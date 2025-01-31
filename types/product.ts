export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  thumbnail: string | null;
  createdAt: string | Date;
  launchDate: string | Date;
  website: string;
  isLaunched: boolean;
  categories: {
    category: {
      id: string;
      name: string;
    };
  }[];
  maker: {
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
    twitter: string | null;
  };
  _count?: {
    votes: number;
    comments: number;
  };
  rank?: number;
  isTied?: boolean | null;
}

export interface WinnerProduct extends Product {
  rank: number;
  isTied: boolean | null;
} 