import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Users, 
  Briefcase, 
  Wrench,
  Chrome,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const roles = [
  { 
    id: 'citizen' as UserRole, 
    label: 'Citizen', 
    icon: Users, 
    description: 'Report and track issues',
    color: 'from-blue-500 to-cyan-500',
  },
  { 
    id: 'authority' as UserRole, 
    label: 'Authority', 
    icon: Briefcase, 
    description: 'Manage and assign tasks',
    color: 'from-purple-500 to-pink-500',
  },
  { 
    id: 'field-staff' as UserRole, 
    label: 'Field Staff', 
    icon: Wrench, 
    description: 'Resolve field issues',
    color: 'from-orange-500 to-yellow-500',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const success = await login(email, password, selectedRole);
    
    if (success) {
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${selectedRole.replace('-', ' ')}`,
      });
      
      // Route to appropriate dashboard based on role
      const dashboardRoutes: Record<typeof selectedRole, string> = {
        citizen: '/dashboard',
        authority: '/authority/dashboard',
        'field-staff': '/field-staff/dashboard',
      };
      
      navigate(dashboardRoutes[selectedRole]);
    } else {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center mx-auto mb-8">
              <MapPin className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-4">
              Welcome Back
            </h1>
            <p className="text-white/80 max-w-sm mb-8">
              Continue your journey in making our city's infrastructure better for everyone.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 p-6 rounded-2xl bg-white/10 backdrop-blur-lg">
              <div>
                <p className="text-3xl font-bold">2.8K</p>
                <p className="text-sm text-white/70">Issues Resolved</p>
              </div>
              <div>
                <p className="text-3xl font-bold">98%</p>
                <p className="text-sm text-white/70">Satisfaction</p>
              </div>
              <div>
                <p className="text-3xl font-bold">4.5h</p>
                <p className="text-sm text-white/70">Avg. Response</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 relative">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Logo for mobile */}
          <Link to="/" className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl">UrbanFlow</span>
          </Link>

          <h2 className="text-2xl font-display font-bold mb-2">Sign in to your account</h2>
          <p className="text-muted-foreground mb-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>

          {/* Role Selection */}
          <div className="mb-8">
            <Label className="text-sm font-medium mb-3 block">Select your role</Label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((role) => (
                <motion.button
                  key={role.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRole(role.id)}
                  className={cn(
                    'relative p-4 rounded-xl border-2 transition-all duration-300 text-center',
                    selectedRole === role.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center',
                      selectedRole === role.id
                        ? `bg-gradient-to-br ${role.color} text-white`
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <role.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium">{role.label}</p>
                  {selectedRole === role.id && (
                    <motion.div
                      layoutId="selectedRole"
                      className="absolute inset-0 border-2 border-primary rounded-xl"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    'pl-10',
                    errors.email && 'border-danger focus-visible:ring-danger'
                  )}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-danger"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    'pl-10 pr-10',
                    errors.password && 'border-danger focus-visible:ring-danger'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-danger"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Social Login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 gap-4">
              <Button variant="outline" className="w-full" type="button">
                <Chrome className="w-5 h-5 mr-2" />
                Google
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
