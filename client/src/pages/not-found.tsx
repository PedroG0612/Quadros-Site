import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] w-full flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-9xl font-serif text-gray-200">404</h1>
        <div className="text-center space-y-4 mt-[-40px]">
          <h2 className="text-2xl font-medium text-gray-900">Page Not Found</h2>
          <p className="text-gray-500">The art you are looking for has been moved or does not exist.</p>
          
          <Link href="/">
            <Button className="mt-8 rounded-none px-8 py-6 bg-black text-white hover:bg-gray-800 uppercase tracking-widest text-xs">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
