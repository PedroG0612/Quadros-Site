import { useArtworks } from "@/hooks/use-artworks";
import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, ShoppingCart } from "lucide-react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ArtworkPage() {
  const [, params] = useRoute("/artwork/:id");
  const id = params?.id ? parseInt(params.id) : null;
  const { data: artworks, isLoading } = useArtworks();
  
  const artwork = artworks?.find(a => a.id === id);

  if (isLoading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!artwork) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl font-serif mb-4 uppercase tracking-tighter">Obra não encontrada</h1>
          <Link href="/">
            <Button variant="outline" className="rounded-none">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Galeria
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12 md:py-24">
        <Link href="/">
          <Button variant="ghost" className="mb-8 rounded-none hover:bg-accent -ml-4 uppercase tracking-widest text-xs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Galeria
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-[3/4] overflow-hidden bg-muted shadow-2xl"
          >
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-center space-y-8"
          >
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold">Obra Original</span>
              <h1 className="text-4xl md:text-6xl font-serif mt-2 leading-tight uppercase">{artwork.title}</h1>
              <p className="text-xl md:text-2xl font-serif mt-4 text-muted-foreground italic">{artwork.artist}</p>
            </div>

            <div className="space-y-4 border-t border-b py-8 border-border">
              {artwork.year && (
                <div className="flex justify-between items-center">
                  <span className="text-sm uppercase tracking-widest text-muted-foreground">Ano</span>
                  <span className="font-medium">{artwork.year}</span>
                </div>
              )}
              {artwork.medium && (
                <div className="flex justify-between items-center">
                  <span className="text-sm uppercase tracking-widest text-muted-foreground">Técnica</span>
                  <span className="font-medium">{artwork.medium}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm uppercase tracking-widest text-muted-foreground">Dimensões</span>
                <span className="font-medium">Varia por edição</span>
              </div>
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-4">Descrição</span>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {artwork.description || "Esta obra minimalista captura a essência do movimento e da luz através de uma composição cuidadosa de sombras e contrastes. Uma peça única para colecionadores que apreciam a sofisticação da simplicidade."}
              </p>
            </div>

            <div className="pt-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm uppercase tracking-widest text-muted-foreground">Investimento</span>
                <span className="text-3xl font-serif">${artwork.price.toLocaleString()}</span>
              </div>
              <Button className="w-full rounded-none py-8 text-lg uppercase tracking-[0.2em] group">
                <ShoppingCart className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Adquirir Obra
              </Button>
              <p className="text-[0.7rem] text-center mt-4 text-muted-foreground uppercase tracking-widest">
                Entrega segura e seguro incluso mundialmente
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
