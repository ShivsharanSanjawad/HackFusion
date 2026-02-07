import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Zap,
  Droplets,
  Construction,
  Trash2,
  Lightbulb,
  ClipboardList,
  UserCircle,
  Home,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '../ThemeToggle';
import { cn } from '@/lib/utils';
import { UserRole } from '@/data/mockData';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Home', icon: Home, href: '/', roles: ['citizen', 'authority', 'field-staff'] },
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['citizen'] },
  { label: 'Authority Hub', icon: LayoutDashboard, href: '/authority/dashboard', roles: ['authority'] },
  { label: 'Field Tasks', icon: LayoutDashboard, href: '/field-staff/dashboard', roles: ['field-staff'] },
  { label: 'Incidents', icon: ClipboardList, href: '/incidents', roles: ['authority', 'field-staff'] },
  { label: 'My Reports', icon: FileText, href: '/my-reports', roles: ['citizen'] },
  { label: 'Map View', icon: MapPin, href: '/map', roles: ['citizen', 'authority', 'field-staff'] },
  { label: 'Team', icon: Users, href: '/team', roles: ['authority'] },
  { label: 'Settings', icon: Settings, href: '/settings', roles: ['citizen', 'authority', 'field-staff'] },
];

const categoryLinks = [
  { label: 'Power', icon: Zap, color: 'text-yellow-500' },
  { label: 'Water', icon: Droplets, color: 'text-blue-500' },
  { label: 'Roads', icon: Construction, color: 'text-orange-500' },
  { label: 'Sanitation', icon: Trash2, color: 'text-green-500' },
  { label: 'Streetlights', icon: Lightbulb, color: 'text-purple-500' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userRole = user?.role || 'citizen';

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50 shadow-xl"
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <motion.div
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
          className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0"
        >
          <MapPin className="w-5 h-5 text-white" />
        </motion.div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="font-display font-bold text-lg text-sidebar-foreground">UrbanFlow</h1>
            <p className="text-xs text-sidebar-foreground/60">Infrastructure Hub</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map((item, index) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  'hover:bg-sidebar-accent',
                  isActive && 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow',
                  !isActive && 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            </motion.div>
          );
        })}

        {/* Categories Section */}
        {!collapsed && (
          <div className="pt-6">
            <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3">
              Categories
            </h3>
            {categoryLinks.map((category, index) => (
              <motion.div
                key={category.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center gap-3 px-3 py-2 text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer transition-colors"
              >
                <category.icon className={cn('w-4 h-4', category.color)} />
                <span className="text-sm">{category.label}</span>
              </motion.div>
            ))}
          </div>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* User Info */}
        {user && (
          <div className={cn(
            'flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/50',
            collapsed && 'justify-center'
          )}>
            <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role.replace('-', ' ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-xl',
            'text-sidebar-foreground/70 hover:text-danger hover:bg-danger/10',
            'transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <motion.main
        initial={false}
        animate={{ marginLeft: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen"
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-lg flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-display font-semibold">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
            </button>
            <button className="p-2 rounded-xl hover:bg-muted transition-colors">
              <UserCircle className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
