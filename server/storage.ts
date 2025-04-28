import { 
  users, 
  type User, 
  type InsertUser,
  i18nProjects,
  type I18nProject,
  type InsertI18nProject,
  extractedTexts,
  type ExtractedText,
  type InsertExtractedText,
  resourceStrings,
  type ResourceString,
  type InsertResourceString,
  codeSnippets,
  type CodeSnippet,
  type InsertCodeSnippet,
  aiSuggestions,
  type AiSuggestion,
  type InsertAiSuggestion
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  createProject(project: InsertI18nProject): Promise<I18nProject>;
  getProjectsByUserId(userId: number): Promise<I18nProject[]>;
  getProjectById(id: number): Promise<I18nProject | undefined>;
  
  // Extracted text operations
  createExtractedText(text: InsertExtractedText): Promise<ExtractedText>;
  getExtractedTextsByProjectId(projectId: number): Promise<ExtractedText[]>;
  deleteExtractedTextsByProjectId(projectId: number): Promise<void>;
  
  // Resource string operations
  createResourceString(resourceString: InsertResourceString): Promise<ResourceString>;
  getResourceStringsByProjectId(projectId: number): Promise<ResourceString[]>;
  getResourceStringByStringId(projectId: number, stringId: string): Promise<ResourceString | undefined>;
  
  // Code snippet operations
  createCodeSnippet(codeSnippet: InsertCodeSnippet): Promise<CodeSnippet>;
  getCodeSnippetsByProjectId(projectId: number): Promise<CodeSnippet[]>;
  getCodeSnippetsByStringIds(projectId: number, stringIds: string[]): Promise<CodeSnippet[]>;
  
  // AI suggestion operations
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  getAiSuggestionsByProjectId(projectId: number): Promise<AiSuggestion[]>;
  getAiSuggestionsByCodeSnippetId(codeSnippetId: number): Promise<AiSuggestion[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, I18nProject>;
  private extractedTexts: Map<number, ExtractedText>;
  private resourceStrings: Map<number, ResourceString>;
  private codeSnippets: Map<number, CodeSnippet>;
  private aiSuggestions: Map<number, AiSuggestion>;
  
  private userId = 1;
  private projectId = 1;
  private extractedTextId = 1;
  private resourceStringId = 1;
  private codeSnippetId = 1;
  private aiSuggestionId = 1;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.extractedTexts = new Map();
    this.resourceStrings = new Map();
    this.codeSnippets = new Map();
    this.aiSuggestions = new Map();
    
    // Add a default user
    this.createUser({ username: "admin", password: "admin" });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Project operations
  async createProject(project: InsertI18nProject): Promise<I18nProject> {
    const id = this.projectId++;
    const newProject: I18nProject = { ...project, id };
    this.projects.set(id, newProject);
    return newProject;
  }
  
  async getProjectsByUserId(userId: number): Promise<I18nProject[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
  }
  
  async getProjectById(id: number): Promise<I18nProject | undefined> {
    return this.projects.get(id);
  }
  
  // Extracted text operations
  async createExtractedText(text: InsertExtractedText): Promise<ExtractedText> {
    const id = this.extractedTextId++;
    const newText: ExtractedText = { ...text, id };
    this.extractedTexts.set(id, newText);
    return newText;
  }
  
  async getExtractedTextsByProjectId(projectId: number): Promise<ExtractedText[]> {
    return Array.from(this.extractedTexts.values()).filter(
      (text) => text.projectId === projectId
    );
  }
  
  async deleteExtractedTextsByProjectId(projectId: number): Promise<void> {
    Array.from(this.extractedTexts.entries()).forEach(([id, text]) => {
      if (text.projectId === projectId) {
        this.extractedTexts.delete(id);
      }
    });
  }
  
  // Resource string operations
  async createResourceString(resourceString: InsertResourceString): Promise<ResourceString> {
    const id = this.resourceStringId++;
    const newResourceString: ResourceString = { ...resourceString, id };
    this.resourceStrings.set(id, newResourceString);
    return newResourceString;
  }
  
  async getResourceStringsByProjectId(projectId: number): Promise<ResourceString[]> {
    return Array.from(this.resourceStrings.values()).filter(
      (rs) => rs.projectId === projectId
    );
  }
  
  async getResourceStringByStringId(projectId: number, stringId: string): Promise<ResourceString | undefined> {
    return Array.from(this.resourceStrings.values()).find(
      (rs) => rs.projectId === projectId && rs.stringId === stringId
    );
  }
  
  // Code snippet operations
  async createCodeSnippet(codeSnippet: InsertCodeSnippet): Promise<CodeSnippet> {
    const id = this.codeSnippetId++;
    const newCodeSnippet: CodeSnippet = { ...codeSnippet, id };
    this.codeSnippets.set(id, newCodeSnippet);
    return newCodeSnippet;
  }
  
  async getCodeSnippetsByProjectId(projectId: number): Promise<CodeSnippet[]> {
    return Array.from(this.codeSnippets.values()).filter(
      (cs) => cs.projectId === projectId
    );
  }
  
  async getCodeSnippetsByStringIds(projectId: number, stringIds: string[]): Promise<CodeSnippet[]> {
    return Array.from(this.codeSnippets.values()).filter(
      (cs) => cs.projectId === projectId && 
              cs.stringIds && 
              cs.stringIds.some((id) => stringIds.includes(id))
    );
  }
  
  // AI suggestion operations
  async createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const id = this.aiSuggestionId++;
    const newSuggestion: AiSuggestion = { ...suggestion, id };
    this.aiSuggestions.set(id, newSuggestion);
    return newSuggestion;
  }
  
  async getAiSuggestionsByProjectId(projectId: number): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values()).filter(
      (s) => s.projectId === projectId
    );
  }
  
  async getAiSuggestionsByCodeSnippetId(codeSnippetId: number): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values()).filter(
      (s) => s.codeSnippetId === codeSnippetId
    );
  }
}

export const storage = new MemStorage();
