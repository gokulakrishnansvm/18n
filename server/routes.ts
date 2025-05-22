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


// export async function extractTextFromImage(imageBuffer: Buffer): Promise<{ text: string; confidence: string }[]> {
//   try {
//     const worker = await createWorker('eng');
//
//     const base64Image = imageBuffer.toString('base64');
//     const result = await worker.recognize(`data:image/jpeg;base64,${base64Image}`, {}, { blocks: true });
//     if (result.data.blocks) {
//       const words = result.data.blocks.map((block) => block.paragraphs.map((paragraph) => paragraph.lines.map((line) => line.words))).flat(3);
//       console.log(words);
//     }
//
//
//
//     if (!words || words.length === 0) {
//       console.warn("No words detected in the image.");
//       await worker.terminate();
//       return [{ text: "No text found", confidence: "0.0" }];
//     }
//
//     // Now you can use result.data.words safely
//     const wordBoxes = result.data.words.map(word => ({
//       text: word.text,
//       confidence: word.confidence?.toFixed(2) ?? "0.0",
//       x: word.bbox.x0,
//       y: word.bbox.y0,
//       width: word.bbox.x1 - word.bbox.x0,
//       height: word.bbox.y1 - word.bbox.y0,
//     }));
//
//     // Grouping logic
//     const horizontalThreshold = 40;
//     const verticalThreshold = 20;
//
//     wordBoxes.sort((a, b) => {
//       const verticalDiff = a.y - b.y;
//       if (Math.abs(verticalDiff) > verticalThreshold) return verticalDiff;
//       return a.x - b.x;
//     });
//
//     const results: { text: string; confidence: string }[] = [];
//     let currentLine: typeof wordBoxes = [];
//
//     for (const word of wordBoxes) {
//       if (currentLine.length === 0) {
//         currentLine.push(word);
//         continue;
//       }
//
//       const prevWord = currentLine[currentLine.length - 1];
//       const verticalDistance = Math.abs(word.y - prevWord.y);
//       const horizontalDistance = word.x - (prevWord.x + prevWord.width);
//
//       if (verticalDistance > verticalThreshold || horizontalDistance > horizontalThreshold) {
//         const lineText = currentLine.map(w => w.text).join(' ');
//         const avgConfidence = (
//             currentLine.reduce((sum, w) => sum + parseFloat(w.confidence), 0) / currentLine.length
//         ).toFixed(2);
//         results.push({ text: lineText, confidence: avgConfidence });
//         currentLine = [word];
//       } else {
//         currentLine.push(word);
//       }
//     }
//
//     if (currentLine.length > 0) {
//       const lineText = currentLine.map(w => w.text).join(' ');
//       const avgConfidence = (
//           currentLine.reduce((sum, w) => sum + parseFloat(w.confidence), 0) / currentLine.length
//       ).toFixed(2);
//       results.push({ text: lineText, confidence: avgConfidence });
//     }
//
//     await worker.terminate();
//
//     return results;
//   } catch (error) {
//     console.error("Error extracting text with Tesseract:", error);
//     return [{ text: "No text found", confidence: "0.0" }];
//   }
// }

//v2
// import { createWorker } from 'tesseract.js';
//
// export async function extractTextFromImage(
//     imageBuffer: Buffer
// ): Promise<{ text: string; confidence: string }[]> {
//   try {
//     const worker = await createWorker('eng');
//
//     const base64Image = imageBuffer.toString('base64');
//     const result = await worker.recognize(
//         `data:image/jpeg;base64,${base64Image}`,
//         {},
//         { blocks: true } // must be explicitly enabled in v6
//     );
//
//     // Extract all words from blocks
//     const words = result.data.blocks
//         .map(block =>
//             block.paragraphs?.flatMap(paragraph =>
//                 paragraph.lines?.flatMap(line =>
//                     line.words ?? []
//                 ) ?? []
//             ) ?? []
//         )
//         .flat();
//     console.log(words);
//
//     if (!words || words.length === 0) {
//       console.warn("No words detected in the image.");
//       await worker.terminate();
//       return [{ text: "No text found", confidence: "0.0" }];
//     }
//
//     const wordBoxes = words.map(word => ({
//       text: word.text,
//       confidence: word.confidence?.toFixed(2) ?? "0.0",
//       x: word.bbox.x0,
//       y: word.bbox.y0,
//       width: word.bbox.x1 - word.bbox.x0,
//       height: word.bbox.y1 - word.bbox.y0,
//     }));
//
//     // Grouping logic
//     const horizontalThreshold = 40;
//     const verticalThreshold = 30;
//
//     wordBoxes.sort((a, b) => {
//       const verticalDiff = a.y - b.y;
//       if (Math.abs(verticalDiff) > verticalThreshold) return verticalDiff;
//       return a.x - b.x;
//     });
//
//     const results: { text: string; confidence: string }[] = [];
//     let currentLine: typeof wordBoxes = [];
//
//     for (const word of wordBoxes) {
//       if (currentLine.length === 0) {
//         currentLine.push(word);
//         continue;
//       }
//
//       const prevWord = currentLine[currentLine.length - 1];
//       const verticalDistance = Math.abs(word.y - prevWord.y);
//       const horizontalDistance = word.x - (prevWord.x + prevWord.width);
//
//       if (verticalDistance > verticalThreshold || horizontalDistance > horizontalThreshold) {
//         const lineText = currentLine.map(w => w.text).join(' ');
//         const avgConfidence = (
//             currentLine.reduce((sum, w) => sum + parseFloat(w.confidence), 0) / currentLine.length
//         ).toFixed(2);
//         results.push({ text: lineText, confidence: avgConfidence });
//         currentLine = [word];
//       } else {
//         currentLine.push(word);
//       }
//     }
//
//     if (currentLine.length > 0) {
//       const lineText = currentLine.map(w => w.text).join(' ');
//       const avgConfidence = (
//           currentLine.reduce((sum, w) => sum + parseFloat(w.confidence), 0) / currentLine.length
//       ).toFixed(2);
//       results.push({ text: lineText, confidence: avgConfidence });
//     }
//
//     await worker.terminate();
//
//     return results;
//   } catch (error) {
//     console.error("Error extracting text with Tesseract:", error);
//     return [{ text: "No text found", confidence: "0.0" }];
//   }
// }

//v3

// export async function extractTextFromImage(
//     imageBuffer: Buffer
// ): Promise<{ text: string; confidence: string }[]> {
//   try {
//     const worker = await createWorker('eng');
//
//     const base64Image = imageBuffer.toString('base64');
//     const result = await worker.recognize(
//         `data:image/jpeg;base64,${base64Image}`,
//         {},
//         { blocks: true } // Important for Tesseract.js v6
//     );
//
//     // Extract words from nested structure
//     const words = result.data.blocks
//         .map(block =>
//             block.paragraphs?.flatMap(paragraph =>
//                 paragraph.lines?.flatMap(line =>
//                     line.words ?? []
//                 ) ?? []
//             ) ?? []
//         )
//         .flat();
//
//     if (!words || words.length === 0) {
//       console.warn("No words detected in the image.");
//       await worker.terminate();
//       return [{ text: "No text found", confidence: "0.0" }];
//     }
//
//     const wordBoxes = words.map(word => ({
//       text: word.text,
//       confidence: word.confidence?.toFixed(2) ?? "0.0",
//       x: word.bbox.x0,
//       y: word.bbox.y0,
//       width: word.bbox.x1 - word.bbox.x0,
//       height: word.bbox.y1 - word.bbox.y0,
//     }));
//
//     // Adaptive thresholds
//     const averageHeight = wordBoxes.reduce((sum, w) => sum + w.height, 0) / wordBoxes.length;
//     const verticalThreshold = averageHeight * 0.6;
//     const horizontalThreshold = 40;
//
//     // Sort first by Y, then X
//     wordBoxes.sort((a, b) => {
//       const verticalDiff = a.y - b.y;
//       if (Math.abs(verticalDiff) > verticalThreshold) return verticalDiff;
//       return a.x - b.x;
//     });
//
//     const results: { text: string; confidence: string }[] = [];
//     let currentLine: typeof wordBoxes = [];
//
//     for (const word of wordBoxes) {
//       if (currentLine.length === 0) {
//         currentLine.push(word);
//         continue;
//       }
//
//       const prevWord = currentLine[currentLine.length - 1];
//
//       // Use vertical midpoints for better accuracy
//       const verticalDistance = Math.abs((word.y + word.height / 2) - (prevWord.y + prevWord.height / 2));
//       const horizontalDistance = word.x - (prevWord.x + prevWord.width);
//
//       if (verticalDistance > verticalThreshold || horizontalDistance > horizontalThreshold) {
//         const lineText = currentLine.map(w => w.text).join(' ');
//         const avgConfidence = (
//             currentLine.reduce((sum, w) => sum + parseFloat(w.confidence), 0) / currentLine.length
//         ).toFixed(2);
//         results.push({ text: lineText, confidence: avgConfidence });
//         currentLine = [word];
//       } else {
//         currentLine.push(word);
//       }
//     }
//
//     // Push final line
//     if (currentLine.length > 0) {
//       const lineText = currentLine.map(w => w.text).join(' ');
//       const avgConfidence = (
//           currentLine.reduce((sum, w) => sum + parseFloat(w.confidence), 0) / currentLine.length
//       ).toFixed(2);
//       results.push({ text: lineText, confidence: avgConfidence });
//     }
//
//     await worker.terminate();
//     return results;
//
//   } catch (error) {
//     console.error("Error extracting text with Tesseract:", error);
//     return [{ text: "No text found", confidence: "0.0" }];
//   }
// }

//v4

// export async function extractTextFromImage(
//     imageBuffer: Buffer
// ): Promise<{ text: string; confidence: string }[]> {
//   try {
//     const worker = await createWorker('eng');
//
//     const base64Image = imageBuffer.toString('base64');
//     const result = await worker.recognize(
//         `data:image/jpeg;base64,${base64Image}`,
//         {},
//         { blocks: true }
//     );
//
//     // Extract words from nested structure
//     const words = result.data.blocks
//         .flatMap(block =>
//             block.paragraphs?.flatMap(paragraph =>
//                 paragraph.lines?.flatMap(line =>
//                     line.words ?? []
//                 ) ?? []
//             ) ?? []
//         );
//
//     if (!words || words.length === 0) {
//       console.warn("No words detected in the image.");
//       await worker.terminate();
//       return [{ text: "No text found", confidence: "0.0" }];
//     }
//
//     const wordBoxes = words.map(word => ({
//       text: word.text,
//       confidence: word.confidence?.toFixed(2) ?? "0.0",
//       x: word.bbox.x0,
//       y: word.bbox.y0,
//       width: word.bbox.x1 - word.bbox.x0,
//       height: word.bbox.y1 - word.bbox.y0,
//     }));
//
//     // Estimate average height and set thresholds
//     const averageHeight = wordBoxes.reduce((sum, w) => sum + w.height, 0) / wordBoxes.length;
//     const verticalLineThreshold = averageHeight * 0.6;
//     const paragraphSpacingThreshold = averageHeight * 1.5;
//     const horizontalThreshold = 40;
//
//     // Sort words top-to-bottom, then left-to-right
//     wordBoxes.sort((a, b) => {
//       const verticalDiff = (a.y + a.height / 2) - (b.y + b.height / 2);
//       if (Math.abs(verticalDiff) > verticalLineThreshold) return verticalDiff;
//       return a.x - b.x;
//     });
//
//     // 1. Group words into lines
//     const lines: typeof wordBoxes[] = [];
//     let currentLine: typeof wordBoxes = [];
//
//     for (const word of wordBoxes) {
//       if (currentLine.length === 0) {
//         currentLine.push(word);
//         continue;
//       }
//
//       const prevWord = currentLine[currentLine.length - 1];
//       const verticalDistance = Math.abs((word.y + word.height / 2) - (prevWord.y + prevWord.height / 2));
//       const horizontalDistance = word.x - (prevWord.x + prevWord.width);
//
//       if (verticalDistance > verticalLineThreshold || horizontalDistance > horizontalThreshold) {
//         lines.push([...currentLine]);
//         currentLine = [word];
//       } else {
//         currentLine.push(word);
//       }
//     }
//
//     if (currentLine.length > 0) lines.push([...currentLine]);
//
//     // 2. Group lines into paragraphs based on vertical spacing between lines
//     const paragraphs: typeof lines[] = [];
//     let currentParagraph: typeof lines = [];
//
//     for (let i = 0; i < lines.length; i++) {
//       const current = lines[i];
//
//       if (currentParagraph.length === 0) {
//         currentParagraph.push(current);
//         continue;
//       }
//
//       const prevLine = currentParagraph[currentParagraph.length - 1];
//       const prevY = Math.min(...prevLine.map(w => w.y));
//       const currY = Math.min(...current.map(w => w.y));
//
//       const lineSpacing = currY - prevY;
//
//       if (lineSpacing > paragraphSpacingThreshold) {
//         paragraphs.push([...currentParagraph]);
//         currentParagraph = [current];
//       } else {
//         currentParagraph.push(current);
//       }
//     }
//
//     if (currentParagraph.length > 0) paragraphs.push([...currentParagraph]);
//
//     // Format output: one entry per paragraph
//     const results: { text: string; confidence: string }[] = paragraphs.map(paragraph => {
//       const paragraphWords = paragraph.flat();
//       const text = paragraph.map(line => line.map(w => w.text).join(' ')).join('\n');
//       const avgConfidence = (
//           paragraphWords.reduce((sum, w) => sum + parseFloat(w.confidence), 0) / paragraphWords.length
//       ).toFixed(2);
//       return { text, confidence: avgConfidence };
//     });
//
//     await worker.terminate();
//     return results;
//   } catch (error) {
//     console.error("Error extracting text with Tesseract:", error);
//     return [{ text: "No text found", confidence: "0.0" }];
//   }
// }

//v5
//
// export async function extractTextFromImage(
//     imageBuffer: Buffer
// ): Promise<{ text: string; confidence: string }[]> {
//   try {
//     const worker = await createWorker('eng');
//
//     const base64Image = imageBuffer.toString('base64');
//     const result = await worker.recognize(
//         `data:image/jpeg;base64,${base64Image}`,
//         {},
//         { blocks: true }
//     );
//
//     // Extract words from nested structure
//     const words = result.data.blocks
//         .flatMap(block =>
//             block.paragraphs?.flatMap(paragraph =>
//                 paragraph.lines?.flatMap(line =>
//                     line.words ?? []
//                 ) ?? []
//             ) ?? []
//         );
//
//     if (!words || words.length === 0) {
//       console.warn("No words detected in the image.");
//       await worker.terminate();
//       return [{ text: "No text found", confidence: "0.0" }];
//     }
//
//     const wordBoxes = words.map(word => ({
//       text: word.text,
//       confidence: word.confidence?.toFixed(2) ?? "0.0",
//       x: word.bbox.x0,
//       y: word.bbox.y0,
//       width: word.bbox.x1 - word.bbox.x0,
//       height: word.bbox.y1 - word.bbox.y0,
//     }));
//
//     // Estimate average height and set thresholds
//     const averageHeight = wordBoxes.reduce((sum, w) => sum + w.height, 0) / wordBoxes.length;
//     const verticalLineThreshold = averageHeight * 0.6;
//     const paragraphSpacingThreshold = averageHeight * 1.5;
//     const horizontalThreshold = 40;
//
//     // Sort words top-to-bottom, then left-to-right
//     wordBoxes.sort((a, b) => {
//       const verticalDiff = (a.y + a.height / 2) - (b.y + b.height / 2);
//       if (Math.abs(verticalDiff) > verticalLineThreshold) return verticalDiff;
//       return a.x - b.x;
//     });
//
//     // 1. Group words into lines
//     const lines: typeof wordBoxes[] = [];
//     let currentLine: typeof wordBoxes = [];
//
//     for (const word of wordBoxes) {
//       if (currentLine.length === 0) {
//         currentLine.push(word);
//         continue;
//       }
//
//       const prevWord = currentLine[currentLine.length - 1];
//       const verticalDistance = Math.abs((word.y + word.height / 2) - (prevWord.y + prevWord.height / 2));
//       const horizontalDistance = word.x - (prevWord.x + prevWord.width);
//
//       if (verticalDistance > verticalLineThreshold || horizontalDistance > horizontalThreshold) {
//         lines.push([...currentLine]);
//         currentLine = [word];
//       } else {
//         currentLine.push(word);
//       }
//     }
//
//     if (currentLine.length > 0) lines.push([...currentLine]);
//
//     // 2. Group lines into paragraphs based on vertical spacing AND horizontal overlap
//     const paragraphs: typeof lines[] = [];
//     let currentParagraph: typeof lines = [];
//
//     for (let i = 0; i < lines.length; i++) {
//       const current = lines[i];
//
//       if (currentParagraph.length === 0) {
//         currentParagraph.push(current);
//         continue;
//       }
//
//       const prevLine = currentParagraph[currentParagraph.length - 1];
//
//       const prevY = Math.min(...prevLine.map(w => w.y));
//       const currY = Math.min(...current.map(w => w.y));
//       const lineSpacing = currY - prevY;
//
//       const prevMinX = Math.min(...prevLine.map(w => w.x));
//       const prevMaxX = Math.max(...prevLine.map(w => w.x + w.width));
//       const currMinX = Math.min(...current.map(w => w.x));
//       const currMaxX = Math.max(...current.map(w => w.x + w.width));
//
//       const horizontalOverlap = Math.min(prevMaxX, currMaxX) - Math.max(prevMinX, currMinX);
//       const horizontalOverlapRatio = horizontalOverlap > 0
//           ? horizontalOverlap / (currMaxX - currMinX)
//           : 0;
//
//       const isSameParagraph = lineSpacing <= paragraphSpacingThreshold && horizontalOverlapRatio >= 0.2;
//
//       if (!isSameParagraph) {
//         paragraphs.push([...currentParagraph]);
//         currentParagraph = [current];
//       } else {
//         currentParagraph.push(current);
//       }
//     }
//
//     if (currentParagraph.length > 0) paragraphs.push([...currentParagraph]);
//
//     // Format final results
//     const results: { text: string; confidence: string }[] = paragraphs.map(paragraph => {
//       const paragraphWords = paragraph.flat();
//       const text = paragraph.map(line => line.map(w => w.text).join(' ')).join('\n');
//       const avgConfidence = (
//           paragraphWords.reduce((sum, w) => sum + parseFloat(w.confidence), 0) / paragraphWords.length
//       ).toFixed(2);
//       return { text, confidence: avgConfidence };
//     });
//
//     await worker.terminate();
//     return results;
//   } catch (error) {
//     console.error("Error extracting text with Tesseract:", error);
//     return [{ text: "No text found", confidence: "0.0" }];
//   }
// }

//v6

export async function extractTextFromImage(
    imageBuffer: Buffer
): Promise<{ text: string; confidence: string }[]> {
  try {
    const worker = await createWorker('eng');

    const base64Image = imageBuffer.toString('base64');
    const result = await worker.recognize(
        `data:image/jpeg;base64,${base64Image}`,
        {},
        { blocks: true }
    );

    const rawWords = result.data.blocks
        .flatMap(block =>
            block.paragraphs?.flatMap(paragraph =>
                paragraph.lines?.flatMap(line =>
                    line.words ?? []
                ) ?? []
            ) ?? []
        );

    if (!rawWords || rawWords.length === 0) {
      console.warn("No words detected in the image.");
      await worker.terminate();
      return [{ text: "No text found", confidence: "0.0" }];
    }

    // Basic whitelist for short valid words
    const shortWordWhitelist = new Set(['of', 'in', 'on', 'at', 'to', 'by', 'is', 'it', 'an', 'as', 'be', 'up', 'do', 'go']);

    // Map and filter words to remove noise
    const wordBoxes = rawWords.map(word => ({
      text: word.text,
      confidence: word.confidence ?? 0,
      x: word.bbox.x0,
      y: word.bbox.y0,
      width: word.bbox.x1 - word.bbox.x0,
      height: word.bbox.y1 - word.bbox.y0,
    })).filter(w =>
        !(w.text.length <= 2 &&
            w.confidence < 70 &&
            !shortWordWhitelist.has(w.text.toLowerCase()))
    ).map(w => ({
      ...w,
      confidence: w.confidence.toFixed(2)
    }));

    if (wordBoxes.length === 0) {
      await worker.terminate();
      return [{ text: "No meaningful text found", confidence: "0.0" }];
    }

    const averageHeight = wordBoxes.reduce((sum, w) => sum + w.height, 0) / wordBoxes.length;
    const verticalLineThreshold = averageHeight * 0.6;
    const paragraphSpacingThreshold = averageHeight * 1.5;
    const horizontalThreshold = 40;

    // Sort words top-down then left-right
    wordBoxes.sort((a, b) => {
      const verticalDiff = (a.y + a.height / 2) - (b.y + b.height / 2);
      if (Math.abs(verticalDiff) > verticalLineThreshold) return verticalDiff;
      return a.x - b.x;
    });

    // Group into lines
    const lines: typeof wordBoxes[] = [];
    let currentLine: typeof wordBoxes = [];

    for (const word of wordBoxes) {
      if (currentLine.length === 0) {
        currentLine.push(word);
        continue;
      }

      const prevWord = currentLine[currentLine.length - 1];
      const verticalDistance = Math.abs((word.y + word.height / 2) - (prevWord.y + prevWord.height / 2));
      const horizontalDistance = word.x - (prevWord.x + prevWord.width);

      if (verticalDistance > verticalLineThreshold || horizontalDistance > horizontalThreshold) {
        lines.push([...currentLine]);
        currentLine = [word];
      } else {
        currentLine.push(word);
      }
    }
    if (currentLine.length > 0) lines.push([...currentLine]);

    // Group into paragraphs
    const paragraphs: typeof lines[] = [];
    let currentParagraph: typeof lines = [];

    for (let i = 0; i < lines.length; i++) {
      const current = lines[i];

      if (currentParagraph.length === 0) {
        currentParagraph.push(current);
        continue;
      }

      const prevLine = currentParagraph[currentParagraph.length - 1];

      const prevY = Math.min(...prevLine.map(w => w.y));
      const currY = Math.min(...current.map(w => w.y));
      const lineSpacing = currY - prevY;

      const prevMinX = Math.min(...prevLine.map(w => w.x));
      const prevMaxX = Math.max(...prevLine.map(w => w.x + w.width));
      const currMinX = Math.min(...current.map(w => w.x));
      const currMaxX = Math.max(...current.map(w => w.x + w.width));

      const horizontalOverlap = Math.min(prevMaxX, currMaxX) - Math.max(prevMinX, currMinX);
      const horizontalOverlapRatio = horizontalOverlap > 0
          ? horizontalOverlap / (currMaxX - currMinX)
          : 0;

      const isSameParagraph = lineSpacing <= paragraphSpacingThreshold && horizontalOverlapRatio >= 0.2;

      if (!isSameParagraph) {
        paragraphs.push([...currentParagraph]);
        currentParagraph = [current];
      } else {
        currentParagraph.push(current);
      }
    }

    if (currentParagraph.length > 0) paragraphs.push([...currentParagraph]);

    // Format output
    const results: { text: string; confidence: string }[] = paragraphs.map(paragraph => {
      const paragraphWords = paragraph.flat();
      const text = paragraph.map(line => line.map(w => w.text).join(' ')).join('\n');
      const avgConfidence = (
          paragraphWords.reduce((sum, w) => sum + parseFloat(w.confidence), 0) / paragraphWords.length
      ).toFixed(2);
      return { text, confidence: avgConfidence };
    });

    await worker.terminate();
    return results;
  } catch (error) {
    console.error("Error extracting text with Tesseract:", error);
    return [{ text: "No text found", confidence: "0.0" }];
  }
}



// Real text extraction function using Tesseract.js
// export async function extractTextFromImage(imageBuffer: Buffer): Promise<{ text: string; confidence: string }[]> {
//   try {
//     const worker = await createWorker('eng');
//
//     // Convert buffer to base64
//     const base64Image = imageBuffer.toString('base64');
//
//     const result = await worker.recognize(`data:image/jpeg;base64,${base64Image}`);
//
//     const results: { text: string; confidence: string }[] = [];
//
//     if (result.data.text && result.data.text.trim() !== '') {
//       const rawLines = result.data.text.split('\n').map(line => line.trim()).filter(Boolean);
//
//       const finalLines: string[] = [];
//       let buffer = '';
//
//       for (const line of rawLines) {
//         if (!line) continue;
//
//         buffer += (buffer ? ' ' : '') + line;
//
//         const lastChar = line.slice(-1);
//
//         if (lastChar === '.' || lastChar === ':' || !line.endsWith(',')) {
//           finalLines.push(buffer.trim());
//           buffer = '';
//         }
//       }
//
//       if (buffer) finalLines.push(buffer.trim());
//
//       // Deduplicate and push into results
//       const seen = new Set<string>();
//       for (const line of finalLines) {
//         if (!seen.has(line)) {
//           results.push({ text: line, confidence: '0.88' }); // You can use result.data.confidence if needed
//           seen.add(line);
//         }
//       }
//     }
//
//     await worker.terminate();
//
//     if (results.length === 0) {
//       console.warn("No text detected in the image.");
//       return [{ text: "No text found", confidence: "0.0" }];
//     }
//
//     return results;
//   } catch (error) {
//     console.error("Error extracting text with Tesseract:", error);
//     return [{ text: "No text found", confidence: "0.0" }];
//   }
// }

//
//
// export async function extractTextFromImage(imageBuffer: Buffer): Promise<{ text: string; confidence: string }[]> {
//   const worker = await createWorker('eng');
//   try {
//     const base64Image = imageBuffer.toString('base64');
//     const result = await worker.recognize(`data:image/jpeg;base64,${base64Image}`);
//
//     const rawText = result.data.text?.trim();
//     if (!rawText) {
//       console.warn("No text detected in the image.");
//       return [{ text: "No text found", confidence: "0.0" }];
//     }
//
//     const finalResults: { text: string; confidence: string }[] = [];
//     const rawLines = rawText.split('\n').map(line => line.trim()).filter(Boolean);
//
//     let buffer = '';
//     let previousText = new Set<string>();
//
//     // Instead of checking each line's punctuation at each iteration, handle it more cleanly in this loop
//     for (const line of rawLines) {
//       buffer += (buffer ? ' ' : '') + line;
//
//       const endsWithPunctuation = /[.:!?]$/.test(line);
//       const endsWithComma = /,$/.test(line);
//
//       // If the line ends with punctuation or is not followed by a comma, process the sentence
//       if (endsWithPunctuation || !endsWithComma) {
//         const sentence = buffer.trim();
//
//         // Skip duplicate sentences to prevent unnecessary work
//         if (!previousText.has(sentence)) {
//           previousText.add(sentence);
//           finalResults.push({ text: sentence, confidence: (result.data.confidence / 100).toFixed(2) });
//         }
//         buffer = ''; // Reset the buffer for the next sentence
//       }
//     }
//
//     // If there's any leftover text in the buffer, add it
//     if (buffer) {
//       const last = buffer.trim();
//       if (!previousText.has(last)) {
//         finalResults.push({ text: last, confidence: (result.data.confidence / 100).toFixed(2) });
//       }
//     }
//
//     // Return results or a default message if no valid sentences were detected
//     return finalResults.length > 0 ? finalResults : [{ text: "No text found", confidence: "0.0" }];
//   } catch (error) {
//     console.error("Error extracting text with Tesseract:", error);
//     return [{ text: "No text found", confidence: "0.0" }];
//   } finally {
//     await worker.terminate();
//   }
// }


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

      if (bestScore >= 0.75) {
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
        matches.push({
          text: textBlock,
          stringId: match.stringId,
          resourceContent: resourceStrings.get(match.stringId) || ''
        });
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
