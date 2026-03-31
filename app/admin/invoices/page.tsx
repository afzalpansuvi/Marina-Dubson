'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
    AlertCircle,
    TrendingUp,
    Search,
    Filter,
    Printer,
    ExternalLink,
    Zap,
    Activity,
    CreditCard as CreditCardIcon,
    ArrowRight,
    CheckCircle,
    Clock,
    FileText,
    Download,
    X,
} from 'lucide-react'

export default function InvoicesPage() {
    const router = useRouter()
    const [activeSection, setActiveSection] = useState<'CLIENT' | 'REPORTER'>('CLIENT')
    const [filter, setFilter] = useState('ALL')
    const [search, setSearch] = useState('')
    const [invoices, setInvoices] = useState<any[]>([])
    const [reporterInvoices, setReporterInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showOfferModal, setShowOfferModal] = useState(false)
    const [allBookings, setAllBookings] = useState<any[]>([])
    const [reporters, setReporters] = useState<any[]>([])
    const [newOffer, setNewOffer] = useState({
        bookingId: '',
        reporterId: '',
        pageRate: 4.25,
        appearanceFee: 400,
        minimumFee: 400,
        notes: ''
    })

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const token = localStorage.getItem('token')
                const [clientRes, reporterRes, bookingsRes, usersRes] = await Promise.all([
                    fetch('/api/admin/invoices', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch('/api/admin/reporter-invoices', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch('/api/bookings', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch('/api/admin/users', {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ])

                if (clientRes.ok) {
                    const data = await clientRes.json()
                    setInvoices(Array.isArray(data) ? data : [])
                }

                if (reporterRes.ok) {
                    const data = await reporterRes.json()
                    setReporterInvoices(Array.isArray(data) ? data : [])
                }

                if (bookingsRes.ok) {
                    const data = await bookingsRes.json()
                    setAllBookings(Array.isArray(data.bookings) ? data.bookings : [])
                }

                if (usersRes.ok) {
                    const data = await usersRes.json()
                    setReporters((data.users || []).filter((u: any) => u.role === 'REPORTER'))
                }
            } catch (error) {
                console.error('Failed to fetch data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filtered = (activeSection === 'CLIENT' ? invoices : reporterInvoices).filter(inv => {
        const matchesFilter = filter === 'ALL' ? true : inv.status === filter
        const q = search.toLowerCase()

        if (activeSection === 'CLIENT') {
            return matchesFilter && (
                !search ||
                inv.invoiceNumber?.toLowerCase().includes(q) ||
                inv.contact?.firstName?.toLowerCase().includes(q) ||
                inv.contact?.lastName?.toLowerCase().includes(q) ||
                inv.contact?.companyName?.toLowerCase().includes(q)
            )
        } else {
            return matchesFilter && (
                !search ||
                inv.invoiceNumber?.toLowerCase().includes(q) ||
                inv.reporter?.firstName?.toLowerCase().includes(q) ||
                inv.reporter?.lastName?.toLowerCase().includes(q) ||
                inv.booking?.bookingNumber?.toLowerCase().includes(q)
            )
        }
    })

    const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
    const outstandingAmount = invoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + i.total, 0)
    const outstandingCount = invoices.filter(i => i.status !== 'PAID').length

    const reporterTotal = reporterInvoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
    const reporterPending = reporterInvoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.total, 0)

    const handleCreateOffer = async () => {
        if (!newOffer.bookingId || !newOffer.reporterId) {
            alert('Please select a booking and reporter')
            return
        }
        try {
            const token = localStorage.getItem('token')
            const payload = {
                ...newOffer,
                total: newOffer.appearanceFee,
            }
            const res = await fetch('/api/admin/reporter-invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                setShowOfferModal(false)
                setNewOffer({ bookingId: '', reporterId: '', pageRate: 4.25, appearanceFee: 400, minimumFee: 400, notes: '' })
                setActiveSection('REPORTER')
                // Refresh reporter invoices
                const reporterRes = await fetch('/api/admin/reporter-invoices', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (reporterRes.ok) {
                    const data = await reporterRes.json()
                    setReporterInvoices(Array.isArray(data) ? data : [])
                }
            } else {
                const err = await res.json()
                alert(err.error || 'Failed to create offer')
            }
        } catch (error) {
            console.error('Create offer error:', error)
        }
    }

    const handleExport = () => {
        const rows = [
            ['Invoice #', 'Job #', 'Client', 'Company', 'Service', 'Date', 'Due Date', 'Status', 'Pages', 'Total'],
            ...invoices.map(inv => [
                inv.invoiceNumber,
                inv.jobNumber || '',
                `${inv.contact?.firstName || ''} ${inv.contact?.lastName || ''}`.trim(),
                inv.contact?.companyName || '',
                inv.booking?.service?.serviceName || '',
                inv.invoiceDate ? format(new Date(inv.invoiceDate), 'yyyy-MM-dd') : '',
                inv.dueDate ? format(new Date(inv.dueDate), 'yyyy-MM-dd') : '',
                inv.status,
                inv.pages || 0,
                inv.total.toFixed(2),
            ])
        ]
        const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoices-${format(new Date(), 'yyyy-MM-dd')}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
        PAID: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
        SENT: { label: 'Billed/Invoiced — Awaiting Payment', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
        DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: FileText },
        OVERDUE: { label: 'Overdue', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
    }

    return (
        <div className="max-w-full w-full sm:w-[98%] mx-auto px-3 py-6 sm:p-6 lg:p-12 space-y-8 sm:space-y-12 pb-24 animate-in fade-in duration-700">
            {/* Intelligence Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="space-y-1 sm:space-y-2">
                    <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight uppercase leading-none">
                        Revenue <span className="brand-gradient italic">Intelligence</span>
                    </h1>
                    <p className="text-muted-foreground font-black uppercase text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.3em]">Operational readout of the MD Global billing matrix.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-muted/50 p-1 rounded-2xl border border-border">
                        <button
                            onClick={() => { setActiveSection('CLIENT'); setFilter('ALL') }}
                            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${activeSection === 'CLIENT' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Client Matrix
                        </button>
                        <button
                            onClick={() => { setActiveSection('REPORTER'); setFilter('ALL') }}
                            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${activeSection === 'REPORTER' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Reporter Matrix
                        </button>
                    </div>
                    {activeSection === 'REPORTER' && (
                        <button
                            onClick={() => setShowOfferModal(true)}
                            className="luxury-button flex items-center gap-2 px-6 py-2.5 h-10 border-primary/50 !text-white"
                        >
                            <Zap className="h-3.5 w-3.5 !text-white" />
                            <span className="uppercase tracking-widest text-[9px] font-black !text-white">Generate Rate Offer</span>
                        </button>
                    )}
                    <button onClick={handleExport} className="luxury-button flex items-center gap-2 px-6 py-2.5 h-10">
                        <Download className="h-3.5 w-3.5" />
                        <span className="uppercase tracking-widest text-[9px] font-black">Export</span>
                    </button>
                </div>
            </div>

            {/* Data Pulse Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <PulseStatCard
                    label={activeSection === 'CLIENT' ? "Revenue Collected" : "Reporter Payouts"}
                    value={`$${(activeSection === 'CLIENT' ? totalRevenue : reporterTotal).toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
                    sub={`${(activeSection === 'CLIENT' ? invoices.filter(i => i.status === 'PAID').length : reporterInvoices.filter(i => i.status === 'PAID').length)} settled cycles`}
                    color="text-emerald-500"
                    icon={<CheckCircle className="h-5 w-5" />}
                    loading={loading}
                />
                <PulseStatCard
                    label={activeSection === 'CLIENT' ? "Outstanding Balance" : "Pending Obligations"}
                    value={`$${(activeSection === 'CLIENT' ? outstandingAmount : reporterPending).toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
                    sub={`${(activeSection === 'CLIENT' ? outstandingCount : reporterInvoices.filter(i => i.status === 'PENDING').length)} pending cycles`}
                    color="text-amber-500"
                    icon={<Clock className="h-5 w-5" />}
                    loading={loading}
                />
                <PulseStatCard
                    label="Network Velocity"
                    value={(activeSection === 'CLIENT' ? invoices.length : reporterInvoices.length).toString()}
                    sub={`Total ${activeSection === 'CLIENT' ? 'Invoices' : 'Offers'} Tracked`}
                    color="text-primary"
                    icon={<TrendingUp className="h-5 w-5" />}
                    loading={loading}
                />
            </div>

            {/* Operational Tiers */}
            <div className="glass-panel rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-card border border-border shadow-2xl">
                <div className="px-4 sm:px-8 py-6 border-b border-border bg-muted/20 space-y-6">
                    <div className="flex flex-col xl:flex-row justify-between gap-6">
                        <div className="relative group w-full xl:w-auto">
                            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                className="w-full xl:min-w-[450px] pl-11 sm:pl-14 pr-4 sm:pr-6 py-3.5 sm:py-4 rounded-xl bg-card border border-border text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] outline-none focus:ring-4 focus:ring-primary/10 text-foreground transition-all shadow-inner"
                                placeholder="Search by invoice ID or client..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/50 border border-border overflow-x-auto no-scrollbar">
                            {(activeSection === 'CLIENT' ? ['ALL', 'SENT', 'PAID', 'OVERDUE', 'DRAFT'] : ['ALL', 'PENDING', 'ACCEPTED', 'DECLINED', 'PAID']).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    className={`px-4 sm:px-6 py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 ${filter === s
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {s === 'ALL' ? 'Total Yield' : (activeSection === 'CLIENT' ? statusConfig[s]?.label : s) || s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-border">
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="p-8 animate-pulse flex items-center gap-8">
                                <div className="h-12 w-12 rounded-xl bg-muted" />
                                <div className="space-y-2 flex-1"><div className="h-4 w-1/4 bg-muted rounded" /><div className="h-3 w-1/6 bg-muted rounded" /></div>
                            </div>
                        ))
                    ) : filtered.length === 0 ? (
                        <div className="py-24 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">No yield signals detected in this spectrum</p>
                        </div>
                    ) : (
                        filtered.map(inv => {
                            const scClient = statusConfig[inv.status] || statusConfig.DRAFT
                            const scReporter: any = {
                                PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
                                ACCEPTED: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                                DECLINED: { label: 'Declined', color: 'bg-red-100 text-red-700 border-red-200' },
                                PAID: { label: 'Settled', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                            }
                            const sc = activeSection === 'CLIENT' ? scClient : (scReporter[inv.status] || scReporter.PENDING)

                            return (
                                <div
                                    key={inv.id}
                                    className="px-4 sm:px-8 py-5 sm:py-6 hover:bg-primary/5 transition-all cursor-pointer group flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-l-4 border-transparent hover:border-primary"
                                    onClick={() => router.push(activeSection === 'CLIENT' ? `/admin/invoices/${inv.id}` : `/admin/reporter-invoices/${inv.id}`)}
                                >
                                    <div className="flex flex-row items-center gap-4 sm:gap-10">
                                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                                            {activeSection === 'CLIENT' ? <FileText className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                                        </div>
                                        <div className="space-y-1 sm:space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.5 rounded-lg bg-primary/10 text-[7px] sm:text-[9px] font-black text-primary border border-primary/20 uppercase tracking-widest leading-none">{inv.invoiceNumber}</span>
                                                {inv.booking?.bookingNumber && <span className="text-[7px] sm:text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">#BK{inv.booking.bookingNumber}</span>}
                                            </div>
                                            <h4 className="text-sm sm:text-lg font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
                                                {activeSection === 'CLIENT'
                                                    ? (inv.contact?.companyName || `${inv.contact?.firstName} ${inv.contact?.lastName}`)
                                                    : `${inv.reporter?.firstName} ${inv.reporter?.lastName}`
                                                }
                                            </h4>
                                            <div className="flex items-center gap-4">
                                                <p className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-[0.1em]">{inv.booking?.service?.serviceName || 'Standard Protocol'}</p>
                                                <div className="h-1 w-1 rounded-full bg-border" />
                                                <p className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-[0.1em]">
                                                    {inv.invoiceDate ? format(new Date(inv.invoiceDate), 'MMM d, yyyy') : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row items-center justify-between xl:justify-end gap-6 sm:gap-12 px-2 sm:px-0">
                                        <div className="text-right">
                                            <p className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1">
                                                {activeSection === 'CLIENT' ? 'Total Yield' : 'Offering Rate'}
                                            </p>
                                            <p className="text-xl sm:text-2xl font-black text-foreground tracking-tighter">${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                        </div>

                                        <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all ${sc.color}`}>
                                            {sc.label}
                                        </div>

                                        <button className="flex h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-card border border-border items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/20 transition-all flex-shrink-0">
                                            <ArrowRight className="h-4 sm:h-6 w-4 sm:w-6" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Create Offer Modal */}
            {showOfferModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 lg:pl-80 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowOfferModal(false)}></div>
                    <div className="relative w-full max-w-2xl bg-card rounded-[2.5rem] p-8 sm:p-12 shadow-3xl border border-border overflow-y-auto max-h-[90vh] custom-scrollbar">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Generate Payout Offer</h2>
                            </div>
                            <button onClick={() => setShowOfferModal(false)} className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Booking Signal</label>
                                    <select
                                        className="w-full px-5 py-4 rounded-xl bg-muted/50 border border-border outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-[10px] uppercase tracking-widest"
                                        value={newOffer.bookingId}
                                        onChange={(e) => {
                                            const bId = e.target.value
                                            const booking = allBookings.find(b => b.id === bId)
                                            setNewOffer({
                                                ...newOffer,
                                                bookingId: bId,
                                                reporterId: booking?.reporterId || ''
                                            })
                                        }}
                                    >
                                        <option value="">Select Protocol</option>
                                        {allBookings.filter(b => b.bookingStatus !== 'CANCELLED').map(b => (
                                            <option key={b.id} value={b.id}>#{b.bookingNumber} - {b.proceedingType}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Assigned Reporter</label>
                                    <select
                                        className="w-full px-5 py-4 rounded-xl bg-muted/50 border border-border outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-[10px] uppercase tracking-widest"
                                        value={newOffer.reporterId}
                                        onChange={(e) => setNewOffer({ ...newOffer, reporterId: e.target.value })}
                                    >
                                        <option value="">Select Operative</option>
                                        {reporters.map(r => (
                                            <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Page Rate ($)</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-4 rounded-xl bg-muted/50 border border-border outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-sm uppercase tracking-widest"
                                        value={newOffer.pageRate}
                                        onChange={(e) => setNewOffer({ ...newOffer, pageRate: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Appearance ($)</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-4 rounded-xl bg-muted/50 border border-border outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-sm uppercase tracking-widest"
                                        value={newOffer.appearanceFee}
                                        onChange={(e) => setNewOffer({ ...newOffer, appearanceFee: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Min Fee ($)</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-4 rounded-xl bg-muted/50 border border-border outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-sm uppercase tracking-widest"
                                        value={newOffer.minimumFee}
                                        onChange={(e) => setNewOffer({ ...newOffer, minimumFee: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Tactical Notes</label>
                                <textarea
                                    className="w-full px-5 py-4 rounded-xl bg-muted/50 border border-border outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-[10px] uppercase tracking-widest min-h-[100px]"
                                    placeholder="Enter specific instructions or override details..."
                                    value={newOffer.notes}
                                    onChange={(e) => setNewOffer({ ...newOffer, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={() => setShowOfferModal(false)}
                                    className="flex-1 py-4 rounded-xl bg-muted border border-border text-muted-foreground font-black uppercase text-[10px] tracking-widest hover:text-foreground transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateOffer}
                                    className="flex-[2] py-4 rounded-xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                                >
                                    Transmit Offer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function PulseStatCard({ label, value, sub, color, icon, loading }: any) {
    return (
        <div className="glass-panel p-6 sm:p-8 rounded-[2rem] bg-card border border-border shadow-md hover:shadow-xl transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity group-hover:rotate-12 duration-700`}>
                {icon}
            </div>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">{label}</p>
            <div className={`text-2xl sm:text-3xl font-black tracking-tighter uppercase ${color} mb-4`}>
                {loading ? <Activity className="h-8 w-8 animate-pulse" /> : value}
            </div>
            <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest">{sub}</span>
            </div>
        </div>
    )
}


