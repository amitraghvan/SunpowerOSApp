import React from 'react';
import Link from 'next/link';
import { SunpowerLogo } from './sunpower-logo';

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#242531] text-[#A0A8B8] pt-16 pb-12 border-t border-slate-700">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-700/60">
          {/* Brand Block */}
          <div className="lg:col-span-2 space-y-4">
            <SunpowerLogo theme="dark" size="md" showTagline />
            <p className="text-sm text-[#A0A8B8] max-w-sm mt-3 leading-relaxed">
              Solar Operations, Connected. SunPowerOS is the purpose-built operating platform for solar EPC contractors and installers in India.
            </p>
            <div className="pt-2 text-xs text-[#737B8B]">
              A Product of <span className="text-white font-medium">SunPower Solutions</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#crm" className="hover:text-white transition-colors">
                  CRM & Leads
                </Link>
              </li>
              <li>
                <Link href="#customer-360" className="hover:text-white transition-colors">
                  Customer 360
                </Link>
              </li>
              <li>
                <Link href="#survey" className="hover:text-white transition-colors">
                  Site Surveys
                </Link>
              </li>
              <li>
                <Link href="#engineering" className="hover:text-white transition-colors">
                  Solar Engineering
                </Link>
              </li>
              <li>
                <Link href="#quotations" className="hover:text-white transition-colors">
                  Quotations & Pricing
                </Link>
              </li>
              <li>
                <Link href="#ecosystem" className="hover:text-white transition-colors">
                  Application Grid
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/solutions" className="hover:text-white transition-colors">
                  Solar Solutions
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-white transition-colors">
                  Trust & Security
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">
                  Create Workspace
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Enterprise Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Legal */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-[#737B8B]">Documentation (Internal)</span>
              </li>
              <li>
                <span className="text-[#737B8B]">API Specifications</span>
              </li>
              <li>
                <span className="text-[#737B8B]">PM Surya Ghar Scheme</span>
              </li>
              <li>
                <span className="text-[#737B8B]">Privacy Policy</span>
              </li>
              <li>
                <span className="text-[#737B8B]">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737B8B]">
          <div>
            © {currentYear} SunPower Solutions. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Built for Indian Solar EPC Contractors</span>
            <span>•</span>
            <span>Zero Mock Data Invariant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
