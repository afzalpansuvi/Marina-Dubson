'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Globe, Clock, ShieldCheck, Newspaper, FileText } from 'lucide-react'
import Image from 'next/image'

export function HomepageHero() {
    return (
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1920&q=80"
                        alt="Courthouse Hero"
                        fill
                        sizes="100vw"
                        className="object-cover brightness-[0.4]"
                        priority
                    />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none italic">
                    Court Reporting for<br />Complex Litigation
                </h1>
                <p className="text-sm md:text-lg font-medium max-w-2xl mx-auto text-white/90">
                    Precision. Speed. Reliability. We provide unmatched stenographic services for the legal community worldwide, ensuring every word is captured with absolute accuracy.
                </p>
                <div className="pt-4">
                    <Link href="/services" className="bg-[#0071c5] hover:bg-[#0051a8] text-white px-10 py-4 rounded-lg font-black uppercase tracking-widest text-xs transition-all shadow-xl">
                        Learn How We Help
                    </Link>
                </div>
            </div>
        </section>
    )
}

export function WhoWeAre() {
    const cards = [
        {
            title: 'Our Vision',
            desc: 'To set the gold standard in legal transcription services through technological innovation.',
            img: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Our Mission',
            desc: 'Providing law firms and government agencies with surgical accuracy and elite service protocols.',
            img: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=600&q=80'
        },
        {
            title: 'Our Stories',
            desc: 'A legacy of excellence covering thousands of high-stakes proceedings across North America.',
            img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80'
        }
    ]

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
                <h2 className="text-[#a89100] text-xs font-black uppercase tracking-[0.4em] mb-4">About Us</h2>
                <h3 className="text-3xl md:text-4xl font-black text-[#1a1a1a] uppercase italic mb-16">Who We Are</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {cards.map((card, i) => (
                        <div key={i} className="space-y-6 group">
                            <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-lg border border-gray-100 relative">
                                <Image
                                    src={card.img}
                                    alt={card.title}
                                    fill
                                    sizes="(min-width: 768px) 33vw, 100vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <h4 className="text-2xl font-black text-[#1a1a1a] uppercase italic">{card.title}</h4>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed italic">{card.desc}</p>
                            <Link href="/about" className="inline-block border-2 border-gray-200 px-8 py-3 rounded font-black text-[10px] uppercase tracking-widest hover:bg-[#a89100] hover:text-white hover:border-[#a89100] transition-all">
                                Read More
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function SolutionsSection() {
    return (
        <section className="relative py-32 overflow-hidden flex items-center">
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=1920&q=80"
                    alt="Solutions BG"
                    fill
                    sizes="100vw"
                    className="object-cover brightness-[0.3]"
                />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white space-y-6">
                <h2 className="text-[#a89100] text-xs font-black uppercase tracking-[0.4em]">Our Services</h2>
                <h3 className="text-4xl md:text-5xl font-black uppercase leading-none italic">
                    Court Reporting Solutions
                </h3>
                <p className="text-sm md:text-lg font-medium max-w-2xl mx-auto text-white/80 italic">
                    Certified stenographic professionals deployed for mission-critical legal contexts. We handle everything from standard depositions to complex Arbitration/Hearings.
                </p>
                <div className="pt-4">
                    <button className="bg-[#0071c5] hover:bg-[#0051a8] text-white px-10 py-4 rounded-lg font-black uppercase tracking-widest text-xs transition-all">
                        Read More
                    </button>
                </div>
            </div>
        </section>
    )
}

export function ServiceGrid() {
    const services = [
        {
            title: 'Professional Stenographic Reporting',
            desc: 'Elite reporters supported by production teams that verify transcripts for Deposition, EUO, Hearings, and Trials.',
            bullets: ['Deposition', 'Arbitration/Hearings', 'Examinations Under Oath', 'Other bespoke legal matters'],
            note: 'Select “Other” when your proceeding is custom—our concierge clarifies the scope before the calendar locks.',
            img: 'https://images.unsplash.com/photo-1521790945508-bf2a36314e85?auto=format&fit=crop&w=900&q=80'
        },
        {
            title: 'CART & Live Captioning',
            desc: 'Communication Access Real-Time Translation engineered for ADA compliance with glossary-backed captioners and secure viewer portals.',
            bullets: ['Remote / On-site CART', 'Secure viewer links & transcripts', 'Speaker ID + glossary prep'],
            note: 'Always choose “Other” for CART and describe the hearing or meeting context so the right captioner and tech are staged.',
            img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1920&q=80'
        }
    ]

    const proceedingSteps = [
        'Choose the proceeding that most closely mirrors your deposition, hearing, or trial.',
        'If there is no perfect match, select “Other” and add a short description in the booking notes.',
        'Concierge operators review the note, confirm resources, and assign the proper reporter or CART captioner before confirming.'
    ]

    const addOns = [
        'Expedited delivery windows (24-hour certified + PDF).',
        'Glossary and terminology management for complex teams.',
        'Remote monitoring alerts when the proceeding begins.'
    ]

    return (
        <section className="py-24 bg-gray-50 space-y-16">
            <div className="max-w-7xl mx-auto px-4 md:px-8 grid gap-12">
                {services.map((s) => (
                    <div
                        key={s.title}
                        className="grid gap-8 md:grid-cols-2 items-center bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
                    >
                        <div className="relative h-[400px] md:h-full overflow-hidden">
                            <Image
                                src={s.img}
                                alt={s.title}
                                fill
                                sizes="100vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="p-10 space-y-6">
                            <h4 className="text-3xl font-black text-[#1a1a1a] uppercase italic">{s.title}</h4>
                            <p className="text-gray-600 text-sm font-medium leading-relaxed">{s.desc}</p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#0071c5]">
                                {s.bullets.map(b => (
                                    <li key={b} className="flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2">
                                        <span className="h-2 w-2 rounded-full bg-[#0071c5] inline-flex"></span>
                                        {b}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">{s.note}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 grid gap-10 md:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
                <div className="p-8 rounded-[2rem] bg-white border border-gray-100 shadow-lg">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-4">Proceeding logic</h3>
                    <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                        {proceedingSteps.map((step) => (
                            <li key={step}>{step}</li>
                        ))}
                    </ol>
                    <p className="text-[10px] uppercase tracking-[0.3em] mt-6 text-gray-500">Need guidance? Mention the courtroom or hearing type in the notes and the concierge will confirm resources prior to final approval.</p>
                </div>
                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#f8fafc] to-white border border-border shadow-inner space-y-4">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Document Storage</p>
                            <p className="text-sm font-black text-foreground uppercase tracking-tight">PDF / DOC / TXT support</p>
                        </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        Every transcript or exhibit you upload is stored securely, organized by booking so your team can download files later.
                    </p>
                    <div className="space-y-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
                        {addOns.map((addon) => (
                            <p key={addon}>• {addon}</p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export function BlogTeaser() {
    const [blogs, setBlogs] = useState<any[]>([])

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch('/api/blogs?limit=4')
                if (!res.ok) return
                const data = await res.json()
                setBlogs(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error('Failed to fetch homepage blogs:', error)
            }
        }

        fetchBlogs()
    }, [])

    const primaryBlog = blogs[0]
    const sideBlogs = blogs.slice(1, 4)

    return (
        <section id="blog" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-8">
                    <div className="aspect-video overflow-hidden rounded-3xl shadow-xl relative">
                        <Image
                            src="https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=800&q=80"
                            className="object-cover"
                            alt="Main Article"
                            fill
                            sizes="(min-width: 1024px) 50vw, 100vw"
                        />
                    </div>
                    <h3 className="text-3xl font-black text-[#1a1a1a] uppercase italic leading-tight">
                        {primaryBlog?.title || 'Practical Litigation Reporting Insights for Modern Legal Teams'}
                    </h3>
                    <p className="text-gray-500 font-medium italic leading-relaxed">
                        {primaryBlog?.excerpt || 'Read field-tested guidance on deposition preparation, transcript quality controls, and scalable workflows for high-volume case operations.'}
                    </p>
                    <Link href={primaryBlog?.slug ? `/blogs/${primaryBlog.slug}` : '/blogs'} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0071c5] hover:text-[#0051a8]">
                        Read Full Article <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="space-y-12">
                    {(sideBlogs.length > 0 ? sideBlogs : [
                        { title: 'Building Better Deposition Workflows for 2026', createdAt: new Date().toISOString(), slug: '' },
                        { title: 'Remote Hearing Quality Controls That Actually Work', createdAt: new Date().toISOString(), slug: '' },
                        { title: 'Reducing Transcript Revisions Through Better Prep', createdAt: new Date().toISOString(), slug: '' },
                    ]).map((post, i) => (
                        <Link key={i} href={post.slug ? `/blogs/${post.slug}` : '/blogs'} className="flex gap-6 items-center group cursor-pointer">
                            <div className="h-24 w-24 md:h-32 md:w-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-md relative">
                                <Image
                                    src={`https://images.unsplash.com/photo-${i === 0 ? '1589829545856-d10d557cf95f' : i === 1 ? '1505664194779-8beaceb93744' : '1450101499163-c8848c66ca85'}?auto=format&fit=crop&w=300&q=80`}
                                    fill
                                    sizes="(min-width: 1024px) 25vw, 33vw"
                                    className="object-cover group-hover:scale-110 transition-all duration-500"
                                    alt="Side Article"
                                />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-black text-[#1a1a1a] uppercase italic leading-tight transition-colors group-hover:text-[#0071c5]">
                                    {post.title}
                                </h4>
                                <p className="text-[#a89100] text-[10px] font-black uppercase tracking-widest">
                                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </Link>
                    ))}
                    <Link href="/blogs" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0071c5] hover:text-[#0051a8]">
                        View All Blogs <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}

export function ContactSection() {
    return (
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="mb-12">
                    <h2 className="text-[#0071c5] text-xs font-black uppercase tracking-[0.4em] mb-4">Contact Us</h2>
                    <h3 className="text-5xl font-black text-[#1a1a1a] uppercase italic mb-16">Contact Us</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <div className="aspect-[4/5] overflow-hidden rounded-[2rem] sm:rounded-[3rem] shadow-2xl relative">
                        <Image
                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
                            fill
                            sizes="(min-width: 1024px) 48vw, 100vw"
                            className="object-cover"
                            alt="Contact"
                        />
                        <div className="absolute inset-0 bg-blue-900/10"></div>
                    </div>

                    <form className="space-y-8 p-10 bg-gray-50 rounded-[3rem] border border-gray-100 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">First Name</label>
                                <input className="w-full bg-white border border-gray-200 rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#0071c5]/20 text-gray-900" placeholder="First Name" />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Last Name</label>
                                <input className="w-full bg-white border border-gray-200 rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#0071c5]/20 text-gray-900" placeholder="Last Name" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Email</label>
                                <input className="w-full bg-white border border-gray-200 rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#0071c5]/20 text-gray-900" placeholder="Your Email" />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Phone Number</label>
                                <input className="w-full bg-white border border-gray-200 rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#0071c5]/20 text-gray-900" placeholder="Phone Number" />
                            </div>
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Zip Code</label>
                            <select className="w-full bg-white border border-gray-200 rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#0071c5]/20 text-gray-900 appearance-none">
                                <option>Select Your Zip Code</option>
                                <option>10001</option>
                                <option>10301</option>
                            </select>
                        </div>
                        <button className="w-full bg-[#0071c5] hover:bg-[#0051a8] text-white py-5 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95">
                            Join Now
                        </button>
                    </form>
                </div>
            </div>
        </section>
    )
}
