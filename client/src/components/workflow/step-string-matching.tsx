import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

interface ExtractedItem {
  text: string;
  confidence: string;
}

interface MatchedString {
  text: string;
  stringId: string;
}

interface UnmatchedString {
  text: string;
  suggestedId: string;
}

interface StepStringMatchingProps {
  isActive: boolean;
  onComplete: () => void;
  onPrevious: () => void;
  extractedItems: ExtractedItem[];
  matchedStrings: MatchedString[];
  unmatchedStrings: UnmatchedString[];
  setMatchedStrings: (strings: MatchedString[]) => void;
  setUnmatchedStrings: (strings: UnmatchedString[]) => void;
}

export default function StepStringMatching({
  isActive,
  onComplete,
  onPrevious,
  extractedItems,
  matchedStrings,
  unmatchedStrings,
  setMatchedStrings,
  setUnmatchedStrings
}: StepStringMatchingProps) {
  const [isMatching, setIsMatching] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const matchingMutation = useMutation({
    mutationFn: async () => {
      if (!uploadedFile) throw new Error("No resource file selected");
      if (extractedItems.length === 0) throw new Error("No extracted text items");
      
      const formData = new FormData();
      formData.append('resourceFile', uploadedFile);
      formData.append('extractedTexts', JSON.stringify(extractedItems.map(item => item.text)));
      
      const res = await fetch('/api/match-strings', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setMatchedStrings(data.matched || []);
        setUnmatchedStrings(data.unmatched || []);
        
        toast({
          title: "String matching complete",
          description: `Matched ${data.matched?.length || 0} strings, ${data.unmatched?.length || 0} unmatched`,
          variant: "default"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to match strings",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsMatching(false);
    }
  });
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type (basic check)
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'json' && fileExt !== 'xml') {
      toast({
        title: "Invalid file type",
        description: "Please upload a JSON or XML resource file.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    
    toast({
      title: "Resource file uploaded",
      description: `Uploaded ${file.name}`,
      variant: "default"
    });
  };
  
  const handleMatchStrings = () => {
    if (!uploadedFile) {
      toast({
        title: "No resource file selected",
        description: "Please upload a resource file first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsMatching(true);
    matchingMutation.mutate();
  };
  
  const handleContinue = () => {
    if (matchedStrings.length === 0 && unmatchedStrings.length === 0) {
      toast({
        title: "No matching performed",
        description: "Please match strings with a resource file first.",
        variant: "destructive"
      });
      return;
    }
    
    onComplete();
  };
  
  if (!isActive) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 opacity-60">
        <h2 className="text-lg font-semibold mb-4">Step 3: Match Strings</h2>
        <p className="text-neutral-600 mb-4">Upload a resource file to match extracted text with existing localized strings.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold">Step 3: Match Strings</h2>
        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">Active</span>
      </div>
      
      <p className="text-neutral-600 mb-4">
        Upload a resource file (JSON or XML) containing localized string mappings to match with extracted text.
      </p>
      
      {!uploadedFile && (
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center mb-6 hover:border-primary-400 transition-colors">
          <input 
            type="file" 
            id="resourceUpload" 
            ref={inputRef}
            className="hidden" 
            accept=".json,.xml" 
            onChange={handleFileUpload}
          />
          <label htmlFor="resourceUpload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-3">
              <div className="text-neutral-400 bg-neutral-100 p-3 rounded-full">
                <i className="ri-file-text-line text-2xl"></i>
              </div>
              <div>
                <p className="font-medium text-neutral-800">Upload resource file</p>
                <p className="text-neutral-500 text-sm mt-1">Upload your strings.xml or .json localization file</p>
              </div>
              <button 
                className="mt-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                onClick={() => inputRef.current?.click()}
              >
                Browse Files
              </button>
            </div>
          </label>
        </div>
      )}
      
      {uploadedFile && (matchedStrings.length === 0 && unmatchedStrings.length === 0) && (
        <div className="mb-6">
          <div className="bg-neutral-50 p-4 rounded-md flex items-center mb-4">
            <div className="flex-shrink-0 mr-3">
              <i className="ri-file-list-3-line text-primary-500 text-xl"></i>
            </div>
            <div className="flex-grow">
              <p className="font-medium">{uploadedFile.name}</p>
              <p className="text-sm text-neutral-500">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
            </div>
            <div>
              <button 
                onClick={() => {
                  setUploadedFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleMatchStrings}
            disabled={isMatching || !uploadedFile}
            className={`w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2 ${(isMatching || !uploadedFile) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isMatching ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Matching Strings...</span>
              </>
            ) : (
              <>
                <i className="ri-links-line"></i>
                <span>Match Strings with Resource File</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {matchedStrings.length > 0 && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="font-medium flex items-center gap-2">
                <i className="ri-checkbox-circle-line text-success-500"></i>
                <span>Matched Strings ({matchedStrings.length})</span>
              </h3>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <ul className="space-y-2 text-sm">
                {matchedStrings.map((string, index) => (
                  <li key={index} className="bg-neutral-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">"{string.text}"</p>
                        <p className="text-xs text-neutral-500 mt-1">String ID: <span className="font-mono bg-neutral-100 px-1 py-0.5 rounded">{string.stringId}</span></p>
                      </div>
                      <span className="text-xs bg-success-100 text-success-500 px-2 py-0.5 rounded-full h-fit">Matched</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {unmatchedStrings.length > 0 && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="font-medium flex items-center gap-2">
                <i className="ri-error-warning-line text-warning-500"></i>
                <span>Unmatched Strings ({unmatchedStrings.length})</span>
              </h3>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <ul className="space-y-2 text-sm">
                {unmatchedStrings.map((string, index) => (
                  <li key={index} className="bg-neutral-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">"{string.text}"</p>
                        <p className="text-xs text-neutral-500 mt-1">Suggested ID: <span className="font-mono bg-neutral-100 px-1 py-0.5 rounded">{string.suggestedId}</span></p>
                      </div>
                      <span className="text-xs bg-warning-100 text-warning-500 px-2 py-0.5 rounded-full h-fit">Unmatched</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between">
        <button 
          onClick={onPrevious}
          className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium px-6 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          <i className="ri-arrow-left-line"></i>
          <span>Previous</span>
        </button>
        
        <button 
          onClick={handleContinue}
          className={`bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${(matchedStrings.length === 0 && unmatchedStrings.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={matchedStrings.length === 0 && unmatchedStrings.length === 0}
        >
          <span>Continue</span>
          <i className="ri-arrow-right-line"></i>
        </button>
      </div>
    </div>
  );
}
