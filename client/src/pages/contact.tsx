import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactForm) => {
    console.log("Contact Form Data:", data);
    toast({
      title: "Message Sent",
      description: "We will respond to your inquiry shortly.",
    });
    form.reset();
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground block mb-2">Get in Touch</span>
            <h1 className="text-4xl md:text-5xl font-serif mb-8">Inquiries</h1>
            <p className="text-gray-600 mb-8 leading-relaxed max-w-md">
              For pricing availability, commissions, or general questions about our current exhibition, please use the form or contact us directly.
            </p>
            
            <div className="space-y-6 mt-12">
              <div>
                <h3 className="font-serif text-lg mb-1">Visit</h3>
                <p className="text-sm text-gray-500">
                  123 Art District Ave<br/>
                  New York, NY 10012
                </p>
              </div>
              <div>
                <h3 className="font-serif text-lg mb-1">Email</h3>
                <p className="text-sm text-gray-500">gallery@noirandblanc.com</p>
              </div>
              <div>
                <h3 className="font-serif text-lg mb-1">Phone</h3>
                <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-gray-500">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} className="bg-transparent border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors" />
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
                      <FormLabel className="text-xs uppercase tracking-wider text-gray-500">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Email" {...field} className="bg-transparent border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors" />
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
                      <FormLabel className="text-xs uppercase tracking-wider text-gray-500">Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us about your interest..." {...field} className="bg-transparent border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black resize-none min-h-[100px] transition-colors" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full rounded-none bg-black h-12 text-xs uppercase tracking-widest hover:bg-gray-800">
                  Send Message
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
