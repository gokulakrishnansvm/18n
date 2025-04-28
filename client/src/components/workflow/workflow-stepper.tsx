import React from 'react';

interface WorkflowStepperProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Upload Image" },
  { number: 2, label: "Extract Text" },
  { number: 3, label: "Match Strings" },
  { number: 4, label: "Code Search" },
  { number: 5, label: "AI Analysis" },
  { number: 6, label: "Report" }
];

export default function WorkflowStepper({ currentStep }: WorkflowStepperProps) {
  return (
    <div className="w-full lg:w-auto flex flex-col md:flex-row gap-1 md:gap-0">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center group">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step.number === currentStep 
              ? "bg-primary-500 text-white" 
              : step.number < currentStep 
                ? "bg-primary-300 text-white"
                : "bg-neutral-200 text-neutral-800"
          } font-medium shrink-0`}>
            {step.number}
          </div>
          <div className={`mx-2 text-sm font-medium ${
            step.number === currentStep 
              ? "text-neutral-800" 
              : "text-neutral-500"
          }`}>
            {step.label}
          </div>
          <div className={`hidden md:block w-8 h-0.5 ${
            step.number < currentStep 
              ? "bg-primary-100" 
              : "bg-neutral-200"
          } mx-1 ${index === steps.length - 1 ? "hidden" : ""}`}></div>
        </div>
      ))}
    </div>
  );
}
