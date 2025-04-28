import React from 'react';

interface WorkflowStepperProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Upload Image", icon: "image" },
  { number: 2, label: "Extract Text", icon: "file-text" },
  { number: 3, label: "Match Strings", icon: "links" },
  { number: 4, label: "Code Search", icon: "code-s-slash" },
  { number: 5, label: "AI Analysis", icon: "robot" },
  { number: 6, label: "Report", icon: "file-chart" }
];

export default function WorkflowStepper({ currentStep }: WorkflowStepperProps) {
  // Helper function to get icon with fallback
  const getIcon = (iconName: string, isActive: boolean) => {
    const getIconClass = (name: string) => {
      // Map our icon names to Font Awesome equivalents for fallback
      const faMap: Record<string, string> = {
        "image": "image",
        "file-text": "file-lines",
        "links": "link",
        "code-s-slash": "code",
        "robot": "robot",
        "file-chart": "chart-line"
      };
      
      return (
        <>
          <i className={`ri-${name}-line`}></i>
          <span className={`ri-${name}-line hidden`}>
            <i className={`fa-solid fa-${faMap[name] || name}`}></i>
          </span>
        </>
      );
    };
    
    return getIconClass(iconName);
  };

  return (
    <div className="w-full lg:w-auto flex flex-col md:flex-row gap-3 md:gap-0">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center group">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step.number === currentStep 
              ? "bg-primary-500 text-white" 
              : step.number < currentStep 
                ? "bg-primary-300 text-white"
                : "bg-neutral-200 text-neutral-800"
          } font-medium shrink-0`}>
            {getIcon(step.icon, step.number === currentStep)}
          </div>
          <div className={`mx-2 text-sm font-medium ${
            step.number === currentStep 
              ? "text-neutral-800" 
              : "text-neutral-500"
          }`}>
            {step.label}
          </div>
          <div className={`hidden md:block w-12 h-0.5 ${
            step.number < currentStep 
              ? "bg-primary-300" 
              : "bg-neutral-200"
          } mx-1 ${index === steps.length - 1 ? "hidden" : ""}`}></div>
        </div>
      ))}
    </div>
  );
}
