"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, Edit, Trash2, Shield, User, Crown, Briefcase, Mail, Eye, EyeOff, KeyRound } from "lucide-react"
import { UserRole } from "@/lib/types"
import { sendEmail } from "@/lib/email"
import { toast } from "sonner"

export default function AdminUsersPage() {
  const { users, addUser, updateUser, deleteUser } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "am" as UserRole,
    department: "",
    password: "",
    sendWelcomeEmail: true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin": return <Shield className="h-4 w-4" />
      case "ceo": return <Crown className="h-4 w-4" />
      case "am": return <Briefcase className="h-4 w-4" />
      case "license_team": return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin": return "destructive"
      case "ceo": return "default"
      case "am": return "secondary"
      case "license_team": return "outline"
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    
    try {
      const createdUser = addUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        disabled: false,
        mapped_clients: [],
        last_login: null,
        password: newUser.password,
      })

      // Send welcome email if enabled
      if (newUser.sendWelcomeEmail) {
        const welcomeHtml = generateWelcomeEmail(newUser.name, newUser.email, newUser.password, newUser.role)
        await sendEmail({
          to: newUser.email,
          subject: "Welcome to LicenseIQ - Your Account Has Been Created",
          html: welcomeHtml,
          type: "WELCOME_EMAIL",
          originalRecipient: newUser.email,
          recipientRole: newUser.role,
        })
        toast.success(`User created and welcome email sent to ${newUser.email}`)
      } else {
        toast.success("User created successfully")
      }

      setNewUser({ name: "", email: "", role: "am", department: "", password: "", sendWelcomeEmail: true })
      setIsAddDialogOpen(false)
    } catch (error) {
      toast.error("Failed to create user")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateWelcomeEmail = (name: string, email: string, password: string, role: UserRole): string => {
    const roleLabel = role === "am" ? "Account Manager" : role === "license_team" ? "License Team" : role === "ceo" ? "CEO" : "Administrator"
    const loginUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : "/login"
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
          Welcome to LicenseIQ
        </h2>
        
        <p style="color: #334155;">Hello ${name},</p>
        
        <p style="color: #334155;">
          Your LicenseIQ account has been created successfully. You can now log in to access the system.
        </p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #334155; margin-top: 0;">Your Login Credentials</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 40%;">Email:</td>
              <td style="padding: 8px 0; font-weight: bold;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Password:</td>
              <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${password}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Role:</td>
              <td style="padding: 8px 0;">${roleLabel}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Log In to LicenseIQ
          </a>
        </div>
        
        <p style="color: #dc2626; font-size: 14px; background: #fef2f2; padding: 12px; border-radius: 4px;">
          <strong>Important:</strong> Please change your password after your first login for security purposes.
        </p>
        
        <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          This is an automated email from LicenseIQ - Antworks License Management System.<br/>
          If you did not expect this email, please contact your administrator.
        </p>
      </div>
    `
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId)
    }
  }

  const roleStats = {
    admin: users.filter(u => u.role === "admin").length,
    ceo: users.filter(u => u.role === "ceo").length,
    am: users.filter(u => u.role === "am").length,
    license_team: users.filter(u => u.role === "license_team").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage system users and their roles</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account with specified role and credentials</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="john@antworks.ai"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter a secure password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => {
                      const generated = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase() + "!"
                      setNewUser({ ...newUser, password: generated })
                      setShowPassword(true)
                    }}
                  >
                    <KeyRound className="mr-2 h-3 w-3" />
                    Generate Password
                  </Button>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v as UserRole })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="ceo">CEO</SelectItem>
                      <SelectItem value="am">Account Manager</SelectItem>
                      <SelectItem value="license_team">License Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    placeholder="Sales"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="sendWelcomeEmail" className="cursor-pointer">Send Welcome Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Send login credentials to the user via email
                    </p>
                  </div>
                  <Switch
                    id="sendWelcomeEmail"
                    checked={newUser.sendWelcomeEmail}
                    onCheckedChange={(checked) => setNewUser({ ...newUser, sendWelcomeEmail: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddUser} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Creating...</>
                  ) : (
                    <>
                      {newUser.sendWelcomeEmail && <Mail className="mr-2 h-4 w-4" />}
                      Add User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Role Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats.admin}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CEOs</CardTitle>
              <Crown className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats.ceo}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Managers</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats.am}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">License Team</CardTitle>
              <User className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats.license_team}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-4 mt-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="am">Account Manager</SelectItem>
                    <SelectItem value="license_team">License Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1">
                        {getRoleIcon(user.role)}
                        {user.role === "license_team" ? "License Team" : user.role === "am" ? "AM" : user.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
