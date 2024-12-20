`https://claude.ai/chat/19bf8334-f83e-451c-8033-1f38852a90a1`

import { type ClassValue, clsx } from 'clsx'
import { Metadata } from 'next'
import { twMerge } from 'tailwind-merge'

// Utility function for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate absolute URLs
export function absoluteUrl(path: string) {
  if (typeof window !== 'undefined') return path
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}${path}`
  return `http://localhost:${process.env.PORT ?? 3000}${path}`
}

// Construct metadata for SEO
export function constructMetadata({
  title = "Product Launches - Discover & Share Exciting New Product Launches in India",
  description = "Join India's premier product launch community. Discover innovative products, share launches, engage with founders, and stay ahead of the latest trends. Your go-to platform for product launches, founder stories, and early-access opportunities.",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false,
  keywords = "product launches, Indian startups, new products, product discovery, startup community, product hunt india, tech products, startup launches, founder stories, early access"
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
  keywords?: string
} = {}): Metadata {
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: 'Product Launches - Indian Product Discovery Platform'
        }
      ],
      type: 'website',
      siteName: 'Product Launches',
      locale: 'en_IN'
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@productlaunchesin",
      site: "@productlaunchesin",
    },
    icons,
    metadataBase: new URL('https://www.productlaunches.in'),
    alternates: {
      canonical: 'https://www.productlaunches.in'
    },
    authors: [{
      name: 'Product Launches Team',
      url: 'https://www.productlaunches.in'
    }],
    verification: {
      google: "your-google-verification-code", // Add your Google Search Console verification code
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    // Additional metadata for better SEO
    category: 'Technology',
    classification: 'Business & Technology',
    creator: 'Product Launches Team',
    publisher: 'Product Launches India',
    formatDetection: {
      telephone: false,
      date: false,
      address: false,
      email: true,
    },
    other: {
      'google-site-verification': 'your-google-verification-code', // Add your verification code
    }
  }
}