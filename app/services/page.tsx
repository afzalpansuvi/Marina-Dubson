'use client'

'use client'

import React from 'react'
import {
    PublicTopBar,
    PublicHeader,
    PublicFooter
} from '../components/landing/PublicLayout'
import {
    CheckCircle2,
    Globe,
    ShieldCheck,
    ArrowRight,
    FileText
} from 'lucide-react'

const PRIMARY_SERVICES = [
    {
        title: 'Professional Stenographic Reporting',
        summary: 'Certified reporters with realtime delivery, drawing on a team of editors who verify transcripts before they hit your inbox.',
        tag: 'Depositions • Arbitration/Hearings • Trials',
        highlight: 'When your matter doesn’t fit a silos, choose “Other” in the proceeding type. Our scheduling desk clarifies scope before confirming the assignment.',
        callout: 'Realtime revisions, secure upload, verified transcripts.'
    },
    {
        title: 'CART & Live Captioning',
        summary: 'Communication Access Real-Time Translation engineered for ADA compliance with secure viewer links and glossary-backed captioners.',
        tag: 'Remote • Hybrid • On-site',
        highlight: 'CART deployments require the “Other” proceeding option so you can summarize the event context. We’ll connect the right captioner and glossary ahead of time.',
        callout: 'Caption + transcript delivery • Captured metadata • Glossary support.'
    }
]

const PROCEEDING_STEPS = [
    'Select the proceeding that most closely matches your hearing.',
    'If no predefined type fits, choose “Other” and describe the event in the booking notes.',
    'Our intake team reviews the description, confirms resources, and locks the appropriate professional team.'
]

const ADDON_SERVICES = [
    { label: 'Remote Monitoring', desc: 'Live status monitoring with secure alerts for counsel.' },
    { label: 'Expedited Delivery', desc: 'PDF and certified transcript ready within 24 hours of the proceeding.' },
    { label: 'Glossary Support', desc: 'Team-managed terminology file for consistent speaker IDs.' }
]

export default function ServicesPage() {
    return (
        <div className="bg-white min-h-screen">
            <PublicTopBar />
            <PublicHeader />

            <section className="relative h-[320px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1920&q=80"
                        alt="Services Hero"
                        className="w-full h-full object-cover brightness-[0.4]"
                    />
                </div>
                <div className="relative z-10 text-center space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.5em] text-white font-black">Premium Offerings</p>
                    <h1 className="text-5xl font-black text-white uppercase italic">Focused Services</h1>
                    <p className="text-sm text-white/80 max-w-2xl mx-auto">
                        We spotlight two core services—Court Reporting and CART translations—each backed by the Systems Control Room that routes assignments according to your proceeding and compliance requirements.
                    </p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-4 md:px-8 py-20 space-y-20">
                <section className="grid gap-10 md:grid-cols-2">
                    {PRIMARY_SERVICES.map((service) => (
                        <div
                            key={service.title}
                            className="p-6 rounded-[2.5rem] border border-gray-100 shadow-xl bg-slate-50 flex flex-col gap-6"
                        >
                            <div className="space-y-2">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.4em]">Primary Service</p>
                                <h2 className="text-2xl font-black uppercase tracking-tight">{service.title}</h2>
                                <p className="text-sm text-foreground/70 leading-relaxed">{service.summary}</p>
                                <p className="text-xs uppercase tracking-[0.4em] font-black text-foreground">{service.tag}</p>
                            </div>
                            <div className="text-sm text-foreground/80">
                                <p className="font-black uppercase tracking-[0.2em] text-muted-foreground">Proceeding Guidance</p>
                                <p className="mt-2 text-xs uppercase tracking-[0.2em]">{service.highlight}</p>
                                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary">{service.callout}</p>
                            </div>
                            <button className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:text-primary-foreground">
                                Explore Booking <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </section>

                <section className="grid gap-6 md:grid-cols-[minmax(0,2fr),minmax(0,1fr)] items-start">
                    <div className="p-6 rounded-[2.5rem] border border-gray-100 bg-white space-y-6 shadow-lg">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Proceeding Logic</p>
                            <h3 className="text-2xl font-black uppercase tracking-tight">How “Other” Works</h3>
                        </div>
                        <ol className="space-y-4 text-sm text-foreground/80 list-decimal list-inside">
                            {PROCEEDING_STEPS.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ol>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Need help selecting? Contact the concierge via the portal prior to booking.</p>
                    </div>
                    <div className="p-6 rounded-[2.5rem] border border-dashed border-primary/40 bg-primary/5 space-y-4">
                        <h3 className="text-lg font-black uppercase tracking-tight">Add-On Services</h3>
                        <div className="grid gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                            {ADDON_SERVICES.map((addon) => (
                                <div key={addon.label} className="flex flex-col gap-1 rounded-xl bg-white/80 p-3 border border-border shadow-inner transition hover:border-primary/40">
                                    <p className="text-xs font-black tracking-[0.3em]">{addon.label}</p>
                                    <p className="text-[9px]">{addon.desc}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-[0.4em]">Every add-on is configurable in the booking path—no dropdowns elsewhere.</p>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    )
}
