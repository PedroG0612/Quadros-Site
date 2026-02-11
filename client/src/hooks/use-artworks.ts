import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertArtwork } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useArtworks() {
  return useQuery({
    queryKey: [api.artworks.list.path],
    queryFn: async () => {
      const res = await fetch(api.artworks.list.path);
      if (!res.ok) throw new Error("Failed to fetch artworks");
      return api.artworks.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateArtwork() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (artwork: InsertArtwork) => {
      const res = await fetch(api.artworks.create.path, {
        method: api.artworks.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artwork),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.artworks.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to create artwork");
      }
      return api.artworks.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.artworks.list.path] });
      toast({ title: "Artwork added", description: "The collection has been updated." });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteArtwork() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.artworks.delete.path, { id });
      const res = await fetch(url, {
        method: api.artworks.delete.method,
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Artwork not found");
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to delete artwork");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.artworks.list.path] });
      toast({ title: "Artwork removed", description: "The piece has been removed from the gallery." });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
