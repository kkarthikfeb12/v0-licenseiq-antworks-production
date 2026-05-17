"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KeyRound, Mail, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuthStore()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await login(email, password)
      
      if (result.success) {
        // Get the current user to determine redirect
        const currentUser = useAuthStore.getState().currentUser
        
        switch (currentUser?.role) {
          case "Admin":
            router.push("/admin")
            break
          case "AM":
            router.push("/dashboard")
            break
          case "LicenseTeam":
            router.push("/license-team")
            break
          case "CEO":
            router.push("/ceo")
            break
          default:
            router.push("/dashboard")
        }
      } else {
        setError(result.error || "Login failed")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-0 bg-card">
      <CardHeader className="space-y-2 pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">LicenseIQ</span>
          </div>
        </div>
        <CardTitle className="text-xl font-semibold text-center text-foreground">Welcome back</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-3">Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-muted rounded-md">
              <p className="font-medium text-foreground">Admin</p>
              <p className="text-muted-foreground">admin@antworks.com</p>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <p className="font-medium text-foreground">CEO</p>
              <p className="text-muted-foreground">ceo@antworks.com</p>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <p className="font-medium text-foreground">AM</p>
              <p className="text-muted-foreground">abhishek@antworks.com</p>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <p className="font-medium text-foreground">License Team</p>
              <p className="text-muted-foreground">puthiyaraj@antworks.com</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">Password: admin123, ceo123, am123, lt123</p>
        </div>
      </CardContent>
    </Card>
  )
}
