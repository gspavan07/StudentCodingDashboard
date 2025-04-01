import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StudentWithProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { exportStudentsToExcel } from "@/lib/exportToExcel";
import { StudentProfileDialog } from "@/components/StudentProfileDialog";
import {
  DownloadIcon,
  SearchIcon,
  LoaderIcon,
  AlertCircleIcon,
  TrophyIcon,
  MedalIcon,
  UserIcon,
} from "lucide-react";

type RankingTab = "overall" | "branch" | "year";

const Rankings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectyear, setselectyear] = useState<string>("");
  const [rankingLimit, setRankingLimit] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<RankingTab>("overall");
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all students with profiles
  const {
    data: allStudents,
    isLoading,
    isError,
  } = useQuery<StudentWithProfile[]>({
    queryKey: ["/api/students/all"],
  });

  // Extract unique branches and years for filters
  const branches = useMemo(() => {
    if (!allStudents) return [];
    const branchSet = new Set<string>();
    allStudents.forEach((student) => {
      if (student.branch) branchSet.add(student.branch);
    });
    return Array.from(branchSet).sort();
  }, [allStudents]);

  const years = useMemo(() => {
    if (!allStudents || !selectedBranch) return [];
    const yearSet = new Set<string>();
    allStudents.forEach((student) => {
      if (student.branch === selectedBranch && student.year) {
        yearSet.add(student.year);
      }
    });
    return Array.from(yearSet).sort();
  }, [allStudents, selectedBranch]);

  // Calculate scores for each student
  const studentsWithScores = useMemo(() => {
    if (!allStudents) return [];

    return allStudents.map((student) => {
      const profile = student.profile;

      // Calculate score based on the new scoring system
      const score = profile
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

      return {
        ...student,
        score,
      };
    });
  }, [allStudents]);

  // Apply filters based on tab, branch, year
  const filteredStudents = useMemo(() => {
    if (!studentsWithScores) return [];

    let filtered = studentsWithScores;

    // Apply tab filter
    if (activeTab === "branch" && selectedBranch) {
      filtered = filtered.filter(
        (student) => student.branch === selectedBranch,
      );
    } else if (activeTab === "year" && selectedBranch && selectyear) {
      filtered = filtered.filter(
        (student) =>
          student.branch === selectedBranch &&
          student.year === selectyear,
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort by score (descending)
    filtered = filtered.sort((a, b) => b.score - a.score);

    // Apply limit
    if (rankingLimit > 0) {
      filtered = filtered.slice(0, rankingLimit);
    }

    return filtered;
  }, [
    studentsWithScores,
    activeTab,
    selectedBranch,
    selectyear,
    searchTerm,
    rankingLimit,
  ]);

  const handleExportToExcel = () => {
    if (filteredStudents && filteredStudents.length > 0) {
      try {
        let today = new Date();
        let day = today.getDate().toString().padStart(2, '0');  
let month = (today.getMonth() + 1).toString().padStart(2, '0');  
let year = today.getFullYear();  

let fileName = `${day}_${month}_${year}_rankings`;
        

        if (activeTab === "branch" && selectedBranch) {
          fileName = `${day}_${month}_${year}_${selectedBranch}_rankings`;
        } else if (
          activeTab === "year" &&
          selectedBranch &&
          selectyear
        ) {
          fileName = `${day}_${month}_${year}_${selectedBranch}_${selectyear}_rankings`;
        }

        exportStudentsToExcel(filteredStudents, fileName);

        toast({
          title: "Success",
          description: "Ranking data exported to Excel successfully",
        });
      } catch (error) {
        console.error("Excel export error:", error);
        toast({
          title: "Error",
          description: "Failed to export data to Excel",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewProfile = (student: StudentWithProfile) => {
    setSelectedStudent(student);
    setIsProfileOpen(true);
  };

  const getRankBadge = (index: number) => {
    if (index === 0)
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          1st <TrophyIcon className="ml-1 h-3 w-3" />
        </Badge>
      );
    if (index === 1)
      return (
        <Badge className="bg-gray-400 hover:bg-gray-500">
          2nd <MedalIcon className="ml-1 h-3 w-3" />
        </Badge>
      );
    if (index === 2)
      return (
        <Badge className="bg-amber-700 hover:bg-amber-800">
          3rd <MedalIcon className="ml-1 h-3 w-3" />
        </Badge>
      );
    return <Badge variant="outline">{index + 1}th</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-2">
          Student Rankings
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Compare performance across branches and years
        </p>
      </div>

      <div className="flex flex-col space-y-6">
        <Tabs
          defaultValue="overall"
          className="w-full"
          onValueChange={(value) => setActiveTab(value as RankingTab)}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <TabsList className="mb-4 md:mb-0">
              <TabsTrigger value="overall">Overall Rankings</TabsTrigger>
              <TabsTrigger value="branch">Branch Rankings</TabsTrigger>
              <TabsTrigger value="year">Year Rankings</TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button
                onClick={handleExportToExcel}
                disabled={!filteredStudents || filteredStudents.length === 0}
                className="whitespace-nowrap"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            {activeTab !== "overall" && (
              <div className="w-full sm:w-auto">
                <Select
                  value={selectedBranch}
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {activeTab === "year" && (
              <div className="w-full sm:w-auto">
                <Select
                  value={selectyear}
                  onValueChange={setselectyear}
                  disabled={!selectedBranch}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="w-full sm:w-auto">
              <Select
                value={rankingLimit.toString()}
                onValueChange={(value) => setRankingLimit(parseInt(value))}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                  <SelectItem value="50">Top 50</SelectItem>
                  <SelectItem value="100">Top 100</SelectItem>
                  <SelectItem value="0">All Students</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading students...</span>
            </div>
          )}

          {isError && (
            <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
              <CardContent className="pt-6 pb-6 flex items-center justify-center">
                <AlertCircleIcon className="h-6 w-6 text-red-500 mr-2" />
                <p className="text-red-600 dark:text-red-400">
                  Error loading student data. Please try again later.
                </p>
              </CardContent>
            </Card>
          )}

          <TabsContent value="overall" className="mt-0">
            <RankingTable
              students={filteredStudents}
              getRankBadge={getRankBadge}
              onViewProfile={handleViewProfile}
            />
          </TabsContent>

          <TabsContent value="branch" className="mt-0">
            {!selectedBranch ? (
              <Card>
                <CardContent className="pt-6 pb-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Please select a branch to view rankings.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <RankingTable
                students={filteredStudents}
                getRankBadge={getRankBadge}
                onViewProfile={handleViewProfile}
              />
            )}
          </TabsContent>

          <TabsContent value="year" className="mt-0">
            {!selectedBranch || !selectyear ? (
              <Card>
                <CardContent className="pt-6 pb-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Please select both branch and year to view rankings.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <RankingTable
                students={filteredStudents}
                getRankBadge={getRankBadge}
                onViewProfile={handleViewProfile}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <StudentProfileDialog
        student={selectedStudent}
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
      />
    </div>
  );
};

// Extracted RankingTable component for better organization
interface RankingTableProps {
  students: (StudentWithProfile & { score: number })[];
  getRankBadge: (index: number) => JSX.Element;
  onViewProfile: (student: StudentWithProfile) => void;
}

const RankingTable = ({
  students,
  getRankBadge,
  onViewProfile,
}: RankingTableProps) => {
  if (!students || students.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No students match the current criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Roll Number</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Year</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">
                {getRankBadge(index)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
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
                  <span>{student.name}</span>
                </div>
              </TableCell>
              <TableCell>{student.rollNumber}</TableCell>
              <TableCell>{student.branch}</TableCell>
              <TableCell>{student.year}</TableCell>
              <TableCell className="text-right font-semibold">
                {student.score}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProfile(student)}
                >
                  <UserIcon className="h-4 w-4 mr-1" />
                  Profile
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Rankings;
