import { useState } from 'react';

export interface ExtractedItem {
  text: string;
  confidence: string;
}

export interface MatchedString {
  text: string;
  stringId: string;
}

export interface UnmatchedString {
  text: string;
  suggestedId: string;
}

export interface CodeSnippet {
  id: number;
  filename: string;
  code: string;
  lineNumber?: number;
  stringIds: string[];
  expanded?: boolean;
}

export interface AiSuggestion {
  id: number;
  codeSnippetId: number;
  issue: string;
  currentImplementation: string;
  suggestedImplementation: string;
  recommendation: string;
}

export interface WorkflowState {
  currentStep: number;
  uploadedImage: File | null;
  extractedItems: ExtractedItem[];
  matchedStrings: MatchedString[];
  unmatchedStrings: UnmatchedString[];
  codeSnippets: CodeSnippet[];
  suggestions: AiSuggestion[];
  
  // Actions
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetWorkflow: () => void;
  setUploadedImage: (file: File) => void;
  setExtractedItems: (items: ExtractedItem[]) => void;
  setMatchedStrings: (strings: MatchedString[]) => void;
  setUnmatchedStrings: (strings: UnmatchedString[]) => void;
  setCodeSnippets: (snippets: CodeSnippet[]) => void;
  setSuggestions: (suggestions: AiSuggestion[]) => void;
}

export function useWorkflow(): WorkflowState {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [matchedStrings, setMatchedStrings] = useState<MatchedString[]>([]);
  const [unmatchedStrings, setUnmatchedStrings] = useState<UnmatchedString[]>([]);
  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>([]);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);

  const goToNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setUploadedImage(null);
    setExtractedItems([]);
    setMatchedStrings([]);
    setUnmatchedStrings([]);
    setCodeSnippets([]);
    setSuggestions([]);
  };

  return {
    currentStep,
    uploadedImage,
    extractedItems,
    matchedStrings,
    unmatchedStrings,
    codeSnippets,
    suggestions,
    
    goToNextStep,
    goToPreviousStep,
    resetWorkflow,
    setUploadedImage,
    setExtractedItems,
    setMatchedStrings,
    setUnmatchedStrings,
    setCodeSnippets,
    setSuggestions
  };
}
