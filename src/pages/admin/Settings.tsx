import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Save, DollarSign, Bell, Shield, Palette, Globe, RefreshCw } from "lucide-react"

export default function AdminSettings() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 1000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage system configuration and preferences.</p>
      </div>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#187C19]" />
            Payment Settings
          </CardTitle>
          <CardDescription>Configure membership fee and payment parameters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Membership Fee Amount</label>
              <Input type="number" defaultValue={50} placeholder="0.00" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Currency</label>
              <Input defaultValue="PHP" placeholder="PHP" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Payment Deadline</label>
            <Input type="date" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">GCash Payments</span>
            <Badge variant="success">Enabled</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#187C19]" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure system notifications and alerts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Email Notifications</p>
              <p className="text-xs text-gray-500">Send email alerts for events and announcements</p>
            </div>
            <Badge variant="success">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">SMS Notifications</p>
              <p className="text-xs text-gray-500">Send SMS alerts for urgent announcements</p>
            </div>
            <Badge variant="secondary">Disabled</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#187C19]" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage authentication and security preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500">Require 2FA for admin accounts</p>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Session Timeout</p>
              <p className="text-xs text-gray-500">Auto-logout after period of inactivity</p>
            </div>
            <span className="text-sm font-medium">30 min</span>
          </div>
        </CardContent>
      </Card>

      {/* Branding Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#187C19]" />
            Branding
          </CardTitle>
          <CardDescription>Customize the look and feel of the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Primary Color</label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#187C19] border" />
                <span className="text-sm text-gray-600">#187C19</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Secondary Color</label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#69B41E] border" />
                <span className="text-sm text-gray-600">#69B41E</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">System Name</label>
              <Input defaultValue="Squared" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : saved ? (
            <><Save className="w-4 h-4 mr-2" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Save Settings</>
          )}
        </Button>
      </div>
    </div>
  )
}
