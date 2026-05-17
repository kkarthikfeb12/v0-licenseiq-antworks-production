"use client"

import { useState } from "react"
import { useAuthStore, useDataStore } from "@/lib/store"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Clock, 
  FileText,
  CheckCircle2,
  Building2,
  Package,
  Server,
  UserPlus,
  Eye,
  Inbox,
  User
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { LicenseDetailSheet } from "@/components/license-detail-sheet"
import type { License } from "@/lib/types"

function LicenseTeamDashboardContent() {
  const { currentUser } = useAuthStore()
  const { getLicenses, claimLicense, activateLicense } = useDataStore()
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  if (!currentUser) return null

  const allLicenses = getLicenses()
  
  // Unassigned tickets (Pending License Team with no assignee)
  const unassignedTickets = allLicenses.filter(
    l => l.status === "Pending License Team" && !l.assigned_license_team_member
  )
  
  // My tickets (assigned to current user)
  const myTickets = allLicenses.filter(
    l => l.assigned_license_team_member === currentUser.name
  )
  
  // Active tickets I worked on
  const myActiveTickets = myTickets.filter(l => l.status === "Active")
  const myPendingTickets = myTickets.filter(l => l.status !== "Active")

  const handleClaim = (license: License) => {
    claimLicense(license.id, currentUser.name)
    toast.success(`Ticket ${license.ticket_id} claimed successfully`)
  }

  const handleActivate = (license: License) => {
    activateLicense(license.id, currentUser.name)
    toast.success(`License ${license.ticket_id} activated and shared`)
    setIsSheetOpen(false)
  }

  const openLicenseDetail = (license: License) => {
    setSelectedLicense(license)
    setIsSheetOpen(true)
  }

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Service Desk" }]}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Service Desk
          </h1>
          <p className="text-muted-foreground">
            Manage license requests and provision licenses for clients.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
              <Inbox className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{unassignedTickets.length}</div>
              <p className="text-xs text-muted-foreground">Waiting to be claimed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Pending</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{myPendingTickets.length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{myActiveTickets.length}</div>
              <p className="text-xs text-muted-foreground">Licenses activated</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Handled</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myTickets.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Tabs */}
        <Tabs defaultValue="unassigned" className="space-y-4">
          <TabsList>
            <TabsTrigger value="unassigned" className="gap-2">
              <Inbox className="h-4 w-4" />
              Unassigned
              {unassignedTickets.length > 0 && (
                <Badge variant="secondary" className="ml-1">{unassignedTickets.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="my-tickets" className="gap-2">
              <User className="h-4 w-4" />
              My Tickets
              {myPendingTickets.length > 0 && (
                <Badge variant="secondary" className="ml-1">{myPendingTickets.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unassigned">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Inbox className="h-5 w-5" />
                  Unassigned Tickets
                </CardTitle>
                <CardDescription>Claim tickets to start working on them</CardDescription>
              </CardHeader>
              <CardContent>
                {unassignedTickets.length > 0 ? (
                  <div className="space-y-4">
                    {unassignedTickets.map((license) => (
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
                              <Badge variant="secondary">
                                {license.ceo_approved_at ? "CEO Approved" : "Bypass"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {license.product}
                              </span>
                              <span className="flex items-center gap-1">
                                <Server className="h-3 w-3" />
                                {license.environment}
                              </span>
                              <span>by {license.am_name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Ticket: {license.ticket_id} | Created: {format(new Date(license.created_at), "dd-MMM-yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openLicenseDetail(license)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button size="sm" onClick={() => handleClaim(license)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Claim
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
                    <h3 className="text-lg font-semibold">No unassigned tickets</h3>
                    <p className="text-muted-foreground">All tickets have been claimed.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-tickets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  My Tickets
                </CardTitle>
                <CardDescription>Tickets assigned to you</CardDescription>
              </CardHeader>
              <CardContent>
                {myTickets.length > 0 ? (
                  <div className="space-y-4">
                    {myTickets.map((license) => (
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
                              {license.status === "Active" ? (
                                <Badge className="bg-success text-success-foreground">Active</Badge>
                              ) : (
                                <Badge variant="secondary">In Progress</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {license.product}
                              </span>
                              <span className="flex items-center gap-1">
                                <Server className="h-3 w-3" />
                                {license.environment}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Ticket: {license.ticket_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openLicenseDetail(license)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          {license.status !== "Active" && (
                            <Button size="sm" onClick={() => handleActivate(license)} className="bg-success hover:bg-success/90">
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark Active
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No tickets assigned</h3>
                    <p className="text-muted-foreground">Claim tickets from the Unassigned tab to start working.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* License Detail Sheet */}
      <LicenseDetailSheet
        license={selectedLicense}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onClaim={handleClaim}
        onActivate={handleActivate}
        currentUserName={currentUser.name}
      />
    </DashboardLayout>
  )
}

export default function LicenseTeamDashboardPage() {
  return (
    <AuthGuard allowedRoles={["LicenseTeam"]}>
      <LicenseTeamDashboardContent />
    </AuthGuard>
  )
}
