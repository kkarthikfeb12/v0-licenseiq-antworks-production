import type { User, License, AuditEntry, SystemConfig, LicenseStatus, ApprovalPayload } from "./types"

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15)

// Helper to generate ticket IDs
let ticketCounter = 1000
const generateTicketId = () => `TKT-${String(ticketCounter++).padStart(4, "0")}`

// Parse date string like "16-Apr-25" to ISO format
const parseDate = (dateStr: string): string => {
  const months: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
  }
  const parts = dateStr.split("-")
  if (parts.length !== 3) return new Date().toISOString()
  const day = parts[0].padStart(2, "0")
  const month = months[parts[1]] || "01"
  const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2]
  return `${year}-${month}-${day}`
}

// System configuration
export const systemConfig: SystemConfig = {
  id: "system-config-1",
  products: [
    "CMR",
    "CMR+",
    "QueenBOT",
    "ANTstein suite",
    "FAI - TaxBOT",
    "FAI - TitleBOT",
    "FAI - FareAuditBOT",
    "EXL - Logistics",
    "DI",
    "Queenbot"
  ],
  environments: ["Production", "UAT", "Dev", "DR", "Staging", "QA", "IT", "DEV"],
  license_team: ["Puthiyaraj", "Manish", "Abhijith"],
  product_support_dl: "productsupport@antworks.com",
  auth_methods: [
    "Mac ID",
    "IP Add",
    "Machine Name",
    "Volume ID",
    "Proc ID",
    "Mother Board Serial No"
  ],
  license_types: ["Volume", "Servers", "Period"]
}

// Seed users
export const seedUsers: User[] = [
  // Admins
  {
    id: "admin-1",
    name: "System Admin",
    email: "admin@antworks.com",
    role: "admin",
    department: "IT",
    mapped_clients: [],
    disabled: false,
    last_login: new Date().toISOString(),
    password: "admin123",
    createdAt: new Date().toISOString()
  },
  
  // CEO
  {
    id: "ceo-1",
    name: "Asheesh Mehra",
    email: "ceo@antworks.com",
    role: "ceo",
    department: "Executive",
    mapped_clients: [],
    disabled: false,
    last_login: null,
    password: "ceo123",
    createdAt: new Date().toISOString()
  },
  
  // Account Managers
  {
    id: "am-1",
    name: "Abhishek",
    email: "abhishek@antworks.com",
    role: "am",
    department: "Sales",
    mapped_clients: ["Mercer - Health", "USC"],
    disabled: false,
    last_login: null,
    password: "am123",
    createdAt: new Date().toISOString()
  },
  {
    id: "am-2",
    name: "Balaji G",
    email: "balaji@antworks.com",
    role: "am",
    department: "Sales",
    mapped_clients: ["Mercer - Health"],
    disabled: false,
    last_login: null,
    password: "am123",
    createdAt: new Date().toISOString()
  },
  {
    id: "am-3",
    name: "Murtuza",
    email: "murtuza@antworks.com",
    role: "am",
    department: "Sales",
    mapped_clients: ["US Bank"],
    disabled: false,
    last_login: null,
    password: "am123",
    createdAt: new Date().toISOString()
  },
  {
    id: "am-4",
    name: "Sumer",
    email: "sumer@antworks.com",
    role: "am",
    department: "Sales",
    mapped_clients: ["Kotak", "CYPRESS", "GUUD", "Scoot PTE LTD"],
    disabled: false,
    last_login: null,
    password: "am123",
    createdAt: new Date().toISOString()
  },
  {
    id: "am-5",
    name: "Jason Moore",
    email: "jason@antworks.com",
    role: "am",
    department: "Sales",
    mapped_clients: ["Marsh Asia Slips"],
    disabled: false,
    last_login: null,
    password: "am123",
    createdAt: new Date().toISOString()
  },
  {
    id: "am-6",
    name: "Ben",
    email: "ben@antworks.com",
    role: "am",
    department: "Sales",
    mapped_clients: ["Marsh Asia Slips", "Marsh Policy Intake"],
    disabled: false,
    last_login: null,
    password: "am123",
    createdAt: new Date().toISOString()
  },
  {
    id: "am-7",
    name: "Shanmugapriya",
    email: "shanmugapriya@antworks.com",
    role: "am",
    department: "Sales",
    mapped_clients: ["Fetch Insurance Services LLC"],
    disabled: false,
    last_login: null,
    password: "am123",
    createdAt: new Date().toISOString()
  },
  {
    id: "am-8",
    name: "Gokul",
    email: "gokul@antworks.com",
    role: "am",
    department: "Sales",
    mapped_clients: ["American Type Culture Collection / ATCC"],
    disabled: false,
    last_login: null,
    password: "am123",
    createdAt: new Date().toISOString()
  },
  
  // License Team
  {
    id: "lt-1",
    name: "Puthiyaraj",
    email: "puthiyaraj@antworks.com",
    role: "license_team",
    department: "License Operations",
    mapped_clients: [],
    disabled: false,
    last_login: null,
    password: "lt123",
    createdAt: new Date().toISOString()
  },
  {
    id: "lt-2",
    name: "Manish",
    email: "manish@antworks.com",
    role: "license_team",
    department: "License Operations",
    mapped_clients: [],
    disabled: false,
    last_login: null,
    password: "lt123",
    createdAt: new Date().toISOString()
  },
  {
    id: "lt-3",
    name: "Abhijith",
    email: "abhijith@antworks.com",
    role: "license_team",
    department: "License Operations",
    mapped_clients: [],
    disabled: false,
    last_login: null,
    password: "lt123",
    createdAt: new Date().toISOString()
  }
]

// Raw license data from seed
const rawLicenseData = [
  { am: "Abhishek", product: "CMR", issueDate: "16-Apr-25", endDate: "15-Apr-26", environment: "Production", client: "Mercer - Health", status: "Draft" },
  { am: "Abhishek", product: "CMR", issueDate: "16-Apr-25", endDate: "15-Apr-26", environment: "Production", client: "Mercer - Health", status: "Active" },
  { am: "Abhishek", product: "CMR", issueDate: "16-Apr-25", endDate: "15-Apr-26", environment: "Dev", client: "Mercer - Health", status: "Active" },
  { am: "Balaji G", product: "CMR", issueDate: "16-Apr-25", endDate: "15-Apr-26", environment: "Dev", client: "Mercer - Health", status: "Draft" },
  { am: "Abhishek", product: "CMR", issueDate: "16-Apr-25", endDate: "15-Apr-26", environment: "Staging", client: "Mercer - Health", status: "Active" },
  { am: "Abhishek", product: "CMR", issueDate: "16-Apr-25", endDate: "15-Apr-26", environment: "Staging", client: "Mercer - Health", status: "Active" },
  { am: "Murtuza", product: "CMR+", issueDate: "30-Mar-26", endDate: "15-Apr-26", environment: "Production", client: "US Bank", status: "Draft" },
  { am: "Murtuza", product: "CMR+", issueDate: "30-Mar-26", endDate: "15-Apr-26", environment: "DR", client: "US Bank", status: "Draft" },
  { am: "Murtuza", product: "CMR+", issueDate: "30-Mar-26", endDate: "15-Apr-26", environment: "UAT", client: "US Bank", status: "Active" },
  { am: "Murtuza", product: "CMR+", issueDate: "30-Mar-26", endDate: "15-Apr-26", environment: "IT", client: "US Bank", status: "Active" },
  { am: "Murtuza", product: "CMR+", issueDate: "30-Mar-26", endDate: "15-Apr-26", environment: "Dev", client: "US Bank", status: "Active" },
  { am: "Sumer", product: "CMR", issueDate: "7-Apr-26", endDate: "22-Apr-26", environment: "Production", client: "Kotak", status: "Expired" },
  { am: "Sumer", product: "CMR", issueDate: "7-Apr-26", endDate: "22-Apr-26", environment: "Production", client: "Kotak", status: "Active" },
  { am: "Sumer", product: "CMR", issueDate: "7-Apr-26", endDate: "22-Apr-26", environment: "Production", client: "Kotak", status: "Active" },
  { am: "Sumer", product: "CMR", issueDate: "7-Apr-26", endDate: "22-Apr-26", environment: "Production", client: "Kotak", status: "Active" },
  { am: "Sumer", product: "Queenbot", issueDate: "7-Apr-26", endDate: "22-Apr-26", environment: "Production", client: "Kotak", status: "Active" },
  { am: "Sumer", product: "Queenbot", issueDate: "7-Apr-26", endDate: "22-Apr-26", environment: "UAT", client: "Kotak", status: "Expired" },
  { am: "Sumer", product: "CMR", issueDate: "7-Apr-26", endDate: "22-Apr-26", environment: "UAT", client: "Kotak", status: "Active" },
  { am: "Sumer", product: "CMR", issueDate: "1-Apr-25", endDate: "30-Apr-26", environment: "Production", client: "CYPRESS", status: "Active" },
  { am: "Jason Moore", product: "CMR+", issueDate: "25-Aug-25", endDate: "22-Jun-26", environment: "Dev", client: "Marsh Asia Slips", status: "Draft" },
  { am: "Abhishek", product: "CMR", issueDate: "25-Jun-25", endDate: "24-Jun-26", environment: "QA", client: "USC", status: "Active" },
  { am: "Abhishek", product: "DI", issueDate: "25-Jun-25", endDate: "24-Jun-26", environment: "QA", client: "USC", status: "Active" },
  { am: "Abhishek", product: "CMR", issueDate: "25-Jun-25", endDate: "24-Jun-26", environment: "Production", client: "USC", status: "Active" },
  { am: "Abhishek", product: "DI", issueDate: "25-Jun-25", endDate: "24-Jun-26", environment: "Production", client: "USC", status: "Active" },
  { am: "Ben", product: "CMR+", issueDate: "8-Oct-25", endDate: "18-Aug-26", environment: "UAT", client: "Marsh Asia Slips", status: "Active" },
  { am: "Ben", product: "CMR+", issueDate: "8-Dec-25", endDate: "18-Aug-26", environment: "UAT", client: "Marsh Asia Slips", status: "Active" },
  { am: "Sumer", product: "CMR", issueDate: "2-Sep-25", endDate: "1-Sep-26", environment: "Production", client: "GUUD", status: "Active" },
  { am: "Ben", product: "CMR+", issueDate: "28-Nov-25", endDate: "30-Sep-26", environment: "Production", client: "Marsh Policy Intake", status: "Active" },
  { am: "Shanmugapriya", product: "DI", issueDate: "4-Jan-26", endDate: "11-Jan-27", environment: "UAT", client: "Fetch Insurance Services LLC", status: "Draft" },
  { am: "Shanmugapriya", product: "CMR+", issueDate: "4-Jan-26", endDate: "11-Jan-27", environment: "UAT", client: "Fetch Insurance Services LLC", status: "Draft" },
  { am: "Shanmugapriya", product: "DI", issueDate: "4-Jan-26", endDate: "11-Jan-27", environment: "Production", client: "Fetch Insurance Services LLC", status: "Active" },
  { am: "Shanmugapriya", product: "DI", issueDate: "4-Jan-26", endDate: "11-Jan-27", environment: "DR", client: "Fetch Insurance Services LLC", status: "Active" },
  { am: "Shanmugapriya", product: "CMR+", issueDate: "4-Jan-26", endDate: "11-Jan-27", environment: "DR", client: "Fetch Insurance Services LLC", status: "Active" },
  { am: "Shanmugapriya", product: "DI", issueDate: "4-Jan-26", endDate: "11-Jan-27", environment: "DEV", client: "Fetch Insurance Services LLC", status: "Active" },
  { am: "Shanmugapriya", product: "CMR+", issueDate: "4-Jan-26", endDate: "11-Jan-27", environment: "Production", client: "Fetch Insurance Services LLC", status: "Active" },
  { am: "Shanmugapriya", product: "CMR+", issueDate: "5-Jan-26", endDate: "11-Jan-27", environment: "DEV", client: "Fetch Insurance Services LLC", status: "Active" },
  { am: "Gokul", product: "CMR+", issueDate: "7-Jan-26", endDate: "11-Jan-27", environment: "Production", client: "American Type Culture Collection / ATCC", status: "Expired" },
  { am: "Gokul", product: "CMR+", issueDate: "8-Apr-26", endDate: "11-Jan-27", environment: "UAT", client: "American Type Culture Collection / ATCC", status: "Active" },
  { am: "Murtuza", product: "CMR+", issueDate: "5-Jan-26", endDate: "14-Jan-27", environment: "Production", client: "US Bank", status: "Active" },
  { am: "Murtuza", product: "CMR+", issueDate: "5-Jan-26", endDate: "14-Jan-27", environment: "DR", client: "US Bank", status: "Active" },
  { am: "Murtuza", product: "CMR+", issueDate: "5-Jan-26", endDate: "14-Jan-27", environment: "UAT", client: "US Bank", status: "Active" },
  { am: "Murtuza", product: "CMR+", issueDate: "5-Jan-26", endDate: "14-Jan-27", environment: "IT", client: "US Bank", status: "Active" },
  { am: "Sumer", product: "CMR", issueDate: "8-Feb-26", endDate: "8-Feb-27", environment: "Production", client: "Scoot PTE LTD", status: "Active" },
  { am: "Sumer", product: "CMR", issueDate: "8-Feb-26", endDate: "8-Feb-27", environment: "UAT", client: "Scoot PTE LTD", status: "Active" }
]

// Find AM user by name
const findAmUser = (amName: string): User | undefined => {
  return seedUsers.find(u => u.role === "am" && u.name === amName)
}

// Generate seed licenses from raw data
export const seedLicenses: License[] = rawLicenseData.map((item, index) => {
  const amUser = findAmUser(item.am)
  const now = new Date().toISOString()
  
  const defaultPayload: ApprovalPayload = {
    license_requested_by: item.am,
    client_name: item.client,
    client_contact_person_name: "",
    client_contact_email: "",
    antworks_business_contact: item.am,
    antworks_technical_contact: "",
    product: item.product,
    environment: item.environment,
    license_type: "Period",
    auth_method: "Mac ID",
    auth_value: "",
    contract_signed_date: parseDate(item.issueDate),
    contract_period: "12 months",
    license_required_by: parseDate(item.issueDate),
    license_issue_date: parseDate(item.issueDate),
    license_end_date: parseDate(item.endDate),
    cto_approval: item.status === "Active",
    finance_approval: item.status === "Active",
    management_approval: item.status === "Active",
    it_head_approval: item.status === "Active",
    custom_fields: [],
    routing: "bypass",
    cc_product_support: false
  }

  return {
    id: generateId(),
    ticket_id: `TKT-${String(1000 + index).padStart(4, "0")}`,
    am_name: item.am,
    am_id: amUser?.id || "unknown",
    client: item.client,
    product: item.product,
    environment: item.environment,
    status: item.status as LicenseStatus,
    assigned_license_team_member: item.status === "Active" ? systemConfig.license_team[index % 3] : null,
    cc_product_support: false,
    required_fields: [],
    approval_payload: defaultPayload,
    shared_by_name: item.status === "Active" ? systemConfig.license_team[index % 3] : null,
    issueDate: parseDate(item.issueDate),
    endDate: parseDate(item.endDate),
    created_at: now,
    updated_at: now,
    magic_token: null,
    ceo_approved_at: null,
    ceo_approved_by: null
  }
})

// Update ticket counter for new licenses
ticketCounter = 1000 + rawLicenseData.length

// Seed audit entries
export const seedAuditEntries: AuditEntry[] = seedLicenses.slice(0, 10).map((license, index) => ({
  id: generateId(),
  license_id: license.id,
  user_id: license.am_id,
  action: "TICKET_CREATED" as const,
  details: {
    ticket_id: license.ticket_id,
    client: license.client,
    product: license.product
  },
  timestamp: new Date(Date.now() - (10 - index) * 24 * 60 * 60 * 1000).toISOString()
}))

// All unique clients for dropdowns
export const allClients = [...new Set(rawLicenseData.map(l => l.client))]

// Export helper for generating new ticket IDs
export const getNextTicketId = () => generateTicketId()
