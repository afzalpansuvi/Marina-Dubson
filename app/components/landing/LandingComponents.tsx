'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Scale,
    BookOpen,
    MessageSquare,
    ShieldCheck,
    Menu,
    X,
    ArrowRight,
    ArrowUpRight,
    Mail,
    Lock
} from 'lucide-react'

export function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Services', href: '#services' },
        { name: 'Tactical Blog', href: '#blog' },
        { name: 'Inquiry', href: '#contact' },
    ]

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border py-4' : 'bg-transparent py-6'
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Scale className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-bold text-foreground leading-tight">Marina Dubson</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">Stenographic Services</p>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link
                        href="/login"
                        className="btn-primary py-2.5 px-6 text-xs"
                    >
                        Access Portal
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-foreground"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-6 animate-fade-in">
                    <div className="flex flex-col gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-black uppercase tracking-widest text-foreground"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href="/login"
                            className="btn-primary w-full text-center py-4"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Access Portal
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}

export function LandingHero() {
    const [liveStats, setLiveStats] = useState([
        { label: 'Uptime Precision', value: '99.9%' },
        { label: 'Active Bookings', value: '0' },
        { label: 'Client Network', value: '0' },
        { label: 'Service Readiness', value: '24/7' },
    ])

    useEffect(() => {
        const fetchLiveStats = async () => {
            try {
                const res = await fetch('/api/debug-db')
                if (!res.ok) return
                const data = await res.json()
                const counts = data?.counts || {}
                setLiveStats([
                    { label: 'Uptime Precision', value: '99.9%' },
                    { label: 'Active Bookings', value: String(counts.bookings ?? 0) },
                    { label: 'Client Network', value: String(counts.contacts ?? 0) },
                    { label: 'Service Readiness', value: '24/7' },
                ])
            } catch (error) {
                console.error('Failed to fetch live stats:', error)
            }
        }

        fetchLiveStats()
    }, [])

    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full -z-10"></div>

            <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary animate-fade-in">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Compliance Protocol v4.0</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.9] animate-slide-up">
                    LEGAL PRECISION<br />
                    <span className="text-primary italic">DIGITALLY DEFINED.</span>
                </h1>

                <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
                    Elite stenographic services for the modern litigation cycle.
                    From high-velocity depositions to complex multi-party hearings,
                    we provide the tactical accuracy your cases demand.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <Link href="/register" className="btn-primary py-4 px-10 text-sm w-full sm:w-auto">
                        Schedule Service
                    </Link>
                    <Link href="#services" className="btn-secondary py-4 px-10 text-sm w-full sm:w-auto group">
                        Browse Registry <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Hero Stats */}
            <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mt-24">
                {liveStats.map((stat, i) => (
                    <div key={i} className="text-center p-6 bg-card border border-border rounded-3xl group hover:border-primary/30 transition-all">
                        <p className="text-2xl font-black text-foreground">{stat.value}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60 group-hover:opacity-100">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export function LandingServices() {
    const [services, setServices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('/api/services?active=true')
                const data = await res.json()
                if (data.services) setServices(data.services)
            } catch (e) {
                console.error('Service fetch failed', e)
            } finally {
                setLoading(false)
            }
        }
        fetchServices()
    }, [])

    const displayServices = services.length > 0 ? services : [
        {
            serviceName: 'Premium Court Reporting',
            category: 'COURT_REPORTING',
            description: 'Proceeding coverage: Deposition, Arbitration/Hearings, Hearing, Examinations Under Oath, CART, Other with realtime + exhibit support.'
        },
        {
            serviceName: 'CART Services',
            category: 'ACCESSIBILITY',
            description: 'Communication Access Real-Time Translation providing live verbatim captions for complete accessibility.'
        }
    ]

    return (
        <section id="services" className="py-24 bg-muted/30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16">
                    <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-4">Registry of Services</h2>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase">Tactical Capabilities</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayServices.slice(0, 8).map((s, i) => (
                        <div key={i} className="bg-card p-10 rounded-[2.5rem] border border-border hover:shadow-2xl hover:border-primary/50 transition-all group overflow-hidden relative">
                            <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
                            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <span className="inline-flex mb-4 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[8px] font-black uppercase tracking-widest text-primary">
                                {s.category?.replace('_', ' ') || 'Service'}
                            </span>
                            <h4 className="text-xl font-black text-foreground uppercase tracking-tight mb-4">{s.serviceName}</h4>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6">
                                {s.description || 'Professional stenographic sessions deployed for mission-critical legal contexts.'}
                            </p>
                            <Link href="/login" className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                Request Quote <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function LandingNewsletter() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [blogPosts, setBlogPosts] = useState<any[]>([])

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch('/api/blogs?limit=3')
                if (!res.ok) return
                const data = await res.json()
                setBlogPosts(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error('Failed to fetch landing blogs:', error)
            }
        }

        fetchBlogs()
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (email) {
            setSubmitted(true)
        }
    }

    return (
        <section id="blog" className="py-24 border-y border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 -z-10"></div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                    <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Tactical Feed</h2>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
                        GET MISSION-CRITICAL<br />
                        <span className="text-indigo-500">TRANSCRIPT UPDATES.</span>
                    </h3>
                    <p className="text-base text-muted-foreground font-medium max-w-md">
                        Join our technical digest for the latest updates on legal transcription protocols,
                        industry shifts, and new Marina Dubson infrastructure upgrades.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
                        {(blogPosts.length > 0 ? blogPosts : [
                            { title: 'De-Escalating High-Conflict EUOs', createdAt: '2026-02-14T00:00:00.000Z' },
                            { title: 'The Shift to Remote Litigative Hubs', createdAt: '2026-02-10T00:00:00.000Z' },
                            { title: 'Building Better Deposition Workflows with AI', createdAt: '2026-02-06T00:00:00.000Z' },
                        ]).map((post: any, i: number) => (
                            <div key={post.id || i} className="p-5 bg-card border border-border rounded-3xl hover:border-primary/40 hover:-translate-y-1 transition-all cursor-pointer group">
                                <span className="text-[8px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md mb-2 inline-block">
                                    {post.published ? 'Published' : 'Protocol'}
                                </span>
                                <h4 className="text-sm font-black text-foreground leading-tight group-hover:text-primary transition-colors">
                                    {post.title}
                                </h4>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase mt-3">
                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card p-10 rounded-[3rem] border border-border shadow-xl">
                    {submitted ? (
                        <div className="text-center py-12 animate-fade-in">
                            <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h4 className="text-xl font-black text-foreground uppercase mb-2">Signal Received</h4>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">You are now in the tactical loop.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2">Communication Channel (Email)</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="operator@legalhub.com"
                                    className="w-full bg-muted border border-border rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full py-5 text-sm uppercase tracking-[0.3em] font-black">
                                Join Tactical Loop
                            </button>
                            <p className="text-[9px] text-muted-foreground text-center uppercase tracking-widest leading-relaxed">
                                By joining, you accept our encrypted communications protocols and data privacy matrix.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </section>
    )
}

export function LandingContact() {
    const [contactInfo, setContactInfo] = useState({
        companyName: 'Marina Dubson Stenographic Services',
        phone: '(917) 494-1859',
        email: 'MarinaDubson@gmail.com',
        address: '12A Saturn Lane, Staten Island, NY',
    })

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const res = await fetch('/api/site-settings')
                if (!res.ok) return
                const data = await res.json()
                setContactInfo({
                    companyName: data.companyName || 'Marina Dubson Stenographic Services',
                    phone: data.phone || '(917) 494-1859',
                    email: data.email || 'MarinaDubson@gmail.com',
                    address: data.address || '12A Saturn Lane, Staten Island, NY',
                })
            } catch (error) {
                console.error('Failed to fetch contact settings:', error)
            }
        }

        fetchContactInfo()
    }, [])

    return (
        <section id="contact" className="py-24 bg-card">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Inquiry Protocol</h2>
                            <h3 className="text-5xl font-black text-foreground tracking-tighter uppercase leading-[0.9]">
                                CONNECT WITH THE<br />COMMAND CENTER.
                            </h3>
                        </div>

                        <div className="space-y-8">
                            {[
                                { icon: <MessageSquare className="h-6 w-6" />, label: 'Direct Transmission', value: contactInfo.phone },
                                { icon: <Mail className="h-6 w-6" />, label: 'Data Inquiry', value: contactInfo.email },
                                { icon: <Scale className="h-6 w-6" />, label: 'Main Command', value: contactInfo.address },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-6 group">
                                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className="text-lg font-black text-foreground uppercase tracking-tight">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-muted/30 p-10 rounded-[3rem] border border-border relative">
                        <form className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2">Subject Name</label>
                                    <input className="w-full bg-card border border-border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2">Email Address</label>
                                    <input className="w-full bg-card border border-border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2">Protocol Details (Message)</label>
                                <textarea className="w-full bg-card border border-border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 text-foreground min-h-[150px]" placeholder="State your objective..."></textarea>
                            </div>
                            <button className="btn-primary w-full py-5 uppercase tracking-[0.2em] font-black text-xs">
                                Dispatch Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export function LandingChat() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="fixed bottom-10 right-10 z-[100]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-16 w-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-primary'
                    }`}
            >
                {isOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
            </button>

            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[350px] bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
                    <div className="bg-primary p-8 text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Live Interface</p>
                        <h4 className="text-xl font-black uppercase tracking-tight">Chat with Admin</h4>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Admin System Online</span>
                        </div>
                    </div>
                    <div className="p-8 h-[300px] flex flex-col justify-center items-center text-center text-muted-foreground gap-4 bg-muted/10">
                        <div className="h-16 w-16 bg-muted border border-border rounded-3xl flex items-center justify-center opacity-20">
                            <Lock className="h-8 w-8" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                            Tactical encryption established.<br />Please sign in to initiate direct dialogue.
                        </p>
                        <Link href="/login" className="btn-secondary py-3 px-8 text-[10px]">
                            Authorize Access
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
