import { Toaster } from "@/components/ui/toaster";
import { cn, constructMetadata } from "@/lib/utils";
import { Inter } from "next/font/google";
import "react-loading-skeleton/dist/skeleton.css";
import "simplebar-react/dist/simplebar.min.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Metadata } from 'next'
import Script from 'next/script'

// Initialize the font - keeping Inter for clean typography
const inter = Inter({ subsets: ["latin"] });

// Export metadata using constructMetadata function
export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          defer
          data-website-id="67a45af3ffcad047bba3873c"
          data-domain="www.productlaunches.in"
          src="https://datafa.st/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <Providers>
        <body
          className={cn(
            "min-h-screen font-sans antialiased grainy",
            "bg-[#0A0B14] text-white relative",
            "selection:bg-[#6E3AFF] selection:text-white",
            "scrollbar-track-blue-lighter scrollbar-thumb-blue scrollbar-thumb-rounded",
            inter.className
          )}
        >
          {/* Custom toaster styles for dark theme */}
          <Toaster />
          
          {/* Main navigation */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <Navbar />
          </div>

          {/* Main content with proper spacing */}
          <div className="pt-16"> {/* Add padding to account for fixed navbar */}
            {children}
          </div>

          {/* Background gradient effect */}
          <div className="fixed inset-0 bg-[#6E3AFF] opacity-5 pointer-events-none" 
               style={{
                 backgroundImage: 'radial-gradient(circle at top right, #6E3AFF 0%, transparent 70%)',
               }} 
          />
        </body>
      </Providers>
    </html>
  );
}