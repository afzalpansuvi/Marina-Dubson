'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Printer, Download, ArrowLeft, ExternalLink, CheckCircle, Clock, AlertCircle, CreditCard, Activity, Zap, FileText } from 'lucide-react'

export default function InvoiceDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [invoice, setInvoice] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [payUrl, setPayUrl] = useState<string | null>(null)
    const printRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`/api/invoices/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (res.ok) {
                    const data = await res.json()
                    setInvoice(data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchInvoice()
    }, [id])

    const handleGeneratePaymentLink = async () => {
        setGenerating(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/invoices/${id}/payment-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setPayUrl(data.url)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setGenerating(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
        PAID: { label: 'Paid', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle },
        SENT: { label: 'Billed/Invoiced — Awaiting Payment', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
        DRAFT: { label: 'Draft', color: 'text-slate-600 bg-slate-100 border-slate-200', icon: AlertCircle },
        OVERDUE: { label: 'Overdue', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle },
    }
    const status = statusConfig[invoice?.status] || statusConfig.DRAFT

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-3">
                    <div className="h-10 w-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading invoice…</p>
                </div>
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-3">
                    <p className="text-lg font-semibold text-foreground">Invoice not found</p>
                    <button onClick={() => router.back()} className="btn-secondary text-sm">Go back</button>
                </div>
            </div>
        )
    }

    const pages = invoice.pages || 0
    const lineItems = [
        pages > 0 && invoice.pageRate > 0 && {
            label: 'Original Transcript',
            detail: `${pages} pgs × $${invoice.pageRate.toFixed(2)}/pg × ${invoice.originalCopies} original(s)`,
            amount: pages * invoice.pageRate * invoice.originalCopies,
        },
        invoice.additionalCopies > 0 && pages > 0 && {
            label: 'Copy',
            detail: `${pages} pgs × $${invoice.copyRate.toFixed(2)}/pg × ${invoice.additionalCopies} copy(s)`,
            amount: pages * invoice.copyRate * invoice.additionalCopies,
        },
        {
            label: 'Appearance Fee',
            detail: `${invoice.booking?.appearanceType === 'REMOTE' ? 'Remote' : 'In-Person'} (incl. $${invoice.congestionFee?.toFixed(2) || '9.00'} congestion)`,
            amount: invoice.appearanceFee + (invoice.congestionFee || 9),
        },
        invoice.realtimeFee && {
            label: 'Realtime',
            detail: `${pages} pgs × $1.50/device × ${invoice.realtimeDevices || 1} device(s)`,
            amount: invoice.realtimeFee,
        },
        invoice.roughFee && {
            label: 'Rough Draft',
            detail: `${pages} pgs × $1.25/pg`,
            amount: invoice.roughFee,
        },
        invoice.videographerFee > 0 && {
            label: 'Videography Services',
            detail: `${pages} pgs × $0.30/pg`,
            amount: invoice.videographerFee,
        },
        invoice.interpreterFee > 0 && {
            label: 'Interpreter Coordination',
            detail: `${pages} pgs × $0.30/pg`,
            amount: invoice.interpreterFee,
        },
        invoice.expertFee > 0 && {
            label: 'Expert Witness Coordination',
            detail: `${pages} pgs × $0.50/pg`,
            amount: invoice.expertFee,
        },
        invoice.afterHoursFee > 0 && {
            label: 'After-Hours Surcharge',
            detail: `$100/hr after 5:30 PM (${invoice.afterHoursCount || 0} hr(s))`,
            amount: invoice.afterHoursFee,
        },
        invoice.waitTimeFee > 0 && {
            label: 'Wait Time Surcharge',
            detail: `$100/hr after 30 min (${invoice.waitTimeCount || 0} hr(s))`,
            amount: invoice.waitTimeFee,
        },
        invoice.cancellationFee && {
            label: 'Cancellation Fee',
            detail: `Late cancellation — minimum booking fee`,
            amount: invoice.cancellationFee,
        },
        invoice.locationBaseFee > 0 && {
            label: 'Location / Travel Base Fee',
            detail: `Out-of-radius travel or specific region charge`,
            amount: invoice.locationBaseFee,
        },
        invoice.paperDeliveryFee > 0 && {
            label: 'Delivery Method: Paper ($150)',
            detail: `Specialized Physical Document Assembly`,
            amount: invoice.paperDeliveryFee,
        },
        invoice.preBilledReviewFee > 0 && {
            label: 'Pre-billed Review Pricing',
            detail: `+$1.00/pg (Standard Review Rate)`,
            amount: invoice.preBilledReviewFee,
        },
    ].filter(Boolean) as { label: string; detail: string; amount: number }[]

    if (invoice.expediteFee && invoice.expediteFee > 0) {
        lineItems.push({
            label: 'Expedite Delivery',
            detail: invoice.expediteLabel || 'Accelerated delivery window',
            amount: invoice.expediteFee,
        })
    }

    return (
        <>
            {/* Compact Intelligence Action Bar */}
            <div className="print:hidden sticky top-0 z-[100] backdrop-blur-xl bg-background/90 border-b border-border/50 px-4 py-3 sm:py-6">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                    <button onClick={() => router.back()} className="group flex items-center gap-2 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all">
                        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Matrix
                    </button>
                    <div className="flex flex-nowrap items-center gap-2 w-full sm:w-auto">
                        {invoice.status !== 'PAID' && (
                            <button
                                onClick={handleGeneratePaymentLink}
                                disabled={generating}
                                className="flex-1 sm:flex-none luxury-button flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 h-auto text-[8px] sm:text-[9px] font-black uppercase tracking-widest whitespace-nowrap bg-primary text-primary-foreground shadow-xl active:scale-95 transition-all shrink-0"
                            >
                                <Zap className="h-3.5 w-3.5" />
                                {generating ? '...' : 'Payment Link'}
                            </button>
                        )}
                        <button onClick={handlePrint} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 text-[8px] sm:text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shrink-0">
                            <Printer className="h-3.5 w-3.5" />
                            Print
                        </button>
                        {invoice.status !== 'PAID' && (
                            <button
                                onClick={async () => {
                                    const token = localStorage.getItem('token')
                                    const res = await fetch(`/api/invoices/${id}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ status: 'PAID', paidAt: new Date().toISOString() })
                                    })
                                    if (res.ok) window.location.reload()
                                }}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-emerald-500 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
                            >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Settle Invoice
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Status & Yield Summary */}
            <div className="print:hidden max-w-4xl mx-auto px-4 pt-8 space-y-2">
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-xl ${status.color}`}>
                        <status.icon className="h-3.5 w-3.5" />
                        {status.label}
                    </span>
                    {invoice.status !== 'PAID' && invoice.dueDate && (
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            <Clock className="h-3 w-3" />
                            Due: {format(new Date(invoice.dueDate), 'MMMM d, yyyy')}
                        </div>
                    )}
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter uppercase">
                    Yield <span className="brand-gradient italic">Matrix</span>
                </h2>
            </div>

            {/* Tactical Invoice Container */}
            <div ref={printRef} className="max-w-4xl mx-auto my-4 sm:my-8 px-4 sm:px-4 print:p-0 print:m-0 print:w-full">
                <div className="glass-panel text-foreground rounded-[1.5rem] sm:rounded-[3rem] border border-border shadow-2xl print:border-0 print:shadow-none print:rounded-none overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] animate-pulse pointer-events-none">
                        <Activity className="h-48 w-48 text-primary" />
                    </div>

                    <div className="p-5 sm:p-12 space-y-8 sm:space-y-12 relative z-10">
                        {/* Firm Branding */}
                        <div className="text-center space-y-3 sm:space-y-4 border-b border-border/50 pb-8 sm:pb-12">
                            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-[1.5rem] border border-primary/20 mb-2">
                                <Zap className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Marina <span className="brand-gradient">Dubson</span></h1>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Stenographic Services Matrix, LLC</p>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.1em]">12A Saturn Lane, Staten Island, NY 10314</p>
                                <div className="flex items-center justify-center gap-4 text-[9px] font-black text-primary uppercase tracking-widest mt-4">
                                    <span>(917) 494-1859</span>
                                    <div className="h-1 w-1 rounded-full bg-border" />
                                    <span>MarinaDubson@gmail.com</span>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Details */}
                        <div className="flex flex-col lg:flex-row justify-between gap-6 sm:gap-10">
                            <div className="space-y-6 flex-1">
                                <div>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-3 text-center sm:text-left">Counterparty Data</p>
                                    <div className="p-4 sm:p-6 bg-muted/40 rounded-[1.5rem] sm:rounded-[2rem] border border-border">
                                        <p className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight leading-none mb-1">
                                            {invoice.contact.companyName || `${invoice.contact.firstName} ${invoice.contact.lastName}`}
                                        </p>
                                        <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">{invoice.contact.firstName} {invoice.contact.lastName}</p>
                                        <div className="h-px w-full bg-border my-3 sm:my-4" />
                                        <p className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest mb-1 truncate">{invoice.contact.email}</p>
                                        {invoice.contact.phone && <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">{invoice.contact.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full lg:min-w-[280px] lg:w-auto space-y-4">
                                <div className="p-5 sm:p-6 bg-primary/5 rounded-[1.5rem] sm:rounded-[2rem] border border-primary/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                        <FileText className="h-10 w-10 text-primary" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest gap-4">
                                            <span className="text-muted-foreground whitespace-nowrap">Invoice Matrix</span>
                                            <span className="text-foreground truncate">{invoice.invoiceNumber}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest gap-4">
                                            <span className="text-muted-foreground whitespace-nowrap">Booking Ref</span>
                                            <span className="text-foreground truncate">#BK{invoice.jobNumber || '—'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest gap-4">
                                            <span className="text-muted-foreground whitespace-nowrap">Invoice Date</span>
                                            <span className="text-foreground whitespace-nowrap">{format(new Date(invoice.invoiceDate), 'MM/dd/yyyy')}</span>
                                        </div>
                                        {invoice.dueDate && (
                                            <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-500 gap-4">
                                                <span className="whitespace-nowrap">Settlement</span>
                                                <span className="whitespace-nowrap">{format(new Date(invoice.dueDate), 'MM/dd/yyyy')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Protocol Specs (Grid instead of Table for mobile) */}
                        <div className="space-y-6">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Operational Yield Specs</p>

                            {/* Header for web */}
                            <div className="hidden sm:grid grid-cols-12 px-6 py-4 bg-primary text-primary-foreground rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl">
                                <div className="col-span-6">Service Protocol</div>
                                <div className="col-span-2 text-center">Pages</div>
                                <div className="col-span-2 text-center">Units</div>
                                <div className="col-span-2 text-right">Yield</div>
                            </div>

                            <div className="space-y-4 sm:space-y-2">
                                {lineItems.map((item, i) => (
                                    <div key={i} className="grid grid-cols-1 sm:grid-cols-12 px-6 py-5 sm:py-4 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-all group/item">
                                        <div className="col-span-1 sm:col-span-6 space-y-1 mb-4 sm:mb-0">
                                            <p className="text-xs font-black text-foreground uppercase tracking-tight group-hover/item:text-primary transition-colors">{item.label}</p>
                                            <p className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest">{item.detail}</p>
                                        </div>
                                        <div className="flex sm:block justify-between items-center col-span-1 sm:col-span-2">
                                            <span className="sm:hidden text-[8px] font-black text-muted-foreground uppercase tracking-widest">Pages:</span>
                                            <p className="text-[10px] font-black text-foreground text-center uppercase">{pages > 0 ? pages : '—'}</p>
                                        </div>
                                        <div className="flex sm:block justify-between items-center col-span-1 sm:col-span-2 mt-2 sm:mt-0">
                                            <span className="sm:hidden text-[8px] font-black text-muted-foreground uppercase tracking-widest">Units:</span>
                                            <p className="text-[10px] font-black text-foreground text-center">1</p>
                                        </div>
                                        <div className="flex sm:block justify-between items-center col-span-1 sm:col-span-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-border sm:border-0">
                                            <span className="sm:hidden text-[8px] font-black text-muted-foreground uppercase tracking-widest">Yield:</span>
                                            <p className="text-xs sm:text-sm font-black text-foreground text-right tracking-tighter">${item.amount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals Flux */}
                        <div className="flex flex-col xl:flex-row justify-between gap-12 pt-8">
                            <div className="flex-1 space-y-2">
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Operational Notes</p>
                                <div className="p-6 bg-muted/20 rounded-[2rem] border border-border border-dashed">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-widest whitespace-pre-wrap">
                                        {invoice.notes || 'Payment due within 14 days. A late fee of 1.5% may apply to overdue balances.'}
                                    </p>
                                </div>
                            </div>
                            <div className="min-w-[300px] w-full xl:w-auto p-8 bg-card rounded-[2.5rem] border border-border shadow-2xl space-y-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-500 to-primary"></div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        <span>Subtotal Yield</span>
                                        <span>${invoice.subtotal.toFixed(2)}</span>
                                    </div>
                                    {invoice.minimumFee > invoice.subtotal && (
                                        <div className="flex justify-between items-center text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                            <span>Min-Threshold Gap</span>
                                            <span>+${(invoice.minimumFee - invoice.subtotal).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {invoice.tax > 0 && (
                                        <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            <span>Surcharge TAX</span>
                                            <span>${invoice.tax.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {(invoice.lateFee || 0) > 0 && (
                                        <div className="flex justify-between items-center text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                            <span>Late Payment Fee</span>
                                            <span>+${invoice.lateFee.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="h-px w-full bg-border my-6" />
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] whitespace-nowrap">Total Settlement</p>
                                        <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter leading-none">${invoice.total.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Network Footer */}
                        <div className="text-center pt-12 mt-12 border-t border-border/50">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4">Thank you for your business</p>
                            <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Secure Payment to: <span className="text-primary italic">Marina Dubson Stenographic Services, LLC</span></p>
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2 opacity-50">Marina Dubson Stenographic Services, LLC — 2026</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </>
    )
}
