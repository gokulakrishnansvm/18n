import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import WorkflowStepper from "@/components/workflow/workflow-stepper";
import StepImageUpload from "@/components/workflow/step-image-upload";
import StepTextExtraction from "@/components/workflow/step-text-extraction";
import StepStringMatching from "@/components/workflow/step-string-matching";
import StepCodeSearch from "@/components/workflow/step-code-search";
import StepAIAnalysis from "@/components/workflow/step-ai-analysis";
import StepReportGeneration from "@/components/workflow/step-report-generation";
import DetailsPanel from "@/components/panels/details-panel";
import { useWorkflow } from "@/hooks/use-workflow";

export default function Home() {
  const workflow = useWorkflow();
  const { currentStep, resetWorkflow } = workflow;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        {/* Workflow Stepper */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h2 className="text-lg font-medium mb-4">I18N Standardization Process</h2>
            <div className="flex flex-wrap items-center justify-between text-sm">
              <WorkflowStepper currentStep={currentStep} />
              
              <div className="mt-4 lg:mt-0">
                <button 
                  onClick={resetWorkflow} 
                  className="text-primary-600 hover:text-primary-800 text-sm flex items-center gap-1"
                >
                  <i className="ri-restart-line"></i>
                  <span>Reset Workflow</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Workflow Steps */}
            <div>
              <StepImageUpload 
                isActive={currentStep === 1} 
                onComplete={workflow.goToNextStep} 
                onImageUpload={workflow.setUploadedImage}
              />
              
              <StepTextExtraction 
                isActive={currentStep === 2} 
                onComplete={workflow.goToNextStep}
                onPrevious={workflow.goToPreviousStep}
                extractedItems={workflow.extractedItems}
                setExtractedItems={workflow.setExtractedItems}
                uploadedImage={workflow.uploadedImage}
              />
              
              <StepStringMatching 
                isActive={currentStep === 3} 
                onComplete={workflow.goToNextStep}
                onPrevious={workflow.goToPreviousStep}
                extractedItems={workflow.extractedItems}
                matchedStrings={workflow.matchedStrings}
                unmatchedStrings={workflow.unmatchedStrings}
                setMatchedStrings={workflow.setMatchedStrings}
                setUnmatchedStrings={workflow.setUnmatchedStrings}
              />
              
              <StepCodeSearch 
                isActive={currentStep === 4} 
                onComplete={workflow.goToNextStep}
                onPrevious={workflow.goToPreviousStep}
                matchedStrings={workflow.matchedStrings}
                codeSnippets={workflow.codeSnippets}
                setCodeSnippets={workflow.setCodeSnippets}
              />
              
              <StepAIAnalysis 
                isActive={currentStep === 5} 
                onComplete={workflow.goToNextStep}
                onPrevious={workflow.goToPreviousStep}
                codeSnippets={workflow.codeSnippets}
                suggestions={workflow.suggestions}
                setSuggestions={workflow.setSuggestions}
              />
              
              <StepReportGeneration 
                isActive={currentStep === 6} 
                onPrevious={workflow.goToPreviousStep}
                extractedItems={workflow.extractedItems}
                matchedStrings={workflow.matchedStrings}
                unmatchedStrings={workflow.unmatchedStrings}
                codeSnippets={workflow.codeSnippets}
                suggestions={workflow.suggestions}
              />
            </div>
          </div>

          <div>
            <DetailsPanel 
              workflow={workflow}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
