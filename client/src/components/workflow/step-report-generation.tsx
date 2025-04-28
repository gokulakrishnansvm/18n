import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import CodeBlock from '@/components/ui/code-block';

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

interface CodeSnippet {
  id: number;
  filename: string;
  code: string;
  lineNumber?: number;
  stringIds: string[];
}

interface AiSuggestion {
  id: number;
  codeSnippetId: number;
  issue: string;
  currentImplementation: string;
  suggestedImplementation: string;
  recommendation: string;
}

interface StepReportGenerationProps {
  isActive: boolean;
  onPrevious: () => void;
  extractedItems: ExtractedItem[];
  matchedStrings: MatchedString[];
  unmatchedStrings: UnmatchedString[];
  codeSnippets: CodeSnippet[];
  suggestions: AiSuggestion[];
}

export default function StepReportGeneration({
  isActive,
  onPrevious,
  extractedItems,
  matchedStrings,
  unmatchedStrings,
  codeSnippets,
  suggestions
}: StepReportGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const { toast } = useToast();
  
  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      // In a real application, this would call an API endpoint that generates a PDF
      // Here we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Report generated",
        description: "PDF report has been generated and downloaded",
        variant: "default"
      });
      
      // Simulate downloading a file
      const blob = new Blob(['PDF report content would go here'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'i18n_standardization_report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Failed to generate report",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleExport = (format: string) => {
    let content = '';
    let mimeType = '';
    let fileName = '';
    
    // Create a simple export for different formats
    if (format === 'csv') {
      content = 'Text,StringID,Status\n';
      matchedStrings.forEach(s => {
        content += `"${s.text}","${s.stringId}","Matched"\n`;
      });
      unmatchedStrings.forEach(s => {
        content += `"${s.text}","${s.suggestedId}","Unmatched"\n`;
      });
      mimeType = 'text/csv';
      fileName = 'i18n_report.csv';
    } else if (format === 'txt') {
      content = 'I18N STANDARDIZATION REPORT\n\n';
      content += `Total strings: ${extractedItems.length}\n`;
      content += `Matched: ${matchedStrings.length}\n`;
      content += `Unmatched: ${unmatchedStrings.length}\n`;
      content += `Issues: ${suggestions.length}\n\n`;
      
      content += 'UNMATCHED STRINGS:\n';
      unmatchedStrings.forEach(s => {
        content += `- "${s.text}" (Suggested ID: ${s.suggestedId})\n`;
      });
      
      content += '\nSUGGESTIONS:\n';
      suggestions.forEach(s => {
        content += `- ${s.issue}\n`;
        content += `  Current: ${s.currentImplementation}\n`;
        content += `  Suggested: ${s.suggestedImplementation}\n`;
        content += `  Recommendation: ${s.recommendation}\n\n`;
      });
      
      mimeType = 'text/plain';
      fileName = 'i18n_report.txt';
    } else if (format === 'json') {
      const reportData = {
        summary: {
          totalStrings: extractedItems.length,
          matched: matchedStrings.length,
          unmatched: unmatchedStrings.length,
          suggestions: suggestions.length
        },
        matchedStrings,
        unmatchedStrings,
        suggestions
      };
      
      content = JSON.stringify(reportData, null, 2);
      mimeType = 'application/json';
      fileName = 'i18n_report.json';
    }
    
    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowExportDropdown(false);
    
    toast({
      title: "Report exported",
      description: `Report has been exported as ${format.toUpperCase()}`,
      variant: "default"
    });
  };
  
  if (!isActive) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 opacity-60">
        <h2 className="text-lg font-semibold mb-4">Step 6: Report Generation</h2>
        <p className="text-neutral-600 mb-4">Generate a comprehensive I18N standardization report.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold">Step 6: Report Generation</h2>
        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">Active</span>
      </div>
      
      <p className="text-neutral-600 mb-4">
        Generate a comprehensive report of I18N standardization findings and suggestions.
      </p>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="font-medium">I18N Standardization Report</h3>
          <div className="flex gap-2">
            <button 
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className={`bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <i className="ri-download-line"></i>
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-1.5 rounded-md text-xs transition-colors flex items-center gap-1"
              >
                <span>Export As</span>
                <i className="ri-arrow-down-s-line"></i>
              </button>
              {showExportDropdown && (
                <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-md py-1 min-w-[120px] z-10 border border-neutral-200">
                  <button 
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 transition-colors"
                  >
                    CSV
                  </button>
                  <button 
                    onClick={() => handleExport('txt')}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 transition-colors"
                  >
                    TXT
                  </button>
                  <button 
                    onClick={() => handleExport('json')}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 transition-colors"
                  >
                    JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="border border-neutral-200 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-medium mb-3">I18N Analysis Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-50 p-3 rounded-md text-center">
                <p className="text-neutral-500 text-sm">Total Strings</p>
                <p className="text-2xl font-semibold text-primary-600">{extractedItems.length}</p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-md text-center">
                <p className="text-neutral-500 text-sm">Matched</p>
                <p className="text-2xl font-semibold text-success-500">{matchedStrings.length}</p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-md text-center">
                <p className="text-neutral-500 text-sm">Unmatched</p>
                <p className="text-2xl font-semibold text-warning-500">{unmatchedStrings.length}</p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-md text-center">
                <p className="text-neutral-500 text-sm">Issues Found</p>
                <p className="text-2xl font-semibold text-error-500">{suggestions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {unmatchedStrings.length > 0 && (
              <div>
                <h4 className="text-lg font-medium mb-3">Unmatched Strings</h4>
                <div className="overflow-hidden border border-neutral-200 rounded-lg">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Text</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Suggested ID</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200 text-sm">
                      {unmatchedStrings.map((string, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-neutral-800">"{string.text}"</td>
                          <td className="px-4 py-3 whitespace-nowrap text-neutral-600 font-mono text-xs">{string.suggestedId}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <button className="text-primary-600 hover:text-primary-700 text-xs">Add to Resources</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {suggestions.length > 0 && (
              <div>
                <h4 className="text-lg font-medium mb-3">I18N Improvement Suggestions</h4>
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => {
                    const snippet = codeSnippets.find(s => s.id === suggestion.codeSnippetId);
                    
                    return (
                      <div key={index} className="border border-neutral-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                          <h5 className="font-medium text-sm">{suggestion.issue}</h5>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-neutral-600 mb-3">
                            Replace hard-coded string with translated text using proper i18n framework functions.
                          </p>
                          <div className="text-xs bg-neutral-50 p-3 rounded-md mb-3">
                            <p className="font-medium mb-1">File: {snippet?.filename} {snippet?.lineNumber ? `(Line ${snippet.lineNumber})` : ''}</p>
                            <code className="text-neutral-800 font-mono">{suggestion.currentImplementation}</code>
                          </div>
                          <div className="bg-primary-50 border-l-4 border-primary-500 p-3 text-sm text-primary-800">
                            <p>
                              <span className="font-medium">Recommendation:</span> {suggestion.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button 
          onClick={onPrevious}
          className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium px-6 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          <i className="ri-arrow-left-line"></i>
          <span>Previous</span>
        </button>
      </div>
    </div>
  );
}
