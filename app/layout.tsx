
import { Toaster } from "@/components/ui/toaster";
import { cn, constructMetadata } from "@/lib/utils";
import { Inter } from "next/font/google";
import "react-loading-skeleton/dist/skeleton.css";
import "simplebar-react/dist/simplebar.min.css";
import "./globals.css";
// import { Footer } from "@/components/Footer";
// import { OnboardingTour } from "@/components/OnboardingTour";

// Initialize the font
const inter = Inter({ subsets: ["latin"] });

// Export metadata using constructMetadata function
export const metadata = constructMetadata();
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

// Root layout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
              <Providers>
        <body
          className={cn(
            "min-h-screen font-sans antialiased grainy relative",
            inter.className
          )}
        >
          <Toaster />
          <Navbar />
          {children}
          {/* <OnboardingTour /> */}
          
        {/* <Footer /> */}
        </body>
      </Providers>
    </html>
  );
}
