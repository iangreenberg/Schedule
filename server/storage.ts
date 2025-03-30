import { users as usersTable, whiteboardItems as whiteboardItemsTable, type User, type InsertUser, type WhiteboardItem, type WhiteboardItemDB, type InsertWhiteboardItem, convertToWhiteboardItem, convertToDbItem } from "@shared/schema";
import { db } from "./db";
import { eq, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

// Update the interface with any CRUD methods needed
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Whiteboard operations
  getWhiteboardItems(userId?: number): Promise<WhiteboardItem[]>;
  getWhiteboardItem(clientId: string): Promise<WhiteboardItem | undefined>;
  createWhiteboardItem(item: Omit<WhiteboardItem, "id">, userId?: number): Promise<WhiteboardItem>;
  updateWhiteboardItem(clientId: string, item: Partial<WhiteboardItem>): Promise<WhiteboardItem | undefined>;
  deleteWhiteboardItem(clientId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(usersTable).values(insertUser).returning();
    return result[0];
  }
  
  // Whiteboard operations
  async getWhiteboardItems(userId?: number): Promise<WhiteboardItem[]> {
    try {
      const query = userId
        ? db.select().from(whiteboardItemsTable).where(eq(whiteboardItemsTable.userId, userId))
        : db.select().from(whiteboardItemsTable).where(isNull(whiteboardItemsTable.userId));
      
      const dbItems = await query;
      return dbItems.map((item) => convertToWhiteboardItem(item as WhiteboardItemDB));
    } catch (error) {
      console.error('Error fetching whiteboard items:', error);
      return [];
    }
  }

  async getWhiteboardItem(clientId: string): Promise<WhiteboardItem | undefined> {
    try {
      const result = await db
        .select()
        .from(whiteboardItemsTable)
        .where(eq(whiteboardItemsTable.clientId, clientId));
      
      if (result.length === 0) return undefined;
      
      return convertToWhiteboardItem(result[0] as WhiteboardItemDB);
    } catch (error) {
      console.error('Error fetching whiteboard item:', error);
      return undefined;
    }
  }

  async createWhiteboardItem(
    item: Omit<WhiteboardItem, "id">, 
    userId?: number
  ): Promise<WhiteboardItem> {
    try {
      // Create a unique client ID for the item
      const clientId = uuidv4();
      const completeItem = { id: clientId, ...item };
      
      // Convert the client item to a database item
      const dbItem = convertToDbItem(completeItem);
      
      // Add userId if provided
      const itemToInsert = userId ? { ...dbItem, userId } : dbItem;
      
      const result = await db
        .insert(whiteboardItemsTable)
        .values(itemToInsert as InsertWhiteboardItem)
        .returning();
      
      return convertToWhiteboardItem(result[0] as WhiteboardItemDB);
    } catch (error) {
      console.error('Error creating whiteboard item:', error);
      throw error;
    }
  }

  async updateWhiteboardItem(
    clientId: string,
    item: Partial<WhiteboardItem>
  ): Promise<WhiteboardItem | undefined> {
    try {
      // Convert partial client item to database format
      const updateData: any = {};
      
      if (item.content !== undefined) updateData.content = item.content;
      if (item.type !== undefined) updateData.type = item.type;
      if (item.connectedDate !== undefined) updateData.connectedDate = item.connectedDate;
      
      if (item.position) {
        if (item.position.x !== undefined) updateData.positionX = item.position.x;
        if (item.position.y !== undefined) updateData.positionY = item.position.y;
      }
      
      // Add updatedAt timestamp
      updateData.updatedAt = new Date();
      
      const result = await db
        .update(whiteboardItemsTable)
        .set(updateData)
        .where(eq(whiteboardItemsTable.clientId, clientId))
        .returning();
      
      if (result.length === 0) return undefined;
      
      return convertToWhiteboardItem(result[0] as WhiteboardItemDB);
    } catch (error) {
      console.error('Error updating whiteboard item:', error);
      return undefined;
    }
  }

  async deleteWhiteboardItem(clientId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(whiteboardItemsTable)
        .where(eq(whiteboardItemsTable.clientId, clientId))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting whiteboard item:', error);
      return false;
    }
  }
}

// Export the database storage instance
export const storage = new DatabaseStorage();
