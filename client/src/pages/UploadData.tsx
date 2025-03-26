import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileType, UploadCloud, AlertCircle, CheckCircle2, Download, ShieldAlert } from "lucide-react";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLocation } from "wouter";
import * as XLSX from 'xlsx';

const branches = [
  { value: "CSE", label: "Computer Science & Engineering" },
  { value: "AIML", label: "AI & Machine Learning" },
  { value: "DS", label: "Data Science" },
  { value: "ECE", label: "Electronics & Communication" },
  { value: "IT", label: "Information Technology" },
  { value: "MCA", label: "MCA" },
];

const sections = [
  { value: "A", label: "Section A" },
  { value: "B", label: "Section B" },
  { value: "C", label: "Section C" },
  { value: "D", label: "Section D" },
];

const generateTemplateFile = () => {
  // Generate example data
  const templateData = [
    {
      "Roll Number": "201CS001",
      "Name": "John Doe",
      "HackerRank": "https://www.hackerrank.com/johndoe",
      "LeetCode": "https://leetcode.com/johndoe",
      "CodeChef": "https://www.codechef.com/users/johndoe",
      "GeeksforGeeks": "https://auth.geeksforgeeks.org/user/johndoe"
    },
    {
      "Roll Number": "201CS002",
      "Name": "Jane Smith",
      "HackerRank": "https://www.hackerrank.com/janesmith",
      "LeetCode": "https://leetcode.com/janesmith", 
      "CodeChef": "https://www.codechef.com/users/janesmith",
      "GeeksforGeeks": "https://auth.geeksforgeeks.org/user/janesmith"
    }
  ];

  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  
  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create a Blob from the buffer
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'student_data_template.xlsx';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return true;
};

const UploadData = () => {
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{success: boolean; message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect non-admin users to the home page
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Admin Access Required",
        description: "You must be logged in as an administrator to access this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setUploadResult(null);
      }
    }
  };

  const validateFile = (file: File) => {
    // Check file extension
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return false;
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File size should not exceed 10MB",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setUploadResult(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!branch) {
      toast({
        title: "Branch required",
        description: "Please select a branch",
        variant: "destructive",
      });
      return;
    }
    
    if (!section) {
      toast({
        title: "Section required",
        description: "Please select a section",
        variant: "destructive",
      });
      return;
    }
    
    if (!file) {
      toast({
        title: "File required",
        description: "Please select an Excel file to upload",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadResult(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('branch', branch);
      formData.append('section', section);
      
      // Use XMLHttpRequest instead of fetch to better handle file uploads
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.withCredentials = true; // Include cookies for authentication
      
      xhr.onload = function() {
        let response;
        try {
          response = JSON.parse(xhr.responseText);
        } catch (e) {
          response = { message: "Error parsing server response" };
        }
        
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadResult({
            success: true,
            message: response.message || `Successfully processed ${response.count || 0} student records`,
          });
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          setUploadResult({
            success: false,
            message: response.message || "An error occurred during upload",
          });
        }
        setIsUploading(false);
      };
      
      xhr.onerror = function() {
        setUploadResult({
          success: false,
          message: "Network error occurred during upload",
        });
        setIsUploading(false);
      };
      
      xhr.send(formData);
    } catch (error) {
      setUploadResult({
        success: false,
        message: "An error occurred during upload",
      });
      setIsUploading(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }
  
  // Only show content if user is authenticated and is an admin
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold text-center">Upload Student Data</CardTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
            <ShieldAlert className="inline-block mr-1 h-4 w-4 text-amber-500" />
            Admin-only feature for uploading Excel sheets containing student coding profiles
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Branch & Section Selection */}
            <div className="md:col-span-1">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="branchSelect">Branch</Label>
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger id="branchSelect" className="mt-1">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(branchOption => (
                        <SelectItem key={branchOption.value} value={branchOption.value}>
                          {branchOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="sectionSelect">Section</Label>
                  <Select value={section} onValueChange={setSection}>
                    <SelectTrigger id="sectionSelect" className="mt-1">
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map(sectionOption => (
                        <SelectItem key={sectionOption.value} value={sectionOption.value}>
                          {sectionOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File Format Requirements:</p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 list-disc pl-5 space-y-1">
                    <li>Excel file (.xlsx) with headers</li>
                    <li>Required columns: <span className="font-semibold">Roll Number, Name, HackerRank, LeetCode, CodeChef, GeeksforGeeks</span></li>
                    <li>Maximum file size: 10MB</li>
                  </ul>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Link Format Guidelines:</p>
                    <ul className="text-xs text-gray-500 dark:text-gray-400 list-disc pl-5 space-y-2">
                      <li><span className="font-semibold">HackerRank</span>: https://www.hackerrank.com/username</li>
                      <li><span className="font-semibold">LeetCode</span>: https://leetcode.com/username</li>
                      <li><span className="font-semibold">CodeChef</span>: https://www.codechef.com/users/username</li>
                      <li><span className="font-semibold">GeeksforGeeks</span>: https://auth.geeksforgeeks.org/user/username</li>
                    </ul>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Processing:</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      After uploading the Excel file, the system will automatically scrape the following information from each profile:
                    </p>
                    <ul className="text-xs text-gray-500 dark:text-gray-400 list-disc pl-5 space-y-1 mt-2">
                      <li><span className="font-semibold">HackerRank</span>: Badges, stars, and solved problems</li>
                      <li><span className="font-semibold">LeetCode</span>: Problems by difficulty (Easy, Medium, Hard), Rank</li>
                      <li><span className="font-semibold">CodeChef</span>: Total solved, contests, stars</li>
                      <li><span className="font-semibold">GeeksforGeeks</span>: Problems by level, total score</li>
                    </ul>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (generateTemplateFile()) {
                          toast({
                            title: "Template Downloaded",
                            description: "Excel template has been downloaded. Please fill it with your student data.",
                          });
                        }
                      }}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Upload Area */}
            <div className="md:col-span-2">
              <div className="h-full flex flex-col">
                <div 
                  className={`flex-grow border-2 border-dashed rounded-lg p-6 flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-700 transition-all cursor-pointer ${
                    isDragging 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-650"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    {file ? (
                      <>
                        <FileType className="mx-auto h-12 w-12 text-primary mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload Excel File</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Drag and drop your Excel file here, or click to browse
                        </p>
                      </>
                    )}
                    <input 
                      ref={fileInputRef}
                      id="fileUpload" 
                      type="file" 
                      className="sr-only" 
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                    />
                    <div className="mt-3">
                      <Button variant="outline" size="sm" className="mx-auto">
                        {file ? "Change File" : "Select File"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Upload result message */}
                {uploadResult && (
                  <Alert variant={uploadResult.success ? "default" : "destructive"} className="mt-4">
                    {uploadResult.success ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {uploadResult.success ? "Success" : "Error"}
                    </AlertTitle>
                    <AlertDescription>
                      {uploadResult.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Upload Button */}
                <div className="mt-4">
                  <Button 
                    onClick={handleUpload}
                    disabled={!file || !branch || !section || isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-pulse" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadData;
