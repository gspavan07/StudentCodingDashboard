import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Branches from "./pages/Branches";
import StudentData from "./pages/StudentData";
import Rankings from "./pages/Rankings";
import UploadData from "./pages/UploadData";
import Developers from "./pages/Developers";
import Contact from "./pages/Contact";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/branches/:branch/:year" component={StudentData} />
      <Route path="/branches" component={Branches} />
      <Route path="/rankings" component={Rankings} />
      <Route path="/upload" component={UploadData} />
      <Route path="/developers" component={Developers} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
