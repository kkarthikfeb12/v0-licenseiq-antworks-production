"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  CheckCircle2, 
  UserPlus,
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
import type { License } from "@/lib/types"

interface LicenseDetailSheetProps {
  license: License | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onClaim: (license: License) => void
  onActivate: (license: License) => void
  currentUserName: string
}

export function LicenseDetailSheet({
  license,
  open,
  onOpenChange,
  onClaim,
  onActivate,
  currentUserName
}: LicenseDetailSheetProps) {
  if (!license) return null

  const payload = license.approval_payload
  const isAssignedToMe = license.assigned_license_team_member === currentUserName
  const canClaim = !license.assigned_license_team_member && license.status === "Pending License Team"
  const canActivate = isAssignedToMe && license.status !== "Active"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            <SheetTitle>{license.ticket_id}</SheetTitle>
            {license.status === "Active" ? (
              <Badge className="bg-success text-success-foreground">Active</Badge>
            ) : (
              <Badge variant="secondary">
                {license.assigned_license_team_member ? "In Progress" : "Unassigned"}
              </Badge>
            )}
          </div>
          <SheetDescription>
            {license.client} - {license.product}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Status & Assignment */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold">{license.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned To</p>
                    <p className="font-semibold">{license.assigned_license_team_member || "Unassigned"}</p>
                  </div>
                </div>
              </div>
              {license.ceo_approved_at && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">
                      CEO Approved on {format(new Date(license.ceo_approved_at), "dd-MMM-yyyy")}
                      {license.ceo_approved_by && ` by ${license.ceo_approved_by}`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* General Information */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4" />
                General Information
              </h3>
              <dl className="grid gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Client</dt>
                    <dd className="font-medium text-sm">{license.client}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Requested By</dt>
                    <dd className="font-medium text-sm">{payload.license_requested_by || license.am_name}</dd>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Client Contact</dt>
                    <dd className="font-medium text-sm">{payload.client_contact_person_name || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Contact Email</dt>
                    <dd className="font-medium text-sm">{payload.client_contact_email || "-"}</dd>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Business Contact</dt>
                    <dd className="font-medium text-sm">{payload.antworks_business_contact || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Technical Contact</dt>
                    <dd className="font-medium text-sm">{payload.antworks_technical_contact || "-"}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <Separator />

            {/* Technical Details */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Server className="h-4 w-4" />
                Technical Details
              </h3>
              <dl className="grid gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Product</dt>
                    <dd className="font-medium text-sm flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {license.product}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Environment</dt>
                    <dd className="font-medium text-sm">{license.environment}</dd>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">License Type</dt>
                    <dd className="font-medium text-sm">{payload.license_type || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Auth Method</dt>
                    <dd className="font-medium text-sm">{payload.auth_method || "-"}</dd>
                  </div>
                </div>
                {payload.auth_value && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Auth Value</dt>
                    <dd className="font-medium text-sm font-mono bg-muted p-2 rounded text-xs break-all">
                      {payload.auth_value}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <Separator />

            {/* Validity & Contracts */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4" />
                Validity & Contracts
              </h3>
              <dl className="grid gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Contract Signed</dt>
                    <dd className="font-medium text-sm">
                      {payload.contract_signed_date 
                        ? format(new Date(payload.contract_signed_date), "dd-MMM-yyyy")
                        : "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Contract Period</dt>
                    <dd className="font-medium text-sm">{payload.contract_period || "-"}</dd>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Issue Date</dt>
                    <dd className="font-medium text-sm">
                      {license.issueDate 
                        ? format(new Date(license.issueDate), "dd-MMM-yyyy")
                        : "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">End Date</dt>
                    <dd className="font-medium text-sm">
                      {license.endDate 
                        ? format(new Date(license.endDate), "dd-MMM-yyyy")
                        : "-"}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <Separator />

            {/* Internal Approvals */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4" />
                Internal Approvals
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "CTO", value: payload.cto_approval },
                  { label: "Finance", value: payload.finance_approval },
                  { label: "Management", value: payload.management_approval },
                  { label: "IT Head", value: payload.it_head_approval }
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between rounded border p-2">
                    <span className="text-xs font-medium">{label}</span>
                    {value ? (
                      <Badge variant="outline" className="text-success border-success/30 text-xs">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">No</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Fields */}
            {payload.custom_fields && payload.custom_fields.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4" />
                    Custom Fields
                  </h3>
                  <dl className="grid gap-2">
                    {payload.custom_fields.map((field, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2">
                        <dt className="text-xs text-muted-foreground">{field.key}</dt>
                        <dd className="font-medium text-sm">{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </>
            )}

            {/* CC Product Support */}
            {license.cc_product_support && (
              <>
                <Separator />
                <div className="rounded-lg border p-3 bg-primary/5">
                  <p className="text-sm">
                    <strong>Note:</strong> Product Support DL will be notified upon activation.
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t mt-4">
          {canClaim && (
            <Button onClick={() => onClaim(license)} className="flex-1">
              <UserPlus className="mr-2 h-4 w-4" />
              Claim Ticket
            </Button>
          )}
          {canActivate && (
            <Button onClick={() => onActivate(license)} className="flex-1 bg-success hover:bg-success/90">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Active & Share
            </Button>
          )}
          {!canClaim && !canActivate && license.status === "Active" && (
            <div className="flex-1 text-center py-2">
              <Badge className="bg-success text-success-foreground">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                License Active
              </Badge>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
