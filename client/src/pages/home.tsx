import { useArtworks } from "@/hooks/use-artworks";
import { Layout } from "@/components/layout";
import { ArtworkCard } from "@/components/artwork-card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: artworks, isLoading } = useArtworks();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-black text-white overflow-hidden">
        {/* Unsplash abstract black and white architecture */}
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=2000&auto=format&fit=crop")' }}
        />
        <div className="relative z-10 text-center max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
              Elegance in <br/> Monochrome
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl mx-auto font-light leading-relaxed">
              Discover a curated collection of black & white artistry. 
              Where shadows speak louder than colors.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-16">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground block mb-2">Collection</span>
            <h2 className="text-3xl md:text-4xl font-serif">Latest Acquisitions</h2>
          </div>
          <div className="hidden md:block w-32 h-[1px] bg-black/20 mb-4"></div>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="gallery-grid">
            {artworks?.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
            {(!artworks || artworks.length === 0) && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <p>No artworks found in the collection.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Quote Section */}
      <section className="bg-secondary/30 py-32 border-t">
        <div className="container mx-auto px-6 text-center">
          <blockquote className="font-serif text-3xl md:text-5xl italic leading-tight max-w-4xl mx-auto text-black/80">
            "Black and white are the colors of photography. To me they symbolize the alternatives of hope and despair to which mankind is forever subjected."
          </blockquote>
          <cite className="block mt-8 text-sm uppercase tracking-widest text-muted-foreground font-normal not-italic">
            — Robert Frank
          </cite>
        </div>
      </section>
    </Layout>
  );
}
