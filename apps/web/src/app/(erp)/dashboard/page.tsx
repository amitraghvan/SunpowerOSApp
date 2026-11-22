'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import {
  Users,
  ClipboardList,
  Sun,
  FileText,
  FileSignature,
  ShoppingCart,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  RefreshCw,
  FolderKanban
} from 'lucide-react';

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>('');
  const [activeOrgName, setActiveOrgName] = useState<string>('Loading Workspace...');

  const [isLoading, setIsLoading] = useState(true);
  const [activeQueueTab, setActiveQueueTab] = useState<'surveys' | 'quotes' | 'orders'>('surveys');

  // Real operational KPI counts
  const [stats, setStats] = useState({
    activeLeads: 0,
    pendingSurveys: 0,
    engineeringDesigns: 0,
    activeQuotations: 0,
    acceptedQuotations: 0,
    confirmedSalesOrders: 0,
  });

  // Real work queue items
  const [workQueue, setWorkQueue] = useState<{
    surveys: any[];
    quotes: any[];
    orders: any[];
  }>({
    surveys: [],
    quotes: [],
    orders: [],
  });

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch user profile
      try {
        const me = await ApiClient.getMe();
        if (me?.user) {
          setUserName(me.user.firstName ? `${me.user.firstName} ${me.user.lastName || ''}`.trim() : me.user.email);
        }
        if (me?.activeOrganization) {
          setActiveOrgName(me.activeOrganization.name);
        }
      } catch {
        // Fallback gracefully if running in public or unauthenticated dev mode
      }

      // 2. Fetch leads
      let leadsCount = 0;
      try {
        const leadsRes = await ApiClient.getLeads();
        const leads = Array.isArray(leadsRes) ? leadsRes : leadsRes?.data || [];
        leadsCount = leads.filter((l: any) => l.status !== 'LOST' && l.status !== 'WON').length;
      } catch {}

      // 3. Fetch surveys
      let surveysList: any[] = [];
      try {
        const surveysRes = await ApiClient.getSurveys();
        surveysList = Array.isArray(surveysRes) ? surveysRes : surveysRes?.data || [];
      } catch {}

      // 4. Fetch engineering designs
      let designsCount = 0;
      try {
        const designsRes = await ApiClient.getDesigns();
        const designs = Array.isArray(designsRes) ? designsRes : (designsRes as any)?.data || [];
        designsCount = designs.length;
      } catch {}

      // 5. Fetch quotations
      let quotesList: any[] = [];
      try {
        const quotesRes = await ApiClient.getQuotations();
        quotesList = Array.isArray(quotesRes) ? quotesRes : (quotesRes as any)?.data || [];
      } catch {}

      // 6. Fetch sales orders
      let ordersList: any[] = [];
      try {
        const ordersRes = await ApiClient.getSalesOrders();
        ordersList = Array.isArray(ordersRes) ? ordersRes : (ordersRes as any)?.data || [];
      } catch {}

      setStats({
        activeLeads: leadsCount,
        pendingSurveys: surveysList.filter((s: any) => s.status === 'SCHEDULED' || s.status === 'DRAFT' || s.status === 'UNDER_REVIEW').length,
        engineeringDesigns: designsCount,
        activeQuotations: quotesList.filter((q: any) => q.status === 'DRAFT' || q.status === 'SUBMITTED').length,
        acceptedQuotations: quotesList.filter((q: any) => q.status === 'ACCEPTED').length,
        confirmedSalesOrders: ordersList.filter((o: any) => o.status === 'CONFIRMED').length,
      });

      setWorkQueue({
        surveys: surveysList.slice(0, 5),
        quotes: quotesList.slice(0, 5),
        orders: ordersList.slice(0, 5),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-white border border-[#E4E5E9] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F1EAF0] text-[#714B67] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB32C]" />
            <span>Workspace: {activeOrgName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#151A2B] tracking-tight">
            {userName ? (
              `Welcome back, ${userName}.`
            ) : (
              <span className="inline-block w-64 h-8 bg-[#E4E5E9] rounded-lg animate-pulse align-middle" />
            )}
          </h1>
          <p className="text-sm text-[#737B8B] mt-1">
            Here is your solar business activity and pending operations for today.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="p-2.5 rounded-lg border border-[#E4E5E9] text-[#737B8B] hover:text-[#151A2B] hover:bg-[#F4F4F6] transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/crm"
            className="btn-primary !min-h-[40px] !py-2 !px-4 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </Link>
        </div>
      </div>

      {/* 2. Quick Actions Bar */}
      <div className="bg-white border border-[#E4E5E9] rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-[#714B67] uppercase tracking-wider text-[11px]">
          Quick Actions:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/crm"
            className="px-3 py-1.5 rounded-lg bg-[#F4F4F6] hover:bg-[#F1EAF0] text-[#202536] hover:text-[#714B67] font-semibold flex items-center gap-1.5 transition-colors border border-[#E4E5E9]"
          >
            <Users className="w-3.5 h-3.5 text-[#714B67]" />
            <span>+ Lead</span>
          </Link>
          <Link
            href="/customers"
            className="px-3 py-1.5 rounded-lg bg-[#F4F4F6] hover:bg-[#F1EAF0] text-[#202536] hover:text-[#714B67] font-semibold flex items-center gap-1.5 transition-colors border border-[#E4E5E9]"
          >
            <Users className="w-3.5 h-3.5 text-[#06C6AE]" />
            <span>+ Customer</span>
          </Link>
          <Link
            href="/surveys"
            className="px-3 py-1.5 rounded-lg bg-[#F4F4F6] hover:bg-[#F1EAF0] text-[#202536] hover:text-[#714B67] font-semibold flex items-center gap-1.5 transition-colors border border-[#E4E5E9]"
          >
            <ClipboardList className="w-3.5 h-3.5 text-[#FF747C]" />
            <span>Schedule Survey</span>
          </Link>
          <Link
            href="/engineering"
            className="px-3 py-1.5 rounded-lg bg-[#F4F4F6] hover:bg-[#F1EAF0] text-[#202536] hover:text-[#714B67] font-semibold flex items-center gap-1.5 transition-colors border border-[#E4E5E9]"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>New Design</span>
          </Link>
          <Link
            href="/quotations"
            className="px-3 py-1.5 rounded-lg bg-[#F4F4F6] hover:bg-[#F1EAF0] text-[#202536] hover:text-[#714B67] font-semibold flex items-center gap-1.5 transition-colors border border-[#E4E5E9]"
          >
            <FileText className="w-3.5 h-3.5 text-[#017E84]" />
            <span>Create Quote</span>
          </Link>
        </div>
      </div>

      {/* 3. Real Operational KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Active Leads */}
        <Link href="/crm" className="bg-white p-4 rounded-xl border border-[#E4E5E9] shadow-xs hover:border-[#D7C5D3] transition-all">
          <div className="flex items-center justify-between text-[#737B8B] mb-2">
            <span className="text-xs font-semibold">Active Leads</span>
            <Users className="w-4 h-4 text-[#714B67]" />
          </div>
          <div className="text-2xl font-bold text-[#151A2B]">{stats.activeLeads}</div>
          <div className="text-[10px] text-[#737B8B] mt-1">In CRM Pipeline</div>
        </Link>

        {/* Pending Surveys */}
        <Link href="/surveys" className="bg-white p-4 rounded-xl border border-[#E4E5E9] shadow-xs hover:border-[#D7C5D3] transition-all">
          <div className="flex items-center justify-between text-[#737B8B] mb-2">
            <span className="text-xs font-semibold">Pending Surveys</span>
            <ClipboardList className="w-4 h-4 text-[#FF747C]" />
          </div>
          <div className="text-2xl font-bold text-[#151A2B]">{stats.pendingSurveys}</div>
          <div className="text-[10px] text-[#737B8B] mt-1">Needs Field Audit</div>
        </Link>

        {/* Engineering Designs */}
        <Link href="/engineering" className="bg-white p-4 rounded-xl border border-[#E4E5E9] shadow-xs hover:border-[#D7C5D3] transition-all">
          <div className="flex items-center justify-between text-[#737B8B] mb-2">
            <span className="text-xs font-semibold">Designs</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-[#151A2B]">{stats.engineeringDesigns}</div>
          <div className="text-[10px] text-[#737B8B] mt-1">Sized PV Arrays</div>
        </Link>

        {/* Active Quotations */}
        <Link href="/quotations" className="bg-white p-4 rounded-xl border border-[#E4E5E9] shadow-xs hover:border-[#D7C5D3] transition-all">
          <div className="flex items-center justify-between text-[#737B8B] mb-2">
            <span className="text-xs font-semibold">Active Quotes</span>
            <FileText className="w-4 h-4 text-[#06C6AE]" />
          </div>
          <div className="text-2xl font-bold text-[#151A2B]">{stats.activeQuotations}</div>
          <div className="text-[10px] text-[#737B8B] mt-1">In Customer Review</div>
        </Link>

        {/* Accepted Quotes */}
        <Link href="/quotations" className="bg-white p-4 rounded-xl border border-[#E4E5E9] shadow-xs hover:border-[#D7C5D3] transition-all">
          <div className="flex items-center justify-between text-[#737B8B] mb-2">
            <span className="text-xs font-semibold">Accepted Quotes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{stats.acceptedQuotations}</div>
          <div className="text-[10px] text-[#737B8B] mt-1">Awaiting Contract</div>
        </Link>

        {/* Confirmed Orders */}
        <Link href="/sales-orders" className="bg-white p-4 rounded-xl border border-[#E4E5E9] shadow-xs hover:border-[#D7C5D3] transition-all">
          <div className="flex items-center justify-between text-[#737B8B] mb-2">
            <span className="text-xs font-semibold">Sales Orders</span>
            <ShoppingCart className="w-4 h-4 text-[#017E84]" />
          </div>
          <div className="text-2xl font-bold text-[#151A2B]">{stats.confirmedSalesOrders}</div>
          <div className="text-[10px] text-[#737B8B] mt-1">Projects Initiated</div>
        </Link>
      </div>

      {/* 4. Operational Work Queue */}
      <div className="bg-white border border-[#E4E5E9] rounded-2xl shadow-xs overflow-hidden">
        {/* Tabs Bar */}
        <div className="border-b border-[#E4E5E9] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveQueueTab('surveys')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeQueueTab === 'surveys'
                  ? 'bg-[#714B67] text-white'
                  : 'text-[#737B8B] hover:text-[#151A2B] hover:bg-[#F4F4F6]'
              }`}
            >
              Surveys Requiring Review ({workQueue.surveys.length})
            </button>
            <button
              onClick={() => setActiveQueueTab('quotes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeQueueTab === 'quotes'
                  ? 'bg-[#714B67] text-white'
                  : 'text-[#737B8B] hover:text-[#151A2B] hover:bg-[#F4F4F6]'
              }`}
            >
              Pending Quotations ({workQueue.quotes.length})
            </button>
            <button
              onClick={() => setActiveQueueTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeQueueTab === 'orders'
                  ? 'bg-[#714B67] text-white'
                  : 'text-[#737B8B] hover:text-[#151A2B] hover:bg-[#F4F4F6]'
              }`}
            >
              Confirmed Sales Orders ({workQueue.orders.length})
            </button>
          </div>

          <span className="text-xs text-[#737B8B]">
            Showing real records scoped to your organization
          </span>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeQueueTab === 'surveys' && (
            <div>
              {workQueue.surveys.length === 0 ? (
                <div className="text-center py-10 text-sm text-[#737B8B]">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No site surveys currently awaiting review.</p>
                  <Link href="/surveys" className="text-xs font-semibold text-[#714B67] hover:underline mt-2 inline-block">
                    + Schedule New Survey
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#E4E5E9]">
                  {workQueue.surveys.map((s: any) => (
                    <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#151A2B]">{s.surveyCode || 'Survey Record'}</span>
                        <span className="text-[#737B8B] ml-2">Status: {s.status}</span>
                      </div>
                      <Link href={`/surveys`} className="text-[#714B67] font-semibold hover:underline flex items-center gap-1">
                        <span>Open Survey</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeQueueTab === 'quotes' && (
            <div>
              {workQueue.quotes.length === 0 ? (
                <div className="text-center py-10 text-sm text-[#737B8B]">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No quotations currently pending approval.</p>
                  <Link href="/quotations" className="text-xs font-semibold text-[#714B67] hover:underline mt-2 inline-block">
                    + Create Quotation from Approved BOM
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#E4E5E9]">
                  {workQueue.quotes.map((q: any) => (
                    <div key={q.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#151A2B]">{q.quotationNumber || 'Quote Record'}</span>
                        <span className="text-[#737B8B] ml-2">Amount: ₹{Number(q.totalAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <Link href={`/quotations/${q.id}`} className="text-[#714B67] font-semibold hover:underline flex items-center gap-1">
                        <span>Review Quote</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeQueueTab === 'orders' && (
            <div>
              {workQueue.orders.length === 0 ? (
                <div className="text-center py-10 text-sm text-[#737B8B]">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No confirmed sales orders waiting for execution.</p>
                  <Link href="/sales-orders" className="text-xs font-semibold text-[#714B67] hover:underline mt-2 inline-block">
                    View Sales Orders
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#E4E5E9]">
                  {workQueue.orders.map((o: any) => (
                    <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#151A2B]">{o.orderNumber || 'Sales Order'}</span>
                        <span className="text-[#737B8B] ml-2">Advance: {o.advancePaymentCleared ? 'Cleared' : 'Pending'}</span>
                      </div>
                      <Link href={`/sales-orders/${o.id}`} className="text-[#714B67] font-semibold hover:underline flex items-center gap-1">
                        <span>Open Order</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
