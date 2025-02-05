import { type ClassValue, clsx } from 'clsx'
import { Metadata } from 'next'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  if (typeof window !== 'undefined') return path
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}${path}`
  return `http://localhost:${process.env.PORT ?? 3000
    }${path}`
}

export function constructMetadata({
  title = "ProductLaunches - Discover & Vote on Today's Best Products | Daily Product Launch Platform",
  description = "Join ProductLaunches to discover and vote on the most exciting product launches every day. A community-driven platform showcasing innovative startups, tools, and apps. Launch your product, get feedback, and connect with early adopters.",
  image = "/thumbnail.png",
  icons = "/favicon-96x96.png",
  noIndex = false,
  keywords = "product launches, product hunt alternative, startup launches, daily products, tech products, indie makers, product discovery, startup community, product feedback, launch platform, new products, product voting"
}: {
  title?:string
  description?:string
  image?:string
  icons?:string
  noIndex?:boolean
  keywords?:string
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
          alt:'Product Launches - Discover & Vote on Today\'s Best Products'
        }
      ], 
      type:'website', 
      siteName: 'Product Launches', 
      locale:'en_US'
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@productlaunches",
      site: "@productlaunches",
    },
    icons,
    // metadataBase: new URL('https://pdfaskai.vercel.app/'),
    metadataBase: new URL('https://www.productlaunches.in/'),
    alternates: {
      canonical: 'https://www.productlaunches.in/'
    },
    authors:[{
      name: 'ProductLaunches Team',
      url: 'https://www.productlaunches.in/'
    }],
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  }
}
