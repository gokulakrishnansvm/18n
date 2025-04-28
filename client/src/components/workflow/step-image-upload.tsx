import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface StepImageUploadProps {
  isActive: boolean;
  onComplete: () => void;
  onImageUpload: (file: File) => void;
}

export default function StepImageUpload({ 
  isActive, 
  onComplete, 
  onImageUpload 
}: StepImageUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, JPEG, GIF).",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    onImageUpload(file);
    
    toast({
      title: "Image uploaded",
      description: "Image uploaded successfully!",
      variant: "default"
    });
  };

  const handleProceed = () => {
    if (!uploadedFile) {
      toast({
        title: "No image selected",
        description: "Please upload an image first.",
        variant: "destructive"
      });
      return;
    }
    
    onComplete();
  };

  if (!isActive) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 opacity-60">
        <h2 className="text-lg font-semibold mb-4">Step 1: Upload Image</h2>
        <p className="text-neutral-600 mb-6">Upload an image file containing text for internationalization analysis.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold">Step 1: Upload Image</h2>
        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">Active</span>
      </div>
      
      <p className="text-neutral-600 mb-6">Upload an image file containing text for internationalization analysis.</p>
      
      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center mb-4 hover:border-primary-400 transition-colors">
        <input 
          type="file" 
          id="imageUpload" 
          ref={inputRef}
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload}
        />
        <label htmlFor="imageUpload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            <div className="text-neutral-400 bg-neutral-100 p-4 rounded-full">
              {/* Icon with fallback */}
              <span className="text-3xl">
                <i className="ri-image-add-line"></i>
                <span className="ri-image-add-line hidden">
                  <i className="fa-solid fa-image fa-xl"></i>
                </span>
              </span>
            </div>
            <div>
              <p className="font-medium text-neutral-800">
                {uploadedFile ? uploadedFile.name : "Drag and drop an image file here"}
              </p>
              <p className="text-neutral-500 text-sm mt-1">
                {uploadedFile 
                  ? `${(uploadedFile.size / 1024).toFixed(2)} KB - ${uploadedFile.type}`
                  : "Or click to browse files (PNG, JPG, JPEG)"}
              </p>
            </div>
            <button 
              className="mt-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              {uploadedFile ? "Change File" : "Browse Files"}
            </button>
          </div>
        </label>
      </div>
      
      <div className="text-right">
        <button 
          onClick={handleProceed}
          className={`bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-2 rounded-md transition-colors flex items-center gap-2 float-right ${!uploadedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!uploadedFile}
        >
          <span>Extract Text</span>
          <span>
            <i className="ri-arrow-right-line"></i>
            <span className="ri-arrow-right-line hidden">
              <i className="fa-solid fa-arrow-right"></i>
            </span>
          </span>
        </button>
        <div className="clear-both"></div>
      </div>
    </div>
  );
}
