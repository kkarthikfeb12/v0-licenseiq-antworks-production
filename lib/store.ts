import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, License, AuditEntry, SystemConfig, AuditAction, LicenseStatus, ApprovalPayload } from "./types"
import { seedUsers, seedLicenses, seedAuditEntries, systemConfig, getNextTicketId } from "./seed-data"

// Current user store for RBAC
interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // First check persisted users from data store, then fall back to seed data
        const dataStoreUsers = useDataStore.getState().users
        const allUsers = dataStoreUsers.length > 0 ? dataStoreUsers : seedUsers
        
        // Find user by email (case-insensitive) and password
        const user = allUsers.find(u => 
          u.email.toLowerCase() === email.toLowerCase() && 
          u.password === password && 
          !u.disabled
        )
        
        if (user) {
          const updatedUser = { ...user, last_login: new Date().toISOString() }
          set({ currentUser: updatedUser, isAuthenticated: true })
          
          // Log login event
          useDataStore.getState().addAuditEntry({
            license_id: null,
            user_id: user.id,
            action: "USER_LOGIN",
            details: { email: user.email, role: user.role }
          })
          
          return { success: true }
        }
        return { success: false, error: "Invalid email or password" }
      },
      logout: () => {
        set({ currentUser: null, isAuthenticated: false })
      }
    }),
    {
      name: "licenseiq-auth"
    }
  )
)

// Data store for licenses, users, audit, etc.
interface DataState {
  users: User[]
  licenses: License[]
  auditEntries: AuditEntry[]
  systemConfig: SystemConfig
  
  // User actions
  getUsers: () => User[]
  getUserById: (id: string) => User | undefined
  updateUser: (id: string, updates: Partial<User>) => void
  addUser: (user: Omit<User, "id">) => User
  
  // License actions
  getLicenses: () => License[]
  getLicenseById: (id: string) => License | undefined
  getLicenseByTicketId: (ticketId: string) => License | undefined
  getLicensesByStatus: (status: LicenseStatus) => License[]
  getLicensesByAm: (amId: string) => License[]
  getLicensesByClient: (client: string) => License[]
  createLicense: (data: {
    amId: string
    amName: string
    approvalPayload: ApprovalPayload
  }) => License
  updateLicense: (id: string, updates: Partial<License>) => void
  claimLicense: (licenseId: string, teamMember: string) => void
  activateLicense: (licenseId: string, sharedBy: string) => void
  
  // Audit actions
  getAuditEntries: () => AuditEntry[]
  getAuditByLicense: (licenseId: string) => AuditEntry[]
  addAuditEntry: (entry: Omit<AuditEntry, "id" | "timestamp">) => void
  
  // System config
  getSystemConfig: () => SystemConfig
  updateSystemConfig: (updates: Partial<SystemConfig>) => void
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      licenses: seedLicenses,
      auditEntries: seedAuditEntries,
      systemConfig: systemConfig,
      
      // User actions
      getUsers: () => get().users,
      getUserById: (id: string) => get().users.find(u => u.id === id),
      updateUser: (id: string, updates: Partial<User>) => {
        set(state => ({
          users: state.users.map(u => u.id === id ? { ...u, ...updates } : u)
        }))
      },
      addUser: (user: Omit<User, "id">) => {
        const newUser: User = {
          ...user,
          id: Math.random().toString(36).substring(2, 15)
        }
        set(state => ({ users: [...state.users, newUser] }))
        return newUser
      },
      
      // License actions
      getLicenses: () => get().licenses,
      getLicenseById: (id: string) => get().licenses.find(l => l.id === id),
      getLicenseByTicketId: (ticketId: string) => get().licenses.find(l => l.ticket_id === ticketId),
      getLicensesByStatus: (status: LicenseStatus) => get().licenses.filter(l => l.status === status),
      getLicensesByAm: (amId: string) => get().licenses.filter(l => l.am_id === amId),
      getLicensesByClient: (client: string) => get().licenses.filter(l => l.client === client),
      
      createLicense: (data) => {
        const now = new Date().toISOString()
        const newLicense: License = {
          id: Math.random().toString(36).substring(2, 15),
          ticket_id: getNextTicketId(),
          am_name: data.amName,
          am_id: data.amId,
          client: data.approvalPayload.client_name,
          product: data.approvalPayload.product,
          environment: data.approvalPayload.environment,
          status: data.approvalPayload.routing === "ceo" ? "Pending CEO" : "Pending License Team",
          assigned_license_team_member: null,
          cc_product_support: data.approvalPayload.cc_product_support,
          required_fields: [],
          approval_payload: data.approvalPayload,
          shared_by_name: null,
          issueDate: data.approvalPayload.license_issue_date,
          endDate: data.approvalPayload.license_end_date,
          created_at: now,
          updated_at: now,
          magic_token: data.approvalPayload.routing === "ceo" ? Math.random().toString(36).substring(2, 30) : null,
          ceo_approved_at: null,
          ceo_approved_by: null
        }
        
        set(state => ({ licenses: [newLicense, ...state.licenses] }))
        
        // Add audit entry
        get().addAuditEntry({
          license_id: newLicense.id,
          user_id: data.amId,
          action: "TICKET_CREATED",
          details: {
            ticket_id: newLicense.ticket_id,
            client: newLicense.client,
            product: newLicense.product,
            routing: data.approvalPayload.routing
          }
        })
        
        return newLicense
      },
      
      updateLicense: (id: string, updates: Partial<License>) => {
        set(state => ({
          licenses: state.licenses.map(l => 
            l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
          )
        }))
      },
      
      claimLicense: (licenseId: string, teamMember: string) => {
        get().updateLicense(licenseId, { assigned_license_team_member: teamMember })
        get().addAuditEntry({
          license_id: licenseId,
          user_id: null,
          action: "CLAIMED_BY",
          details: { team_member: teamMember }
        })
      },
      
      activateLicense: (licenseId: string, sharedBy: string) => {
        get().updateLicense(licenseId, { 
          status: "Active", 
          shared_by_name: sharedBy 
        })
        get().addAuditEntry({
          license_id: licenseId,
          user_id: null,
          action: "LICENSE_ACTIVATED",
          details: { shared_by: sharedBy }
        })
      },
      
      // Audit actions
      getAuditEntries: () => get().auditEntries,
      getAuditByLicense: (licenseId: string) => 
        get().auditEntries.filter(a => a.license_id === licenseId),
      addAuditEntry: (entry) => {
        const newEntry: AuditEntry = {
          ...entry,
          id: Math.random().toString(36).substring(2, 15),
          timestamp: new Date().toISOString()
        }
        set(state => ({ auditEntries: [newEntry, ...state.auditEntries] }))
      },
      
      // System config
      getSystemConfig: () => get().systemConfig,
      updateSystemConfig: (updates: Partial<SystemConfig>) => {
        set(state => ({
          systemConfig: { ...state.systemConfig, ...updates }
        }))
      }
    }),
    {
      name: "licenseiq-data"
    }
  )
)

// Convenience hook that combines both stores
export const useStore = () => {
  const auth = useAuthStore()
  const data = useDataStore()
  return {
    ...auth,
    ...data,
    addUser: (user: Omit<User, "id" | "createdAt">) => {
      return data.addUser({
        ...user,
        password: user.password || "password123",
        createdAt: new Date().toISOString()
      } as Omit<User, "id">)
    },
    deleteUser: (id: string) => {
      data.updateUser(id, { disabled: true })
    }
  }
}
