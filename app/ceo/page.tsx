"use client"

import { useAuthStore, useDataStore } from "@/lib/store"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  FileText,
  CheckCircle2,
  Building2,
  Package,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

function CEODashboardContent() {
  const { currentUser } = useAuthStore()
  const { getLicenses } = useDataStore()

  if (!currentUser) return null

  const allLicenses = getLicenses()
  const pendingApprovals = allLicenses.filter(l => l.status === "Pending CEO")
  const recentlyApproved = allLicenses
    .filter(l => l.ceo_approved_at)
    .sort((a, b) => new Date(b.ceo_approved_at!).getTime() - new Date(a.ceo_approved_at!).getTime())
    .slice(0, 5)

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Pending Approvals" }]}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-muted-foreground">
            Review and approve license requests that require your authorization.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingApprovals.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting your decision</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved This Week</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {allLicenses.filter(l => {
                  if (!l.ceo_approved_at) return false
                  const approvedDate = new Date(l.ceo_approved_at)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return approvedDate > weekAgo
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviewed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allLicenses.filter(l => l.ceo_approved_at).length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>License requests awaiting your approval</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.map((license) => (
                  <div
                    key={license.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{license.client}</p>
                          <Badge variant="secondary" className="bg-warning/20 text-warning-foreground border-warning/30">
                            Pending
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {license.product}
                          </span>
                          <span>{license.environment}</span>
                          <span>by {license.am_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>Ticket: {license.ticket_id}</span>
                          <span>MAC: {license.approval_payload.mac_id || "-"}</span>
                          <span>Pages: {license.approval_payload.no_of_pages || "-"}</span>
                          <span>Docs: {license.approval_payload.no_of_documents || "-"}</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/ceo/approve/${license.id}`}>
                        Review
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
                <h3 className="text-lg font-semibold">All caught up!</h3>
                <p className="text-muted-foreground">No pending approvals at the moment.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Approved */}
        {recentlyApproved.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Recently Approved
              </CardTitle>
              <CardDescription>Your recent approval decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentlyApproved.map((license) => (
                  <div
                    key={license.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{license.client}</p>
                      <p className="text-sm text-muted-foreground">
                        {license.product} - {license.ticket_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-success text-success-foreground">Approved</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {license.ceo_approved_at && format(new Date(license.ceo_approved_at), "dd-MMM-yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function CEODashboardPage() {
  return (
    <AuthGuard allowedRoles={["ceo"]}>
      <CEODashboardContent />
    </AuthGuard>
  )
}
