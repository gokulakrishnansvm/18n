import React from 'react';
import { useWorkflow, WorkflowState } from '@/hooks/use-workflow';

interface DetailsPanelProps {
  workflow: WorkflowState;
}

export default function DetailsPanel({ workflow }: DetailsPanelProps) {
  const {
    currentStep,
    uploadedImage,
    extractedItems,
    matchedStrings,
    unmatchedStrings,
    codeSnippets,
    suggestions
  } = workflow;
  
  const hasImage = !!uploadedImage;
  
  // Calculate stats
  const matchRate = matchedStrings.length > 0 && extractedItems.length > 0 
    ? Math.round((matchedStrings.length / extractedItems.length) * 100) 
    : 0;
  
  const codeSnippetsFound = codeSnippets.length > 0 && matchedStrings.length > 0
    ? `${codeSnippets.length}/${matchedStrings.length}`
    : '0/0';
  
  const issuesIdentified = suggestions.length;
  
  // Get image details
  const imageDetails = uploadedImage ? {
    name: uploadedImage.name,
    size: `${(uploadedImage.size / 1024).toFixed(0)} KB`,
    type: uploadedImage.type
  } : null;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-4">I18N Analysis Details</h2>
      
      {!hasImage ? (
        // No image selected
        <div>
          <div className="py-8 text-center">
            <div className="bg-neutral-100 p-4 inline-flex rounded-full mb-3">
              <i className="ri-information-line text-3xl text-neutral-400"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">No Image Selected</h3>
            <p className="text-neutral-500 text-sm mb-6">Upload an image to start the I18N analysis process</p>
            
            <div className="text-xs text-neutral-500 text-left p-3 bg-neutral-50 rounded-md">
              <p className="font-medium mb-1">Supported formats:</p>
              <ul className="list-disc list-inside">
                <li>PNG</li>
                <li>JPG/JPEG</li>
                <li>GIF (first frame only)</li>
              </ul>
              <p className="mt-3 mb-1 font-medium">Size limitations:</p>
              <ul className="list-disc list-inside">
                <li>Maximum file size: 5MB</li>
                <li>Minimum dimensions: 200x200px</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        // Image is selected
        <div>
          {/* Image preview */}
          <div className="border border-neutral-200 rounded-lg p-2 mb-4">
            <img 
              src={URL.createObjectURL(uploadedImage)} 
              alt="Preview of uploaded screenshot" 
              className="w-full h-auto rounded-md"
            />
          </div>
          
          {/* Image details */}
          <div className="bg-neutral-50 p-3 rounded-md mb-4">
            <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
              <i className="ri-information-line text-primary-500"></i>
              <span>Image Details</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-neutral-500">File name:</p>
                <p className="font-medium">{imageDetails?.name}</p>
              </div>
              <div>
                <p className="text-neutral-500">Size:</p>
                <p className="font-medium">{imageDetails?.size}</p>
              </div>
              <div>
                <p className="text-neutral-500">Type:</p>
                <p className="font-medium">{imageDetails?.type}</p>
              </div>
            </div>
          </div>
          
          {/* Progress stats (show after extraction) */}
          {currentStep > 1 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Analysis Progress</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Extracted Text Items</span>
                    <span className="font-medium">{extractedItems.length}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-1.5">
                    <div 
                      className="bg-primary-500 h-1.5 rounded-full" 
                      style={{ width: extractedItems.length > 0 ? '100%' : '0%' }}
                    ></div>
                  </div>
                </div>
                
                {currentStep > 2 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-600">Matched Strings</span>
                      <span className="font-medium">{matchedStrings.length}/{extractedItems.length}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5">
                      <div 
                        className="bg-secondary-500 h-1.5 rounded-full" 
                        style={{ width: `${matchRate}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {currentStep > 3 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-600">Code Snippets Found</span>
                      <span className="font-medium">{codeSnippetsFound}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5">
                      <div 
                        className="bg-secondary-500 h-1.5 rounded-full" 
                        style={{ width: matchedStrings.length > 0 ? `${(codeSnippets.length / matchedStrings.length) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {currentStep > 4 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-600">I18N Issues Identified</span>
                      <span className="font-medium">{issuesIdentified}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5">
                      <div 
                        className="bg-warning-500 h-1.5 rounded-full" 
                        style={{ width: codeSnippets.length > 0 ? `${(issuesIdentified / codeSnippets.length) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border border-neutral-200 rounded-md p-3">
                <h3 className="text-sm font-medium mb-2">Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-neutral-50 rounded-md p-2">
                    <p className="text-sm text-neutral-500">Strings</p>
                    <p className="font-semibold text-lg text-primary-600">{extractedItems.length}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-md p-2">
                    <p className="text-sm text-neutral-500">Match Rate</p>
                    <p className="font-semibold text-lg text-success-500">{matchRate}%</p>
                  </div>
                  <div className="bg-neutral-50 rounded-md p-2">
                    <p className="text-sm text-neutral-500">Snippets</p>
                    <p className="font-semibold text-lg text-secondary-500">{codeSnippets.length}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-md p-2">
                    <p className="text-sm text-neutral-500">Issues</p>
                    <p className="font-semibold text-lg text-warning-500">{issuesIdentified}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Quick Help */}
      <div className="mt-6 border-t border-neutral-200 pt-4">
        <h3 className="text-sm font-medium mb-3">Quick Help</h3>
        <div className="space-y-3">
          <div className="flex gap-3 text-sm">
            <div className="text-primary-500 flex-shrink-0">
              <i className="ri-image-line"></i>
            </div>
            <p className="text-neutral-600">Upload UI screenshots containing text that needs I18N.</p>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="text-primary-500 flex-shrink-0">
              <i className="ri-file-list-line"></i>
            </div>
            <p className="text-neutral-600">Match text against your resource files (JSON, XML) to identify missing translations.</p>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="text-primary-500 flex-shrink-0">
              <i className="ri-code-line"></i>
            </div>
            <p className="text-neutral-600">View code contexts where strings are used to better understand the implementation.</p>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="text-primary-500 flex-shrink-0">
              <i className="ri-robot-line"></i>
            </div>
            <p className="text-neutral-600">Get I18N standardization suggestions from our AI assistant.</p>
          </div>
        </div>
        
        <div className="mt-4">
          <button className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
            <i className="ri-question-line"></i>
            <span>View Full Documentation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
