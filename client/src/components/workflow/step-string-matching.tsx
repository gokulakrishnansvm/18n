import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { FadeTransition, SlideUpTransition } from '@/components/ui/transition';
import { Loader, ButtonLoader } from '@/components/ui/loader';

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
      
      {(matchedStrings.length > 0 || unmatchedStrings.length > 0) && (
        <div className="mb-6">
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <div className="flex border-b border-neutral-200">
              <button 
                className={`flex-1 px-4 py-3 text-center font-medium ${true ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500' : 'text-neutral-600'}`}
              >
                Extracted Text Matching Results
              </button>
            </div>
            
            <div className="p-4">
              {/* Match statistics */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[120px] bg-success-50 rounded-lg p-3 border border-success-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                      <i className="ri-checkbox-circle-line text-success-600"></i>
                    </div>
                    <div>
                      <p className="text-success-700 text-sm font-medium">Matched</p>
                      <p className="text-xl font-bold text-success-800">{matchedStrings.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-[120px] bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <i className="ri-error-warning-line text-amber-600"></i>
                    </div>
                    <div>
                      <p className="text-amber-700 text-sm font-medium">Needs Translation</p>
                      <p className="text-xl font-bold text-amber-800">{unmatchedStrings.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-[120px] bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <i className="ri-file-text-line text-blue-600"></i>
                    </div>
                    <div>
                      <p className="text-blue-700 text-sm font-medium">Total Extracted</p>
                      <p className="text-xl font-bold text-blue-800">{extractedItems.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Matched strings section */}
              {matchedStrings.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-neutral-800 flex items-center gap-1">
                      <div className="bg-success-100 rounded-full p-0.5 w-5 h-5 flex items-center justify-center">
                        <i className="ri-checkbox-circle-fill text-success-600"></i>
                      </div>
                      <span>Matched Strings</span>
                    </h3>
                    <button 
                      onClick={() => {
                        // Export matched strings as CSV
                        const csvContent = [
                          ['Text', 'Resource ID'],
                          ...matchedStrings.map(item => [item.text, item.stringId])
                        ].map(row => row.join(',')).join('\n');
                        
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'matched_strings.csv';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-xs bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 px-2 py-1 rounded flex items-center gap-1"
                    >
                      <i className="ri-download-line"></i>
                      <span>Export</span>
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto border border-neutral-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-neutral-200 text-sm">
                      <thead className="bg-gradient-to-r from-success-50 to-green-50">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-success-800 uppercase tracking-wider">
                            Extracted Text
                          </th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-success-800 uppercase tracking-wider">
                            Resource ID
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-100">
                        {matchedStrings.map((string, index) => (
                          <tr key={index} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-3 py-2">
                              <div className="text-neutral-800">{string.text}</div>
                            </td>
                            <td className="px-3 py-2">
                              <span className="inline-flex items-center bg-success-50 text-success-700 px-2 py-0.5 rounded text-xs font-mono">
                                {string.stringId}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Unmatched strings section - only show from extracted text, not resource file */}
              {unmatchedStrings.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-neutral-800 flex items-center gap-1">
                      <div className="bg-amber-100 rounded-full p-0.5 w-5 h-5 flex items-center justify-center">
                        <i className="ri-error-warning-fill text-amber-600"></i>
                      </div>
                      <span>Text Needing Translation</span>
                    </h3>
                    <button 
                      onClick={() => {
                        // Export unmatched strings as CSV with suggested IDs
                        const csvContent = [
                          ['Text', 'Suggested ID'],
                          ...unmatchedStrings.map(item => [item.text, item.suggestedId])
                        ].map(row => row.join(',')).join('\n');
                        
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'unmatched_strings.csv';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-xs bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 px-2 py-1 rounded flex items-center gap-1"
                    >
                      <i className="ri-download-line"></i>
                      <span>Export</span>
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto border border-neutral-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-neutral-200 text-sm">
                      <thead className="bg-gradient-to-r from-amber-50 to-yellow-50">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                            Extracted Text
                          </th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                            Suggested ID
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-100">
                        {unmatchedStrings.map((string, index) => (
                          <tr key={index} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-3 py-2">
                              <div className="text-neutral-800">{string.text}</div>
                            </td>
                            <td className="px-3 py-2">
                              <span className="inline-flex items-center bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-mono">
                                {string.suggestedId}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
