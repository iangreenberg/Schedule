import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertWhiteboardItemSchema, WhiteboardItem } from "@shared/schema";
import { migrateDb } from "./migrate";

export async function registerRoutes(app: Express): Promise<Server> {
  // Run database migration
  await migrateDb().catch(error => {
    console.error("Database migration failed:", error);
  });

  // API routes for whiteboard items
  app.get('/api/whiteboard-items', async (req, res) => {
    try {
      // In a real app with auth, we would get userId from session
      // For now, get all items not associated with a user
      const items = await storage.getWhiteboardItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching whiteboard items:", error);
      res.status(500).json({ message: "Failed to retrieve whiteboard items" });
    }
  });

  app.get('/api/whiteboard-items/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getWhiteboardItem(id);
      
      if (!item) {
        return res.status(404).json({ message: "Whiteboard item not found" });
      }
      
      res.json(item);
    } catch (error) {
      console.error("Error fetching whiteboard item:", error);
      res.status(500).json({ message: "Failed to retrieve whiteboard item" });
    }
  });

  app.post('/api/whiteboard-items', async (req, res) => {
    try {
      console.log('Creating item with data:', req.body);
      
      // Create a new item without an ID, our storage will generate one
      const itemData = req.body as Omit<WhiteboardItem, "id">;
      
      // Validate and create the item
      const createdItem = await storage.createWhiteboardItem(itemData);
      res.status(201).json(createdItem);
    } catch (error) {
      console.error("Error creating whiteboard item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create whiteboard item" });
    }
  });

  app.put('/api/whiteboard-items/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const itemData = req.body as Partial<WhiteboardItem>;
      
      const updatedItem = await storage.updateWhiteboardItem(id, itemData);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Whiteboard item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating whiteboard item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update whiteboard item" });
    }
  });

  app.delete('/api/whiteboard-items/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteWhiteboardItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Whiteboard item not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting whiteboard item:", error);
      res.status(500).json({ message: "Failed to delete whiteboard item" });
    }
  });

  // Batch operations for better performance
  app.post('/api/whiteboard-items/batch', async (req, res) => {
    try {
      const { items } = req.body;
      
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Invalid batch format. Expected array of items." });
      }
      
      const createdItems = await Promise.all(
        items.map((item: Omit<WhiteboardItem, "id">) => 
          storage.createWhiteboardItem(item)
        )
      );
      
      res.status(201).json(createdItems);
    } catch (error) {
      console.error("Error in batch create:", error);
      res.status(500).json({ message: "Failed to process batch operation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
