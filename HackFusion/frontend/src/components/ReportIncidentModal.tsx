import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  CheckCircle2,
  Image as ImageIcon,
  Zap,
  Droplets,
  Construction,
  Trash2,
  Lightbulb,
  Navigation,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const categories = [
  { id: '550e8400-e29b-41d4-a716-446655440000', label: 'Engineering', icon: Zap, color: 'text-yellow-500' },
  { id: '0800c6f9-a50c-486a-9ac3-df5cc2d8d706', label: 'MMRDA', icon: Droplets, color: 'text-blue-500' },
  { id: 'd4631ade-0722-4ade-a7a7-92ba00a28dcc', label: 'MMRCL', icon: Construction, color: 'text-orange-500' },
  { id: 'bfced05c-3781-467f-8b27-ee288b1ecc61', label: 'BEST', icon: Trash2, color: 'text-green-500' },
  { id: '13bbbd9f-9b56-4135-99fe-b04bee2db5b7', label: 'Police Department', icon: Lightbulb, color: 'text-purple-500' },
  { id: 'de61431b-bb6b-4e92-a918-fd5136b6b0b1', label: 'Public Works Department', icon: Zap, color: 'text-blue-300' },
];

interface ReportIncidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => void;
}

export function ReportIncidentModal({ open, onOpenChange }: ReportIncidentModalProps) {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
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
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviews((prev) => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImages((prev) => [...prev, ...files]);
    setErrors((prev) => ({ ...prev, images: '' }));
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
    setFormData({ ...formData, locationAddress: fakeLocation.address });
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
    }
    if (currentStep === 2) {
      if (!formData.department) newErrors.department = 'Department is required';
      if (!location && !formData.locationAddress) newErrors.location = 'Location is required';
    }
    if (currentStep === 3 && images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const uploadedMediaUrls: string[] = [];

      // 1. Upload each file to Cloudinary via Spring Boot
      for (const file of images) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder_name', 'incident_reports');

        const uploadRes = await fetch('http://localhost:8080/cloudinary', {
          method: 'POST',
          body: uploadData,
        });

        if (!uploadRes.ok) throw new Error(`Failed to upload ${file.name}`);
        const cloudUrl = await uploadRes.text();
        uploadedMediaUrls.push(cloudUrl);
      }

      // 2. Construct final payload
      const payload = {
        username: "alice_tech", // Ensure this exists in your 'operators' table
        issue_since: formData.sinceDate || new Date().toISOString().split('T')[0],
        description: `${formData.title}: ${formData.description}`,
        lat: location?.lat || 18.5204,
        lon: location?.lng || 73.8567,
        media_url: uploadedMediaUrls,
        department_id: formData.department
      };

      // 3. Submit Report
      const response = await fetch("http://localhost:8080/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to save report to database");

      alert("Report submitted successfully!");
      onOpenChange(false);
      resetForm();

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setImages([]);
    setPreviews([]);
    setLocation(null);
    setFormData({ title: '', description: '', department: '', locationAddress: '', sinceDate: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Report New Issue</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={cn('flex-1 h-2 rounded-full transition-all', s <= step ? 'bg-blue-600' : 'bg-gray-200')} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Issue Title</label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Broken Street Light" />
                {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, department: cat.id })}
                    className={cn('p-3 border rounded-lg flex items-center gap-2', formData.department === cat.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200')}
                  >
                    <cat.icon className={cn('w-4 h-4', cat.color)} />
                    <span className="text-xs">{cat.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={formData.locationAddress} onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })} placeholder="Location" />
                <Button variant="outline" onClick={detectLocation}><Navigation className="w-4 h-4" /></Button>
              </div>
              <Input type="date" value={formData.sinceDate} onChange={(e) => setFormData({ ...formData, sinceDate: e.target.value })} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div 
                className="border-2 border-dashed p-8 rounded-xl text-center cursor-pointer hover:bg-gray-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm">Click to upload images (Max 5)</p>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <div className="grid grid-cols-5 gap-2">
                {previews.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p} className="w-full h-16 object-cover rounded" alt="preview" />
                    <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              {errors.images && <p className="text-red-500 text-xs">{errors.images}</p>}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold mb-2">Review Report</h4>
              <p className="text-sm"><strong>Title:</strong> {formData.title}</p>
              <p className="text-sm"><strong>Dept:</strong> {categories.find(c => c.id === formData.department)?.label}</p>
              <p className="text-sm"><strong>Images:</strong> {images.length}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">Back</Button>}
          {step < 4 ? (
            <Button onClick={() => validateStep(step) && setStep(step + 1)} className="flex-1 bg-blue-600 hover:bg-blue-700">Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              {isSubmitting ? "Uploading..." : "Submit Report"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}