import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertUserSchema } from "@shared/schema";
import { useEffect } from "react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const formSchema = insertUserSchema.extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const loginForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-2xl shadow-black/5">
          <div className="text-center">
            <h2 className="text-3xl font-serif text-gray-900 mb-2">Member Access</h2>
            <p className="text-sm text-gray-500">Sign in to manage your collection or join our community.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 rounded-none bg-gray-100 p-1">
              <TabsTrigger 
                value="login" 
                className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs uppercase tracking-widest"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs uppercase tracking-widest"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-500">Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} className="border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black bg-transparent" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-500">Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} className="border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black bg-transparent" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full rounded-none h-12 text-xs uppercase tracking-widest bg-black hover:bg-gray-800"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Authenticating..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-6">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-500">Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} className="border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black bg-transparent" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-500">Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Choose a password" {...field} className="border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black bg-transparent" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full rounded-none h-12 text-xs uppercase tracking-widest bg-black hover:bg-gray-800"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
