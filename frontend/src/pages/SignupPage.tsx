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
  ArrowLeft,
  Users, 
  Briefcase, 
  Wrench,
  User,
  Phone,
  Building2,
  MapPinned,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, wards, mockDepartments } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const roles = [
  { 
    id: 'citizen' as UserRole, 
    label: 'Citizen', 
    icon: Users, 
    description: 'Report issues in your area',
    color: 'from-blue-500 to-cyan-500',
  },
  { 
    id: 'field-staff' as UserRole, 
    label: 'Field Staff', 
    icon: Wrench, 
    description: 'Resolve assigned issues',
    color: 'from-orange-500 to-yellow-500',
  },
];

const steps = [
  { id: 1, title: 'Choose Role', description: 'Select your user type' },
  { id: 2, title: 'Basic Info', description: 'Your personal details' },
  { id: 3, title: 'Location', description: 'Area or department' },
  { id: 4, title: 'Security', description: 'Set your password' },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    role: 'citizen' as UserRole,
    name: '',
    email: '',
    ward: '',
    department: '',
    category: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 2:
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        break;
      case 3:
        if (formData.role === 'citizen' && !formData.ward) {
          newErrors.ward = 'Please select your ward';
        }
        if ((formData.role === 'authority' || formData.role === 'field-staff') && !formData.department) {
          newErrors.department = 'Please select your department';
        }
        if (formData.role === 'field-staff' && !formData.category) {
          newErrors.category = 'Please select your category';
        }
        break;
      case 4:
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.agreeToTerms) {
          newErrors.agreeToTerms = 'You must agree to the terms';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    const success = await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      ward: formData.ward,
      department: formData.department,
      category: formData.category,
    });

    if (success) {
      toast({
        title: 'Account created!',
        description: 'Welcome to UrbanFlow',
      });
      
      // Route to appropriate dashboard based on role
      const dashboardRoutes: Record<typeof formData.role, string> = {
        citizen: '/dashboard',
        authority: '/authority/dashboard',
        'field-staff': '/field-staff/dashboard',
      };
      
      navigate(dashboardRoutes[formData.role]);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid gap-4">
              {roles.map((role) => (
                <motion.button
                  key={role.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateFormData('role', role.id)}
                  className={cn(
                    'relative p-6 rounded-2xl border-2 transition-all duration-300 text-left flex items-center gap-4',
                    formData.role === role.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                      formData.role === role.id
                        ? `bg-gradient-to-br ${role.color} text-white`
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <role.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{role.label}</p>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                  {formData.role === role.id && (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className={cn('pl-10', errors.name && 'border-danger')}
                />
              </div>
              {errors.name && <p className="text-sm text-danger">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={cn('pl-10', errors.email && 'border-danger')}
                />
              </div>
              {errors.email && <p className="text-sm text-danger">{errors.email}</p>}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >              
            {formData.role === 'field-staff' && (
              <>
                <div className="space-y-2">
                  <Label>Select Your Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => updateFormData('department', value)}
                  >
                    <SelectTrigger className={errors.department ? 'border-danger' : ''}>
                      <SelectValue placeholder="Choose your department..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {dept.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-sm text-danger">{errors.department}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Select Your Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateFormData('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-danger' : ''}>
                      <SelectValue placeholder="Choose your category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="power">
                        <div className="flex items-center gap-2">
                          ⚡ Power
                        </div>
                      </SelectItem>
                      <SelectItem value="water">
                        <div className="flex items-center gap-2">
                          💧 Water
                        </div>
                      </SelectItem>
                      <SelectItem value="roads">
                        <div className="flex items-center gap-2">
                          🛣️ Roads
                        </div>
                      </SelectItem>
                      <SelectItem value="sanitation">
                        <div className="flex items-center gap-2">
                          🧹 Sanitation
                        </div>
                      </SelectItem>
                      <SelectItem value="streetlights">
                        <div className="flex items-center gap-2">
                          💡 Streetlights
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-danger">{errors.category}</p>}
                </div>
              </>
            )}

            {formData.role === 'citizen' && (
              <div className="space-y-2">
                <Label>Select Your Ward</Label>
                <Select
                  value={formData.ward}
                  onValueChange={(value) => updateFormData('ward', value)}
                >
                  <SelectTrigger className={errors.ward ? 'border-danger' : ''}>
                    <SelectValue placeholder="Choose your ward..." />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.name}>
                        <div className="flex items-center gap-2">
                          <MapPinned className="w-4 h-4" />
                          {ward.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ward && <p className="text-sm text-danger">{errors.ward}</p>}
              </div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className={cn('pl-10 pr-10', errors.password && 'border-danger')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-danger">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className={cn('pl-10', errors.confirmPassword && 'border-danger')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-danger">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password requirements */}
            <div className="p-4 rounded-xl bg-muted/50 space-y-2">
              <p className="text-sm font-medium">Password requirements:</p>
              <div className="space-y-1">
                {[
                  { check: formData.password.length >= 8, text: 'At least 8 characters' },
                  { check: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
                  { check: /[0-9]/.test(formData.password), text: 'One number' },
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check
                      className={cn(
                        'w-4 h-4',
                        req.check ? 'text-success' : 'text-muted-foreground'
                      )}
                    />
                    <span className={req.check ? 'text-foreground' : 'text-muted-foreground'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </Label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-danger">{errors.agreeToTerms}</p>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
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
              Join UrbanFlow
            </h1>
            <p className="text-white/80 max-w-sm mb-8">
              Become part of the movement to create smarter, more responsive urban infrastructure.
            </p>

            {/* Steps indicator */}
            <div className="flex justify-center gap-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    'flex flex-col items-center',
                    step.id <= currentStep ? 'opacity-100' : 'opacity-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all',
                      step.id < currentStep
                        ? 'bg-white text-primary'
                        : step.id === currentStep
                        ? 'bg-white/20 border-2 border-white'
                        : 'bg-white/10'
                    )}
                  >
                    {step.id < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{step.id}</span>
                    )}
                  </div>
                  <p className="text-xs">{step.title}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 relative">
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

          {/* Mobile step indicator */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm font-medium">{steps[currentStep - 1].title}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                className="h-full bg-gradient-primary"
              />
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold mb-2">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-muted-foreground mb-8">
            {steps[currentStep - 1].description}
          </p>

          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            {currentStep < 4 ? (
              <Button onClick={handleNext} className="flex-1 bg-gradient-primary hover:opacity-90">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-primary hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
