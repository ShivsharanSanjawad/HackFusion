import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  LogOut,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DashboardLayout } from '@/components/layout/Sidebar';
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <DashboardLayout>
    <div className="p-6 space-y-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and system options
        </p>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Profile</h2>
          </div>

          <div className="space-y-4">
            <Input placeholder="Full Name" defaultValue="User" />
            <Input placeholder="Email Address" defaultValue="abc@example.com" />
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Notifications</h2>
          </div>

          <div className="space-y-4">
            <ToggleRow label="Email Notifications" />
            <ToggleRow label="Push Notifications" />
            <ToggleRow label="SMS Alerts" />
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Appearance</h2>
          </div>

          <div className="space-y-4">
            <ToggleRow label="Dark Mode" />
            <ToggleRow label="High Contrast Mode" />
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Privacy & Security</h2>
          </div>

          <div className="space-y-4">
            <ToggleRow label="Two-Factor Authentication" />
            <ToggleRow label="Public Profile Visibility" />
          </div>
        </motion.div>

        {/* Language */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Language & Region</h2>
          </div>

          <Input defaultValue="English (India)" />
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <LogOut className="w-5 h-5 text-danger" />
            <h2 className="font-semibold text-lg">Account</h2>
          </div>

          <Button variant="destructive" className="w-full">
            Logout
          </Button>
        </motion.div>

      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-gradient-primary shadow-glow">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

    </div>
    </DashboardLayout>
  );
}

/* ---------- Helper Component ---------- */

function ToggleRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch />
    </div>
  );
}
