"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useDataStore } from "@/lib/store"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  Building2,
  Package,
  Server,
  Shield,
  FileText,
  User
} from "lucide-react"
import { format } from "date-fns"
import type { LicenseStatus } from "@/lib/types"

function LicenseDetailContent({ licenseId }: { licenseId: string }) {
  const router = useRouter()
  const { getLicenseById, getAuditByLicense } = useDataStore()

  const license = getLicenseById(licenseId)
  const auditEntries = getAuditByLicense(licenseId)

  if (!license) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Licenses", href: "/dashboard/licenses" },
          { label: "Not Found" }
        ]}
      >
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">License Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The license you are looking for does not exist or has been removed.
            </p>
            <Button onClick={() => router.push("/dashboard/licenses")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Licenses
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

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

  const getStatusIcon = (status: LicenseStatus) => {
    switch (status) {
      case "Active":
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case "Pending CEO":
      case "Pending License Team":
        return <Clock className="h-5 w-5 text-warning" />
      case "Expired":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />
    }
  }

  const payload = license.approval_payload

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Licenses", href: "/dashboard/licenses" },
        { label: license.ticket_id }
      ]}
      actions={
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(license.status)}
                  <div>
                    <CardTitle className="text-xl">{license.ticket_id}</CardTitle>
                    <CardDescription>{license.client}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(license.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Product</p>
                    <p className="font-medium">{license.product}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Server className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Environment</p>
                    <p className="font-medium">{license.environment}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Manager</p>
                    <p className="font-medium">{license.am_name}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">License Requested By</dt>
                  <dd className="font-medium">{payload.license_requested_by || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Client Contact Person</dt>
                  <dd className="font-medium">{payload.client_contact_person_name || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Client Contact Email</dt>
                  <dd className="font-medium">{payload.client_contact_email || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Antworks Business Contact</dt>
                  <dd className="font-medium">{payload.antworks_business_contact || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Antworks Technical Contact</dt>
                  <dd className="font-medium">{payload.antworks_technical_contact || "-"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5" />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">License Type</dt>
                  <dd className="font-medium">{payload.license_type || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Authentication Method</dt>
                  <dd className="font-medium">{payload.auth_method || "-"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-muted-foreground">Authentication Value</dt>
                  <dd className="font-medium font-mono text-sm">{payload.auth_value || "-"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Hardware Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5" />
                Hardware Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">MAC ID</dt>
                  <dd className="font-medium font-mono">{payload.mac_id || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Motherboard Serial No.</dt>
                  <dd className="font-medium font-mono">{payload.motherboard_serial_no || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Processor ID</dt>
                  <dd className="font-medium font-mono">{payload.processor_id || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">C Drive Serial No.</dt>
                  <dd className="font-medium font-mono">{payload.c_drive_serial_no || "-"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Document Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">No. of Pages</dt>
                  <dd className="font-medium">{payload.no_of_pages || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">No. of Documents</dt>
                  <dd className="font-medium">{payload.no_of_documents || "-"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Validity & Contracts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Validity & Contracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Contract Signed Date</dt>
                  <dd className="font-medium">
                    {payload.contract_signed_date 
                      ? format(new Date(payload.contract_signed_date), "dd-MMM-yyyy")
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Contract Period</dt>
                  <dd className="font-medium">{payload.contract_period || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">License Issue Date</dt>
                  <dd className="font-medium">
                    {license.issueDate 
                      ? format(new Date(license.issueDate), "dd-MMM-yyyy")
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">License End Date</dt>
                  <dd className="font-medium">
                    {license.endDate 
                      ? format(new Date(license.endDate), "dd-MMM-yyyy")
                      : "-"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Internal Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Internal Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "CTO Approval", value: payload.cto_approval },
                  { label: "Finance Approval", value: payload.finance_approval },
                  { label: "Management Approval", value: payload.management_approval },
                  { label: "IT Head Approval", value: payload.it_head_approval }
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">{label}</span>
                    {value ? (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Fields */}
          {payload.custom_fields && payload.custom_fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {payload.custom_fields.map((field, index) => (
                    <div key={index}>
                      <dt className="text-sm text-muted-foreground">{field.key}</dt>
                      <dd className="font-medium">{field.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Status */}
                <div className="flex items-center gap-3">
                  {getStatusIcon(license.status)}
                  <div>
                    <p className="font-medium">{license.status}</p>
                    <p className="text-xs text-muted-foreground">Current Status</p>
                  </div>
                </div>

                {license.ceo_approved_at && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium">CEO Approved</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(license.ceo_approved_at), "dd-MMM-yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {license.assigned_license_team_member && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Assigned to {license.assigned_license_team_member}</p>
                        <p className="text-xs text-muted-foreground">License Team</p>
                      </div>
                    </div>
                  </>
                )}

                {license.shared_by_name && license.status === "Active" && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium">Activated by {license.shared_by_name}</p>
                        <p className="text-xs text-muted-foreground">License Shared</p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(license.created_at), "dd-MMM-yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              {auditEntries.length > 0 ? (
                <div className="space-y-3">
                  {auditEntries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="text-sm">
                      <p className="font-medium">{entry.action.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.timestamp), "dd-MMM-yyyy HH:mm")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No audit entries</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function LicenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  
  return (
    <AuthGuard allowedRoles={["am", "admin"]}>
      <LicenseDetailContent licenseId={resolvedParams.id} />
    </AuthGuard>
  )
}
