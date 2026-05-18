"use client"

import { useState } from "react"
import { useDataStore } from "@/lib/store"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreHorizontal, Download, Eye, Bell, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import type { LicenseStatus } from "@/lib/types"

function AdminLicensesContent() {
  const { getLicenses, updateLicense, addAuditEntry } = useDataStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [productFilter, setProductFilter] = useState<string>("all")

  const licenses = getLicenses()

  // Get unique values for filters
  const uniqueProducts = [...new Set(licenses.map(l => l.product))]

  // Apply filters
  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = 
      license.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
      license.client.toLowerCase().includes(search.toLowerCase()) ||
      license.am_name.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || license.status === statusFilter
    const matchesProduct = productFilter === "all" || license.product === productFilter
    
    return matchesSearch && matchesStatus && matchesProduct
  })

  const getStatusBadge = (status: LicenseStatus) => {
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

  const handleForceApprove = (licenseId: string) => {
    updateLicense(licenseId, { status: "Pending License Team" })
    addAuditEntry({
      license_id: licenseId,
      user_id: null,
      action: "ADMIN_OVERRIDE",
      details: { action: "Force Approved to Pending License Team" }
    })
    toast.success("License force approved")
  }

  const handleSendReminder = (license: typeof licenses[0]) => {
    addAuditEntry({
      license_id: license.id,
      user_id: null,
      action: "AM_REMINDER",
      details: { sent_to: license.am_name }
    })
    toast.success(`Reminder sent to ${license.am_name}`)
  }

  const handleExportCSV = () => {
    // Flatten the data for CSV export
    const headers = [
      "Ticket ID", "Client", "Product", "Environment", "Status", 
      "AM Name", "Issue Date", "End Date", "Created At"
    ]
    
    const rows = filteredLicenses.map(l => [
      l.ticket_id,
      l.client,
      l.product,
      l.environment,
      l.status,
      l.am_name,
      format(new Date(l.issueDate), "dd-MMM-yyyy"),
      format(new Date(l.endDate), "dd-MMM-yyyy"),
      format(new Date(l.created_at), "dd-MMM-yyyy HH:mm")
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `licenses-export-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("CSV exported successfully")
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Licenses" }
      ]}
      actions={
        <Button onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>All Licenses</CardTitle>
          <CardDescription>View and manage all license requests across the system</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket ID, client, or AM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Pending CEO">Pending CEO</SelectItem>
                  <SelectItem value="Pending License Team">Pending License Team</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {uniqueProducts.map(product => (
                    <SelectItem key={product} value={product}>{product}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>MAC ID</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead>Docs</TableHead>
                  <TableHead>AM</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono text-sm">{license.ticket_id}</TableCell>
                    <TableCell className="font-medium">{license.client}</TableCell>
                    <TableCell>{license.product}</TableCell>
                    <TableCell>{license.environment}</TableCell>
                    <TableCell className="font-mono text-xs">{license.approval_payload.mac_id || "-"}</TableCell>
                    <TableCell>{license.approval_payload.no_of_pages || "-"}</TableCell>
                    <TableCell>{license.approval_payload.no_of_documents || "-"}</TableCell>
                    <TableCell>{license.am_name}</TableCell>
                    <TableCell>{getStatusBadge(license.status)}</TableCell>
                    <TableCell>{format(new Date(license.endDate), "dd-MMM-yyyy")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/licenses/${license.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendReminder(license)}>
                            <Bell className="mr-2 h-4 w-4" />
                            Send Reminder to AM
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {license.status === "Pending CEO" && (
                            <DropdownMenuItem onClick={() => handleForceApprove(license.id)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Force Approve (Bypass CEO)
                            </DropdownMenuItem>
                          )}
                          {license.status !== "Expired" && new Date(license.endDate) < new Date() && (
                            <DropdownMenuItem 
                              onClick={() => {
                                updateLicense(license.id, { status: "Expired" })
                                toast.success("License marked as expired")
                              }}
                              className="text-destructive"
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Mark as Expired
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLicenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center">
                      <p className="text-muted-foreground">No licenses found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredLicenses.length} of {licenses.length} licenses
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

export default function AdminLicensesPage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <AdminLicensesContent />
    </AuthGuard>
  )
}
