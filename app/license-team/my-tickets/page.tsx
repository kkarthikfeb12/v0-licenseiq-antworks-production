"use client"

import { useState } from "react"
import { useAuthStore, useDataStore } from "@/lib/store"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Search, Filter, Eye, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { LicenseDetailSheet } from "@/components/license-detail-sheet"
import type { License, LicenseStatus } from "@/lib/types"

function MyTicketsContent() {
  const { currentUser } = useAuthStore()
  const { getLicenses, claimLicense, activateLicense } = useDataStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  if (!currentUser) return null

  const allLicenses = getLicenses()
  const myTickets = allLicenses.filter(
    l => l.assigned_license_team_member === currentUser.name
  )

  // Apply filters
  const filteredTickets = myTickets.filter(license => {
    const matchesSearch = 
      license.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
      license.client.toLowerCase().includes(search.toLowerCase()) ||
      license.product.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && license.status === "Active") ||
      (statusFilter === "pending" && license.status !== "Active")
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: LicenseStatus) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>
      case "Pending License Team":
        return <Badge variant="secondary">In Progress</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

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
      breadcrumbs={[
        { label: "Service Desk", href: "/license-team" },
        { label: "My Tickets" }
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle>My Tickets</CardTitle>
          <CardDescription>All license tickets assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket ID, client, or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">In Progress</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono text-sm">{license.ticket_id}</TableCell>
                    <TableCell className="font-medium">{license.client}</TableCell>
                    <TableCell>{license.product}</TableCell>
                    <TableCell>{license.environment}</TableCell>
                    <TableCell>{getStatusBadge(license.status)}</TableCell>
                    <TableCell>{format(new Date(license.issueDate), "dd-MMM-yyyy")}</TableCell>
                    <TableCell>{format(new Date(license.endDate), "dd-MMM-yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openLicenseDetail(license)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {license.status !== "Active" && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleActivate(license)}
                            className="text-success hover:text-success"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <p className="text-muted-foreground">No tickets found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredTickets.length} of {myTickets.length} tickets
          </div>
        </CardContent>
      </Card>

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

export default function MyTicketsPage() {
  return (
    <AuthGuard allowedRoles={["LicenseTeam"]}>
      <MyTicketsContent />
    </AuthGuard>
  )
}
