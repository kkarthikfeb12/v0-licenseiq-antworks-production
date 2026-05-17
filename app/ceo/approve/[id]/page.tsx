"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useDataStore } from "@/lib/store"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Calendar,
  Building2,
  Package,
  Server,
  Shield,
  FileText,
  User,
  Clock
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

function CEOApprovalContent({ licenseId }: { licenseId: string }) {
  const router = useRouter()
  const { currentUser } = useAuthStore()
  const { getLicenseById, updateLicense, addAuditEntry } = useDataStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const license = getLicenseById(licenseId)

  if (!license) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Pending Approvals", href: "/ceo" },
          { label: "Not Found" }
        ]}
      >
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">License Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The license request you are looking for does not exist.
            </p>
            <Button onClick={() => router.push("/ceo")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  if (license.status !== "Pending CEO") {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Pending Approvals", href: "/ceo" },
          { label: license.ticket_id }
        ]}
      >
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
            <h2 className="text-xl font-semibold mb-2">Already Processed</h2>
            <p className="text-muted-foreground mb-4">
              This license request has already been processed. Current status: {license.status}
            </p>
            <Button onClick={() => router.push("/ceo")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const payload = license.approval_payload

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      updateLicense(license.id, {
        status: "Pending License Team",
        ceo_approved_at: new Date().toISOString(),
        ceo_approved_by: currentUser?.name
      })
      
      addAuditEntry({
        license_id: license.id,
        user_id: currentUser?.id || null,
        action: "CEO_APPROVED",
        details: {
          approved_by: currentUser?.name,
          ticket_id: license.ticket_id
        }
      })

      toast.success("License approved and forwarded to License Team")
      router.push("/ceo")
    } catch {
      toast.error("Failed to approve license")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    try {
      updateLicense(license.id, {
        status: "Draft"
      })
      
      addAuditEntry({
        license_id: license.id,
        user_id: currentUser?.id || null,
        action: "CEO_REJECTED",
        details: {
          rejected_by: currentUser?.name,
          ticket_id: license.ticket_id
        }
      })

      toast.success("License request rejected")
      router.push("/ceo")
    } catch {
      toast.error("Failed to reject license")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Pending Approvals", href: "/ceo" },
        { label: license.ticket_id }
      ]}
      actions={
        <Button variant="outline" onClick={() => router.push("/ceo")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-warning" />
                <div>
                  <CardTitle className="text-xl">{license.ticket_id}</CardTitle>
                  <CardDescription>License Approval Request</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-warning/20 text-warning-foreground border-warning/30">
                Pending Your Approval
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-semibold">{license.client}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-semibold">{license.product}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Environment</p>
                  <p className="font-semibold">{license.environment}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Requested By</p>
                  <p className="font-semibold">{license.am_name}</p>
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
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Custom Fields
              </CardTitle>
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

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleReject}
                disabled={isSubmitting}
                className="min-w-[200px]"
              >
                {isSubmitting ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Reject Request
              </Button>
              <Button
                size="lg"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="min-w-[200px] bg-success hover:bg-success/90"
              >
                {isSubmitting ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Approve License
              </Button>
            </div>
            <Separator className="my-4" />
            <p className="text-center text-sm text-muted-foreground">
              Approving this request will forward it to the License Team for provisioning.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function CEOApprovalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  
  return (
    <AuthGuard allowedRoles={["ceo"]}>
      <CEOApprovalContent licenseId={resolvedParams.id} />
    </AuthGuard>
  )
}
