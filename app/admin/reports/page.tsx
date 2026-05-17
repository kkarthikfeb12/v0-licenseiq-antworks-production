"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  Download, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Building
} from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function AdminReportsPage() {
  const { licenses, users } = useStore()
  const [dateRange, setDateRange] = useState("30")

  // Calculate metrics
  const totalLicenses = licenses.length
  const pendingLicenses = licenses.filter(l => l.status === "pending_ceo").length
  const approvedLicenses = licenses.filter(l => l.status === "ceo_approved" || l.status === "license_generated").length
  const rejectedLicenses = licenses.filter(l => l.status === "ceo_rejected").length
  
  const avgProcessingTime = licenses.length > 0 
    ? Math.round(licenses.reduce((acc, l) => {
        const created = new Date(l.createdAt).getTime()
        const updated = new Date(l.updatedAt).getTime()
        return acc + (updated - created)
      }, 0) / licenses.length / (1000 * 60 * 60 * 24))
    : 0

  // Status distribution for pie chart
  const statusData = [
    { name: "Draft", value: licenses.filter(l => l.status === "draft").length, color: "#94a3b8" },
    { name: "Pending CEO", value: licenses.filter(l => l.status === "pending_ceo").length, color: "#f59e0b" },
    { name: "CEO Approved", value: licenses.filter(l => l.status === "ceo_approved").length, color: "#22c55e" },
    { name: "CEO Rejected", value: licenses.filter(l => l.status === "ceo_rejected").length, color: "#ef4444" },
    { name: "License Generated", value: licenses.filter(l => l.status === "license_generated").length, color: "#3b82f6" },
  ].filter(d => d.value > 0)

  // License type distribution
  const typeData = [
    { name: "New", count: licenses.filter(l => l.licenseType === "new").length },
    { name: "Renewal", count: licenses.filter(l => l.licenseType === "renewal").length },
    { name: "Extension", count: licenses.filter(l => l.licenseType === "extension").length },
    { name: "POC", count: licenses.filter(l => l.licenseType === "poc").length },
  ]

  // Monthly trend data (simulated)
  const trendData = [
    { month: "Jan", requests: 12, approved: 10, rejected: 2 },
    { month: "Feb", requests: 15, approved: 12, rejected: 3 },
    { month: "Mar", requests: 18, approved: 15, rejected: 3 },
    { month: "Apr", requests: 22, approved: 18, rejected: 4 },
    { month: "May", requests: 25, approved: 21, rejected: 4 },
    { month: "Jun", requests: 20, approved: 17, rejected: 3 },
  ]

  // AM performance
  const amPerformance = users
    .filter(u => u.role === "am")
    .map(am => ({
      name: am.name,
      requests: licenses.filter(l => l.createdBy === am.id).length,
      approved: licenses.filter(l => l.createdBy === am.id && (l.status === "ceo_approved" || l.status === "license_generated")).length,
    }))
    .sort((a, b) => b.requests - a.requests)

  // Customer distribution
  const customerData = licenses.reduce((acc, l) => {
    const existing = acc.find(c => c.name === l.customerName)
    if (existing) {
      existing.count++
    } else {
      acc.push({ name: l.customerName, count: 1 })
    }
    return acc
  }, [] as { name: string; count: number }[])
  .sort((a, b) => b.count - a.count)
  .slice(0, 5)

  const handleExportCSV = () => {
    const headers = ["ID", "Customer", "Type", "Status", "Created By", "Created At"]
    const rows = licenses.map(l => [
      l.id,
      l.customerName,
      l.licenseType,
      l.status,
      users.find(u => u.id === l.createdBy)?.name || "Unknown",
      new Date(l.createdAt).toLocaleDateString()
    ])
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `license-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive license management insights</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLicenses}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingLicenses}</div>
              <p className="text-xs text-muted-foreground">Awaiting CEO</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedLicenses}</div>
              <p className="text-xs text-muted-foreground">
                {totalLicenses > 0 ? Math.round((approvedLicenses / totalLicenses) * 100) : 0}% approval rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedLicenses}</div>
              <p className="text-xs text-muted-foreground">
                {totalLicenses > 0 ? Math.round((rejectedLicenses / totalLicenses) * 100) : 0}% rejection rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Processing</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgProcessingTime} days</div>
              <p className="text-xs text-muted-foreground">Request to approval</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">AM Performance</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Current license request statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: { label: "Count" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* License Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>License Types</CardTitle>
                  <CardDescription>Distribution by license type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: { label: "Count", color: "hsl(var(--primary))" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={typeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
                <CardDescription>License requests over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    requests: { label: "Requests", color: "hsl(var(--primary))" },
                    approved: { label: "Approved", color: "#22c55e" },
                    rejected: { label: "Rejected", color: "#ef4444" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="requests" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="approved" stroke="#22c55e" strokeWidth={2} />
                      <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Manager Performance</CardTitle>
                <CardDescription>License requests by account manager</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Manager</TableHead>
                      <TableHead className="text-center">Total Requests</TableHead>
                      <TableHead className="text-center">Approved</TableHead>
                      <TableHead className="text-center">Success Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {amPerformance.map((am) => (
                      <TableRow key={am.name}>
                        <TableCell className="font-medium">{am.name}</TableCell>
                        <TableCell className="text-center">{am.requests}</TableCell>
                        <TableCell className="text-center">{am.approved}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={am.requests > 0 && (am.approved / am.requests) >= 0.8 ? "default" : "secondary"}>
                            {am.requests > 0 ? Math.round((am.approved / am.requests) * 100) : 0}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Customers with most license requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-center">License Requests</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerData.map((customer) => (
                      <TableRow key={customer.name}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{customer.count}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
