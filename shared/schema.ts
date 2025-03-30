import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Schema for whiteboard objects
export const whiteboardObjects = pgTable("whiteboard_objects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // 'text', 'task', 'image', 'event'
  content: jsonb("content").notNull(), // Flexible JSON structure based on type
  positionX: integer("position_x").notNull(),
  positionY: integer("position_y").notNull(),
  connectedDate: timestamp("connected_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWhiteboardObjectSchema = createInsertSchema(whiteboardObjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWhiteboardObject = z.infer<typeof insertWhiteboardObjectSchema>;
export type WhiteboardObject = typeof whiteboardObjects.$inferSelect;

// Define the content schema for different whiteboard object types
export const textNoteContentSchema = z.object({
  text: z.string(),
  subtext: z.string().optional(),
});

export const taskContentSchema = z.object({
  text: z.string(),
  completed: z.boolean().default(false),
});

export const eventContentSchema = z.object({
  title: z.string(),
  time: z.string().optional(),
  location: z.string().optional(),
});

export const imageContentSchema = z.object({
  url: z.string().optional(),
  caption: z.string().optional(),
});

// Client-side state type for whiteboard objects (includes connector information)
export type WhiteboardItem = {
  id: string;
  type: 'text' | 'task' | 'image' | 'event';
  content: any;
  position: {
    x: number;
    y: number;
  };
  connectedDate: Date;
};
