// components/Footer.tsx
"use client";

import Link from "next/link";
import { Github, Twitter, Heart, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#2A2B3C] bg-[#151725]">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#6E3AFF] to-[#2563EB] text-transparent bg-clip-text">
              Product Launches
            </h3>
            <p className="text-sm text-gray-400">
              Discover & share amazing digital products with the world.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com/DeshmukhSomesh7"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#6E3AFF] transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#6E3AFF] transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#6E3AFF] transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>

            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Products</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Latest Products
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Launch Product
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              {/* <li>
                <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li> */}
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/refund" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-[#2A2B3C] flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Product Launches. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 flex items-center mt-4 sm:mt-0">
            Made with <Heart className="h-4 w-4 text-[#6E3AFF] mx-1" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}