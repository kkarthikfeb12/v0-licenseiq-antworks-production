"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore, useDataStore } from "@/lib/store"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { 
  Plus, 
  Trash2, 
  CalendarIcon, 
  Send,
  UserCheck,
  ArrowRight
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { ApprovalPayload, CustomField } from "@/lib/types"
import { sendEmail, generateCEOApprovalEmail, generateLicenseCreatedEmail } from "@/lib/email"
import { toast } from "sonner"

function CreateLicenseFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClient = searchParams.get("client") || ""
  
  const { currentUser } = useAuthStore()
  const { createLicense, getSystemConfig } = useDataStore()
  const systemConfig = getSystemConfig()
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    // Section 1 - General
    license_requested_by: currentUser?.name || "",
    client_name: preselectedClient,
    client_contact_person_name: "",
    client_contact_email: "",
    antworks_business_contact: currentUser?.name || "",
    antworks_technical_contact: "",
    
    // Section 2 - Product & Technical
    product: "",
    environment: "",
    license_type: "",
    auth_method: "",
    auth_value: "",
    
    // Hardware/System Details
    mac_id: "",
    motherboard_serial_no: "",
    processor_id: "",
    c_drive_serial_no: "",
    
    // Document Metrics
    no_of_pages: "",
    no_of_documents: "",
    
    // Section 3 - Validity & Contracts
    contract_signed_date: undefined as Date | undefined,
    contract_period: "",
    license_required_by: undefined as Date | undefined,
    license_issue_date: undefined as Date | undefined,
    license_end_date: undefined as Date | undefined,
    
    // Section 4 - Internal Approvals
    cto_approval: false,
    finance_approval: false,
    management_approval: false,
    it_head_approval: false,
    
    // Section 5 - Custom Fields
    custom_fields: [] as CustomField[],
    
    // Section 6 - Routing
    routing: "ceo" as "ceo" | "bypass",
    cc_product_support: false
  })

  if (!currentUser) return null

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      custom_fields: [...prev.custom_fields, { key: "", value: "" }]
    }))
  }

  const updateCustomField = (index: number, field: "key" | "value", value: string) => {
    setFormData(prev => ({
      ...prev,
      custom_fields: prev.custom_fields.map((cf, i) => 
        i === index ? { ...cf, [field]: value } : cf
      )
    }))
  }

  const removeCustomField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      custom_fields: prev.custom_fields.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.client_name || !formData.product || !formData.environment) {
        toast.error("Please fill in all required fields")
        setIsSubmitting(false)
        return
      }

      const approvalPayload: ApprovalPayload = {
        license_requested_by: formData.license_requested_by,
        client_name: formData.client_name,
        client_contact_person_name: formData.client_contact_person_name,
        client_contact_email: formData.client_contact_email,
        antworks_business_contact: formData.antworks_business_contact,
        antworks_technical_contact: formData.antworks_technical_contact,
        product: formData.product,
        environment: formData.environment,
        license_type: formData.license_type,
        auth_method: formData.auth_method,
        auth_value: formData.auth_value,
        mac_id: formData.mac_id,
        motherboard_serial_no: formData.motherboard_serial_no,
        processor_id: formData.processor_id,
        c_drive_serial_no: formData.c_drive_serial_no,
        no_of_pages: formData.no_of_pages,
        no_of_documents: formData.no_of_documents,
        contract_signed_date: formData.contract_signed_date?.toISOString() || "",
        contract_period: formData.contract_period,
        license_required_by: formData.license_required_by?.toISOString() || "",
        license_issue_date: formData.license_issue_date?.toISOString() || "",
        license_end_date: formData.license_end_date?.toISOString() || "",
        cto_approval: formData.cto_approval,
        finance_approval: formData.finance_approval,
        management_approval: formData.management_approval,
        it_head_approval: formData.it_head_approval,
        custom_fields: formData.custom_fields.filter(cf => cf.key && cf.value),
        routing: formData.routing,
        cc_product_support: formData.cc_product_support
      }

      const license = createLicense({
        amId: currentUser.id,
        amName: currentUser.name,
        approvalPayload
      })

      // Send emails
      if (formData.routing === "ceo") {
        // Send CEO approval email
        const magicLink = `${window.location.origin}/ceo/approve/${license.id}?token=${license.magic_token}`
        await sendEmail({
          to: "ceo@antworks.com",
          subject: `License Request Pending Approval - ${license.ticket_id}`,
          html: generateCEOApprovalEmail(license, magicLink),
          type: "CEO_SIGNOFF",
          originalRecipient: "ceo@antworks.com",
          recipientRole: "CEO"
        })
      }

      // Send confirmation email to AM
      await sendEmail({
        to: currentUser.email,
        subject: `License Request Created - ${license.ticket_id}`,
        html: generateLicenseCreatedEmail(license),
        type: "TICKET_CREATED",
        originalRecipient: currentUser.email,
        recipientRole: "Account Manager"
      })

      toast.success(
        formData.routing === "ceo"
          ? "License request created and sent to CEO for approval"
          : "License request created and sent to License Team"
      )

      router.push(`/dashboard/licenses/${license.id}`)
    } catch {
      toast.error("Failed to create license request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Create License Request" }
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Section 1 - General */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Section 1 - General Information</CardTitle>
            <CardDescription>Basic details about the license request</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="license_requested_by">License Requested By</Label>
              <Input
                id="license_requested_by"
                value={formData.license_requested_by}
                onChange={(e) => handleInputChange("license_requested_by", e.target.value)}
                placeholder="Your name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name *</Label>
              <Select
                value={formData.client_name}
                onValueChange={(value) => handleInputChange("client_name", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {currentUser.mapped_clients.map((client) => (
                    <SelectItem key={client} value={client}>{client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_contact_person_name">Client Contact Person Name</Label>
              <Input
                id="client_contact_person_name"
                value={formData.client_contact_person_name}
                onChange={(e) => handleInputChange("client_contact_person_name", e.target.value)}
                placeholder="Contact person name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_contact_email">Client Contact Email ID</Label>
              <Input
                id="client_contact_email"
                type="email"
                value={formData.client_contact_email}
                onChange={(e) => handleInputChange("client_contact_email", e.target.value)}
                placeholder="contact@client.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="antworks_business_contact">Antworks Business Contact Person</Label>
              <Input
                id="antworks_business_contact"
                value={formData.antworks_business_contact}
                onChange={(e) => handleInputChange("antworks_business_contact", e.target.value)}
                placeholder="Business contact name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="antworks_technical_contact">Antworks Technical Contact Person</Label>
              <Input
                id="antworks_technical_contact"
                value={formData.antworks_technical_contact}
                onChange={(e) => handleInputChange("antworks_technical_contact", e.target.value)}
                placeholder="Technical contact name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2 - Product & Technical */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Section 2 - Product & Technical Details</CardTitle>
            <CardDescription>Product and environment configuration</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select
                value={formData.product}
                onValueChange={(value) => handleInputChange("product", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {systemConfig.products.map((product) => (
                    <SelectItem key={product} value={product}>{product}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="environment">Environment / Licensed Setup Path *</Label>
              <Select
                value={formData.environment}
                onValueChange={(value) => handleInputChange("environment", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  {systemConfig.environments.map((env) => (
                    <SelectItem key={env} value={env}>{env}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="license_type">Type of License</Label>
              <Select
                value={formData.license_type}
                onValueChange={(value) => handleInputChange("license_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select license type" />
                </SelectTrigger>
                <SelectContent>
                  {systemConfig.license_types.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="auth_method">User Authentication Method</Label>
              <Select
                value={formData.auth_method}
                onValueChange={(value) => handleInputChange("auth_method", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select auth method" />
                </SelectTrigger>
                <SelectContent>
                  {systemConfig.auth_methods.map((method) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="auth_value">Authentication Value</Label>
              <Input
                id="auth_value"
                value={formData.auth_value}
                onChange={(e) => handleInputChange("auth_value", e.target.value)}
                placeholder="Enter authentication value"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2.1 - Hardware/System Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Section 2.1 - Hardware/System Details</CardTitle>
            <CardDescription>System hardware identifiers for license binding</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mac_id">MAC ID</Label>
              <Input
                id="mac_id"
                value={formData.mac_id}
                onChange={(e) => handleInputChange("mac_id", e.target.value)}
                placeholder="e.g., 00:1A:2B:3C:4D:5E"
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="motherboard_serial_no">Motherboard Serial No</Label>
              <Input
                id="motherboard_serial_no"
                value={formData.motherboard_serial_no}
                onChange={(e) => handleInputChange("motherboard_serial_no", e.target.value)}
                placeholder="e.g., MB123456789"
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="processor_id">Processor ID</Label>
              <Input
                id="processor_id"
                value={formData.processor_id}
                onChange={(e) => handleInputChange("processor_id", e.target.value)}
                placeholder="e.g., BFEBFBFF000906EA"
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="c_drive_serial_no">C Drive Serial No</Label>
              <Input
                id="c_drive_serial_no"
                value={formData.c_drive_serial_no}
                onChange={(e) => handleInputChange("c_drive_serial_no", e.target.value)}
                placeholder="e.g., WD-WCAZ12345678"
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2.2 - Document Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Section 2.2 - Document Metrics</CardTitle>
            <CardDescription>Document processing capacity limits</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="no_of_pages">No. of Pages</Label>
              <Input
                id="no_of_pages"
                type="number"
                value={formData.no_of_pages}
                onChange={(e) => handleInputChange("no_of_pages", e.target.value)}
                placeholder="e.g., 10000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="no_of_documents">No. of Documents</Label>
              <Input
                id="no_of_documents"
                type="number"
                value={formData.no_of_documents}
                onChange={(e) => handleInputChange("no_of_documents", e.target.value)}
                placeholder="e.g., 5000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3 - Validity & Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Section 3 - Validity & Contracts</CardTitle>
            <CardDescription>Contract and license validity dates</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Contract Signed Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.contract_signed_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.contract_signed_date ? (
                      format(formData.contract_signed_date, "dd-MMM-yyyy")
                    ) : (
                      "Select date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.contract_signed_date}
                    onSelect={(date) => handleInputChange("contract_signed_date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contract_period">Contract Period</Label>
              <Input
                id="contract_period"
                value={formData.contract_period}
                onChange={(e) => handleInputChange("contract_period", e.target.value)}
                placeholder="e.g., 12 months"
              />
            </div>
            
            <div className="space-y-2">
              <Label>License Required By</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.license_required_by && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.license_required_by ? (
                      format(formData.license_required_by, "dd-MMM-yyyy")
                    ) : (
                      "Select date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.license_required_by}
                    onSelect={(date) => handleInputChange("license_required_by", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>License Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.license_issue_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.license_issue_date ? (
                      format(formData.license_issue_date, "dd-MMM-yyyy")
                    ) : (
                      "Select date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.license_issue_date}
                    onSelect={(date) => handleInputChange("license_issue_date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>License End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.license_end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.license_end_date ? (
                      format(formData.license_end_date, "dd-MMM-yyyy")
                    ) : (
                      "Select date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.license_end_date}
                    onSelect={(date) => handleInputChange("license_end_date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 - Internal Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Section 4 - Internal Approvals</CardTitle>
            <CardDescription>Mark the approvals obtained for this request</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="cto_approval" className="font-medium">CTO Approval</Label>
                <p className="text-sm text-muted-foreground">Chief Technology Officer</p>
              </div>
              <Switch
                id="cto_approval"
                checked={formData.cto_approval}
                onCheckedChange={(checked) => handleInputChange("cto_approval", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="finance_approval" className="font-medium">Finance Approval</Label>
                <p className="text-sm text-muted-foreground">Finance Department</p>
              </div>
              <Switch
                id="finance_approval"
                checked={formData.finance_approval}
                onCheckedChange={(checked) => handleInputChange("finance_approval", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="management_approval" className="font-medium">Management Approval</Label>
                <p className="text-sm text-muted-foreground">Management Team</p>
              </div>
              <Switch
                id="management_approval"
                checked={formData.management_approval}
                onCheckedChange={(checked) => handleInputChange("management_approval", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="it_head_approval" className="font-medium">IT Head Approval</Label>
                <p className="text-sm text-muted-foreground">IT Department Head</p>
              </div>
              <Switch
                id="it_head_approval"
                checked={formData.it_head_approval}
                onCheckedChange={(checked) => handleInputChange("it_head_approval", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 5 - Dynamic Custom Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Section 5 - Custom Fields</CardTitle>
            <CardDescription>Add any additional information as key-value pairs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.custom_fields.map((field, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <Label>Key</Label>
                  <Input
                    value={field.key}
                    onChange={(e) => updateCustomField(index, "key", e.target.value)}
                    placeholder="Field name"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Value</Label>
                  <Input
                    value={field.value}
                    onChange={(e) => updateCustomField(index, "value", e.target.value)}
                    placeholder="Field value"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-8"
                  onClick={() => removeCustomField(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addCustomField}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Field
            </Button>
          </CardContent>
        </Card>

        {/* Section 6 - Routing & Submit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Section 6 - Routing & Submit</CardTitle>
            <CardDescription>Choose the approval workflow for this request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Routing</Label>
              <RadioGroup
                value={formData.routing}
                onValueChange={(value) => handleInputChange("routing", value as "ceo" | "bypass")}
                className="grid gap-4"
              >
                <div className="flex items-start space-x-4 rounded-lg border p-4">
                  <RadioGroupItem value="ceo" id="routing-ceo" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="routing-ceo" className="font-medium flex items-center gap-2 cursor-pointer">
                      <UserCheck className="h-4 w-4 text-primary" />
                      Require CEO Approval
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Send this request to CEO for approval before it goes to the License Team
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 rounded-lg border p-4">
                  <RadioGroupItem value="bypass" id="routing-bypass" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="routing-bypass" className="font-medium flex items-center gap-2 cursor-pointer">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      Bypass to License Team
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Send this request directly to the License Team for processing
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {formData.routing === "bypass" && (
              <div className="flex items-center space-x-3 rounded-lg border p-4 bg-muted/50">
                <Checkbox
                  id="cc_product_support"
                  checked={formData.cc_product_support}
                  onCheckedChange={(checked) => handleInputChange("cc_product_support", !!checked)}
                />
                <div>
                  <Label htmlFor="cc_product_support" className="font-medium cursor-pointer">
                    Loop in Product Support DL upon activation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send notification to Product Support when this license is activated
                  </p>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Create & Route Ticket
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </DashboardLayout>
  )
}

function CreateLicenseForm() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <CreateLicenseFormContent />
    </Suspense>
  )
}

export default function CreateLicensePage() {
  return (
    <AuthGuard allowedRoles={["am"]}>
      <CreateLicenseForm />
    </AuthGuard>
  )
}
