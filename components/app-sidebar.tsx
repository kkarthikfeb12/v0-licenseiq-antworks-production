"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  KeyRound,
  BarChart3,
  ClipboardList,
  UserCheck,
  FileCheck,
  Building2,
  Bell
} from "lucide-react"
import { useAuthStore } from "@/lib/store"
import type { UserRole } from "@/lib/types"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

const navItems: NavItem[] = [
  // AM Navigation
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["am"]
  },
  {
    title: "My Licenses",
    href: "/dashboard/licenses",
    icon: FileText,
    roles: ["am"]
  },
  {
    title: "Create Request",
    href: "/dashboard/create",
    icon: FileCheck,
    roles: ["am"]
  },
  
  // License Team Navigation
  {
    title: "Service Desk",
    href: "/license-team",
    icon: ClipboardList,
    roles: ["license_team"]
  },
  {
    title: "My Tickets",
    href: "/license-team/my-tickets",
    icon: FileText,
    roles: ["license_team"]
  },
  
  // CEO Navigation
  {
    title: "Pending Approvals",
    href: "/ceo",
    icon: UserCheck,
    roles: ["ceo"]
  },
  
  // Admin Navigation
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["admin"]
  },
  {
    title: "Licenses",
    href: "/admin/licenses",
    icon: FileText,
    roles: ["admin"]
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    roles: ["admin"]
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"]
  },
  {
    title: "Audit Logs",
    href: "/admin/audit",
    icon: ClipboardList,
    roles: ["admin"]
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["admin"]
  }
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, logout } = useAuthStore()

  if (!currentUser) return null

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(currentUser.role)
  )

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Administrator"
      case "am":
        return "Account Manager"
      case "license_team":
        return "License Team"
      case "ceo":
        return "CEO"
      default:
        return role
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <KeyRound className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">LicenseIQ</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            {getRoleLabel(currentUser.role)}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentUser.role === "am" && currentUser.mapped_clients.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
                My Clients
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {currentUser.mapped_clients.map((client) => (
                    <SidebarMenuItem key={client}>
                      <SidebarMenuButton asChild tooltip={client}>
                        <Link href={`/dashboard?client=${encodeURIComponent(client)}`}>
                          <Building2 className="h-4 w-4" />
                          <span className="truncate">{client}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-sidebar-foreground">
                      {currentUser.name}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      {currentUser.email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                side="top"
                align="start"
                sideOffset={4}
              >
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{currentUser.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {getRoleLabel(currentUser.role)}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
