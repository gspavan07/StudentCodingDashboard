import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Github, Linkedin, Send, Loader2 } from "lucide-react";

// Feedback form schema with validation
const feedbackSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" })
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize the form
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      message: ""
    }
  });

  // Form submission handler
  const onSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/feedback", data);
      if (response.ok) {
        toast({
          title: "Feedback Sent",
          description: "Thank you for your feedback! We'll get back to you soon.",
        });
        form.reset();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Contact Information */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-6">
            Contact Us
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
            Have questions about the Student Coding Profile Dashboard? We'd love to hear from you. Fill out the form or reach out through any of the contact methods below.
          </p>

          <div className="space-y-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-3 text-base text-gray-500 dark:text-gray-400">
                <p>contact@codetrack.edu</p>
                <p className="mt-1">We'll respond within 24 hours</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Github className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-3 text-base text-gray-500 dark:text-gray-400">
                <p>github.com/codetrack</p>
                <p className="mt-1">Report issues or contribute</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Linkedin className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-3 text-base text-gray-500 dark:text-gray-400">
                <p>linkedin.com/company/codetrack</p>
                <p className="mt-1">Connect with our team</p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Office Hours
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">Monday - Friday</p>
              <p className="text-gray-700 dark:text-gray-300 font-medium">9:00 AM - 5:00 PM</p>
              <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                Responses may be delayed outside of office hours
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <div>
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Send Us Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email address" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="How can we help you?"
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">How is the score calculated?</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                  The score is calculated based on problem difficulty, with harder problems weighted more heavily. We also consider contest participation and platform-specific ratings.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">How often is the data updated?</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                  The data is updated whenever new profiles are uploaded by administrators. Student data can be refreshed by searching for a roll number.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Can I upload my own coding profile?</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                  Student data is managed by administrators. If you notice any discrepancies in your profile, please contact your department coordinator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
