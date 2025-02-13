import { create } from 'zustand';
import { OramaClient } from "@oramacloud/client";

const client = new OramaClient({
  endpoint: process.env.EXPO_PUBLIC_ORAMA_ENDPOINT as string,
  api_key: process.env.EXPO_PUBLIC_ORAMA_API_KEY as string,
});

const formatImageUrl = (imageArray: string[]) => {
  const allUrls = imageArray.join('').split('~');
  const laydownUrl = allUrls.find(url => url.includes('laydown.jpg')) || allUrls[0];
  
  return laydownUrl
    .replace('w_600f_autoq_auto', 'w_600,f_auto,q_auto,fl_lossy,c_fill,g_auto');
};

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  brand: string;
  color: string;
  images: string[];
  original_price: number;
  selling_price: number;
  average_rating: number;
  reviews_count: number;
}

interface StoreState {
  products: Product[];
  searchQuery: string;
  selectedCategory: string | null;
  priceRange: [number, number];
  isLoading: boolean;
  error: string | null;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setPriceRange: (range: [number, number]) => void;
  searchProducts: (term?: string) => Promise<void>;
  loadInitialProducts: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  products: [],
  searchQuery: '',
  selectedCategory: null,
  priceRange: [0, 1000],
  isLoading: false,
  error: null,
  setSearchQuery: async (query) => {
    set({ searchQuery: query });
    await get().searchProducts(query);
  },
  setSelectedCategory: async (category) => {
    set({ selectedCategory: category });
    await get().searchProducts(get().searchQuery);
  },
  setPriceRange: (range) => set({ priceRange: range }),
  searchProducts: async (term = '') => {
    try {
      set({ isLoading: true, error: null });
      const results = await client.search({
        term,
        mode: "fulltext",
        where: get().selectedCategory ? {
          category: get().selectedCategory
        } : undefined,
        limit: 50
      });

      const formattedProducts = results.hits.map(hit => {
        const images = (hit.document.images as string[]);
        
        return {
          id: hit.document.id as string,
          name: hit.document.name as string,
          price: hit.document.selling_price as number,
          description: hit.document.description as string,
          image: formatImageUrl(images),
          category: hit.document.category as string,
          brand: hit.document.brand as string,
          color: hit.document.color as string,
          images: images.map(img => img.split('~')[0]),
          original_price: hit.document.original_price as number,
          selling_price: hit.document.selling_price as number,
          average_rating: hit.document.average_rating as number,
          reviews_count: hit.document.reviews_count as number,
        };
      });

      set({ products: formattedProducts });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  loadInitialProducts: async () => {
    await get().searchProducts();
  }
}));