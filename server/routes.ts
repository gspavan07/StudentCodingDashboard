import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { read, utils } from "xlsx";
import { z } from "zod";
import {
  insertStudentSchema,
  insertCodingProfileSchema,
  insertFeedbackSchema,
} from "@shared/schema";
import { scrapeProfiles } from "./services/profileScrapers";
import fs from "fs";
import path from "path";
// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
const EXCEL_FILE_PATH = path.join(process.cwd(), "tmp", "Book1 (1).xlsx");
export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route("/api");

  // Get all students with profiles for rankings (placed before parameterized route)
  app.get("/api/students/all", async (_req: Request, res: Response) => {
    try {
      const students = await storage.getStudents();

      // Get profiles for all students
      const studentsWithProfiles = await Promise.all(
        students.map(async (student) => {
          const profile = await storage.getCodingProfile(student.id);
          return {
            ...student,
            profile: profile || null,
          };
        }),
      );

      return res.json(studentsWithProfiles);
    } catch (error) {
      console.error("Error retrieving all students:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Student profile retrieval endpoint
  app.get("/api/students/:rollNumber", async (req: Request, res: Response) => {
    try {
      const rollNumber = req.params.rollNumber;
      const studentWithProfile =
        await storage.getStudentWithProfile(rollNumber);

      if (!studentWithProfile) {
        return res.status(404).json({ message: "Student not found" });
      }

      return res.json(studentWithProfile);
    } catch (error) {
      console.error("Error retrieving student profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get students by branch and section
  app.get("/api/students", async (req: Request, res: Response) => {
    try {
      const { branch, section } = req.query;

      if (typeof branch !== "string" || typeof section !== "string") {
        return res
          .status(400)
          .json({ message: "Branch and section are required" });
      }

      const students = await storage.getStudentsByBranchAndSection(
        branch,
        section,
      );

      // Get profiles for all students
      const studentsWithProfiles = await Promise.all(
        students.map(async (student) => {
          const profile = await storage.getCodingProfile(student.id);
          return {
            ...student,
            profile: profile || null,
          };
        }),
      );

      return res.json(studentsWithProfiles);
    } catch (error) {
      console.error("Error retrieving students:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Middleware to check if user is admin
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.session.user || !req.session.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Unauthorized. Admin access required." });
    }
    next();
  };

  // Delete students by section (admin only) - most specific route first
  app.delete(
    "/api/students/branch/:branch/section/:section",
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const { branch, section } = req.params;
        const deletedCount = await storage.deleteStudentsBySection(
          branch,
          section,
        );

        return res.json({
          message: `Successfully deleted ${deletedCount} students from branch ${branch}, section ${section}`,
        });
      } catch (error) {
        console.error("Error deleting students by section:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  // Delete students by branch (admin only) - second most specific route
  app.delete(
    "/api/students/branch/:branch",
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const branch = req.params.branch;
        const deletedCount = await storage.deleteStudentsByBranch(branch);

        return res.json({
          message: `Successfully deleted ${deletedCount} students from branch ${branch}`,
        });
      } catch (error) {
        console.error("Error deleting students by branch:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  // Delete student by roll number (admin only) - least specific route last
  app.delete(
    "/api/students/:rollNumber",
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const rollNumber = req.params.rollNumber;
        const deleted = await storage.deleteStudentByRollNumber(rollNumber);

        if (!deleted) {
          return res.status(404).json({ message: "Student not found" });
        }

        return res.json({ message: "Student deleted successfully" });
      } catch (error) {
        console.error("Error deleting student:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  // Upload Excel file endpoint (admin only)
  app.post(
    "/api/upload",
    isAdmin,
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const { branch, section } = req.body;
        if (!branch || !section) {
          return res
            .status(400)
            .json({ message: "Branch and section are required" });
        }

        // Parse Excel data
        const workbook = read(req.file.buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = utils.sheet_to_json(sheet);

        if (data.length === 0) {
          return res.status(400).json({ message: "Excel file is empty" });
        }

        // Validate format
        const requiredColumns = [
          "Roll Number",
          "Name",
          "HackerRank",
          "LeetCode",
          "CodeChef",
          "GeeksforGeeks",
        ];
        const firstRow = data[0] as Record<string, any>;
        const missingColumns = requiredColumns.filter(
          (col) => !(col in firstRow),
        );

        if (missingColumns.length > 0) {
          return res.status(400).json({
            message: `Missing required columns: ${missingColumns.join(", ")}`,
          });
        }

        // Write the excel data to a temporary file
        const tempDir = path.join(process.cwd(), "tmp");
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        // Write the excel data to the file path expected by the Python script
        fs.writeFileSync(EXCEL_FILE_PATH, req.file.buffer);

        // Call the Python script with the file path
        const profiles = await scrapeProfiles(EXCEL_FILE_PATH);

        // Clean up after processing
        try {
          fs.unlinkSync(EXCEL_FILE_PATH);
        } catch (err) {
          console.warn("Could not delete temporary file:", err);
        }

        // Ensure profiles.data exists before processing
        if (!profiles || !profiles.data) {
          return res.status(500).json({ message: "Failed to scrape profiles" });
        }

        const processedProfiles = Object.entries(profiles.data).map(
          ([rollNumber, data]: [string, any]) => {
            const profileData = data.Profiles || {};

            return {
              studentId: parseInt(rollNumber) || 0,
              hackerrank: {
                starScore: profileData.HackerRank?.["Total_Score"] || 0,
                contests: 0,
                stars: profileData.HackerRank?.Badges?.length || 0,
              },
              leetcode: {
                easy: profileData.LeetCode?.Problems?.Easy || 0,
                medium: profileData.LeetCode?.Problems?.Medium || 0,
                hard: profileData.LeetCode?.Problems?.Hard || 0,
                rank: profileData.LeetCode?.Rating || 0,
                contests: profileData.LeetCode?.["Contests_Attended"] || 0,
              },
              codechef: {
                totalSolved: profileData.CodeChef?.Total_Score || 0,
                contests: profileData.CodeChef?.Contests_Participated || 0,
                stars: parseInt(profileData.CodeChef?.Star?.charAt(0)) || 0,
              },
              gfg: {
                school:
                  profileData.GeeksForGeeks?.Problems_by_Difficulty?.Easy || 0,
                basic:
                  profileData.GeeksForGeeks?.Problems_by_Difficulty?.Easy || 0,
                medium:
                  profileData.GeeksForGeeks?.Problems_by_Difficulty?.Medium ||
                  0,
                hard:
                  profileData.GeeksForGeeks?.Problems_by_Difficulty?.Hard || 0,
                score: parseInt(profileData.GeeksForGeeks?.Coding_Score) || 0,
              },
            };
          },
        );

        // Create the student record with profile data
        const processedStudents = data.map((row: any, index: number) => ({
          rollNumber: String(row["Roll Number"]),
          name: String(row["Name"]),
          branch,
          section,
          imageUrl: `https://info.aec.edu.in/AEC/StudentPhotos/${row["Roll Number"]}.jpg`,
          profile: processedProfiles[index],
        }));

        // Insert or update the data
        const count =
          await storage.bulkCreateOrUpdateStudentsWithProfiles(
            processedStudents,
          );

        return res.json({
          message: `Successfully processed ${count} student records`,
          count,
        });
      } catch (error) {
        console.error("Error processing upload:", error);
        return res.status(500).json({ message: "Error processing upload" });
      }
    },
  );

  // Get developers endpoint
  app.get("/api/developers", async (_req: Request, res: Response) => {
    try {
      const developers = await storage.getDevelopers();
      return res.json(developers);
    } catch (error) {
      console.error("Error retrieving developers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit feedback endpoint
  app.post("/api/feedback", async (req: Request, res: Response) => {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(validatedData);
      return res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid feedback data", errors: error.errors });
      }
      console.error("Error submitting feedback:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
