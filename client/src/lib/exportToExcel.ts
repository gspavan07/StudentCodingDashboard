import { type Student, type StudentWithProfile } from "@shared/schema";
import * as XLSX from "xlsx";

interface ExcelRow {
  "Roll Number": string;
  Name: string;
  Branch: string;
  Section: string;
  HackerRank: string;
  LeetCode_Easy: number;
  LeetCode_Medium: number;
  LeetCode_Hard: number;
  CodeChef_stars: number;
  CodeChef_contest: number;
  GFG_Easy: number;
  GFG_Medium: number;
  GFG_Hard: number;
  "Total Problems": number;
  "Total Contests": number;
  "Grand Total": number;
}

/**
 * Formats a student's profile data for Excel export
 */
export function formatStudentForExcel(student: StudentWithProfile): ExcelRow {
  const profile = student.profile;

  // Calculate total values for summary

  const totalProblems =
    (profile?.leetCodeEasy || 0) +
    (profile?.leetCodeMedium || 0) +
    (profile?.leetCodeHard || 0) +
    (profile?.gfgBasic || 0) +
    (profile?.gfgMedium || 0) +
    (profile?.gfgHard || 0);

  const totalContests =
    (profile?.leetCodeContests || 0) + (profile?.codeChefContests || 0);

  // Calculate grand total score based on the new scoring system
  // "For each easy (consider basic as easy in geeksforgeeks) problem solved +1,
  // for medium +2, for hard +3, for each contest attended +2,
  // for every badge in hackerrank +no of star for that badge"
  const grandTotal = profile
    ? // Easy problems: LeetCode easy + GFG school/basic
      (profile.leetCodeEasy || 0) * 1 +
      (profile.gfgBasic || 0) * 1 +
      // Medium problems: LeetCode medium + GFG medium
      (profile.leetCodeMedium || 0) * 2 +
      (profile.gfgMedium || 0) * 2 +
      // Hard problems: LeetCode hard + GFG hard
      (profile.leetCodeHard || 0) * 3 +
      (profile.gfgHard || 0) * 3 +
      // Contests: +2 for each contest
      (profile.codeChefContests || 0) * 2 +
      (profile.leetCodeContests || 0) * 2 +
      // HackerRank stars/badges
      (profile.hackerRankStarScore || 0)
    : 0;

  // Format platform-specific data
  const hackerRank = profile
    ? `Stars: ${profile.hackerRankStarScore || 0}`
    : "N/A";

  
  return {
    "Roll Number": student.rollNumber,
    Name: student.name,
    Branch: student.branch,
    Section: student.section,
    HackerRank: hackerRank,
    LeetCode_Easy: profile?.leetCodeEasy || 0,
    LeetCode_Medium: profile?.leetCodeMedium || 0,
    LeetCode_Hard: profile?.leetCodeHard || 0,
    CodeChef_contest: profile?.codeChefContests || 0,
    CodeChef_stars: profile?.codeChefStars || 0,
    GFG_Easy: profile?.gfgBasic || 0,
    GFG_Medium: profile?.gfgMedium || 0,
    GFG_Hard: profile?.gfgHard || 0,
    "Total Problems": totalProblems,
    "Total Contests": totalContests,
    "Grand Total": grandTotal,
  };
}

/**
 * Export a single student's data to Excel
 */
export function exportStudentToExcel(student: StudentWithProfile): void {
  const data = [formatStudentForExcel(student)];
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 15 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 50 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 }, // Grand Total
  ];

  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Profile");

  // Generate file name based on student data
  const fileName = `${student.rollNumber}_${student.name.replace(/\s+/g, "_")}_CodingProfile.xlsx`;

  // Export the file
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export multiple students' data to Excel
 */
export function exportStudentsToExcel(
  students: Student[],
  fileName = "students_coding_profile",
): void {
  // If we have students with profiles, format them accordingly
  const formattedStudents = students.map((student) => {
    // Handle the case where we only have Student data without profiles
    if ("profile" in student) {
      return formatStudentForExcel(student as StudentWithProfile);
    } else {
      // Create a basic row with just student info
      return {
        "Roll Number": student.rollNumber,
        Name: student.name,
        Branch: student.branch,
        Section: student.section,
        HackerRank: "N/A",
        LeetCode: "N/A",
        CodeChef: "N/A",
        GeeksforGeeks: "N/A",
        "Total Problems": 0,
        "Total Contests": 0,
        "Grand Total": 0,
      };
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedStudents);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 15 }, // Roll Number
    { wch: 30 }, // Name
    { wch: 10 }, // Branch
    { wch: 10 }, // Section
    { wch: 12 }, // HackerRank
    { wch: 13 }, // LeetCode-easy
    { wch: 12 }, // LeetCode-medium
    { wch: 13 }, // LeetCode-Hard
    { wch: 12 }, // CodeChef_Contests
    { wch: 15 }, // CodeChef_Stars
    { wch: 12 }, // GFG-easy
    { wch: 12 }, // GFG-medium
    { wch: 12 }, // GFG-Hard
    { wch: 13 }, // Total Problems
    { wch: 12 }, // Total Contests
    { wch: 10 }, // Grand Total
  ];

  worksheet["!cols"] = columnWidths;


  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

  // Export the file
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
