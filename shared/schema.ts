import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// I18N Project schema
export const i18nProjects = pgTable("i18n_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertI18nProjectSchema = createInsertSchema(i18nProjects).pick({
  name: true,
  userId: true,
  createdAt: true,
});

// Extracted Text schema
export const extractedTexts = pgTable("extracted_texts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  text: text("text").notNull(),
  confidence: text("confidence"),
  type: text("type").default("text"),
});

export const insertExtractedTextSchema = createInsertSchema(extractedTexts).pick({
  projectId: true,
  text: true,
  confidence: true,
  type: true,
});

// Resource Strings schema
export const resourceStrings = pgTable("resource_strings", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  stringId: text("string_id").notNull(),
  textValue: text("text_value").notNull(),
  language: text("language").default("en"),
});

export const insertResourceStringSchema = createInsertSchema(resourceStrings).pick({
  projectId: true,
  stringId: true,
  textValue: true,
  language: true,
});

// Code Snippets schema
export const codeSnippets = pgTable("code_snippets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  filename: text("filename").notNull(),
  code: text("code").notNull(),
  lineNumber: integer("line_number"),
  stringIds: text("string_ids").array(),
});

export const insertCodeSnippetSchema = createInsertSchema(codeSnippets).pick({
  projectId: true,
  filename: true,
  code: true,
  lineNumber: true,
  stringIds: true,
});

// AI Suggestions schema
export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  codeSnippetId: integer("code_snippet_id").notNull(),
  issue: text("issue").notNull(),
  currentImplementation: text("current_implementation").notNull(),
  suggestedImplementation: text("suggested_implementation").notNull(),
  recommendation: text("recommendation").notNull(),
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).pick({
  projectId: true,
  codeSnippetId: true,
  issue: true,
  currentImplementation: true,
  suggestedImplementation: true,
  recommendation: true,
});

// For API requests
export const extractTextSchema = z.object({
  imageData: z.string(),
});

export const matchStringsSchema = z.object({
  extractedTexts: z.array(z.string()),
  resourceData: z.string(),
});

export const searchCodeSchema = z.object({
  stringIds: z.array(z.string()),
});

export const aiAnalysisSchema = z.object({
  codeSnippets: z.array(z.object({
    id: z.number(),
    filename: z.string(),
    code: z.string(),
    stringIds: z.array(z.string()).optional(),
  })),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type I18nProject = typeof i18nProjects.$inferSelect;
export type InsertI18nProject = z.infer<typeof insertI18nProjectSchema>;
export type ExtractedText = typeof extractedTexts.$inferSelect;
export type InsertExtractedText = z.infer<typeof insertExtractedTextSchema>;
export type ResourceString = typeof resourceStrings.$inferSelect;
export type InsertResourceString = z.infer<typeof insertResourceStringSchema>;
export type CodeSnippet = typeof codeSnippets.$inferSelect;
export type InsertCodeSnippet = z.infer<typeof insertCodeSnippetSchema>;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
