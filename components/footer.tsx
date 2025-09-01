"use client"

import { ContactDialog } from "./contact-dialog"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-16 px-6 relative">
      {/* Minimal section divider */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-white/60 text-sm font-light">Located in San Francisco, CA</p>
        </div>

        {/* Bottom - ultra minimal */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <p className="text-white/40 text-xs font-light">© 2024 APEX VERIFY</p>
            <ContactDialog>
              <button className="text-white/40 hover:text-white/60 text-xs font-light transition-colors">
                CONTACT US
              </button>
            </ContactDialog>
            <Link
              href="/privacy-policy"
              className="text-white/40 hover:text-white/60 text-xs font-light transition-colors"
            >
              PRIVACY POLICY
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white/40 text-xs font-light">SYSTEM OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
