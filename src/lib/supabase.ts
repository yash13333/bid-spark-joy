import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export { supabase };

export type { User, Session };

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  starting_price: number;
  current_price: number;
  auction_end: string;
  status: 'active' | 'sold' | 'expired' | 'cancelled';
  winner_id: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  seller?: Profile;
}

export interface Bid {
  id: string;
  product_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
  bidder?: Profile;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'sale' | 'refund';
  amount: number;
  description: string | null;
  product_id: string | null;
  created_at: string;
}
