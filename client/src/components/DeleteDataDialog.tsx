import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/contexts/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DeleteMode = "student" | "branch" | "section";

export function DeleteDataDialog({ open, onOpenChange }: DeleteDataDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  
  const [deleteMode, setDeleteMode] = useState<DeleteMode>("student");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedRollNumber, setSelectedRollNumber] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Fetch students data
  const { data: students = [] } = useQuery({
    queryKey: ["/api/students/all"],
    queryFn: () => apiRequest<any[]>({ 
      method: "GET",
      url: "/api/students/all" 
    }),
    enabled: open,
  });
  
  // Extract unique branches and sections
  const branches = Array.from(
    new Set(students.map((student) => student.branch))
  ).sort();
  
  const sections = selectedBranch
    ? Array.from(
        new Set(
          students
            .filter(student => student.branch === selectedBranch)
            .map(student => student.section)
        )
      ).sort()
    : [];
  
  const studentsForSelection = (() => {
    if (deleteMode === "student") {
      return students;
    } else if (deleteMode === "section" && selectedBranch && selectedSection) {
      return students.filter(
        student => 
          student.branch === selectedBranch && 
          student.section === selectedSection
      );
    } else if (deleteMode === "branch" && selectedBranch) {
      return students.filter(student => student.branch === selectedBranch);
    }
    return [];
  })();
  
  // Reset form when delete mode changes
  const handleDeleteModeChange = (value: DeleteMode) => {
    setDeleteMode(value);
    setSelectedBranch("");
    setSelectedSection("");
    setSelectedRollNumber("");
  };
  
  const getConfirmMessage = () => {
    switch(deleteMode) {
      case "student":
        const student = students.find(s => s.rollNumber === selectedRollNumber);
        return student 
          ? `Are you sure you want to delete "${student.name}" (${student.rollNumber})?`
          : "Are you sure you want to delete this student?";
      case "branch":
        return `Are you sure you want to delete ALL students from branch "${selectedBranch}"? This will delete ${studentsForSelection.length} students.`;
      case "section":
        return `Are you sure you want to delete ALL students from branch "${selectedBranch}", section "${selectedSection}"? This will delete ${studentsForSelection.length} students.`;
      default:
        return "Are you sure you want to proceed?";
    }
  };
  
  // Create delete mutations
  const deleteStudentMutation = useMutation({
    mutationFn: async () => {
      if (deleteMode === "student" && selectedRollNumber) {
        return apiRequest<any>({ 
          method: "DELETE",
          url: `/api/students/${selectedRollNumber}`
        });
      } else if (deleteMode === "branch" && selectedBranch) {
        return apiRequest<any>({ 
          method: "DELETE",
          url: `/api/students/branch/${selectedBranch}`
        });
      } else if (deleteMode === "section" && selectedBranch && selectedSection) {
        return apiRequest<any>({ 
          method: "DELETE",
          url: `/api/students/branch/${selectedBranch}/section/${selectedSection}`
        });
      }
      throw new Error("Invalid delete operation");
    },
    onSuccess: (data) => {
      // Show toast notification
      toast({
        title: "Success",
        description: data.message || "Data deleted successfully",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/students/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      
      // Reset form and close dialogs
      setSelectedBranch("");
      setSelectedSection("");
      setSelectedRollNumber("");
      setConfirmDialogOpen(false);
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete data. Please try again.",
        variant: "destructive",
      });
      setConfirmDialogOpen(false);
    },
  });
  
  // Determine if submit button should be disabled
  const isSubmitDisabled = 
    (deleteMode === "student" && !selectedRollNumber) ||
    (deleteMode === "branch" && !selectedBranch) ||
    (deleteMode === "section" && (!selectedBranch || !selectedSection)) ||
    deleteStudentMutation.isPending;
  
  // Handle form submission
  const handleSubmit = () => {
    setConfirmDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    deleteStudentMutation.mutate();
  };
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Student Data
            </DialogTitle>
            <DialogDescription>
              Delete student data from the system. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Delete By</label>
              <Select 
                value={deleteMode} 
                onValueChange={(value) => handleDeleteModeChange(value as DeleteMode)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delete mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Individual Student</SelectItem>
                  <SelectItem value="section">Entire Section</SelectItem>
                  <SelectItem value="branch">Entire Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Branch selection for branch or section delete mode */}
            {(deleteMode === "branch" || deleteMode === "section") && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Branch</label>
                <Select 
                  value={selectedBranch} 
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Branches</SelectLabel>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Section selection for section delete mode */}
            {deleteMode === "section" && selectedBranch && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Section</label>
                <Select 
                  value={selectedSection} 
                  onValueChange={setSelectedSection}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sections</SelectLabel>
                      {sections.map((section) => (
                        <SelectItem key={section} value={section}>
                          {section}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Student selection for individual student delete mode */}
            {deleteMode === "student" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Student</label>
                <Select 
                  value={selectedRollNumber} 
                  onValueChange={setSelectedRollNumber}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Students</SelectLabel>
                      {students.map((student) => (
                        <SelectItem key={student.rollNumber} value={student.rollNumber}>
                          {student.name} ({student.rollNumber}) - {student.branch} {student.section}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Summary of what will be deleted */}
            {studentsForSelection.length > 0 && deleteMode !== "student" && (
              <div className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/50">
                <p className="font-medium text-foreground">Delete Summary:</p>
                <p>{studentsForSelection.length} students will be deleted.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={deleteStudentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
            >
              {deleteStudentMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmMessage()}
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteStudentMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteStudentMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStudentMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}