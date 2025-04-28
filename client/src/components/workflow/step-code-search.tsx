import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import CodeBlock from '@/components/ui/code-block';

interface MatchedString {
  text: string;
  stringId: string;
}

interface CodeSnippet {
  id: number;
  filename: string;
  code: string;
  lineNumber?: number;
  stringIds: string[];
  expanded?: boolean;
}

interface StepCodeSearchProps {
  isActive: boolean;
  onComplete: () => void;
  onPrevious: () => void;
  matchedStrings: MatchedString[];
  codeSnippets: CodeSnippet[];
  setCodeSnippets: (snippets: CodeSnippet[]) => void;
}

export default function StepCodeSearch({
  isActive,
  onComplete,
  onPrevious,
  matchedStrings,
  codeSnippets,
  setCodeSnippets
}: StepCodeSearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  
  const searchMutation = useMutation({
    mutationFn: async () => {
      if (matchedStrings.length === 0) throw new Error("No matched strings to search for");
      
      const stringIds = matchedStrings.map(str => str.stringId);
      
      const res = await fetch('/api/search-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stringIds }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Add expanded property to each snippet
        const snippetsWithExpanded = data.codeSnippets.map((snippet: CodeSnippet) => ({
          ...snippet,
          expanded: false
        }));
        
        setCodeSnippets(snippetsWithExpanded);
        
        toast({
          title: "Code search complete",
          description: `Found ${data.codeSnippets.length} code snippets`,
          variant: "default"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to search code",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsSearching(false);
    }
  });
  
  const handleSearchCode = () => {
    if (matchedStrings.length === 0) {
      toast({
        title: "No matched strings",
        description: "Please match strings with a resource file first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    searchMutation.mutate();
  };
  
  const toggleSnippet = (id: number) => {
    setCodeSnippets(codeSnippets.map(snippet => 
      snippet.id === id 
        ? { ...snippet, expanded: !snippet.expanded } 
        : snippet
    ));
  };
  
  const copySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "Code snippet has been copied to clipboard",
      variant: "default"
    });
  };
  
  const handleContinue = () => {
    if (codeSnippets.length === 0) {
      toast({
        title: "No code snippets found",
        description: "Please search for code snippets first.",
        variant: "destructive"
      });
      return;
    }
    
    onComplete();
  };
  
  if (!isActive) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 opacity-60">
        <h2 className="text-lg font-semibold mb-4">Step 4: Code Search</h2>
        <p className="text-neutral-600 mb-4">Search for code snippets using the matched string identifiers.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold">Step 4: Code Search</h2>
        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">Active</span>
      </div>
      
      <p className="text-neutral-600 mb-4">
        Search the codebase for snippets that use the matched string identifiers.
      </p>
      
      {codeSnippets.length === 0 && (
        <div className="mb-6">
          <button 
            onClick={handleSearchCode}
            disabled={isSearching || matchedStrings.length === 0}
            className={`w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2 ${(isSearching || matchedStrings.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSearching ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Searching Code...</span>
              </>
            ) : (
              <>
                <i className="ri-code-s-slash-line"></i>
                <span>Search Code for String Usage</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {codeSnippets.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-neutral-200">
            <h3 className="font-medium">Code Snippets ({codeSnippets.length} found)</h3>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              {codeSnippets.map((snippet) => (
                <div key={snippet.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-neutral-100 border-b border-neutral-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <i className="ri-code-s-slash-line text-neutral-600"></i>
                      <span className="font-medium text-sm">{snippet.filename}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-xs flex items-center gap-1 text-neutral-600 hover:text-neutral-800"
                        onClick={() => copySnippet(snippet.code)}
                      >
                        <i className="ri-file-copy-line"></i>
                        <span>Copy</span>
                      </button>
                      <button 
                        className="text-xs flex items-center gap-1 text-neutral-600 hover:text-neutral-800"
                        onClick={() => toggleSnippet(snippet.id)}
                      >
                        <i className={`ri-arrow-${snippet.expanded ? 'up' : 'down'}-s-line`}></i>
                        <span>{snippet.expanded ? 'Collapse' : 'Expand'}</span>
                      </button>
                    </div>
                  </div>
                  {snippet.expanded && (
                    <CodeBlock code={snippet.code} language={snippet.filename.endsWith('.ts') || snippet.filename.endsWith('.tsx') ? 'typescript' : 'java'} />
                  )}
                </div>
              ))}
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
          className={`bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${codeSnippets.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={codeSnippets.length === 0}
        >
          <span>Continue</span>
          <i className="ri-arrow-right-line"></i>
        </button>
      </div>
    </div>
  );
}
