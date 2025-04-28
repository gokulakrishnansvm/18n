import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import CodeBlock from '@/components/ui/code-block';

interface CodeSnippet {
  id: number;
  filename: string;
  code: string;
  lineNumber?: number;
  stringIds: string[];
  expanded?: boolean;
}

interface AiSuggestion {
  id: number;
  codeSnippetId: number;
  issue: string;
  currentImplementation: string;
  suggestedImplementation: string;
  recommendation: string;
}

interface StepAIAnalysisProps {
  isActive: boolean;
  onComplete: () => void;
  onPrevious: () => void;
  codeSnippets: CodeSnippet[];
  suggestions: AiSuggestion[];
  setSuggestions: (suggestions: AiSuggestion[]) => void;
}

export default function StepAIAnalysis({
  isActive,
  onComplete,
  onPrevious,
  codeSnippets,
  suggestions,
  setSuggestions
}: StepAIAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  
  const aiAnalysisMutation = useMutation({
    mutationFn: async () => {
      if (codeSnippets.length === 0) throw new Error("No code snippets to analyze");
      
      const res = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codeSnippets }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setSuggestions(data.suggestions);
        
        toast({
          title: "AI analysis complete",
          description: `Found ${data.suggestions.length} I18N improvement suggestions`,
          variant: "default"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to perform AI analysis",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsAnalyzing(false);
    }
  });
  
  const handleAnalyze = () => {
    if (codeSnippets.length === 0) {
      toast({
        title: "No code snippets",
        description: "Please search for code snippets first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    aiAnalysisMutation.mutate();
  };
  
  const handleContinue = () => {
    if (suggestions.length === 0) {
      toast({
        title: "No AI suggestions",
        description: "Please perform AI analysis first.",
        variant: "destructive"
      });
      return;
    }
    
    onComplete();
  };
  
  if (!isActive) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 opacity-60">
        <h2 className="text-lg font-semibold mb-4">Step 5: AI Analysis</h2>
        <p className="text-neutral-600 mb-4">Amazon Bedrock will analyze your code snippets and provide I18N improvement suggestions.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold">Step 5: AI Analysis</h2>
        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">Active</span>
      </div>
      
      <p className="text-neutral-600 mb-4">
        Get AI-powered suggestions for improving internationalization in your code.
      </p>
      
      {suggestions.length === 0 && (
        <div className="mb-6">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || codeSnippets.length === 0}
            className={`w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2 ${(isAnalyzing || codeSnippets.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing with AI...</span>
              </>
            ) : (
              <>
                <i className="ri-robot-line"></i>
                <span>Analyze with Amazon Bedrock</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-2">
            <i className="ri-robot-line text-primary-500"></i>
            <h3 className="font-medium">Amazon Bedrock I18N Suggestions</h3>
          </div>
          <div className="p-4">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-primary-800 mb-2">Analysis Complete</h4>
              <p className="text-sm text-primary-700">
                Amazon Bedrock analyzed {codeSnippets.length} code snippets and identified {suggestions.length} internationalization issues that could be improved.
              </p>
            </div>
            
            <div className="space-y-6">
              {suggestions.map((suggestion) => {
                const snippet = codeSnippets.find(s => s.id === suggestion.codeSnippetId);
                
                return (
                  <div key={suggestion.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-neutral-100 border-b border-neutral-200">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <i className="ri-error-warning-line text-warning-500"></i>
                        <span>{suggestion.issue}</span>
                      </h4>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-xs font-medium text-neutral-500 mb-2">Current Implementation:</h5>
                          <CodeBlock code={suggestion.currentImplementation} language={snippet?.filename.endsWith('.ts') || snippet?.filename.endsWith('.tsx') ? 'typescript' : 'java'} />
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-neutral-500 mb-2">Suggested Implementation:</h5>
                          <CodeBlock code={suggestion.suggestedImplementation} language={snippet?.filename.endsWith('.ts') || snippet?.filename.endsWith('.tsx') ? 'typescript' : 'java'} />
                        </div>
                      </div>
                      
                      <div className="mt-4 text-sm">
                        <h5 className="font-medium mb-2">Recommendation:</h5>
                        <p className="text-neutral-600">{suggestion.recommendation}</p>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <button className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-md text-xs transition-colors">
                          Add to Resource File
                        </button>
                        <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-1.5 rounded-md text-xs transition-colors">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
          className={`bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${suggestions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={suggestions.length === 0}
        >
          <span>Continue</span>
          <i className="ri-arrow-right-line"></i>
        </button>
      </div>
    </div>
  );
}
