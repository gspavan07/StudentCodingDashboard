import { StudentWithProfile } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CodeSquare } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { useToast } from "@/hooks/use-toast";

interface StudentProfileDialogProps {
  student: StudentWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentProfileDialog({
  student,
  open,
  onOpenChange,
}: StudentProfileDialogProps) {
  const { toast } = useToast();

  // Calculate summary stats if student data is available
  const summary = student?.profile
    ? {
        totalProblems:
          (student.profile.leetCodeEasy || 0) +
          (student.profile.leetCodeMedium || 0) +
          (student.profile.leetCodeHard || 0) +
          (student.profile.gfgBasic || 0) +
          (student.profile.gfgMedium || 0) +
          (student.profile.gfgHard || 0),
        platforms: 4,
        totalContests:
          (student.profile.hackerRankContests || 0) +
          (student.profile.codeChefContests || 0),
        grandTotal:
          (student.profile.leetCodeEasy || 0) * 1 +
          (student.profile.leetCodeMedium || 0) * 2 +
          (student.profile.leetCodeHard || 0) * 3 +
          (student.profile.gfgBasic || 0) * 1 +
          (student.profile.gfgMedium || 0) * 2 +
          (student.profile.gfgHard || 0) * 3 +
          (student.profile.codeChefContests || 0) * 2 +
          (student.profile.leetCodeContests || 0) * 2 +
          (student.profile.hackerRankStarScore || 0),
      }
    : null;

    const handleExportToPDF = () => {
      if (!student || !student.profile) return;
  
      try {
        console.log("Creating PDF document...");
        const doc = new jsPDF();
  
        // Add title
        doc.setFontSize(20);
        doc.text("Student Profile", 105, 20, { align: "center" });
  
        // Prepare data for tables
        const basicInfo = [
          ["Name", student.name],
          ["Roll Number", student.rollNumber],
          ["Branch", student.branch],
          ["year", student.year || "N/A"]
        ];
  
        const codingStats = [
          ["LeetCode Easy", student.profile.leetCodeEasy?.toString() || "0"],
          ["LeetCode Medium", student.profile.leetCodeMedium?.toString() || "0"],
          ["LeetCode Hard", student.profile.leetCodeHard?.toString() || "0"],
          ["GFG Basic", student.profile.gfgBasic?.toString() || "0"],
          ["GFG Medium", student.profile.gfgMedium?.toString() || "0"],
          ["GFG Hard", student.profile.gfgHard?.toString() || "0"],
          ["CodeChef Stars", student.profile.codeChefStars?.toString() || "0"],
          ["CodeChef Contests", student.profile.codeChefContests?.toString() || "0"],
          ["HackerRank Stars", student.profile.hackerRankStars?.toString() || "0"],
          ["HackerRank Contests", student.profile.hackerRankContests?.toString() || "0"]
        ];
  
        // Add basic info table
        console.log("Adding basic info table...");
        autoTable(doc, {
          startY: 30,
          head: [["Field", "Value"]],
          body: basicInfo,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [41, 128, 185] }
        });
  
        // Add coding stats table
        console.log("Adding coding stats table...");
        autoTable(doc, {
          startY: 80,
          head: [["Platform", "Score"]],
          body: codingStats,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [46, 204, 113] }
        });
  
        // Generate filename and save
        const fileName = `${student.rollNumber}_${student.name.replace(/\s+/g, '_')}_profile.pdf`;
        console.log("Saving PDF...");
        doc.save(fileName);
  
        toast({
          title: "Success",
          description: "Profile exported to PDF successfully",
        });
      } catch (error) {
        console.error("PDF Generation Error:", error);
        toast({
          title: "Error",
          description: "Failed to generate PDF. Please try again.",
          variant: "destructive",
        });
      }
    };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Student Profile
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Student Info Column */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 mb-4">
                <img
                  src={
                    student.imageUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3b82f6&color=fff`
                  }
                  alt={student.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3b82f6&color=fff`;
                  }}
                />
              </div>

              {/* Student Details */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {student.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {student.rollNumber}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {student.branch} {student.year ? `- ${student.year}` : ""}
              </p>

              <div className="w-full mt-4">
                <Button
                  className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 hover:bg-blue-700"
                  onClick={handleExportToPDF}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Coding Stats Column */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Coding Profile Statistics
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  Performance across multiple coding platforms
                </p>
              </div>

              {/* Summary Stats */}
              {summary && (
                <div className="grid grid-cols-3 gap-4 px-4 py-5 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Problems
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-blue-600 dark:text-blue-400">
                      {summary.totalProblems}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Contests
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
                      {summary.totalContests}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Grand Total
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-purple-600 dark:text-purple-400">
                      {summary.grandTotal}
                    </p>
                  </div>
                </div>
              )}

              {/* Platform Cards */}
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                  {/* HackerRank */}
                  <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                          <span className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-md mr-1">
                            <CodeSquare className="h-3 w-3" />
                          </span>
                          HackerRank
                        </h4>
                        {/* Stars/Badges */}
                        {/* <div className="flex">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`h-5 w-5 ${i < (student.profile?.hackerRankStars || 0) ? "text-yellow-400" : "text-gray-300 dark:text-gray-500"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div> */}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Star Score:{" "}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {student.profile?.hackerRankStarScore || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* LeetCode */}
                  <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                          <span className="w-6 h-6 flex items-center justify-center bg-yellow-500 text-white rounded-md mr-1">
                            <CodeSquare className="h-3 w-3" />
                          </span>
                          LeetCode
                        </h4>
                        <div className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Rating:{" "}
                          {(student.profile?.leetCodeRank || 0).toFixed(2) ||
                            "N/A"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Easy:{" "}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {student.profile?.leetCodeEasy || 0}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Medium:{" "}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {student.profile?.leetCodeMedium || 0}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Hard:{" "}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {student.profile?.leetCodeHard || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* CodeChef */}
                  <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                          <span className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-md mr-1">
                            <CodeSquare className="h-3 w-3" />
                          </span>
                          CodeChef
                        </h4>
                        <div className="flex">
                          {/* Stars */}
                          <div className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {student.profile?.codeChefStars || 0}★ Coder
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Contests:{" "}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {student.profile?.codeChefContests || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* GeeksforGeeks */}
                  <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                          <span className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-md mr-1">
                            <CodeSquare className="h-3 w-3" />
                          </span>
                          GeeksforGeeks
                        </h4>
                        <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Score: {student.profile?.gfgScore || 0}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Easy:{" "}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {student.profile?.gfgBasic || 0}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Medium:{" "}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {student.profile?.gfgMedium || 0}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Hard:{" "}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {student.profile?.gfgHard || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
