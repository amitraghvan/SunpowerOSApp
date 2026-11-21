'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SunpowerLogo } from '@/components/marketing/sunpower-logo';
import { ApiClient } from '@/lib/api-client';
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  // Multi-step form state
  const [step, setStep] = useState<1 | 2>(1);

  // User fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Workspace fields
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [businessCategory, setBusinessCategory] = useState('SOLAR_EPC');
  const [state, setState] = useState('Delhi');
  const [city, setCity] = useState('New Delhi');
  const [country, setCountry] = useState('India');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [currency, setCurrency] = useState('INR');

  // Consents
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(true);

  // Interaction & Error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from organization name
  const handleOrgNameChange = (val: string) => {
    setOrganizationName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setOrganizationSlug(slug);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required user fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName) {
      setError('Please specify your solar company name.');
      return;
    }
    if (!termsAccepted || !privacyAccepted) {
      setError('Please accept the terms and privacy policy.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await ApiClient.register({
        firstName,
        lastName,
        email,
        password,
        phone: phone || undefined,
        country,
        organizationName,
        organizationSlug: organizationSlug || undefined,
        businessCategory,
        city,
        state,
        timezone,
        currency,
        termsAccepted,
        privacyAccepted,
      });

      if (res && res.user) {
        // Successfully registered and logged in
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#714B67] selection:text-white">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6">
        <Link href="/" className="focus:outline-none">
          <SunpowerLogo size="md" showTagline />
        </Link>
        <div className="text-xs sm:text-sm text-[#475065]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#714B67] hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-xl mx-auto w-full bg-white rounded-2xl border border-[#E4E5E9] shadow-lg p-6 sm:p-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E4E5E9]">
          <div className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1 ? 'bg-[#714B67] text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {step === 1 ? '1' : '✓'}
            </div>
            <span className={`text-xs font-bold ${step === 1 ? 'text-[#151A2B]' : 'text-[#737B8B]'}`}>
              Personal Account
            </span>
          </div>

          <div className="w-12 h-0.5 bg-[#E4E5E9]" />

          <div className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2 ? 'bg-[#714B67] text-white' : 'bg-slate-100 text-[#737B8B]'
              }`}
            >
              2
            </div>
            <span className={`text-xs font-bold ${step === 2 ? 'text-[#151A2B]' : 'text-[#737B8B]'}`}>
              Solar Workspace
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: USER DETAILS */
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#151A2B]">Create your user account</h2>
              <p className="text-xs text-[#737B8B] mt-1">
                You will be assigned as the Organization Administrator of your new workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#151A2B] mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#737B8B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Rajesh"
                    className="w-full pl-9 pr-3 py-2 border border-[#E4E5E9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#151A2B] mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sharma"
                  className="w-full px-3 py-2 border border-[#E4E5E9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A2B] mb-1">
                Work Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#737B8B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajesh@sunpowersolutions.in"
                  className="w-full pl-9 pr-3 py-2 border border-[#E4E5E9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A2B] mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#737B8B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98110 00000"
                  className="w-full pl-9 pr-3 py-2 border border-[#E4E5E9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A2B] mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737B8B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-10 py-2 border border-[#E4E5E9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737B8B] hover:text-[#151A2B]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="btn-primary w-full !py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <span>Continue to Workspace Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: WORKSPACE SETUP */
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#151A2B]">Set up your solar workspace</h2>
              <p className="text-xs text-[#737B8B] mt-1">
                Create the dedicated tenant workspace for your solar installation business.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A2B] mb-1">
                Company / Organization Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#737B8B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  placeholder="e.g. Apex Solar Energy Systems"
                  className="w-full pl-9 pr-3 py-2 border border-[#E4E5E9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A2B] mb-1">
                Workspace Slug URL
              </label>
              <div className="flex rounded-lg border border-[#E4E5E9] overflow-hidden text-xs">
                <span className="bg-[#F8F8FA] px-3 py-2 text-[#737B8B] border-r border-[#E4E5E9]">
                  sunpoweros.in/
                </span>
                <input
                  type="text"
                  required
                  value={organizationSlug}
                  onChange={(e) => setOrganizationSlug(e.target.value.toLowerCase().trim())}
                  placeholder="apex-solar"
                  className="flex-1 px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#151A2B] mb-1">
                  Business Category
                </label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E4E5E9] rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                >
                  <option value="SOLAR_EPC">Solar EPC Contractor</option>
                  <option value="RESIDENTIAL_INSTALLER">Residential Rooftop Installer</option>
                  <option value="COMMERCIAL_INDUSTRIAL">Commercial & Industrial (C&I)</option>
                  <option value="EQUIPMENT_DISTRIBUTOR">Solar Equipment Distributor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#151A2B] mb-1">
                  Operating State (HQ)
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Delhi / Rajasthan / Maharashtra"
                  className="w-full px-3 py-2 border border-[#E4E5E9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8F8FA] p-3 rounded-xl border border-[#E4E5E9]">
              <div>
                <span className="text-[#737B8B] block mb-0.5">Operating Currency:</span>
                <span className="font-bold text-[#151A2B]">INR (₹)</span>
              </div>
              <div>
                <span className="text-[#737B8B] block mb-0.5">Default Timezone:</span>
                <span className="font-bold text-[#151A2B]">Asia/Kolkata (IST)</span>
              </div>
            </div>

            {/* Terms and Privacy Checkboxes */}
            <div className="space-y-2 pt-2 text-xs text-[#475065]">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-[#714B67] focus:ring-[#714B67]"
                />
                <span>
                  I accept the SunPower Solutions <span className="font-semibold text-[#714B67]">Terms of Service</span>.
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-[#714B67] focus:ring-[#714B67]"
                />
                <span>
                  I accept the <span className="font-semibold text-[#714B67]">Privacy Policy</span> and agree to data processing.
                </span>
              </label>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary !py-2.5 !px-4 text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1 !py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Initializing Workspace...</span>
                ) : (
                  <>
                    <span>Create Free Workspace</span>
                    <Sparkles className="w-4 h-4 text-[#FFB32C]" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer Microcopy */}
      <div className="text-center text-xs text-[#737B8B] mt-8">
        © {new Date().getFullYear()} SunPower Solutions. Multi-tenant secure ERP.
      </div>
    </div>
  );
}
