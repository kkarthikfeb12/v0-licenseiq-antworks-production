"use client"

import { useAuthStore, useDataStore } from "@/lib/store"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Plus, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

function AMDashboardContent() {
  const { currentUser } = useAuthStore()
  const { getLicenses } = useDataStore()

  if (!currentUser) return null

  const allLicenses = getLicenses()
  const myLicenses = allLicenses.filter(l => l.am_id === currentUser.id)
  
  // Stats
  const totalLicenses = myLicenses.length
  const activeLicenses = myLicenses.filter(l => l.status === "Active").length
  const pendingLicenses = myLicenses.filter(l => 
    l.status === "Pending CEO" || l.status === "Pending License Team"
  ).length
  const expiredLicenses = myLicenses.filter(l => l.status === "Expired").length

  // Recent licenses
  const recentLicenses = myLicenses
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  // Licenses by client
  const licensesByClient = currentUser.mapped_clients.map(client => ({
    client,
    licenses: myLicenses.filter(l => l.client === client),
    active: myLicenses.filter(l => l.client === client && l.status === "Active").length,
    pending: myLicenses.filter(l => l.client === client && (l.status === "Pending CEO" || l.status === "Pending License Team")).length
  }))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>
      case "Pending CEO":
        return <Badge variant="secondary" className="bg-warning/20 text-warning-foreground border-warning/30">Pending CEO</Badge>
      case "Pending License Team":
        return <Badge variant="secondary">Pending License Team</Badge>
      case "Expired":
        return <Badge variant="destructive">Expired</Badge>
      case "Draft":
        return <Badge variant="outline">Draft</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }]}
      actions={
        <Button asChild>
          <Link href="/dashboard/create">
            <Plus className="mr-2 h-4 w-4" />
            Create License Request
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-muted-foreground">
            {"Here's an overview of your license requests and clients."}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLicenses}</div>
              <p className="text-xs text-muted-foreground">All time requests</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{activeLicenses}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingLicenses}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* My Clients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                My Clients
              </CardTitle>
              <CardDescription>Quick access to create licenses for your mapped clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {licensesByClient.map(({ client, active, pending }) => (
                  <div
                    key={client}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{client}</p>
                        <p className="text-sm text-muted-foreground">
                          {active} active, {pending} pending
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/create?client=${encodeURIComponent(client)}`}>
                        <Plus className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
                {licensesByClient.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No clients mapped to your account
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Licenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Licenses
              </CardTitle>
              <CardDescription>Your latest license requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLicenses.map((license) => (
                  <div
                    key={license.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">{license.client}</p>
                        {getStatusBadge(license.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {license.product} - {license.environment}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{format(new Date(license.created_at), "dd MMM yyyy")}</span>
                        <span>MAC: {license.approval_payload.mac_id || "-"}</span>
                        <span>Pages: {license.approval_payload.no_of_pages || "-"}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/licenses/${license.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
                {recentLicenses.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No license requests yet
                  </p>
                )}
              </div>
              {myLicenses.length > 5 && (
                <Button variant="link" className="mt-4 w-full" asChild>
                  <Link href="/dashboard/licenses">View all licenses</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function AMDashboardPage() {
  return (
    <AuthGuard allowedRoles={["am"]}>
      <AMDashboardContent />
    </AuthGuard>
  )
}
