import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, LogIn, LogOut, Upload, Trash2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/contexts/AuthContext";
import { LoginDialog } from "./LoginDialog";
import { DeleteDataDialog } from "./DeleteDataDialog";

const branches = [
  { name: "CSE", label: "Computer Science & Engineering" },
  { name: "AIML", label: "AI & Machine Learning" },
  { name: "DS", label: "Data Science" },
  { name: "ECE", label: "Electronics & Communication" },
  { name: "IT", label: "Information Technology" },
  { name: "MCA", label: "MCA" },
];

const years = ["1","2","3","4"];

const Navbar = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const isActive = (path: string) => {
    return location === path
      ? "border-b-2 border-primary text-gray-900 dark:text-white"
      : "border-transparent border-b-2 hover:border-gray-300 dark:hover:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm dark:bg-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-xl font-bold text-primary cursor-pointer">
                  CodeProfileTracker
                </span>
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive("/")}`}
              >
                Home
              </Link>

              {/* Branches Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`group inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive("/branches")}`}
                  >
                    Branches <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Select Branch</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {branches.map((branch) => (
                    <DropdownMenu key={branch.name}>
                      <DropdownMenuTrigger className="w-full px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left flex justify-between items-center">
                        <span>{branch.name}</span>
                        <ChevronDown className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="min-w-[8rem]">
                        <DropdownMenuLabel>Select Year</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {years.map((year) => (
                          <Link
                            key={year}
                            href={`/branches/${branch.name}/${year}`}
                          >
                            <DropdownMenuItem className="cursor-pointer">
                              {year} year
                            </DropdownMenuItem>
                          </Link>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/rankings"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive("/rankings")}`}
              >
                Rankings
              </Link>

              <Link
                href="/developers"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive("/developers")}`}
              >
                Developers
              </Link>

              <Link
                href="/contact"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive("/contact")}`}
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center">
            {/* Theme Toggle */}
            {/* <div className="ml-3">
              <ThemeToggle />
            </div> */}
              
            {/* Auth Controls */}
            <div className="ml-3 relative">
              <div className="flex space-x-2">
                {isAuthenticated ? (
                  <div className="flex space-x-2">
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <Link href="/upload">
                          <Button variant="default" size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                          </Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={logout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLoginDialogOpen(true)}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center sm:hidden ml-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                location === "/"
                  ? "bg-primary-50 dark:bg-gray-700 border-l-4 border-primary text-primary-700 dark:text-white"
                  : "border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300"
              }`}
            >
              Home
            </Link>

            <Link
              href="/branches"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                location.startsWith("/branches")
                  ? "bg-primary-50 dark:bg-gray-700 border-l-4 border-primary text-primary-700 dark:text-white"
                  : "border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300"
              }`}
            >
              Branches
            </Link>

            <Link
              href="/rankings"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                location === "/rankings"
                  ? "bg-primary-50 dark:bg-gray-700 border-l-4 border-primary text-primary-700 dark:text-white"
                  : "border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300"
              }`}
            >
              Rankings
            </Link>

            <Link
              href="/developers"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                location === "/developers"
                  ? "bg-primary-50 dark:bg-gray-700 border-l-4 border-primary text-primary-700 dark:text-white"
                  : "border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300"
              }`}
            >
              Developers
            </Link>

            <Link
              href="/contact"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                location === "/contact"
                  ? "bg-primary-50 dark:bg-gray-700 border-l-4 border-primary text-primary-700 dark:text-white"
                  : "border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300"
              }`}
            >
              Contact Us
            </Link>

            {isAdmin && (
              <>
                <Link
                  href="/upload"
                  className={`block pl-3 pr-4 py-2 text-base font-medium ${
                    location === "/upload"
                      ? "bg-primary-50 dark:bg-gray-700 border-l-4 border-primary text-primary-700 dark:text-white"
                      : "border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Data
                  </div>
                </Link>
                <button
                  onClick={() => setDeleteDialogOpen(true)}
                  className="flex items-center w-full text-left pl-3 pr-4 py-2 text-base font-medium border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300"
                >
                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                  <span>Delete Data</span>
                </button>
              </>
            )}
            
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setLoginDialogOpen(true)}
                className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Login Dialog */}
      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen} 
        onLoginSuccess={() => setLoginDialogOpen(false)}
      />
      
      {/* Delete Data Dialog */}
      <DeleteDataDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </nav>
  );
};

export default Navbar;
