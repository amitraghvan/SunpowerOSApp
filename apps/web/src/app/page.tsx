import React from 'react';
import type { Metadata } from 'next';
import { MarketingNavbar } from '@/components/marketing/marketing-navbar';
import { HeroSection } from '@/components/marketing/hero-section';
import { WorkflowSection } from '@/components/marketing/workflow-section';
import { CrmShowcaseSection } from '@/components/marketing/crm-showcase-section';
import { ActivityFlowSection } from '@/components/marketing/activity-flow-section';
import { CommunicationSection } from '@/components/marketing/communication-section';
import { CustomerShowcaseSection } from '@/components/marketing/customer-showcase-section';
import { SurveyShowcaseSection } from '@/components/marketing/survey-showcase-section';
import { EngineeringShowcaseSection } from '@/components/marketing/engineering-showcase-section';
import { QuotationShowcaseSection } from '@/components/marketing/quotation-showcase-section';
import { ContractsShowcaseSection } from '@/components/marketing/contracts-showcase-section';
import { ReportingSection } from '@/components/marketing/reporting-section';
import { EcosystemSection } from '@/components/marketing/ecosystem-section';
import { SecuritySection } from '@/components/marketing/security-section';
import { FinalCtaSection } from '@/components/marketing/final-cta-section';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

export const metadata: Metadata = {
  title: 'SunPowerOS | Solar EPC Business Management Platform',
  description:
    'Manage solar leads, customer sites, technical surveys, engineering designs and commercial workflows with SunPowerOS by SunPower Solutions.',
  keywords: [
    'Solar ERP',
    'Solar EPC Platform',
    'Solar CRM',
    'Site Survey App',
    'BOM Generator',
    'Solar Quotation Software',
    'PM Surya Ghar',
  ],
  openGraph: {
    title: 'SunPowerOS — The Solar EPC Operating Platform',
    description: 'One platform. Every solar operation. Run your solar business from lead to order.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="marketing-root min-h-screen bg-white text-[#202536] flex flex-col selection:bg-[#714B67] selection:text-white">
      {/* Top Marketing Navigation */}
      <MarketingNavbar />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* Section 1: Hero */}
        <HeroSection />

        {/* Section 2: 8-Step Solar Workflow */}
        <WorkflowSection />

        {/* Section 3: CRM Showcase */}
        <CrmShowcaseSection />

        {/* Section 4: Activity & Follow-Up */}
        <ActivityFlowSection />

        {/* Section 5: Communication Channels */}
        <CommunicationSection />

        {/* Section 6: Customer 360 */}
        <CustomerShowcaseSection />

        {/* Section 7: Site Survey */}
        <SurveyShowcaseSection />

        {/* Section 8: Solar Engineering & BOM */}
        <EngineeringShowcaseSection />

        {/* Section 9: Quotations & GST */}
        <QuotationShowcaseSection />

        {/* Section 10: Legal Contracts & Sales Orders */}
        <ContractsShowcaseSection />

        {/* Section 11: Business Visibility & Analytics */}
        <ReportingSection />

        {/* Section 12: Consolidated Application Ecosystem */}
        <EcosystemSection />

        {/* Section 14: Security & Compliance */}
        <SecuritySection />

        {/* Section 15: Final CTA */}
        <FinalCtaSection />
      </main>

      {/* Section 16: Dark Navy Footer */}
      <MarketingFooter />
    </div>
  );
}
