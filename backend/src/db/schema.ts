import { pgTable, serial, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  description: varchar('description', { length: 500 }).notNull(),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
