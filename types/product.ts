export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  thumbnail: string | null;
  createdAt: string;
  launchDate: string;
  categories: {
    id: string;
    name: string;
  }[];
  maker: {
    name: string | null;
    avatarUrl: string | null;
  };
  _count: {
    votes: number;
  };
} 