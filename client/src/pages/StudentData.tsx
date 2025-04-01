import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Student, StudentWithProfile } from "@shared/schema";
import { useState } from "react";
import { exportStudentsToExcel } from "@/lib/exportToExcel";
import { useToast } from "@/hooks/use-toast";
import { StudentProfileDialog } from "@/components/StudentProfileDialog";
import { 
  DownloadIcon, 
  SearchIcon, 
  LoaderIcon,
  AlertCircleIcon,
  UserIcon
} from "lucide-react";

const StudentData = () => {
  const { branch = "", year = "" } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<StudentWithProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { data: students, isLoading, isError } = useQuery<StudentWithProfile[]>({
    queryKey: [`/api/students?branch=${branch}&year=${year}`],
    enabled: !!branch && !!year,
  });

  const filteredStudents = students?.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportToExcel = () => {
    if (students && students.length > 0) {
      try {
        exportStudentsToExcel(students, `${branch}_${year}_students`);
        toast({
          title: "Success",
          description: "Student data exported to Excel successfully",
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {branch} - {year} year
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Student coding profiles and statistics
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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
            disabled={!students || students.length === 0}
            className="whitespace-nowrap"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
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

      {!isLoading && !isError && filteredStudents && filteredStudents.length === 0 && (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "No students match your search criteria." : "No students found in this year."}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && filteredStudents && filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
              <CardHeader className="bg-primary/5 dark:bg-primary/10 pb-3">
                <CardTitle className="text-lg">{student.name}</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {student.rollNumber}
                </p>
              </CardHeader>
              <CardContent className="pt-4 pb-5">
                <div className="flex justify-between">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img 
                      src={student.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3b82f6&color=fff`}
                      alt={student.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3b82f6&color=fff`;
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Branch: </span>
                      <span className="font-medium">{student.branch}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">year: </span>
                      <span className="font-medium">{student.year}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => handleViewProfile(student)}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StudentProfileDialog
        student={selectedStudent}
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
      />
    </div>
  );
};

export default StudentData;