import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const branches = [
  {
    code: "CSE",
    name: "Computer Science & Engineering",
    description: "Core computer science with software engineering principles",
    years: ["1st","2nd","3rd","4th"]
  },
  {
    code: "AIML",
    name: "AI & Machine Learning",
    description: "Specialized in artificial intelligence and ML algorithms",
    years: ["1st","2nd","3rd","4th"]
  },
  {
    code: "DS",
    name: "Data Science",
    description: "Focused on data analysis, visualization and predictive modeling",
    years: ["1st","2nd","3rd","4th"]
  },
  {
    code: "ECE",
    name: "Electronics & Communication",
    description: "Study of electronic devices, circuits, and communication systems",
    years: ["1st","2nd","3rd","4th"]
  },
  {
    code: "IT",
    name: "Information Technology",
    description: "Emphasis on information systems and technology management",
    years: ["1st","2nd","3rd","4th"]
  },
  {
    code: "MCA",
    name: "MCA",
    description: "Master's program in computer applications",
    years: ["1st","2nd"]
  }
];

const Branches = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Browse by Branch
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Select a branch and year to view student coding profiles
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => (
          <Card key={branch.code} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-primary/5 dark:bg-primary/10">
              <CardTitle className="text-xl font-bold">{branch.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-500 dark:text-gray-400 mb-6">{branch.description}</p>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">years:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {branch.years.map((year) => (
                    <Link key={year} href={`/branches/${branch.code}/${year}`}>
                      <Button variant="outline" className="w-full justify-between">
                         {year} Year
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Branches;
