import { eq } from 'drizzle-orm';
import { db } from '@mvp/database';
import { videoScriptGeneration, videoScriptTemplate } from '@mvp/database';
import { nanoid } from 'nanoid';
import type { ScriptGenerationRequest, GeneratedScript } from './types';

export class VideoScriptDatabaseService {
  async createGeneration(userId: string, request: ScriptGenerationRequest) {
    const generationId = nanoid();
    
    await db.insert(videoScriptGeneration).values({
      id: generationId,
      userId,
      attributes: request.attributes,
      status: 'pending',
      progress: 0,
      modelUsed: 'cerebras-llama-3.3-70b',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return generationId;
  }
  
  async updateGenerationProgress(
    generationId: string, 
    progress: number, 
    status: 'pending' | 'processing' | 'completed' | 'failed'
  ) {
    await db
      .update(videoScriptGeneration)
      .set({
        progress,
        status,
        updatedAt: new Date(),
      })
      .where(eq(videoScriptGeneration.id, generationId));
  }
  
  async completeGeneration(
    generationId: string,
    scripts: GeneratedScript[],
    totalTokensUsed: number,
    processingTimeMs: number
  ) {
    await db
      .update(videoScriptGeneration)
      .set({
        scripts,
        status: 'completed',
        progress: 100,
        totalTokensUsed,
        processingTimeMs,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(videoScriptGeneration.id, generationId));
  }
  
  async failGeneration(generationId: string, error: string) {
    await db
      .update(videoScriptGeneration)
      .set({
        status: 'failed',
        error,
        updatedAt: new Date(),
      })
      .where(eq(videoScriptGeneration.id, generationId));
  }
  
  async getGeneration(generationId: string) {
    const generations = await db
      .select()
      .from(videoScriptGeneration)
      .where(eq(videoScriptGeneration.id, generationId));
    
    return generations[0];
  }
  
  async getUserGenerations(userId: string) {
    return await db
      .select()
      .from(videoScriptGeneration)
      .where(eq(videoScriptGeneration.userId, userId))
      .orderBy(videoScriptGeneration.createdAt);
  }
  
  async saveTemplate(
    userId: string,
    name: string,
    description: string | undefined,
    attributes: any
  ) {
    const templateId = nanoid();
    
    await db.insert(videoScriptTemplate).values({
      id: templateId,
      userId,
      name,
      description,
      attributes,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return templateId;
  }
  
  async getUserTemplates(userId: string) {
    return await db
      .select()
      .from(videoScriptTemplate)
      .where(eq(videoScriptTemplate.userId, userId))
      .orderBy(videoScriptTemplate.createdAt);
  }
  
  async getPublicTemplates() {
    return await db
      .select()
      .from(videoScriptTemplate)
      .where(eq(videoScriptTemplate.isPublic, true))
      .orderBy(videoScriptTemplate.createdAt);
  }
}