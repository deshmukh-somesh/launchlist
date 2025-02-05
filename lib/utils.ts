// import { type ClassValue, clsx } from 'clsx'
// import { Metadata } from 'next'
// import { twMerge } from 'tailwind-merge'

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

// export function absoluteUrl(path: string) {
//   if (typeof window !== 'undefined') return path
//   if (process.env.VERCEL_URL)
//     return `https://${process.env.VERCEL_URL}${path}`
//   return `http://localhost:${process.env.PORT ?? 3000
//     }${path}`
// }

// export function constructMetadata({
//   title = "ProductLaunches - Discover & Vote on Today's Best Products | Daily Product Launch Platform",
//   description = "Join ProductLaunches to discover and vote on the most exciting product launches every day. A community-driven platform showcasing innovative startups, tools, and apps. Launch your product, get feedback, and connect with early adopters.",
//   image = "/thumbnail.png",
//   icons = "/favicon-96x96.png",
//   noIndex = false,
//   keywords = "product launches, product hunt alternative, startup launches, daily products, tech products, indie makers, product discovery, startup community, product feedback, launch platform, new products, product voting"
// }: {
//   title?:string
//   description?:string
//   image?:string
//   icons?:string
//   noIndex?:boolean
//   keywords?:string
// } = {}): Metadata {
//   return {
//     title,
//     description,
//     keywords,
//     openGraph: {
//       title,
//       description,
//       images: [
//         {
//           url: image,
//           width: 1200, 
//           height: 630,
//           alt:'Product Launches - Discover & Vote on Today\'s Best Products'
//         }
//       ], 
//       type:'website', 
//       siteName: 'Product Launches', 
//       locale:'en_US'
//     },
//     twitter: {
//       card: "summary_large_image",
//       title,
//       description,
//       images: [image],
//       creator: "@productlaunches",
//       site: "@productlaunches",
//     },
//     icons,
//     // metadataBase: new URL('https://pdfaskai.vercel.app/'),
//     metadataBase: new URL('https://www.productlaunches.in/'),
//     alternates: {
//       canonical: 'https://www.productlaunches.in/'
//     },
//     authors:[{
//       name: 'ProductLaunches Team',
//       url: 'https://www.productlaunches.in/'
//     }],
//     ...(noIndex && {
//       robots: {
//         index: false,
//         follow: false
//       }
//     })
//   }
// }


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
  return `http://localhost:${process.env.PORT ?? 3000}${path}`
}

// Enhanced meta description templates for better CTR
const descriptionTemplates = {
  default: "Join ProductLaunches to discover and vote on the most exciting product launches every day. A community-driven platform showcasing innovative startups, tools, and apps.",
  product: "Discover {productName} on ProductLaunches - {shortDescription}. Vote, provide feedback, and connect with the makers.",
  category: "Explore the best {category} products on ProductLaunches. Daily curated launches of {category} tools, apps, and solutions.",
}

// Structured schema types for rich results
export const generateStructuredData = (type: 'website' | 'product' | 'organization', data: any) => {
  const schemas = {
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ProductLaunches",
      url: "https://www.productlaunches.in/",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.productlaunches.in/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ProductLaunches",
      url: "https://www.productlaunches.in/",
      logo: "https://www.productlaunches.in/logo.png",
      sameAs: [
        "https://twitter.com/productlaunches",
        "https://linkedin.com/company/productlaunches"
      ]
    },
    product: {
      "@context": "https://schema.org",
      "@type": "Product",
      ...data
    }
  }
  return schemas[type]
}

export function constructMetadata({
  title = "ProductLaunches - Discover & Vote on Today's Best Products | Daily Product Launch Platform",
  description = descriptionTemplates.default,
  image = "/thumbnail.png",
  icons = "/favicon-96x96.png",
  noIndex = false,
  keywords = "product launches, product hunt alternative, startup launches, daily products, tech products, indie makers, product discovery, startup community, product feedback, launch platform, new products, product voting, tech startups, software products, digital products, saas products",
  type = 'website' as const,
  publishedTime,
  modifiedTime,
  category,
  tags = [],
  locale = 'en_US'
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
  keywords?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  category?: string
  tags?: string[]
  locale?: string
} = {}): Metadata {
  const siteUrl = 'https://www.productlaunches.in'
  
  return {
    title,
    description,
    keywords,
    applicationName: 'ProductLaunches',
    referrer: 'origin-when-cross-origin',
    // Recommended robots directives
    robots: {
      index: !noIndex,
      follow: !noIndex,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: 'ProductLaunches',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale,
      type: type as 'website' | 'article',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(category && { category }),
      ...(tags.length > 0 && { tags })
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@productlaunches",
      site: "@productlaunches",
    },
    icons: {
      icon: icons,
      shortcut: icons,
      apple: icons,
      other: {
        rel: 'apple-touch-icon-precomposed',
        url: icons,
      },
    },
    verification: {
      google: 'google-site-verification-code',
      yandex: 'yandex-verification-code',
      me: ['mailto:team@productlaunches.in']
    },
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: siteUrl,
      languages: {
        'en-US': '/en-US',
        'es-ES': '/es-ES',
      },
    },
    authors: [{
      name: 'ProductLaunches Team',
      url: siteUrl
    }],
    publisher: 'ProductLaunches',
    formatDetection: {
      telephone: false
    }
  }
}

// Helper function for generating dynamic meta descriptions
export function generateMetaDescription(template: keyof typeof descriptionTemplates, replacements: Record<string, string>) {
  let description = descriptionTemplates[template]
  Object.entries(replacements).forEach(([key, value]) => {
    description = description.replace(`{${key}}`, value)
  })
  return description
}