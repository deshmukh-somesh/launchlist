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
  title = "PDFaskAI - Chat with PDFs Using Advanced AI | Free PDF Analysis Tool",
  description = "Transform how you interact with PDFs using PDFaskAI. Upload any PDF and get instant, AI-powered insights and answers. Advanced document analysis, free to use, and secure. Perfect for students, researchers, and professionals.",
  image = "/thumbnail.png",
  icons = "/icon.ico",
  noIndex = false,
  keywords = "PDF chat, AI PDF analysis, document analysis, PDF assistant, AI document reader, PDF question answering, free PDF tool, PDFaskAI"
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
          alt:'PDFaskAI - AI-Powered PDF Analysis Tool'
        }
      ], 
      type:'website', 
      siteName: 'PDFaskAI', 
      locale:'en_US'
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@pdfaskai",
      site: "@pdfaskai",
    },
    icons,
    // metadataBase: new URL('https://pdfaskai.vercel.app/'),
    metadataBase: new URL('https://pdfaskai.com/'),
    alternates: {
      canonical: 'https://pdfaskai.com/'
    },
    authors:[{
      name: 'PDFaskAI Team',
      url: 'https://pdfaskai.com/'
    }],
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  }
}
