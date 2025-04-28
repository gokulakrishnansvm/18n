import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'typescript' }: CodeBlockProps) {
  const { toast } = useToast();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "Code snippet has been copied to clipboard",
      variant: "default"
    });
  };
  
  // Simple syntax highlighting function
  const highlightCode = (code: string, language: string) => {
    if (language === 'typescript' || language === 'javascript') {
      // Basic highlighting for JS/TS
      code = code
        .replace(/\/\/(.*)/g, '<span class="comment">$&</span>') // comments
        .replace(/\/\*([\s\S]*?)\*\//g, '<span class="comment">$&</span>') // multiline comments
        .replace(/('.*?'|".*?")/g, '<span class="string">$&</span>') // strings
        .replace(/\b(import|export|from|const|let|var|function|return|if|else|for|while|class|extends|interface|type|new|this|super|async|await|try|catch|throw|typeof)\b/g, '<span class="keyword">$&</span>') // keywords
        .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="class">$&</span>') // classes
        .replace(/\b(true|false|null|undefined)\b/g, '<span class="literal">$&</span>'); // literals
    } else if (language === 'java') {
      // Basic highlighting for Java
      code = code
        .replace(/\/\/(.*)/g, '<span class="comment">$&</span>') // comments
        .replace(/\/\*([\s\S]*?)\*\//g, '<span class="comment">$&</span>') // multiline comments
        .replace(/('.*?'|".*?")/g, '<span class="string">$&</span>') // strings
        .replace(/\b(public|private|protected|class|interface|extends|implements|static|final|void|int|String|boolean|return|if|else|for|while|new|try|catch|throw|this|super)\b/g, '<span class="keyword">$&</span>') // keywords
        .replace(/@\w+/g, '<span class="annotation">$&</span>') // annotations
        .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="class">$&</span>'); // classes
    }
    
    return code;
  };
  
  return (
    <div className="code-block text-xs p-3 overflow-x-auto relative">
      <button 
        onClick={copyToClipboard}
        className="absolute top-2 right-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded p-1"
        title="Copy code"
      >
        <i className="ri-file-copy-line"></i>
      </button>
      <pre 
        dangerouslySetInnerHTML={{ 
          __html: highlightCode(code, language) 
        }} 
      />
    </div>
  );
}
