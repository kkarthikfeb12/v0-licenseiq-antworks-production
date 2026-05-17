"use client"

import { useDataStore } from "@/lib/store"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building2,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

function AdminDashboardContent() {
  const { getLicenses, getUsers } = useDataStore()

  const licenses = getLicenses()
  const users = getUsers()

  // Stats
  const totalLicenses = licenses.length
  const activeLicenses = licenses.filter(l => l.status === "Active").length
  const pendingLicenses = licenses.filter(l => 
    l.status === "Pending CEO" || l.status === "Pending License Team"
  ).length
  const expiredLicenses = licenses.filter(l => l.status === "Expired").length
  const totalUsers = users.length
  const activeAMs = users.filter(u => u.role === "am" && !u.disabled).length

  // Data for charts
  const statusData = [
    { name: "Active", value: activeLicenses, color: "var(--success)" },
    { name: "Pending", value: pendingLicenses, color: "var(--warning)" },
    { name: "Expired", value: expiredLicenses, color: "var(--destructive)" },
    { name: "Draft", value: licenses.filter(l => l.status === "Draft").length, color: "var(--muted-foreground)" }
  ]

  // Licenses by product
  const productCounts = licenses.reduce((acc, license) => {
    acc[license.product] = (acc[license.product] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const productData = Object.entries(productCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  // Licenses by client
  const clientCounts = licenses.reduce((acc, license) => {
    acc[license.client] = (acc[license.client] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const clientData = Object.entries(clientCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Admin Dashboard" }]}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of all license requests and system statistics.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/licenses">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLicenses}</div>
                <p className="text-xs text-muted-foreground">All license requests</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{activeLicenses}</div>
              <p className="text-xs text-muted-foreground">
                {((activeLicenses / totalLicenses) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingLicenses}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{expiredLicenses}</div>
              <p className="text-xs text-muted-foreground">Need renewal</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/users">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">{activeAMs} active AMs</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Clients</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(clientCounts).length}</div>
              <p className="text-xs text-muted-foreground">Active client base</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(productCounts).length}</div>
              <p className="text-xs text-muted-foreground">Licensed products</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>License Status Distribution</CardTitle>
              <CardDescription>Breakdown by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Licenses by Product */}
          <Card>
            <CardHeader>
              <CardTitle>Licenses by Product</CardTitle>
              <CardDescription>Top products by license count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients by License Count</CardTitle>
            <CardDescription>Clients with the most license requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientData.map((client, index) => (
                <div key={client.name} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{client.name}</p>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${(client.value / clientData[0].value) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium">{client.value} licenses</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function AdminDashboardPage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <AdminDashboardContent />
    </AuthGuard>
  )
}
