'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SunpowerLogo } from './sunpower-logo';
import {
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Users,
  Sun,
  ClipboardList,
  FileText,
  FileSignature,
  ShoppingCart,
  Truck,
  Boxes,
  Shield,
  Layers,
  HelpCircle,
  BookOpen
} from 'lucide-react';

export function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <header className="sticky top-0 z-50 h-[74px] bg-white/95 backdrop-blur-md border-b border-[#E4E5E9]/80 transition-all">
      <div className="max-w-[1320px] mx-auto h-full px-5 lg:px-8 flex items-center justify-between gap-6" ref={dropdownRef}>
        {/* Brand Logo */}
        <Link href="/" className="shrink-0 flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#714B67] rounded-lg">
          <SunpowerLogo size="md" showTagline />
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* Platform Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('platform')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                activeDropdown === 'platform' ? 'text-[#714B67] bg-[#F1EAF0]/60' : 'text-[#202536] hover:text-[#714B67] hover:bg-[#F4F4F6]'
              }`}
              aria-expanded={activeDropdown === 'platform'}
            >
              <span>Platform</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'platform' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'platform' && (
              <div className="absolute top-full left-0 mt-2 w-[680px] bg-white rounded-2xl border border-[#E4E5E9] shadow-xl p-6 grid grid-cols-3 gap-6 animate-in fade-in-50 zoom-in-95 duration-150">
                {/* Column 1: Commercial */}
                <div>
                  <h4 className="text-[11px] font-bold text-[#714B67] tracking-wider uppercase mb-3">Commercial</h4>
                  <ul className="space-y-2.5">
                    <li>
                      <Link
                        href="#crm"
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-[#F4F4F6] transition-colors"
                      >
                        <Users className="w-4 h-4 text-[#714B67] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-[#151A2B] group-hover:text-[#714B67]">CRM & Leads</div>
                          <div className="text-xs text-[#737B8B]">Opportunity pipeline</div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#customer-360"
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-[#F4F4F6] transition-colors"
                      >
                        <Layers className="w-4 h-4 text-[#06C6AE] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-[#151A2B] group-hover:text-[#714B67]">Customer 360</div>
                          <div className="text-xs text-[#737B8B]">Sites & activities</div>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Technical & Sales */}
                <div>
                  <h4 className="text-[11px] font-bold text-[#714B67] tracking-wider uppercase mb-3">Technical & Engineering</h4>
                  <ul className="space-y-2.5">
                    <li>
                      <Link
                        href="#survey"
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-[#F4F4F6] transition-colors"
                      >
                        <ClipboardList className="w-4 h-4 text-[#FF747C] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-[#151A2B] group-hover:text-[#714B67]">Site Surveys</div>
                          <div className="text-xs text-[#737B8B]">Roof & electrical audit</div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#engineering"
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-[#F4F4F6] transition-colors"
                      >
                        <Sun className="w-4 h-4 text-[#FFB32C] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-[#151A2B] group-hover:text-[#714B67]">Engineering & BOM</div>
                          <div className="text-xs text-[#737B8B]">Array sizing & bill of materials</div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#quotations"
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-[#F4F4F6] transition-colors"
                      >
                        <FileText className="w-4 h-4 text-[#36B9F6] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-[#151A2B] group-hover:text-[#714B67]">Quotations & Sales</div>
                          <div className="text-xs text-[#737B8B]">GST proposals & contracts</div>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 3: Operations & Supply Chain */}
                <div className="border-l border-[#E4E5E9] pl-6">
                  <h4 className="text-[11px] font-bold text-[#714B67] tracking-wider uppercase mb-3">Supply Chain</h4>
                  <ul className="space-y-2.5">
                    <li>
                      <Link
                        href="#ecosystem"
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-[#F4F4F6] transition-colors"
                      >
                        <Truck className="w-4 h-4 text-[#06C6AE] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-[#151A2B] group-hover:text-[#714B67]">Procurement</div>
                          <div className="text-xs text-[#737B8B]">MRP, RFQs & POs</div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#ecosystem"
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-[#F4F4F6] transition-colors"
                      >
                        <Boxes className="w-4 h-4 text-[#FF747C] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-[#151A2B] group-hover:text-[#714B67]">GRN & Serials</div>
                          <div className="text-xs text-[#737B8B]">Inward barcode tracking</div>
                        </div>
                      </Link>
                    </li>
                  </ul>
                  <div className="mt-4 pt-3 border-t border-[#E4E5E9]">
                    <Link
                      href="#ecosystem"
                      onClick={() => setActiveDropdown(null)}
                      className="text-xs font-semibold text-[#714B67] hover:text-[#58394F] inline-flex items-center gap-1"
                    >
                      <span>Explore all 18 apps</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Solutions Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('solutions')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                activeDropdown === 'solutions' ? 'text-[#714B67] bg-[#F1EAF0]/60' : 'text-[#202536] hover:text-[#714B67] hover:bg-[#F4F4F6]'
              }`}
              aria-expanded={activeDropdown === 'solutions'}
            >
              <span>Solutions</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'solutions' && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-[#E4E5E9] shadow-xl p-4 space-y-1 animate-in fade-in-50 zoom-in-95 duration-150">
                <Link
                  href="/solutions"
                  onClick={() => setActiveDropdown(null)}
                  className="block p-2.5 rounded-lg hover:bg-[#F4F4F6] text-sm font-medium text-[#151A2B] hover:text-[#714B67]"
                >
                  Solar EPC Companies
                  <div className="text-xs text-[#737B8B] font-normal">Full-lifecycle operations</div>
                </Link>
                <Link
                  href="/solutions"
                  onClick={() => setActiveDropdown(null)}
                  className="block p-2.5 rounded-lg hover:bg-[#F4F4F6] text-sm font-medium text-[#151A2B] hover:text-[#714B67]"
                >
                  Residential Solar Providers
                  <div className="text-xs text-[#737B8B] font-normal">PM Surya Ghar subsidy & fast quotes</div>
                </Link>
                <Link
                  href="/solutions"
                  onClick={() => setActiveDropdown(null)}
                  className="block p-2.5 rounded-lg hover:bg-[#F4F4F6] text-sm font-medium text-[#151A2B] hover:text-[#714B67]"
                >
                  Commercial & Industrial Solar
                  <div className="text-xs text-[#737B8B] font-normal">Complex SLD & BOM planning</div>
                </Link>
              </div>
            )}
          </div>

          {/* Direct Links */}
          <Link
            href="/features"
            className="px-3 py-2 rounded-lg text-sm font-medium text-[#202536] hover:text-[#714B67] hover:bg-[#F4F4F6] transition-colors"
          >
            Features
          </Link>
          <Link
            href="/security"
            className="px-3 py-2 rounded-lg text-sm font-medium text-[#202536] hover:text-[#714B67] hover:bg-[#F4F4F6] transition-colors"
          >
            Security
          </Link>
          <Link
            href="/contact"
            className="px-3 py-2 rounded-lg text-sm font-medium text-[#202536] hover:text-[#714B67] hover:bg-[#F4F4F6] transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-[#202536] hover:text-[#714B67] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#714B67] rounded-lg"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="btn-primary text-sm font-semibold !py-2.5 !px-5 !min-h-[42px]"
          >
            Start Free
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#202536] hover:bg-[#F4F4F6] focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[74px] bg-white border-b border-[#E4E5E9] shadow-2xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="space-y-2">
            <Link
              href="#crm"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#202536] hover:bg-[#F4F4F6]"
            >
              CRM & Sales Pipeline
            </Link>
            <Link
              href="#survey"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#202536] hover:bg-[#F4F4F6]"
            >
              Site Surveys
            </Link>
            <Link
              href="#engineering"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#202536] hover:bg-[#F4F4F6]"
            >
              Solar Engineering & BOM
            </Link>
            <Link
              href="#quotations"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#202536] hover:bg-[#F4F4F6]"
            >
              Quotations & Contracts
            </Link>
            <Link
              href="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#202536] hover:bg-[#F4F4F6]"
            >
              All Features
            </Link>
            <Link
              href="/solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#202536] hover:bg-[#F4F4F6]"
            >
              Solutions
            </Link>
            <Link
              href="/security"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#202536] hover:bg-[#F4F4F6]"
            >
              Trust & Security
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#202536] hover:bg-[#F4F4F6]"
            >
              Contact Us
            </Link>
          </nav>

          <div className="pt-4 border-t border-[#E4E5E9] flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-secondary text-center w-full !py-2.5 !min-h-[46px]"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary text-center w-full !py-2.5 !min-h-[46px]"
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
