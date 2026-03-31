'use client'

import { useState, useEffect } from 'react'
import {
    BarChart3,
    Download,
    FileSpreadsheet,
    FileText,
    TrendingUp,
    Users,
    DollarSign,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns'

export default function ReportsPage() {
    const [bookings, setBookings] = useState<any[]>([])
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState('ALL')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token')
                const [br, ir] = await Promise.all([
                    fetch('/api/bookings?limit=500', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/invoices?limit=500', { headers: { Authorization: `Bearer ${token}` } }),
                ])
                const bd = await br.json()
                const id = await ir.json()
                setBookings(bd.bookings || [])
                setInvoices(id.invoices || [])
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Date range filter
    const filterByRange = (items: any[], dateField: string) => {
        if (dateRange === 'ALL') return items
        const now = new Date()
        const monthsBack = dateRange === '1M' ? 1 : dateRange === '3M' ? 3 : 12
        const from = startOfMonth(subMonths(now, monthsBack - 1))
        return items.filter(i => {
            const d = new Date(i[dateField])
            return d >= from
        })
    }

    const filteredBookings = filterByRange(bookings, 'bookingDate')
    const filteredInvoices = filterByRange(invoices, 'invoiceDate')

    // Metrics
    const totalBookings = filteredBookings.length
    const acceptedBookings = filteredBookings.filter(b => b.bookingStatus === 'ACCEPTED' || b.bookingStatus === 'CONFIRMED').length
    const completedBookings = filteredBookings.filter(b => b.bookingStatus === 'COMPLETED').length
    const cancelledBookings = filteredBookings.filter(b => b.bookingStatus === 'CANCELLED').length
    const totalRevenue = filteredInvoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
    const outstandingRev = filteredInvoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + i.total, 0)
    const uniqueClients = new Set(filteredBookings.map(b => b.contactId)).size
    const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : '0.0'

    // Client-level breakdown
    const clientMap: Record<string, { name: string; bookings: number; revenue: number; lastDate: string }> = {}
    filteredBookings.forEach(b => {
        const cid = b.contactId
        if (!clientMap[cid]) {
            clientMap[cid] = {
                name: b.contact?.companyName || `${b.contact?.firstName || ''} ${b.contact?.lastName || ''}`.trim() || 'Unknown',
                bookings: 0,
                revenue: 0,
                lastDate: b.bookingDate,
            }
        }
        clientMap[cid].bookings++
        if (b.bookingDate > clientMap[cid].lastDate) clientMap[cid].lastDate = b.bookingDate
    })
    filteredInvoices.filter(i => i.status === 'PAID').forEach(i => {
        if (clientMap[i.contactId]) clientMap[i.contactId].revenue += i.total
    })
    const clientRows = Object.values(clientMap).sort((a, b) => b.revenue - a.revenue).slice(0, 15)

    // Monthly revenue (last 6 months)
    const monthlyRevenue: { month: string; paid: number; outstanding: number }[] = []
    for (let m = 5; m >= 0; m--) {
        const d = subMonths(new Date(), m)
        const start = startOfMonth(d)
        const end = endOfMonth(d)
        const monthInvoices = invoices.filter(i => {
            const id = new Date(i.invoiceDate)
            return id >= start && id <= end
        })
        monthlyRevenue.push({
            month: format(d, 'MMM yy'),
            paid: monthInvoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0),
            outstanding: monthInvoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + i.total, 0),
        })
    }
    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.paid + m.outstanding), 1)

    // Export functions
    const exportCSV = () => {
        const rows = [
            ['Marina Dubson Stenographic Services — Report'],
            [`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`],
            ['Range:', dateRange === 'ALL' ? 'All Time' : dateRange === '1M' ? 'Last Month' : dateRange === '3M' ? 'Last 3 Months' : 'Last 12 Months'],
            [],
            ['SUMMARY'],
            ['Total Bookings', totalBookings],
            ['Accepted/Confirmed', acceptedBookings],
            ['Completed', completedBookings],
            ['Cancelled', cancelledBookings],
            ['Cancellation Rate', `${cancellationRate}%`],
            ['Total Revenue Collected', `$${totalRevenue.toFixed(2)}`],
            ['Outstanding Balance', `$${outstandingRev.toFixed(2)}`],
            ['Active Clients', uniqueClients],
            [],
            ['MONTHLY REVENUE (Last 6 Months)'],
            ['Month', 'Paid', 'Outstanding'],
            ...monthlyRevenue.map(m => [m.month, `$${m.paid.toFixed(2)}`, `$${m.outstanding.toFixed(2)}`]),
            [],
            ['CLIENT ACTIVITY'],
            ['Client', 'Bookings', 'Revenue Paid', 'Last Booking'],
            ...clientRows.map(c => [c.name, c.bookings, `$${c.revenue.toFixed(2)}`, c.lastDate ? format(new Date(c.lastDate), 'yyyy-MM-dd') : '—']),
            [],
            ['BILL DETAIL'],
            ['Bill #', 'Job #', 'Client', 'Date', 'Due Date', 'Status', 'Total'],
            ...filteredInvoices.map(i => [
                i.invoiceNumber,
                i.jobNumber || '',
                i.contact?.companyName || `${i.contact?.firstName || ''} ${i.contact?.lastName || ''}`.trim(),
                i.invoiceDate ? format(new Date(i.invoiceDate), 'yyyy-MM-dd') : '',
                i.dueDate ? format(new Date(i.dueDate), 'yyyy-MM-dd') : '',
                i.status,
                `$${i.total.toFixed(2)}`,
            ]),
        ]
        const csv = rows.map(r => Array.isArray(r) ? r.map(v => `"${v}"`).join(',') : `"${r}"`).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `marina-dubson-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const exportBookingsCSV = () => {
        const rows = [
            ['Booking #', 'Client', 'Company', 'Service', 'Proceeding Type', 'Date', 'Time', 'Appearance', 'Status', 'Bill Status'],
            ...filteredBookings.map(b => [
                b.bookingNumber,
                `${b.contact?.firstName || ''} ${b.contact?.lastName || ''}`.trim(),
                b.contact?.companyName || '',
                b.service?.serviceName || '',
                b.proceedingType || '',
                b.bookingDate ? format(new Date(b.bookingDate), 'yyyy-MM-dd') : '',
                b.bookingTime || '',
                b.appearanceType || '',
                b.bookingStatus || '',
                b.invoiceStatus || '',
            ])
        ]
        const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-3">
                    <div className="h-10 w-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Generating report…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500 pb-24">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Business intelligence across bookings, revenue, and client activity.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                        {[['ALL', 'All Time'], ['12M', '12 Months'], ['3M', '3 Months'], ['1M', 'This Month']].map(([v, l]) => (
                            <button
                                key={v}
                                onClick={() => setDateRange(v)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${dateRange === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                    <button onClick={exportBookingsCSV} className="btn-secondary flex items-center gap-2 text-xs">
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        Bookings CSV
                    </button>
                    <button onClick={exportCSV} className="btn-primary flex items-center gap-2 text-xs">
                        <Download className="h-3.5 w-3.5" />
                        Full Report CSV
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <KpiCard label="Total Bookings" value={totalBookings} icon={<Calendar className="h-5 w-5 text-primary" />} />
                <KpiCard label="Completed" value={completedBookings} icon={<CheckCircle className="h-5 w-5 text-emerald-600" />} />
                <KpiCard label="Cancellation Rate" value={`${cancellationRate}%`} icon={<XCircle className="h-5 w-5 text-red-500" />} />
                <KpiCard label="Active Clients" value={uniqueClients} icon={<Users className="h-5 w-5 text-blue-500" />} />
                <KpiCard label="Revenue Collected" value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={<CheckCircle className="h-5 w-5 text-emerald-600" />} wide />
                <KpiCard label="Outstanding Balance" value={`$${outstandingRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={<Clock className="h-5 w-5 text-amber-600" />} wide />
            </div>

            {/* Monthly Revenue Bar Chart */}
            <div className="md-card">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-semibold text-foreground">Monthly Revenue</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Last 6 months — collected vs. outstanding</p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-end gap-4 h-40">
                    {monthlyRevenue.map(m => {
                        const totalH = ((m.paid + m.outstanding) / maxRevenue) * 100
                        const paidH = m.paid + m.outstanding > 0 ? (m.paid / (m.paid + m.outstanding)) * totalH : 0
                        const outH = totalH - paidH
                        return (
                            <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                                <div className="w-full flex flex-col justify-end gap-px rounded-t-lg overflow-hidden" style={{ height: '130px' }}>
                                    {m.outstanding > 0 && (
                                        <div className="w-full bg-amber-400/60 rounded-t-lg" style={{ height: `${outH}%`, minHeight: m.outstanding > 0 ? '4px' : '0' }}
                                            title={`Outstanding: $${m.outstanding.toFixed(0)}`} />
                                    )}
                                    {m.paid > 0 && (
                                        <div className="w-full bg-primary" style={{ height: `${paidH}%`, minHeight: m.paid > 0 ? '4px' : '0' }}
                                            title={`Paid: $${m.paid.toFixed(0)}`} />
                                    )}
                                    {m.paid === 0 && m.outstanding === 0 && (
                                        <div className="w-full bg-muted/50 rounded-t-lg" style={{ height: '4px' }} />
                                    )}
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium">{m.month}</span>
                                <span className="text-[10px] font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    ${(m.paid + m.outstanding).toLocaleString()}
                                </span>
                            </div>
                        )
                    })}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm bg-primary" />
                        <span className="text-xs text-muted-foreground">Collected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm bg-amber-400/60" />
                        <span className="text-xs text-muted-foreground">Outstanding</span>
                    </div>
                </div>
            </div>

            {/* Client Activity Table */}
            <div className="md-card">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-semibold text-foreground">Client Activity</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Top clients by revenue paid</p>
                    </div>
                </div>
                <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left pb-3 text-xs font-semibold text-muted-foreground">Client</th>
                                <th className="text-right pb-3 text-xs font-semibold text-muted-foreground">Bookings</th>
                                <th className="text-right pb-3 text-xs font-semibold text-muted-foreground">Revenue Paid</th>
                                <th className="text-right pb-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Last Booking</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {clientRows.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground">No data available.</td>
                                </tr>
                            ) : clientRows.map((c, i) => (
                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                    <td className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-foreground">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-right text-muted-foreground">{c.bookings}</td>
                                    <td className="py-3 text-right font-semibold text-foreground">${c.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    <td className="py-3 text-right text-muted-foreground hidden md:table-cell">
                                        {c.lastDate ? format(new Date(c.lastDate), 'MMM d, yyyy') : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Status Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md-card">
                    <h3 className="font-semibold text-foreground mb-5">Booking Status Breakdown</h3>
                    <div className="space-y-3">
                        {['SUBMITTED', 'PENDING', 'ACCEPTED', 'CONFIRMED', 'COMPLETED', 'DECLINED', 'CANCELLED'].map(s => {
                            const count = filteredBookings.filter(b => b.bookingStatus === s).length
                            const pct = totalBookings > 0 ? (count / totalBookings) * 100 : 0
                            const colors: Record<string, string> = {
                                SUBMITTED: 'bg-slate-400', PENDING: 'bg-amber-400', ACCEPTED: 'bg-emerald-500',
                                CONFIRMED: 'bg-blue-500', COMPLETED: 'bg-teal-500', DECLINED: 'bg-red-400',
                                CANCELLED: 'bg-slate-300',
                            }
                            if (count === 0) return null
                            return (
                                <div key={s} className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-muted-foreground w-24 flex-shrink-0">{s}</span>
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${colors[s] || 'bg-primary'}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs font-semibold text-foreground w-8 text-right">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="md-card">
                    <h3 className="font-semibold text-foreground mb-5">Bill Status Breakdown</h3>
                    <div className="space-y-3">
                        {['BILLED', 'PAID', 'DRAFT', 'OVERDUE'].map(s => {
                            const inv = filteredInvoices.filter(i => i.status === s)
                            const total = inv.reduce((sum, i) => sum + i.total, 0)
                            const pct = filteredInvoices.length > 0 ? (inv.length / filteredInvoices.length) * 100 : 0
                            const colors: Record<string, string> = {
                                BILLED: 'bg-amber-400', PAID: 'bg-emerald-500', DRAFT: 'bg-slate-400', OVERDUE: 'bg-red-500'
                            }
                            if (inv.length === 0) return null
                            return (
                                <div key={s}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-muted-foreground w-20 flex-shrink-0">{s}</span>
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${colors[s] || 'bg-primary'}`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-xs font-semibold text-foreground">{inv.length}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground pl-24 mt-0.5">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

function KpiCard({ label, value, icon, wide }: { label: string; value: string | number; icon: React.ReactNode; wide?: boolean }) {
    return (
        <div className={`md-card flex items-center gap-4 ${wide ? 'col-span-2 lg:col-span-2' : ''}`}>
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    )
}
