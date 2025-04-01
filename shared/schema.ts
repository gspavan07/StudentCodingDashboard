import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Student model
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  rollNumber: text("roll_number").notNull().unique(),
  name: text("name").notNull(),
  branch: text("branch").notNull(),
  year: text("year").notNull(),
  imageUrl: text("image_url"),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  rollNumber: true,
  name: true,
  branch: true,
  year: true,
  imageUrl: true,
});

// Coding Profiles model
export const codingProfiles = pgTable("coding_profiles", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  
  // HackerRank
  hackerRankStarScore: integer("hackerrank_total_solved").default(0),
  hackerRankContests: integer("hackerrank_contests").default(0),
  hackerRankStars: integer("hackerrank_stars").default(0),
  
  // LeetCode
  leetCodeEasy: integer("leetcode_easy").default(0),
  leetCodeMedium: integer("leetcode_medium").default(0),
  leetCodeHard: integer("leetcode_hard").default(0),
  leetCodeRank: integer("leetcode_rank").default(0),
  
  // CodeChef
  codeChefTotalSolved: integer("codechef_total_solved").default(0),
  codeChefContests: integer("codechef_contests").default(0),
  codeChefStars: integer("codechef_stars").default(0),
  
  // GeeksforGeeks
  gfgSchool: integer("gfg_school").default(0),
  gfgBasic: integer("gfg_basic").default(0),
  gfgMedium: integer("gfg_medium").default(0),
  gfgHard: integer("gfg_hard").default(0),
  gfgScore: integer("gfg_score").default(0),
});

export const insertCodingProfileSchema = createInsertSchema(codingProfiles).omit({
  id: true
});

// Feedback model
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true
});

// Developer model
export const developers = pgTable("developers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  githubProfile: text("github_profile").notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
});

export const insertDeveloperSchema = createInsertSchema(developers).omit({
  id: true
});

// Type definitions for frontend use
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertCodingProfile = z.infer<typeof insertCodingProfileSchema>;
export type CodingProfile = typeof codingProfiles.$inferSelect;

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

export type InsertDeveloper = z.infer<typeof insertDeveloperSchema>;
export type Developer = typeof developers.$inferSelect;

// Student with coding profile (combined type)
export type StudentWithProfile = Student & {
  profile: CodingProfile | null;
};
