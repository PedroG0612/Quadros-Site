import { useAuth } from "@/hooks/use-auth";
import { useArtworks, useCreateArtwork, useDeleteArtwork } from "@/hooks/use-artworks";
import { Layout } from "@/components/layout";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertArtworkSchema, InsertArtwork } from "@shared/schema";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ArtworkCard } from "@/components/artwork-card";
import { Plus, Loader2, Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: artworks, isLoading: isArtworksLoading } = useArtworks();
  const createMutation = useCreateArtwork();
  const deleteMutation = useDeleteArtwork();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthLoading && (!user || !user.isAdmin)) {
      setLocation("/");
    }
  }, [user, isAuthLoading, setLocation]);

  const form = useForm<InsertArtwork>({
    resolver: zodResolver(insertArtworkSchema),
    defaultValues: {
      title: "",
      artist: "",
      price: 0,
      imageUrl: "",
      description: "",
      year: new Date().getFullYear(),
      medium: "",
    },
  });

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      form.setValue("imageUrl", url);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: InsertArtwork) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
        toast({
          title: "Success",
          description: "Artwork added to collection",
        });
      },
    });
  };

  if (isAuthLoading || isArtworksLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !user.isAdmin) return null;

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-serif">Gallery Management</h1>
            <p className="text-muted-foreground mt-2">Manage your collection inventory.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none bg-black text-white px-6">
                <Plus className="w-4 h-4 mr-2" />
                Add Artwork
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-none max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">New Acquisition</DialogTitle>
                <DialogDescription>
                  Enter the details of the new artwork to add to the gallery.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Midnight Solitude" {...field} className="rounded-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="artist"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Artist</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Ansel Adams" {...field} className="rounded-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (USD)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="rounded-none" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Artwork Image</FormLabel>
                        <div className="flex gap-4 items-end">
                          <FormControl>
                            <Input placeholder="https://..." {...field} className="rounded-none" />
                          </FormControl>
                          <div className="relative">
                            <input
                              type="file"
                              className="hidden"
                              id="file-upload"
                              accept="image/*"
                              onChange={onFileChange}
                              disabled={isUploading}
                            />
                            <label htmlFor="file-upload">
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-none"
                                disabled={isUploading}
                                asChild
                              >
                                <span>
                                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                </span>
                              </Button>
                            </label>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              className="rounded-none" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="medium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medium</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Oil on Canvas" {...field} value={field.value || ""} className="rounded-none" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <textarea 
                            {...field} 
                            value={field.value || ""}
                            className="w-full min-h-[100px] bg-background border border-input px-3 py-2 text-sm rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Describe the artwork..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full rounded-none"
                    disabled={createMutation.isPending || isUploading}
                  >
                    {createMutation.isPending ? "Adding..." : "Add to Collection"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {artworks?.map((artwork) => (
            <ArtworkCard 
              key={artwork.id} 
              artwork={artwork} 
              isAdmin={true} 
              onDelete={(id) => deleteMutation.mutate(id)} 
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
