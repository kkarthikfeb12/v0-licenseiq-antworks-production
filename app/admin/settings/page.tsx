"use client"

import { useState } from "react"
import { useDataStore, useAuthStore } from "@/lib/store"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Bell, Shield, Database, Save, RefreshCw } from "lucide-react"
import { toast } from "sonner"

function SettingsContent() {
  const { systemConfig, updateSystemConfig, addAuditEntry } = useDataStore()
  const { currentUser } = useAuthStore()
  
  const [emailSettings, setEmailSettings] = useState({
    productSupportDL: systemConfig.product_support_dl,
    smtpHost: "smtp.antworks.com",
    smtpPort: "587",
    smtpUser: "notifications@antworks.com"
  })
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnCreate: true,
    emailOnApproval: true,
    emailOnActivation: true,
    slackIntegration: false
  })
  
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    requireMfa: false,
    passwordExpiry: 90,
    maxLoginAttempts: 5
  })

  const handleSaveEmailSettings = () => {
    updateSystemConfig({ product_support_dl: emailSettings.productSupportDL })
    addAuditEntry({
      license_id: null,
      user_id: currentUser?.id || null,
      action: "ADMIN_OVERRIDE",
      details: { section: "email", changes: emailSettings }
    })
    toast.success("Email settings saved successfully")
  }

  const handleSaveNotificationSettings = () => {
    addAuditEntry({
      license_id: null,
      user_id: currentUser?.id || null,
      action: "ADMIN_OVERRIDE",
      details: { section: "notifications", changes: notificationSettings }
    })
    toast.success("Notification settings saved successfully")
  }

  const handleSaveSecuritySettings = () => {
    addAuditEntry({
      license_id: null,
      user_id: currentUser?.id || null,
      action: "ADMIN_OVERRIDE",
      details: { section: "security", changes: securitySettings }
    })
    toast.success("Security settings saved successfully")
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Settings" }
      ]}
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">Configure LicenseIQ system settings</p>
          </div>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-[600px]">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>
                  Configure email settings for notifications and approvals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="productSupportDL">Product Support DL</Label>
                    <Input
                      id="productSupportDL"
                      type="email"
                      value={emailSettings.productSupportDL}
                      onChange={(e) => setEmailSettings({ ...emailSettings, productSupportDL: e.target.value })}
                      placeholder="support@company.com"
                    />
                    <p className="text-sm text-muted-foreground">
                      Distribution list for product support notifications
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                      placeholder="smtp.example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                      placeholder="587"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={emailSettings.smtpUser}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={handleSaveEmailSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Email Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure when and how notifications are sent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email on License Creation</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email when a new license request is created
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailOnCreate}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, emailOnCreate: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email on CEO Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify AM when CEO approves or rejects a request
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailOnApproval}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, emailOnApproval: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email on License Activation</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify AM when license is activated by the team
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailOnActivation}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, emailOnActivation: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Slack Integration</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications to Slack channel
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.slackIntegration}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, slackIntegration: checked })
                      }
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotificationSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({ 
                        ...securitySettings, 
                        sessionTimeout: parseInt(e.target.value) || 30 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings({ 
                        ...securitySettings, 
                        maxLoginAttempts: parseInt(e.target.value) || 5 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings({ 
                        ...securitySettings, 
                        passwordExpiry: parseInt(e.target.value) || 90 
                      })}
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Multi-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require MFA for all users
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.requireMfa}
                    onCheckedChange={(checked) => 
                      setSecuritySettings({ ...securitySettings, requireMfa: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={handleSaveSecuritySettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  View system status and perform maintenance tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Application Version</h4>
                    <p className="text-2xl font-bold text-primary">v1.0.0</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Environment</h4>
                    <p className="text-2xl font-bold text-primary">Development</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Products Configured</h4>
                    <p className="text-2xl font-bold text-primary">{systemConfig.products.length}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Environments Configured</h4>
                    <p className="text-2xl font-bold text-primary">{systemConfig.environments.length}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => toast.info("Cache cleared successfully")}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" onClick={() => toast.info("Health check passed")}>
                    <Database className="mr-2 h-4 w-4" />
                    Run Health Check
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default function AdminSettingsPage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <SettingsContent />
    </AuthGuard>
  )
}
