"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"

export default function Home() {
  const router = useRouter()
  const { currentUser } = useStore()

  useEffect(() => {
    if (currentUser) {
      // Redirect based on role
      switch (currentUser.role) {
        case "admin":
          router.push("/admin")
          break
        case "ceo":
          router.push("/ceo")
          break
        case "license_team":
          router.push("/license-team")
          break
        case "am":
        default:
          router.push("/dashboard")
          break
      }
    } else {
      router.push("/login")
    }
  }, [currentUser, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
