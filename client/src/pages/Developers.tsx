import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Developer } from "@shared/schema";
import { Github, Linkedin, Loader } from "lucide-react";

const Developers = () => {
  const { data: developers, isLoading, isError } = useQuery<Developer[]>({
    queryKey: ["/api/developers"],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Meet Our Developers
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          The talented team behind the Student Coding Profile Dashboard
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading developer profiles...</span>
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load developer information. Please try again later.</p>
        </div>
      )}

      {!isLoading && !isError && developers && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {developers.map((developer) => (
            <Card key={developer.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-primary/5 dark:bg-primary/10">
              <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">{developer.name}</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{developer.role}</p>
                </div>
                <div>
                  <img
                  src={developer.imageUrl}
                  alt={developer.name}
                  className="h-20 w-20 rounded-full"
                  />
                </div>
              </div>
              </CardHeader>
              <CardContent className="pt-5">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {developer.bio || "Developer on the Student Coding Profile Dashboard project."}
                </p>
                <div className="flex  space-x-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(developer.githubProfile, "_blank")}
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full "
                  onClick={() => window.open(developer.linkedinprofile, "_blank")}
                >
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn Profile
                </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* If no developers returned, show fallback */}
      {!isLoading && !isError && (!developers || developers.length === 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-primary/5 dark:bg-primary/10">
              <CardTitle className="text-xl">Jane Smith</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Full Stack Developer</p>
            </CardHeader>
            <CardContent className="pt-5">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Experienced developer with a passion for clean code and beautiful UIs.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open("https://github.com", "_blank")}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-primary/5 dark:bg-primary/10">
              <CardTitle className="text-xl">John Doe</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Backend Developer</p>
            </CardHeader>
            <CardContent className="pt-5">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                API specialist focused on scalable solutions and high-performance backends.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open("https://github.com", "_blank")}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-primary/5 dark:bg-primary/10">
              <CardTitle className="text-xl">Alex Johnson</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">UI/UX Designer</p>
            </CardHeader>
            <CardContent className="pt-5">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Creating intuitive and accessible user interfaces with modern design principles.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open("https://github.com", "_blank")}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Developers;
