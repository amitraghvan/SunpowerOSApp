'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { MarketingNavbar } from '@/components/marketing/marketing-navbar';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Building,
  HelpCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    systemCapacity: '1-10 kW (Residential)',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await ApiClient.submitPublicEnquiry({
        name: formState.name,
        email: formState.email,
        company: formState.company,
        phone: formState.phone,
        projectCapacity: formState.systemCapacity,
        message: formState.message,
        sourceUrl: typeof window !== 'undefined' ? window.location.href : '/contact',
      });

      if (res?.referenceNumber) {
        setReferenceNumber(res.referenceNumber);
      }
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="marketing-root min-h-screen bg-white text-[#202536] flex flex-col">
      <MarketingNavbar />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="py-20 bg-[#F4F4F6] border-b border-[#E4E5E9]">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EAF0] text-[#714B67] text-xs font-bold tracking-wide uppercase mb-4">
              <span>Connect with SunPower Solutions</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[#151A2B] leading-tight max-w-4xl mx-auto">
              Let&apos;s talk about your solar operations.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#475065] max-w-2xl mx-auto leading-relaxed">
              Have questions about deploying SunPowerOS for your solar EPC business? Reach out to our solution specialists.
            </p>
          </div>
        </section>

        {/* Form and Contact Info Grid */}
        <section className="py-20 md:py-28">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left Column: Contact Details */}
              <div className="lg:col-span-5 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-[#151A2B]">SunPower Solutions</h2>
                  <p className="text-sm text-[#737B8B] mt-1">
                    Solar EPC Operating Systems & Commercial Cloud Platforms
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F1EAF0] text-[#714B67] flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#151A2B]">Headquarters</h3>
                      <p className="text-xs text-[#737B8B] mt-0.5 leading-relaxed">
                        Cyber City, Sector 24, Gurugram, Haryana 122002, India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#06C6AE] flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#151A2B]">Email Inquiries</h3>
                      <p className="text-xs text-[#737B8B] mt-0.5">
                        contact@sunpowersolutions.in
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#FFB32C] flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#151A2B]">Operational Support</h3>
                      <p className="text-xs text-[#737B8B] mt-0.5">
                        Mon – Sat, 9:00 AM – 6:30 PM IST
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#F8F8FA] rounded-2xl border border-[#E4E5E9] space-y-3">
                  <h4 className="font-bold text-sm text-[#151A2B] flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#714B67]" />
                    <span>Ready for Self-Service?</span>
                  </h4>
                  <p className="text-xs text-[#737B8B] leading-relaxed">
                    You can register your solar organization immediately without waiting for a sales call. Create your workspace now.
                  </p>
                  <Link href="/signup" className="btn-secondary !py-2 !px-4 text-xs font-semibold inline-flex">
                    <span>Create Organization Free</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-[#E4E5E9] shadow-sm">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#151A2B]">Enquiry Received</h3>
                    {referenceNumber && (
                      <div className="inline-block px-4 py-2 rounded-xl bg-[#F1EAF0] text-[#714B67] font-mono font-bold text-sm tracking-wide">
                        Reference ID: {referenceNumber}
                      </div>
                    )}
                    <p className="text-sm text-[#737B8B] max-w-md mx-auto leading-relaxed">
                      Thank you for contacting SunPower Solutions. Your enquiry has been routed directly to our commercial solar engineering team.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setReferenceNumber('');
                        setFormState({
                          name: '',
                          email: '',
                          company: '',
                          phone: '',
                          systemCapacity: '1-10 kW (Residential)',
                          message: '',
                        });
                      }}
                      className="btn-secondary !py-2 !px-6 text-xs mt-4"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="text-xl font-bold text-[#151A2B] mb-2">Send an Inquiry</h3>

                    {errorMessage && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E5E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                          placeholder="e.g. Vikram Sharma"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E5E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                          placeholder="vikram@solarepc.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.company}
                          onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E5E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                          placeholder="Solar Horizons EPC"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formState.phone}
                          onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E5E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
                        Typical Project Capacity
                      </label>
                      <select
                        value={formState.systemCapacity}
                        onChange={(e) => setFormState({ ...formState, systemCapacity: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E5E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67] bg-white"
                      >
                        <option value="1-10 kW (Residential)">1–10 kW (Residential Rooftop)</option>
                        <option value="10-50 kW (Commercial)">10–50 kW (Commercial & Institutional)</option>
                        <option value="50-500 kW (Industrial)">50–500 kW (Industrial & Large Rooftop)</option>
                        <option value="500+ kW (MW Scale)">500+ kW (Ground Mount / Utility / Multi-site)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#151A2B] mb-1.5">
                        How can we help? *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E5E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                        placeholder="Tell us about your team size, monthly installation volume, or current software challenges..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full !py-3 font-semibold text-sm justify-center disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          <span>Routing Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          <span>Submit Inquiry</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
