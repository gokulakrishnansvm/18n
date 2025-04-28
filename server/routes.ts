import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { parseStringPromise } from 'xml2js';
import { 
  extractTextSchema, 
  matchStringsSchema, 
  searchCodeSchema, 
  aiAnalysisSchema 
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import xml2js from "xml2js";
import { createWorker } from "tesseract.js";

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  storage: multer.memoryStorage(),
});

// Real text extraction function using Tesseract.js

async function extractTextFromImage(imageBuffer: Buffer): Promise<{ text: string; confidence: string }[]> {
  try {
    const worker = await createWorker('eng');

    // Convert buffer to base64 for Tesseract
    const base64Image = imageBuffer.toString('base64');

    // Recognize text in image
    const result = await worker.recognize(`data:image/jpeg;base64,${base64Image}`);

    const results: { text: string; confidence: string }[] = [];

    if (result.data.text && result.data.text.trim() !== '') {
      const seen = new Set<string>();
      const lines = result.data.text.split('\n').filter(line => line.trim().length > 0);

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.length > 0 && !seen.has(trimmedLine)) {
          results.push({ text: trimmedLine, confidence: "0.88" });
          seen.add(trimmedLine);
        }
      });

      // const allTextNormalized = result.data.text.replace(/\n/g, ' ').replace(/\s+/g, ' ');
      // const sentences = allTextNormalized.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
      //
      // sentences.forEach(sentence => {
      //   const trimmedSentence = sentence.trim();
      //   if (trimmedSentence.length > 15 && !seen.has(trimmedSentence)) {
      //     results.push({ text: trimmedSentence, confidence: "0.90" });
      //     seen.add(trimmedSentence);
      //   }
      // });

    //   let currentParagraph = '';
    //   for (let i = 0; i < lines.length; i++) {
    //     const line = lines[i].trim();
    //     if (line.length === 0) continue;
    //
    //     const endsWithPunctuation = /[.!?]$/.test(line);
    //
    //     if (currentParagraph.length > 0) {
    //       currentParagraph += ' ';
    //     }
    //     currentParagraph += line;
    //
    //     if (endsWithPunctuation || i === lines.length - 1) {
    //       if (currentParagraph.length > 30 && !seen.has(currentParagraph)) {
    //         results.push({ text: currentParagraph.trim(), confidence: "0.92" });
    //         seen.add(currentParagraph.trim());
    //       }
    //       currentParagraph = '';
    //     }
    //   }
    }

    await worker.terminate();

    //  If still empty, just return "no text found"
    if (results.length === 0) {
      console.warn("No text detected in the image.");
      return [{ text: "No text found", confidence: "0.0" }];
    }

    return results;
  } catch (error) {
    console.error("Error extracting text with Tesseract:", error);
    return [{ text: "No text found", confidence: "0.0" }];
  }
}

// Improved string matcher function based on the provided Java implementation

interface MatchResult {
  text: string;
  stringId: string;
}

interface UnmatchedResult {
  text: string;
  suggestedId: string;
}

export async function matchStrings(
    extractedTexts: string[],
    resourceData: string,
    fileType: string
) {
  const resourceStrings = new Map<string, string>();

  if (fileType === 'xml') {
    try {
      const result = await parseStringPromise(resourceData, { explicitArray: false });
      if (result.resources && result.resources.string) {
        const strings = Array.isArray(result.resources.string)
            ? result.resources.string
            : [result.resources.string];

        for (const str of strings) {
          if (str.$?.name && str._) {
            const value = str._.replace(/\s+/g, ' ').trim();
            resourceStrings.set(str.$.name, value);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing XML:', error);
    }
  } else {
    throw new Error('Only XML fileType is supported.');
  }

  const normalizedResources = new Map<string, string>();
  for (const [key, value] of resourceStrings.entries()) {
    normalizedResources.set(key, normalizeText(value));
  }

  const matches: MatchResult[] = [];
  const unmatched: UnmatchedResult[] = [];

  for (const extractedText of extractedTexts) {
    const sentences = extractedText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    let foundMatches: Map<string, { stringId: string; score: number }> = new Map();

    if (sentences.length === 1) {
      const normalizedSentence = normalizeText(sentences[0]);
      let bestKey = '';
      let bestScore = 0;

      for (const [key, normalizedValue] of normalizedResources.entries()) {
        if (Math.abs(normalizedSentence.length - normalizedValue.length) > 100) {
          continue;
        }

        const score = similarity(normalizedSentence, normalizedValue);

        if (score > bestScore) {
          bestScore = score;
          bestKey = key;

          if (bestScore === 1.0) {
            break;
          }
        }
      }

      if (bestScore >= 0.8) {
        foundMatches.set(sentences[0], { stringId: bestKey, score: bestScore });
      }
    } else {
      const n = sentences.length;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j <= n; j++) {
          const combined = sentences.slice(i, j).join(' ').trim();
          if (!combined) continue;

          const normalizedCombined = normalizeText(combined);
          let bestKey = '';
          let bestScore = 0;

          for (const [key, normalizedValue] of normalizedResources.entries()) {
            if (Math.abs(normalizedCombined.length - normalizedValue.length) > 100) {
              continue;
            }

            const score = similarity(normalizedCombined, normalizedValue);

            if (score > bestScore) {
              bestScore = score;
              bestKey = key;

              if (bestScore === 1.0) {
                break;
              }
            }
          }

          if (bestScore >= 0.8) {
            foundMatches.set(combined, { stringId: bestKey, score: bestScore });
          }
        }
      }
    }

    if (foundMatches.size > 0) {
      for (const [textBlock, match] of foundMatches.entries()) {
        matches.push({ text: textBlock, stringId: match.stringId });
      }
    } else {
      unmatched.push({
        text: extractedText,
        suggestedId: generateSuggestedId(extractedText)
      });
    }
  }

  return {
    matched: matches,
    unmatched: unmatched
  };
}

function normalizeText(text: string): string {
  return text
      .replace(/%\d+\$[sd]/g, 'placeholder')  // Handle placeholders
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
}

function similarity(a: string, b: string): number {
  const wordsA = a.split(' ').filter(Boolean);
  const wordsB = b.split(' ').filter(Boolean);

  let intersectionCount = 0;
  const wordCountMap = new Map<string, number>();

  for (const word of wordsB) {
    wordCountMap.set(word, (wordCountMap.get(word) || 0) + 1);
  }

  for (const word of wordsA) {
    if (wordCountMap.has(word)) {
      intersectionCount++;
      const count = wordCountMap.get(word)! - 1;
      if (count === 0) {
        wordCountMap.delete(word);
      } else {
        wordCountMap.set(word, count);
      }
    }
  }

  const unionCount = wordsA.length + wordsB.length - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

function generateSuggestedId(text: string): string {
  return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 30);
}

// Mock code search API
function searchCodeSnippets(stringIds: string[]) {
  // This would normally call your internal code search API
  const mockSnippets = [
    {
      id: 1,
      filename: "LoginComponent.tsx",
      code: `import React from 'react';
import { useTranslation } from 'react-i18next';

const LoginComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div className="login-container">
      <h1>{t('welcome_message')}</h1>
      <p>{t('signin_prompt')}</p>
      
      // This string is not internationalized
      <a href="#">Forgot your password?</a>
    </div>
  );
};`,
      lineNumber: 9,
      stringIds: ["welcome_message", "signin_prompt"]
    },
    {
      id: 2,
      filename: "HomeScreen.java",
      code: `public class HomeScreen extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);
        
        TextView welcomeText = findViewById(R.id.welcome_text);
        welcomeText.setText(getString(R.string.welcome_message));
        
        Button signInButton = findViewById(R.id.sign_in_button);
        signInButton.setText(getString(R.string.signin_prompt));
        
        // This string should be in resources
        TextView privacyLink = findViewById(R.id.privacy_link);
        privacyLink.setText("Privacy Policy");
    }
}`,
      lineNumber: 7,
      stringIds: ["welcome_message", "signin_prompt"]
    }
  ];
  
  // Filter based on provided string IDs
  return mockSnippets.filter(snippet => 
    snippet.stringIds.some(id => stringIds.includes(id))
  );
}

// Mock AI analysis function (simulates Amazon Bedrock)
function getAISuggestions(codeSnippets: any[]) {
  const suggestions = [];
  
  for (const snippet of codeSnippets) {
    if (snippet.filename === "LoginComponent.tsx" && snippet.code.includes("Forgot your password?")) {
      suggestions.push({
        id: 1,
        codeSnippetId: snippet.id,
        issue: "Hard-coded String in LoginComponent.tsx",
        currentImplementation: `<a href="#">Forgot your password?</a>`,
        suggestedImplementation: `<a href="#">{t('forgot_password')}</a>`,
        recommendation: "Replace the hard-coded string \"Forgot your password?\" with a translated string using the i18n framework. Add a new entry in your resource files with key \"forgot_password\"."
      });
    }
    
    if (snippet.filename === "HomeScreen.java" && snippet.code.includes("Privacy Policy")) {
      suggestions.push({
        id: 2,
        codeSnippetId: snippet.id,
        issue: "Hard-coded String in HomeScreen.java",
        currentImplementation: `privacyLink.setText("Privacy Policy");`,
        suggestedImplementation: `privacyLink.setText(getString(R.string.privacy_policy));`,
        recommendation: "Replace the hard-coded string \"Privacy Policy\" with a localized string resource. Add a new entry in your strings.xml with key \"privacy_policy\"."
      });
    }
  }
  
  return suggestions;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Extract text from image
  app.post('/api/extract-text', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }
      
      // Check file type
      const fileType = req.file.mimetype;
      if (!fileType.startsWith('image/')) {
        return res.status(400).json({ error: 'Uploaded file is not an image' });
      }
      
      console.log(`Processing image of type ${fileType} and size ${req.file.size} bytes`);
      
      // Extract text from image using Tesseract OCR
      const extractedItems = await extractTextFromImage(req.file.buffer);
      
      console.log(`Extracted ${extractedItems.length} text items from image`);
      
      return res.json({ 
        success: true, 
        extractedItems 
      });
    } catch (error) {
      console.error('Error extracting text:', error);
      return res.status(500).json({ error: 'Failed to extract text from image' });
    }
  });
  
  // Match strings with resource file
  app.post('/api/match-strings', upload.single('resourceFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No resource file uploaded' });
      }
      
      // Parse extracted text items from request body
      const extractedItems = JSON.parse(req.body.extractedTexts || '[]');
      if (!Array.isArray(extractedItems)) {
        return res.status(400).json({ error: 'Invalid extracted texts format' });
      }
      
      // Extract just the text content from each item
      const extractedTexts = extractedItems.map(item => {
        // If item is an object with text property, extract the text
        if (typeof item === 'object' && item !== null && 'text' in item) {
          return item.text;
        }
        // If item is a string, use as is
        else if (typeof item === 'string') {
          return item;
        }
        // Otherwise return empty string
        return '';
      }).filter(text => text.trim() !== '');
      
      console.log(`Processing ${extractedTexts.length} text items for matching`);
      
      // Determine file type from content
      const fileContent = req.file.buffer.toString('utf8');
      let fileType = 'unknown';
      
      if (fileContent.trim().startsWith('<')) {
        fileType = 'xml';
      } else if (fileContent.trim().startsWith('{')) {
        fileType = 'json';
      }
      
      if (fileType === 'unknown') {
        return res.status(400).json({ error: 'Unsupported resource file format' });
      }
      
      const matchResult = await matchStrings(extractedTexts, fileContent, fileType);
      console.log(`Found ${matchResult.matched.length} matches and ${matchResult.unmatched.length} unmatched items`);
      
      return res.json({
        success: true,
        matched: matchResult.matched,
        unmatched: matchResult.unmatched
      });
    } catch (error) {
      console.error('Error matching strings:', error);
      return res.status(500).json({ error: 'Failed to match strings with resource file' });
    }
  });
  
  // Search code snippets
  app.post('/api/search-code', async (req, res) => {
    try {
      const { stringIds } = searchCodeSchema.parse(req.body);
      
      const codeSnippets = searchCodeSnippets(stringIds);
      
      return res.json({
        success: true,
        codeSnippets
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'Invalid request format', details: error.errors });
      }
      
      console.error('Error searching code:', error);
      return res.status(500).json({ error: 'Failed to search code snippets' });
    }
  });
  
  // Get AI suggestions
  app.post('/api/ai-suggestions', async (req, res) => {
    try {
      const { codeSnippets } = aiAnalysisSchema.parse(req.body);
      
      const suggestions = getAISuggestions(codeSnippets);
      
      return res.json({
        success: true,
        suggestions
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'Invalid request format', details: error.errors });
      }
      
      console.error('Error getting AI suggestions:', error);
      return res.status(500).json({ error: 'Failed to get AI suggestions' });
    }
  });
  
  // Generate report (returns the data needed for the report)
  app.post('/api/generate-report', async (req, res) => {
    try {
      const { 
        extractedTexts = [], 
        matched = [], 
        unmatched = [], 
        codeSnippets = [], 
        suggestions = [] 
      } = req.body;
      
      // In a real application, you might format this data or generate an actual PDF/CSV
      return res.json({
        success: true,
        report: {
          summary: {
            totalStrings: extractedTexts.length,
            matchedCount: matched.length,
            unmatchedCount: unmatched.length,
            issuesCount: suggestions.length
          },
          extractedTexts,
          matched,
          unmatched,
          codeSnippets,
          suggestions
        }
      });
    } catch (error) {
      console.error('Error generating report:', error);
      return res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
