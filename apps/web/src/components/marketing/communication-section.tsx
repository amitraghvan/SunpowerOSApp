import React from 'react';
import { Mail, Phone, MessageSquare, Send, Clock, CheckCircle2, Webhook, Bell } from 'lucide-react';

const channels = [
  {
    icon: Mail,
    title: 'Customer Email Threads',
    desc: 'Formal proposals, quotation PDF links, and milestone notices attached to customer records.',
    status: 'ACTIVE',
    color: '#714B67',
  },
  {
    icon: Phone,
    title: 'Phone Consultation Logs',
    desc: 'Record call summaries, customer load needs, and automatic next-step task assignments.',
    status: 'ACTIVE',
    color: '#06C6AE',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp Gateway',
    desc: 'Automated survey schedule reminders and proposal dispatch via configured WhatsApp API.',
    status: 'COMING_SOON',
    color: '#25D366',
  },
  {
    icon: Bell,
    title: 'SMS & Webhook Alerts',
    desc: 'Discom net-metering status alerts and dispatch notifications pushed to mobile devices.',
    status: 'COMING_SOON',
    color: '#36B9F6',
  },
];

export function CommunicationSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <div className="bg-[#F8F8FA] rounded-3xl p-8 sm:p-10 border border-[#E4E5E9]">
          <div className="max-w-2xl mb-8">
            <div className="text-xs font-bold text-[#714B67] tracking-widest uppercase mb-2">
              COMMUNICATION CHANNELS
            </div>
            <h2 className="font-display font-bold text-[#151A2B] text-2xl sm:text-3xl lg:text-4xl leading-tight">
              Keep customer interactions tied to the right project.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#475065] leading-relaxed">
              No more scattered WhatsApp chats or forgotten phone notes. Maintain an audit-ready timeline on every solar lead and customer account.
            </p>
          </div>

          {/* Horizontal Compact Integration Strip (Composition E) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {channels.map((ch) => {
              const Icon = ch.icon;
              const isActive = ch.status === 'ACTIVE';
              return (
                <div
                  key={ch.title}
                  className="bg-white rounded-xl p-4 border border-[#E4E5E9] hover:border-[#714B67]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${ch.color}15`, color: ch.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#737B8B] bg-slate-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Roadmap
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-[#151A2B] mb-1">{ch.title}</h3>
                    <p className="text-xs text-[#737B8B] leading-relaxed">{ch.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
