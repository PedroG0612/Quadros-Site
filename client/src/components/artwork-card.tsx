import { Artwork } from "@shared/schema";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ArtworkCardProps {
  artwork: Artwork;
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
}

export function ArtworkCard({ artwork, isAdmin, onDelete }: ArtworkCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 saturate-0 group-hover:saturate-100"
        />
        
        {/* Overlay for price/buy action */}
        <div 
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-black rounded-none uppercase tracking-widest text-xs"
          >
            View Details
          </Button>
        </div>

        {isAdmin && onDelete && (
          <button
            onClick={() => onDelete(artwork.id)}
            className="absolute top-2 right-2 bg-white/90 p-2 text-black hover:bg-red-500 hover:text-white transition-colors z-10"
            title="Delete Artwork"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        )}
      </div>

      <div className="flex justify-between items-start pt-2">
        <div>
          <h3 className="font-serif text-lg font-medium leading-tight">{artwork.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wider text-[0.7rem]">{artwork.artist}</p>
        </div>
        <div className="text-right">
          <span className="font-medium text-sm block">${artwork.price.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}
