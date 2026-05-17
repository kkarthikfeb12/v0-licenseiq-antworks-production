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
import { Search, Filter, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import type { LicenseStatus } from "@/lib/types"

function MyLicensesContent() {
  const { currentUser } = useAuthStore()
  const { getLicenses } = useDataStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [clientFilter, setClientFilter] = useState<string>("all")

  if (!currentUser) return null

  const allLicenses = getLicenses()
  const myLicenses = allLicenses.filter(l => l.am_id === currentUser.id)

  // Apply filters
  const filteredLicenses = myLicenses.filter(license => {
    const matchesSearch = 
      license.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
      license.client.toLowerCase().includes(search.toLowerCase()) ||
      license.product.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || license.status === statusFilter
    const matchesClient = clientFilter === "all" || license.client === clientFilter
    
    return matchesSearch && matchesStatus && matchesClient
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

  const uniqueClients = [...new Set(myLicenses.map(l => l.client))]

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "My Licenses" }
      ]}
      actions={
        <Button asChild>
          <Link href="/dashboard/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Request
          </Link>
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>My License Requests</CardTitle>
          <CardDescription>View and manage all your license requests</CardDescription>
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
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
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
              
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {uniqueClients.map(client => (
                    <SelectItem key={client} value={client}>{client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                    <TableCell>{getStatusBadge(license.status)}</TableCell>
                    <TableCell>{format(new Date(license.issueDate), "dd-MMM-yyyy")}</TableCell>
                    <TableCell>{format(new Date(license.endDate), "dd-MMM-yyyy")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/licenses/${license.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLicenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <p className="text-muted-foreground">No licenses found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredLicenses.length} of {myLicenses.length} licenses
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

export default function MyLicensesPage() {
  return (
    <AuthGuard allowedRoles={["AM"]}>
      <MyLicensesContent />
    </AuthGuard>
  )
}
