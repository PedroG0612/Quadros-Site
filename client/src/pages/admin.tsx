import { useAuth } from "@/hooks/use-auth";
import { useArtworks, useCreateArtwork, useDeleteArtwork } from "@/hooks/use-artworks";
import { Layout } from "@/components/layout";
import { useLocation } from "wouter";
import { useEffect, useState, useMemo } from "react";
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
import { Plus, Loader2, Upload, LayoutDashboard, Database, TrendingUp, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: artworks, isLoading: isArtworksLoading } = useArtworks();
  const createMutation = useCreateArtwork();
  const deleteMutation = useDeleteArtwork();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Stats calculation
  const stats = useMemo(() => {
    if (!artworks) return { totalItems: 0, totalValue: 0, avgPrice: 0 };
    const totalItems = artworks.length;
    const totalValue = artworks.reduce((sum, art) => sum + art.price, 0);
    const avgPrice = totalItems > 0 ? Math.round(totalValue / totalItems) : 0;
    return { totalItems, totalValue, avgPrice };
  }, [artworks]);

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
        title: "Sucesso",
        description: "Imagem carregada com sucesso",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao carregar imagem",
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
          title: "Sucesso",
          description: "Obra adicionada à coleção",
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif uppercase tracking-tighter">Painel Administrativo</h1>
            <p className="text-muted-foreground mt-2">Gerencie o inventário e visualize estatísticas da ASSIS.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none bg-primary text-primary-foreground px-8 py-6 h-auto uppercase tracking-[0.2em] text-xs font-bold hover-elevate">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Obra
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-none max-w-md bg-background border-border">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl uppercase tracking-widest">Nova Aquisição</DialogTitle>
                <DialogDescription className="uppercase text-[0.6rem] tracking-widest">
                  Insira os detalhes da nova obra para a galeria.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-[0.6rem] tracking-[0.2em]">Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Solidão à Meia-Noite" {...field} className="rounded-none bg-muted/50" />
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
                        <FormLabel className="uppercase text-[0.6rem] tracking-[0.2em]">Artista</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Ansel Adams" {...field} className="rounded-none bg-muted/50" />
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
                        <FormLabel className="uppercase text-[0.6rem] tracking-[0.2em]">Preço (USD)</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => {
                              const val = e.target.value === "" ? 0 : parseInt(e.target.value.replace(/\D/g, ""));
                              field.onChange(val);
                            }}
                            className="rounded-none bg-muted/50" 
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
                        <FormLabel className="uppercase text-[0.6rem] tracking-[0.2em]">Imagem da Obra</FormLabel>
                        <div className="flex gap-4 items-end">
                          <FormControl>
                            <Input placeholder="https://..." {...field} className="rounded-none bg-muted/50" />
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
                                className="rounded-none border-dashed"
                                disabled={isUploading}
                                asChild
                              >
                                <span className="cursor-pointer">
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
                          <FormLabel className="uppercase text-[0.6rem] tracking-[0.2em]">Ano</FormLabel>
                          <FormControl>
                            <Input 
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value.replace(/\D/g, "")) : null)}
                              className="rounded-none bg-muted/50" 
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
                          <FormLabel className="uppercase text-[0.6rem] tracking-[0.2em]">Técnica</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Óleo sobre Tela" {...field} value={field.value || ""} className="rounded-none bg-muted/50" />
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
                        <FormLabel className="uppercase text-[0.6rem] tracking-[0.2em]">Descrição</FormLabel>
                        <FormControl>
                          <textarea 
                            {...field} 
                            value={field.value || ""}
                            className="w-full min-h-[100px] bg-muted/50 border border-input px-3 py-2 text-sm rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Descreva a obra..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full rounded-none uppercase tracking-[0.2em] font-bold py-6 h-auto bg-primary text-primary-foreground hover-elevate"
                    disabled={createMutation.isPending || isUploading}
                  >
                    {createMutation.isPending ? "Adicionando..." : "Adicionar à Coleção"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="rounded-none bg-card border-border shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Obras Totais</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif">{stats.totalItems}</div>
              <p className="text-[0.6rem] text-muted-foreground uppercase tracking-widest mt-1">Peças no inventário</p>
            </CardContent>
          </Card>
          <Card className="rounded-none bg-card border-border shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Valor Total</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif">${stats.totalValue.toLocaleString()}</div>
              <p className="text-[0.6rem] text-muted-foreground uppercase tracking-widest mt-1">Estimativa de mercado</p>
            </CardContent>
          </Card>
          <Card className="rounded-none bg-card border-border shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Média de Preço</CardTitle>
              <Database className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif">${stats.avgPrice.toLocaleString()}</div>
              <p className="text-[0.6rem] text-muted-foreground uppercase tracking-widest mt-1">Por obra de arte</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-serif uppercase tracking-widest border-b pb-4">Inventário</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {artworks?.map((artwork) => (
            <ArtworkCard 
              key={artwork.id} 
              artwork={artwork} 
              isAdmin={true} 
              onDelete={(id) => {
                if (window.confirm("Tem certeza que deseja remover esta obra?")) {
                  deleteMutation.mutate(id);
                }
              }} 
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
