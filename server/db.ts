import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, whiteboardItems } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, isNull } from 'drizzle-orm';

// Create postgres client
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);

// Helper functions for database operations
export async function getWhiteboardItems(userId?: number) {
  try {
    const query = userId
      ? db.select().from(whiteboardItems).where(eq(whiteboardItems.userId, userId))
      : db.select().from(whiteboardItems).where(isNull(whiteboardItems.userId));
    
    return await query;
  } catch (error) {
    console.error('Error fetching whiteboard items:', error);
    throw error;
  }
}

export async function createWhiteboardItem(data: any, userId?: number) {
  try {
    // Ensure the item has a client ID
    if (!data.clientId) {
      data.clientId = uuidv4();
    }
    
    // If userId provided, associate with user
    if (userId) {
      data.userId = userId;
    }
    
    const result = await db.insert(whiteboardItems).values(data).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating whiteboard item:', error);
    throw error;
  }
}

export async function updateWhiteboardItem(clientId: string, data: any) {
  try {
    const result = await db
      .update(whiteboardItems)
      .set(data)
      .where(eq(whiteboardItems.clientId, clientId))
      .returning();
    
    return result[0];
  } catch (error) {
    console.error('Error updating whiteboard item:', error);
    throw error;
  }
}

export async function deleteWhiteboardItem(clientId: string) {
  try {
    const result = await db
      .delete(whiteboardItems)
      .where(eq(whiteboardItems.clientId, clientId))
      .returning();
    
    return result[0];
  } catch (error) {
    console.error('Error deleting whiteboard item:', error);
    throw error;
  }
}