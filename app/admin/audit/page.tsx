"use client"

import { useState } from "react"
import { useDataStore, useAuthStore } from "@/lib/store"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Filter, Activity, User, FileText, Settings, Shield } from "lucide-react"
import type { AuditAction } from "@/lib/types"

function AuditLogsContent() {
  const { auditEntries, users, licenses } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [userFilter, setUserFilter] = useState<string>("all")

  const getActionLabel = (action: AuditAction) => {
    const labels: Record<AuditAction, string> = {
      USER_LOGIN: "User Login",
      TICKET_CREATED: "Ticket Created",
      CEO_APPROVED: "CEO Approved",
      CEO_REJECTED: "CEO Rejected",
      AM_VERIFIED: "AM Verified",
      EMAIL_SENT_TO_AM: "Email Sent to AM",
      EMAIL_SENT_TO_CEO: "Email Sent to CEO",
      CLAIMED_BY: "Claimed By",
      LICENSE_ACTIVATED: "License Activated",
      ADMIN_OVERRIDE: "Admin Override",
      AM_REMINDER: "AM Reminder",
      EXPIRY_NOTICE: "Expiry Notice",
      LICENSE_PROVISIONED: "License Provisioned"
    }
    return labels[action] || action
  }

  const getActionColor = (action: AuditAction) => {
    if (action.includes("ACTIVATED") || action.includes("APPROVED") || action.includes("CREATED")) {
      return "bg-green-100 text-green-800"
    }
    if (action.includes("REJECTED")) {
      return "bg-red-100 text-red-800"
    }
    if (action.includes("LOGIN") || action.includes("EMAIL")) {
      return "bg-blue-100 text-blue-800"
    }
    return "bg-gray-100 text-gray-800"
  }

  const getActionIcon = (action: AuditAction) => {
    if (action.includes("LICENSE") || action.includes("TICKET")) return <FileText className="h-4 w-4" />
    if (action.includes("USER") || action.includes("CEO") || action.includes("AM") || action.includes("CLAIMED")) return <User className="h-4 w-4" />
    if (action.includes("EMAIL")) return <Activity className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getUserName = (userId: string | null) => {
    if (!userId) return "System"
    const user = users.find(u => u.id === userId)
    return user?.name || userId
  }

  const getLicenseInfo = (licenseId: string | null) => {
    if (!licenseId) return null
    const license = licenses.find(l => l.id === licenseId)
    return license ? `${license.ticket_id} - ${license.client}` : licenseId
  }

  // Get unique actions and users for filters
  const uniqueActions = [...new Set(auditEntries.map(e => e.action))]
  const uniqueUsers = [...new Set(auditEntries.map(e => e.user_id).filter(Boolean))]

  // Filter entries
  const filteredEntries = auditEntries
    .filter(entry => {
      const matchesSearch = 
        searchTerm === "" ||
        getActionLabel(entry.action).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getUserName(entry.user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.license_id && getLicenseInfo(entry.license_id)?.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesAction = actionFilter === "all" || entry.action === actionFilter
      const matchesUser = userFilter === "all" || entry.user_id === userFilter
      
      return matchesSearch && matchesAction && matchesUser
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const exportToCSV = () => {
    const headers = ["Timestamp", "Action", "User", "License", "Details"]
    const rows = filteredEntries.map(entry => [
      new Date(entry.timestamp).toLocaleString(),
      getActionLabel(entry.action),
      getUserName(entry.user_id),
      getLicenseInfo(entry.license_id) || "N/A",
      JSON.stringify(entry.details || {})
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Stats
  const todayEntries = auditEntries.filter(e => 
    new Date(e.timestamp).toDateString() === new Date().toDateString()
  ).length
  const loginEvents = auditEntries.filter(e => e.action === "USER_LOGIN").length
  const licenseEvents = auditEntries.filter(e => e.action.startsWith("LICENSE_")).length

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Audit Logs" }
      ]}
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">Track all system activities and changes</p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditEntries.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayEntries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Login Events</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loginEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">License Events</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{licenseEvents}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {getActionLabel(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(userId => (
                    <SelectItem key={userId} value={userId!}>
                      {getUserName(userId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Showing {filteredEntries.length} of {auditEntries.length} entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[180px]">Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.slice(0, 100).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(entry.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getActionColor(entry.action)} flex items-center gap-1 w-fit`}>
                        {getActionIcon(entry.action)}
                        {getActionLabel(entry.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getUserName(entry.user_id)}</TableCell>
                    <TableCell>
                      {entry.license_id ? (
                        <span className="text-sm">{getLicenseInfo(entry.license_id)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.details ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {JSON.stringify(entry.details).slice(0, 50)}
                          {JSON.stringify(entry.details).length > 50 && "..."}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No audit entries found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {filteredEntries.length > 100 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Showing first 100 entries. Export to CSV for full data.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function AdminAuditPage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <AuditLogsContent />
    </AuthGuard>
  )
}
