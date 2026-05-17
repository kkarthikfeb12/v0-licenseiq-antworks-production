"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import type { UserRole } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"

interface AuthGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, currentUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check hydration
    const checkAuth = () => {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
        // Redirect to appropriate dashboard based on role
        switch (currentUser.role) {
          case "admin":
            router.push("/admin")
            break
          case "am":
            router.push("/dashboard")
            break
          case "license_team":
            router.push("/license-team")
            break
          case "ceo":
            router.push("/ceo")
            break
          default:
            router.push("/login")
        }
        return
      }

      setIsLoading(false)
    }

    // Small delay to allow hydration
    const timeout = setTimeout(checkAuth, 100)
    return () => clearTimeout(timeout)
  }, [isAuthenticated, currentUser, allowedRoles, router, pathname])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Higher-order component for role-based access
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}
