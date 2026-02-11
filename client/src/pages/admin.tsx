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
import { Plus, Loader2 } from "lucide-react";

export default function AdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: artworks, isLoading: isArtworksLoading } = useArtworks();
  const createMutation = useCreateArtwork();
  const deleteMutation = useDeleteArtwork();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    },
  });

  const onSubmit = (data: InsertArtwork) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
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
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} className="rounded-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full rounded-none"
                    disabled={createMutation.isPending}
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
