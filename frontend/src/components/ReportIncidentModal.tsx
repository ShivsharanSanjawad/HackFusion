import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Zap,
  Droplets,
  Construction,
  Trash2,
  Lightbulb,
  Navigation,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IncidentMap } from '@/components/IncidentMap';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'power', label: 'Power Outage', icon: Zap, color: 'text-yellow-500' },
  { id: 'water', label: 'Water Supply', icon: Droplets, color: 'text-blue-500' },
  { id: 'roads', label: 'Road Damage', icon: Construction, color: 'text-orange-500' },
  { id: 'sanitation', label: 'Sanitation', icon: Trash2, color: 'text-green-500' },
  { id: 'streetlights', label: 'Streetlights', icon: Lightbulb, color: 'text-purple-500' },
];

const severities = [
  { id: 'critical', label: 'Critical', description: 'Urgent, safety hazard' },
  { id: 'high', label: 'High', description: 'Major issue, needs quick fix' },
  { id: 'medium', label: 'Medium', description: 'Moderate impact' },
  { id: 'low', label: 'Low', description: 'Minor issue' },
];

interface ReportIncidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => void;
}

export function ReportIncidentModal({ open, onOpenChange, onSubmit }: ReportIncidentModalProps) {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'high',
    locationAddress: '',
    sinceDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      setErrors({ images: 'Maximum 5 images allowed' });
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setErrors({ images: 'Only image files are allowed' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviews((prev) => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImages((prev) => [...prev, ...files]);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.images;
      return newErrors;
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const detectLocation = () => {
  const fakeLocation = {
    address: "Munshi Nagar, Andheri, Mumbai",
    lat: 18.5204,
    lng: 73.8567
  };

  setLocation(fakeLocation);

  setFormData({
    ...formData,
    locationAddress: fakeLocation.address
  });
};


  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        break;
      case 2:
        if (!formData.category) newErrors.category = 'Category is required';
        if (!location && !formData.locationAddress) {
          newErrors.location = 'Location is required';
        }
        break;
      case 3:
        if (previews.length === 0) {
          newErrors.images = 'At least one image is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({
        ...formData,
        images,
        location,
      });
    }
    onOpenChange(false);
    // Reset form
    setStep(1);
    setImages([]);
    setPreviews([]);
    setLocation(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      severity: 'high',
      locationAddress: '',
      sinceDate: '',
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Report New Issue</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                'flex-1 h-2 rounded-full transition-all',
                s <= step ? 'bg-gradient-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium mb-2 block">Issue Title</label>
                <Input
                  placeholder="Brief title of the issue"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={errors.title ? 'border-danger' : ''}
                />
                {errors.title && (
                  <p className="text-xs text-danger mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Detailed Description</label>
                <Textarea
                  placeholder="Describe the issue in detail... What's the problem? When did it start? How is it affecting the area?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={5}
                  className={errors.description ? 'border-danger' : ''}
                />
                {errors.description && (
                  <p className="text-xs text-danger mt-1">{errors.description}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Category & Location */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Category Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">Select Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <motion.button
                        key={cat.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all flex items-center gap-2',
                          formData.category === cat.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Icon className={cn('w-4 h-4', cat.color)} />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
                {errors.category && (
                  <p className="text-xs text-danger mt-2">{errors.category}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Incident Location
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter address or coordinates"
                      value={formData.locationAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, locationAddress: e.target.value })
                      }
                      className={errors.location ? 'border-danger' : ''}
                    />
                    <Button
                      variant="outline"
                      onClick={detectLocation}
                      disabled={isDetectingLocation}
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </div>
                  {location && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-success/10 text-success text-sm flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Location detected: {location.address}
                    </motion.div>
                  )}
                  {errors.location && (
                    <p className="text-xs text-danger">{errors.location}</p>
                  )}
                </div>
              </div>

              {/* Since Date */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  When did the issue start?
                </label>
                <Input
                  type="date"
                  value={formData.sinceDate}
                  onChange={(e) =>
                    setFormData({ ...formData, sinceDate: e.target.value })
                  }
                  className={errors.sinceDate ? 'border-danger' : ''}
                />
                {errors.sinceDate && (
                  <p className="text-xs text-danger mt-1">{errors.sinceDate}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Images */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium mb-3 block">Upload Photos</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload photos of the issue (maximum 5 images, helps with verification)
                </p>

                {/* Upload Area */}
                <motion.div
                  whileHover={{ borderColor: 'var(--primary)' }}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium mb-1">Drop images here or click to select</p>
                  <p className="text-xs text-muted-foreground">
                    Supported: JPG, PNG, WebP (up to 5 images)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </motion.div>

                {errors.images && (
                  <p className="text-xs text-danger mt-2">{errors.images}</p>
                )}

                {/* Image Previews */}
                {previews.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <label className="text-sm font-medium mb-2 block">Uploaded Images</label>
                    <div className="grid grid-cols-4 gap-3">
                      {previews.map((preview, idx) => (
                        <motion.div
                          key={idx}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative group"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${idx}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {previews.length}/5 images uploaded
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Severity & Review */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="text-sm font-medium mb-3 block">Incident Severity</label>
                <div className="space-y-2">
                  {severities.map((severity) => {
                    const severityColors = {
                      critical: 'border-red-500/30 bg-red-500/10 hover:border-red-500',
                      high: 'border-orange-500/30 bg-orange-500/10 hover:border-orange-500',
                      medium: 'border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-500',
                      low: 'border-green-500/30 bg-green-500/10 hover:border-green-500',
                    };

                    return (
                      <motion.button
                        key={severity.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setFormData({ ...formData, severity: severity.id })}
                        className={cn(
                          'w-full p-3 rounded-lg border-2 text-left transition-all',
                          formData.severity === severity.id
                            ? severityColors[severity.id as keyof typeof severityColors].replace(
                                'hover:',
                                ''
                              )
                            : severityColors[severity.id as keyof typeof severityColors]
                        )}
                      >
                        <div className="font-medium">{severity.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {severity.description}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-muted/50 space-y-2"
              >
                <p className="text-sm font-medium">Report Summary</p>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <div>
                    <span className="font-medium">Title:</span> {formData.title}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>{' '}
                    {categories.find((c) => c.id === formData.category)?.label}
                  </div>
                  <div>
                    <span className="font-medium">Severity:</span>{' '}
                    {severities.find((s) => s.id === formData.severity)?.label}
                  </div>
                  <div>
                    <span className="font-medium">Images:</span> {previews.length} uploaded
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
          )}
          {step < 4 && (
            <Button onClick={handleNext} className="flex-1 bg-gradient-primary hover:opacity-90">
              Next
            </Button>
          )}
          {step === 4 && (
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-primary hover:opacity-90 shadow-glow"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Submit Report
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
