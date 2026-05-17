// User roles
export type UserRole = "admin" | "am" | "license_team" | "ceo"

// License status
export type LicenseStatus =
  | "Draft"
  | "Pending CEO"
  | "Pending License Team"
  | "Active"
  | "Expired"

// User type
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
  mapped_clients: string[]
  disabled: boolean
  last_login: string | null
  password?: string
  createdAt: string
}

// License type
export interface License {
  id: string
  ticket_id: string
  am_name: string
  am_id: string
  client: string
  product: string
  environment: string
  status: LicenseStatus
  assigned_license_team_member: string | null
  cc_product_support: boolean
  required_fields: string[]
  approval_payload: ApprovalPayload
  shared_by_name: string | null
  issueDate: string
  endDate: string
  created_at: string
  updated_at: string
  magic_token?: string | null
  ceo_approved_at?: string | null
  ceo_approved_by?: string | null
}

// Approval payload structure
export interface ApprovalPayload {
  // Section 1 - General
  license_requested_by: string
  client_name: string
  client_contact_person_name: string
  client_contact_email: string
  antworks_business_contact: string
  antworks_technical_contact: string

  // Section 2 - Product & Technical
  product: string
  environment: string
  license_type: string
  auth_method: string
  auth_value: string

  // Section 3 - Validity & Contracts
  contract_signed_date: string
  contract_period: string
  license_required_by: string
  license_issue_date: string
  license_end_date: string

  // Section 4 - Internal Approvals
  cto_approval: boolean
  finance_approval: boolean
  management_approval: boolean
  it_head_approval: boolean

  // Section 5 - Dynamic Custom Fields
  custom_fields: CustomField[]

  // Section 6 - Routing
  routing: "ceo" | "bypass"
  cc_product_support: boolean
}

export interface CustomField {
  key: string
  value: string
}

// Audit trail action types
export type AuditAction =
  | "USER_LOGIN"
  | "TICKET_CREATED"
  | "CEO_APPROVED"
  | "AM_VERIFIED"
  | "EMAIL_SENT_TO_AM"
  | "EMAIL_SENT_TO_CEO"
  | "CLAIMED_BY"
  | "LICENSE_ACTIVATED"
  | "ADMIN_OVERRIDE"
  | "AM_REMINDER"
  | "EXPIRY_NOTICE"
  | "CEO_REJECTED"
  | "LICENSE_PROVISIONED"

// Audit trail entry
export interface AuditEntry {
  id: string
  license_id: string | null
  user_id: string | null
  action: AuditAction
  details: Record<string, unknown>
  timestamp: string
}

// System configuration
export interface SystemConfig {
  id: string
  products: string[]
  environments: string[]
  license_team: string[]
  product_support_dl: string
  auth_methods: string[]
  license_types: string[]
}

// Webhook types
export type WebhookType =
  | "CEO_SIGNOFF"
  | "TICKET_CREATED"
  | "LICENSE_ACTIVE_CC"
  | "AM_REMINDER"
  | "EXPIRY_NOTICE"
  | "PASSWORD_RESET"

// Webhook payload
export interface WebhookPayload {
  to: string
  type: WebhookType
  subject: string
  payload?: ApprovalPayload
  magic_link?: string
  reset_url?: string
  html?: string
}
