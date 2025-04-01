import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Search, CodeSquare, Braces } from "lucide-react";
import { type StudentWithProfile } from "@shared/schema";
import { useLocation } from "wouter";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
const Home = () => {
  const [rollNumber, setRollNumber] = useState("");
  const { toast } = useToast();
  const [location] = useLocation();

  const {
    data: student,
    refetch,
    isLoading,
    isError,
  } = useQuery<StudentWithProfile>({
    queryKey: [`/api/students/${rollNumber.toUpperCase()}`],
    enabled: false,
  });

  // Parse URL parameters for roll number and auto-search on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rollNumberFromURL = params.get("rollNumber");

    if (rollNumberFromURL) {
      setRollNumber(rollNumberFromURL);
      // Use setTimeout to ensure state is updated before searching
      setTimeout(() => {
        refetch();
      }, 100);
    }
  }, [location, refetch]);

  const handleSearch = async () => {
    if (!rollNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a roll number",
        variant: "destructive",
      });
      return;
    }

    await refetch();
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero year */}
      <section className="py-12 md:py-20 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-gray-900 dark:text-white">
            <span className="block">Student Coding Profile</span>
            <span className="block text-primary">Dashboard</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Track coding achievements across multiple platforms. Access,
            analyze, and export your performance data with ease.
          </p>

          {/* Search Bar for Roll Number */}
          <div className="mt-10 max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="pl-10 pr-3 py-2"
                  placeholder="Enter Roll Number"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2"
              >
                {isLoading ? "Searching..." : "Search Profile"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-left">
              Enter your roll number to fetch coding profiles from HackerRank,
              LeetCode, CodeChef, and GeeksforGeeks.
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 hidden lg:block">
          <div className="text-gray-200 dark:text-gray-800 opacity-25 transform rotate-45">
            <CodeSquare className="h-36 w-36" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 hidden lg:block">
          <div className="text-gray-200 dark:text-gray-800 opacity-25 transform -rotate-45">
            <Braces className="h-36 w-36" />
          </div>
        </div>
      </section>

      {/* Student Profile Section */}
      {student && student.profile && (
        <section className="py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    {student.branch}
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

                  {/* Platform Cards */}
                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {/* HackerRank */}
                      <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                              <span className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-md mr-2">
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
                                Stars:{" "}
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
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                              <span className="w-6 h-6 flex items-center justify-center bg-yellow-500 text-white rounded-md mr-2">
                                <CodeSquare className="h-3 w-3" />
                              </span>
                              LeetCode
                            </h4>
                            <div className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Rank:{" "}
                              {(student.profile?.leetCodeRank || 0).toFixed(
                                2,
                              ) || "N/A"}
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
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                              <span className="w-6 h-6 flex items-center justify-center bg-orange-500 text-white rounded-md mr-2">
                                <CodeSquare className="h-3 w-3" />
                              </span>
                              CodeChef
                            </h4>
                            <div className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {student.profile?.codeChefStars || 0}★ Coder
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
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                              <span className="w-6 h-6 flex items-center justify-center bg-green-600 text-white rounded-md mr-2">
                                <Braces className="h-3 w-3" />
                              </span>
                              GeeksforGeeks
                            </h4>
                            <div className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Score: {student.profile?.gfgScore || 0}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
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
                          </div>
                          <div className="grid grid-cols-2 gap-2">
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

                    {/* Summary Stats */}
                    {summary && (
                      <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Overall Performance
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Total Problems
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                              {summary.totalProblems}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Platforms
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                              {summary.platforms}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Contests
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                              {summary.totalContests}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Score
                            </p>
                            <p className="text-xl font-bold text-primary">
                              {summary.grandTotal}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Error message if student not found */}
      {isError && (
        <section className="py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No student found with that roll number
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Please check the roll number and try again
            </p>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Platform Features
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              Everything you need to track coding progress and achievements.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white mb-5">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Profile Search
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Quickly find and view coding profiles from multiple platforms
                  using student roll numbers.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white mb-5">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Data Export
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Export student coding profiles and statistics as structured
                  Excel files for analysis.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white mb-5">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.707 3.293a1 1 0 00-1.414 0l-4 4a1 1 0 001.414 1.414L7 5.414V13a1 1 0 102 0V5.414l3.293 3.293a1 1 0 001.414-1.414l-4-4zM10 17a1 1 0 102 0v-3.586l3.293 3.293a1 1 0 001.414-1.414l-4-4a1 1 0 00-1.414 0l-4 4a1 1 0 001.414 1.414L10 13.414V17z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Batch Upload
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Admin tools for uploading and managing multiple student
                  profiles by branch and year.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}

            <Card className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white mb-5">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Branch Navigation
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Browse student profiles by department branches and 
                  year for easy organization.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
