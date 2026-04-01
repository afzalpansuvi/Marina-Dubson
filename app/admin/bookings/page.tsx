'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    Calendar,
    Link as LinkIcon,
    ArrowRight,
    User,
    CheckCircle,
    Clock,
    Search,
    Briefcase,
    Filter,
    ChevronDown,
    MapPin,
    Building2,
    DollarSign,
    Zap,
    Shield,
    TrendingUp,
    X,
    CheckCircle2
} from 'lucide-react'
import LoadingOverlay from '@/app/components/ui/LoadingOverlay'

export default function BookingManagementPage() {
    const [filter, setFilter] = useState('ALL')
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter)
    }

    const closeCompleteModal = () => {
        setShowCompleteModal(false)
        setInvoiceTargetId(null)
    }

    useEffect(() => {
        const q = searchParams.get('q')
        if (q) setSearchQuery(q)
        const f = searchParams.get('filter')
        if (f) setFilter(f)
        else setFilter('ALL')
    }, [searchParams])

    const [reporters, setReporters] = useState<any[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [assigningBookingId, setAssigningBookingId] = useState<string | null>(null)
    const [reviewBooking, setReviewBooking] = useState<any>(null)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [reviewLoading, setReviewLoading] = useState(false)

    const [showClaimsModal, setShowClaimsModal] = useState(false)
    const [selectedBookingClaims, setSelectedBookingClaims] = useState<any[]>([])
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
    const [invoiceTargetId, setInvoiceTargetId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [completedInvoiceId, setCompletedInvoiceId] = useState<string | null>(null)
    const [showAddonModal, setShowAddonModal] = useState(false)
    const [addonText, setAddonText] = useState('')
    const [addonSaving, setAddonSaving] = useState(false)
    const [isCompletingInvoice, setIsCompletingInvoice] = useState(false)

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setBookings(Array.isArray(data.bookings) ? data.bookings : [])
        } catch (error) {
            console.error('Failed to fetch bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch('/api/auth/me', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                })
                if (res.ok) {
                    const data = await res.json()
                    setCurrentUser(data.user)
                }
            } catch (error) {
                console.error('Failed to fetch current user:', error)
            }
        }
        fetchCurrentUser()
    }, [])

    // Listen for add-on open events (from header bell)
    useEffect(() => {
        const handler = (e: any) => {
            const detail = e.detail || {}
            if (detail.id) {
                setSelectedBookingId(detail.id)
                setInvoiceTargetId(detail.id)
                setAddonText(detail.text || '')
                setShowAddonModal(true)
            }
        }
        window.addEventListener('admin-open-addon', handler)
        return () => window.removeEventListener('admin-open-addon', handler)
    }, [])

    const filteredBookings = useMemo(() => {
        if (filter === 'REPORTERS') return []
        return (bookings || []).filter(b => {
            const q = searchQuery.toLowerCase()
            const matchesStatus = filter === 'ALL' || b.bookingStatus === filter
            const matchesSearch = !searchQuery ||
                b.bookingNumber?.toLowerCase().includes(q) ||
                b.contact?.companyName?.toLowerCase().includes(q) ||
                b.contact?.firstName?.toLowerCase().includes(q) ||
                b.contact?.lastName?.toLowerCase().includes(q) ||
                b.proceedingType?.toLowerCase().includes(q) ||
                b.location?.toLowerCase().includes(q)
            return matchesStatus && matchesSearch
        })
    }, [bookings, filter, searchQuery])

    const counts = useMemo(() => {
        const b = bookings || []
        return {
            all: b.length,
            submitted: b.filter(x => x.bookingStatus === 'SUBMITTED').length,
            accepted: b.filter(x => ['ACCEPTED', 'ASSIGNED'].includes(x.bookingStatus)).length
        }
    }, [bookings])

    const updateStatus = async (id: string, status: string) => {
        try {
            const token = localStorage.getItem('token')
            await fetch(`/api/bookings/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bookingStatus: status }),
            })
            fetchBookings()
        } catch (error) {
            console.error('Failed to update status:', error)
        }
    }

    const toggleMarketplace = async (id: string, currentStatus: boolean) => {
        setIsPending(true)
        try {
            const token = localStorage.getItem('token')
            await fetch(`/api/bookings/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isMarketplace: !currentStatus }),
            })
            fetchBookings()
        } catch (error) {
            console.error('Failed to toggle marketplace:', error)
        } finally {
            setIsPending(false)
        }
    }

    const markAsOpened = async (id: string) => {
        try {
            const booking = bookings.find(b => b.id === id)
            if (booking?.isOpened) return
            const token = localStorage.getItem('token')
            await fetch(`/api/bookings/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isOpened: true }),
            })
            fetchBookings()
        } catch (error) {
            console.error('Failed to mark as opened:', error)
        }
    }

    const viewClaims = async (bookingId: string) => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/market/bids?bookingId=${bookingId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setSelectedBookingClaims(data.claims || data.bids || [])
            setSelectedBookingId(bookingId)
            setShowClaimsModal(true)
        } catch (error) {
            console.error('Failed to fetch claims:', error)
        }
    }

    const acceptClaim = async (claimId: string) => {
        setIsPending(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/market/bids', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ claimId, status: 'ACCEPTED' })
            })
            if (res.ok) {
                viewClaims(selectedBookingId!)
                fetchBookings()
            }
        } catch (error) {
            console.error('Failed to accept claim:', error)
        } finally {
            setIsPending(false)
        }
    }

    const declineClaim = async (claimId: string) => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/market/bids', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ claimId, status: 'DECLINED' })
            })
            if (res.ok) {
                viewClaims(selectedBookingId!)
            }
        } catch (error) {
            console.error('Failed to decline claim:', error)
        }
    }

    const [showCompleteModal, setShowCompleteModal] = useState(false)
    const [billingData, setBillingData] = useState({
        pages: 0,
        originalCopies: 1,
        additionalCopies: 0,
        extraCertOriginals: 0,
        turnaroundDays: 10,
        realtimeDevices: 0,
        hasRough: false,
        hasVideographer: false,
        hasInterpreter: false,
        hasExpert: false,
        hasReadAndSign: false,
        hasMini: false,
        hasIndex: false,
        hasCart: false,
        hasPaperDelivery: false,
        hasPreBilledReview: false,
        isOnRecordBust: false,
        afterHoursCount: 0,
        waitTimeCount: 0,
        locationBaseFee: 0,
        notes: '',
        rateTier: 'STANDARD',
        overrides: {} as any
    })

    const fetchPricingTemplate = async (bookingId: string, tier: string) => {
        const booking = bookings.find(b => b.id === bookingId)
        if (!booking) return;

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/pricing?contactId=${booking.contactId}&serviceId=${booking.serviceId}&rateTier=${tier}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                const tierRates = data.rates
                setBillingData(prev => ({
                    ...prev,
                    rateTier: tier,
                    overrides: {
                        pageRate: tierRates.pageRate,
                        copyRate: tierRates.copyRate,
                        appearanceFee: booking.appearanceType === 'REMOTE' ? tierRates.appearanceFeeRemote : tierRates.appearanceFeeInPerson,
                        congestionFee: tierRates.congestionFee,
                        minimumFee: tierRates.minimumFee,
                        roughRate: tierRates.roughRate,
                        videographerRate: tierRates.videographerRate,
                        interpreterRate: tierRates.interpreterRate,
                        expertRate: tierRates.expertRate,
                        readAndSignRate: tierRates.readAndSignRate,
                        miniRate: tierRates.miniRate,
                        indexRate: tierRates.indexRate,
                        afterHoursRate: tierRates.afterHoursRate,
                        waitTimeRate: tierRates.waitTimeRate,
                        cartRate: tierRates.cartRate,
                    }
                }))
            } else {
                setBillingData(prev => ({ ...prev, rateTier: tier }))
            }
        } catch (err) {
            console.error(err)
            setBillingData(prev => ({ ...prev, rateTier: tier }))
        }
    }

    const handleComplete = async () => {
        if (isCompletingInvoice) return
        const bookingId = invoiceTargetId ?? selectedBookingId
        if (!bookingId) {
            setError('Select a booking before generating an invoice.')
            return
        }
        setIsCompletingInvoice(true)
        setIsPending(true)
        try {
            setError(null)
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/bookings/${bookingId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(billingData),
            })
            if (res.ok) {
                const data = await res.json()
                setCompletedInvoiceId(data.invoiceId)
                fetchBookings()
            } else {
                const data = await res.json()
                setError(data.error || 'Automation sync failed. Please check connectivity.')
            }
        } catch (error: any) {
            console.error('Job completion error:', error)
            setError(error.message || 'Something went wrong. Please try again.')
        } finally {
            setIsCompletingInvoice(false)
            setIsPending(false)
        }
    }

    const getDraftCalculation = () => {
        const booking = bookings.find(b => b.id === selectedBookingId)
        if (!booking) return { subtotal: 0, total: 0, breakdown: [] as any[] }

        // Resolve expedite logic
        const rawBaseRate = (billingData as any).overrides?.pageRate ?? (booking as any).lockedPageRate ?? (billingData.rateTier === 'PRIVATE' ? 4.75 : 4.25)
        
        // Expedite Scale (% of Original Rate) applied as additive surcharge
        const getExpPercentage = (days: number) => ({
            0: 1.25, 1: 1.10, 2: 1.00, 3: 0.90, 4: 0.80,
            5: 0.70, 6: 0.60, 7: 0.50, 8: 0.40, 9: 0.30, 10: 0.20
        } as Record<number, number>)[days] ?? 0.20
        const expeditePercentage = getExpPercentage(billingData.turnaroundDays)
        const expediteFee = billingData.pages * rawBaseRate * expeditePercentage
        const effectivePageRate = rawBaseRate // Use base rate for line item display, expedite is separate extra now

        const rates = {
            pageRate: effectivePageRate,
            copyRate: (billingData as any).overrides?.copyRate ?? (billingData.rateTier === 'PRIVATE' ? 0.50 : 1.50),
            appearance: (billingData as any).overrides?.appearanceFee ?? (booking as any).lockedAppearanceFee ?? (
                (booking as any).service?.serviceName?.includes('Arbitration') || (booking as any).service?.serviceName?.includes('Hearing')  // Special Rule for Arbitration/Hearings
                    ? 300 
                    : ((booking as any).appearanceType === 'REMOTE' ? 100 : 200)
            ),
            congestion: (billingData as any).overrides?.congestionFee ?? 15.00,
            roughRate: (billingData as any).overrides?.roughRate ?? (billingData.rateTier === 'PRIVATE' ? 1.75 : 1.50),
            videoRate: (billingData as any).overrides?.videographerRate ?? 1.25,
            interpreterRate: (billingData as any).overrides?.interpreterRate ?? 1.25,
            expertRate: (billingData as any).overrides?.expertRate ?? 2.00,
            readAndSignRate: (billingData as any).overrides?.readAndSignRate ?? 1.00,
            miniRate: (billingData as any).overrides?.miniRate ?? 1.00,
            indexRate: (billingData as any).overrides?.indexRate ?? 1.00,
            afterHoursRate: (billingData as any).overrides?.afterHoursRate ?? 125,
            waitTimeRate: (billingData as any).overrides?.waitTimeRate ?? 100,
            cartRate: (billingData as any).overrides?.cartRate ?? 2.00,
            // Task 6: Admin cover charge — $500 standard floor, $750 private floor
            minFee: (billingData as any).overrides?.minimumFee ?? (booking as any).lockedMinimumFee ?? (billingData.rateTier === 'PRIVATE' ? 750 : 500)
        } as any

        // On-Record Bust: Private $500 floor (overrides manual override only if not already set higher)
        if (billingData.isOnRecordBust && billingData.rateTier === 'PRIVATE') {
            if (!(billingData as any).overrides?.minimumFee) {
                rates.minFee = Math.max(rates.minFee, 500)
            }
        }

        const breakdown = []

        // 1. BASE CHARGES
        let currentBase = 0
        const pageCharge = billingData.pages * rates.pageRate
        if (pageCharge > 0) {
            breakdown.push({ label: `Transcript (${billingData.turnaroundDays ?? 10} Day)`, value: pageCharge, detail: `${billingData.pages} pgs @ $${rates.pageRate.toFixed(2)}` })
            currentBase += pageCharge
        }

        if (billingData.additionalCopies > 0) {
            const copyCharge = billingData.pages * rates.copyRate * billingData.additionalCopies
            breakdown.push({ label: 'Transcript Copies', value: copyCharge, detail: `${billingData.additionalCopies} sets @ $${rates.copyRate}/pg` })
            currentBase += copyCharge
        }

        // Operations (Base + Congestion)
        breakdown.push({ label: 'Service & Appearance', value: rates.appearance + rates.congestion, detail: 'Base + Congestion Fee' })
        currentBase += (rates.appearance + rates.congestion)

        if (billingData.extraCertOriginals > 0) {
            const extraCertVal = billingData.pages * (rates.pageRate * 0.75) * billingData.extraCertOriginals
            breakdown.push({ label: 'Extra Certified Original(s)', value: extraCertVal, detail: `${billingData.pages} pgs × $${(rates.pageRate * 0.75).toFixed(2)}/pg × ${billingData.extraCertOriginals} copy(s)` })
            currentBase += extraCertVal
        }

        // Apply Minimum Fee floor to BASE
        const baseTotal = Math.max(currentBase, rates.minFee)
        if (baseTotal > currentBase) {
            breakdown.push({ label: 'Minimum Fee Offset', value: rates.minFee - currentBase, detail: `Adjusted to $${rates.minFee}` })
        }

        // 2. EXTRAS (Additive)
        let currentExtras = 0
        if (billingData.hasRough) {
            const rough = billingData.pages * rates.roughRate
            breakdown.push({ label: 'Rough Draft Premium', value: rough, detail: `+$${rates.roughRate}/pg (Additive)` })
            currentExtras += rough
        }
        if (billingData.hasVideographer) {
            const video = billingData.pages * rates.videoRate
            breakdown.push({ label: 'Videography Component', value: video, detail: `+$${rates.videoRate}/pg (Additive)` })
            currentExtras += video
        }
        if (billingData.hasInterpreter) {
            const interp = billingData.pages * rates.interpreterRate
            breakdown.push({ label: 'Interpreter Coordination', value: interp, detail: `+$${rates.interpreterRate}/pg (Additive)` })
            currentExtras += interp
        }
        if (billingData.hasExpert) {
            const expert = billingData.pages * rates.expertRate
            breakdown.push({ label: 'Expert Witness Coordination', value: expert, detail: `+$${rates.expertRate}/pg (Additive)` })
            currentExtras += expert
        }
        if (billingData.hasCart) {
            const cart = billingData.pages * rates.cartRate
            breakdown.push({ label: 'CART Services (Accessibility)', value: cart, detail: `+$${rates.cartRate}/pg (Additive)` })
            currentExtras += cart
        }

        if (billingData.afterHoursCount > 0) {
            const ah = billingData.afterHoursCount * rates.afterHoursRate
            breakdown.push({ label: 'Afterhours Surcharge', value: ah, detail: `${billingData.afterHoursCount} hrs @ $${rates.afterHoursRate}` })
            currentExtras += ah
        }
        if (billingData.waitTimeCount > 0) {
            const wt = billingData.waitTimeCount * rates.waitTimeRate
            breakdown.push({ label: 'Wait Time Surcharge', value: wt, detail: `${billingData.waitTimeCount} hrs @ $${rates.waitTimeRate}` })
            currentExtras += wt
        }
        if (billingData.locationBaseFee > 0) {
            breakdown.push({ label: 'Location Base/Travel Fee', value: billingData.locationBaseFee, detail: 'Out-of-radius/Custom region addition' })
            currentExtras += billingData.locationBaseFee
        }
        if (billingData.hasPaperDelivery) {
            breakdown.push({ label: 'Delivery Method: Paper', value: 150, detail: 'Specialized Physical Document Assembly ($150 flat)' })
            currentExtras += 150
        }
        if (billingData.hasPreBilledReview) {
            const reviewFee = billingData.pages * 1.00
            breakdown.push({ label: 'Pre-billed Review Pricing', value: reviewFee, detail: `+$1.00/pg — ${billingData.pages} pgs` })
            currentExtras += reviewFee
        }

        if (expediteFee > 0) {
            breakdown.push({ label: 'Expedite Surcharge', value: expediteFee, detail: `${billingData.turnaroundDays} Day window @ ${(expeditePercentage * 100).toFixed(0)}%` })
        }

        return { subtotal: currentBase + currentExtras + expediteFee, total: baseTotal + currentExtras + expediteFee, breakdown }
    }

    const calculation = getDraftCalculation()
    const completeButtonLabel = isCompletingInvoice ? 'Generating Invoice...' : 'Generate Invoice'
    const completeButtonClasses = `flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all ${isCompletingInvoice ? 'bg-foreground/70 text-background/60 cursor-not-allowed' : 'bg-foreground text-background hover:scale-105' }`

    const fetchReporters = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setReporters((data.users || []).filter((u: any) => u.role === 'REPORTER'))
        } catch (error) {
            console.error('Failed to fetch reporters:', error)
        }
    }

    const handleAssignReporter = async (reporterId: string) => {
        if (!assigningBookingId) return
        setIsPending(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/bookings/${assigningBookingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reporterId, bookingStatus: 'ASSIGNED', isMarketplace: false }),
            })
            if (res.ok) {
                setShowAssignModal(false)
                fetchBookings()
            }
        } catch (error) {
            console.error('Failed to assign reporter:', error)
        } finally {
            setIsPending(false)
        }
    }

    const handleUnassignReporter = async (id: string) => {
        setIsPending(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    reporterId: null, 
                    bookingStatus: 'ACCEPTED', 
                    isMarketplace: false 
                }),
            })
            if (res.ok) {
                fetchBookings()
            }
        } catch (error) {
            console.error('Failed to unassign reporter:', error)
        } finally {
            setIsPending(false)
        }
    }

    const openReviewModal = (booking: any) => {
        setReviewBooking(booking)
        setShowReviewModal(true)
    }

    const confirmReviewApproval = async () => {
        if (!reviewBooking) return
        setReviewLoading(true)
        try {
            await updateStatus(reviewBooking.id, 'ACCEPTED')
            setShowReviewModal(false)
            setReviewBooking(null)
        } finally {
            setReviewLoading(false)
        }
    }

    useEffect(() => {
        fetchBookings()
        fetchReporters()
        const fetchMe = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
                if (res.ok) {
                   const data = await res.json()
                   setCurrentUser(data.user || null)
                }
            } catch (error) {
                console.error('Failed to fetch current user:', error)
            }
        }
        fetchMe()
    }, [])

    return (
        <div className="max-w-full w-full sm:w-[98%] mx-auto px-3 py-6 sm:p-6 lg:p-12 space-y-8 sm:space-y-12 pb-24 animate-in fade-in duration-700 relative">
            {isPending && <LoadingOverlay />}
            {/* Command Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="space-y-1 sm:space-y-2">
                    <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight uppercase leading-none">
                        Tactical <span className="brand-gradient italic">Registry</span>
                    </h1>
                    <p className="text-muted-foreground font-black uppercase text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.3em]">Managing client bookings and reporter assignments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group w-full xl:w-auto">
                        <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            className="w-full xl:min-w-[400px] pl-11 sm:pl-14 pr-4 sm:pr-6 py-3.5 sm:py-4 rounded-xl bg-card border border-border text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] outline-none focus:ring-4 focus:ring-primary/10 text-foreground transition-all shadow-inner"
                            placeholder="CASE_ID OR CLIENT..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Matrix Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar px-1 sm:px-0 relative">
                <div className="flex items-center gap-2 flex-nowrap pr-16 sm:pr-0 w-max sm:w-auto">
                    <FilterTab active={filter === 'ALL'} onClick={() => handleFilterChange('ALL')} label="Full Matrix" count={counts.all.toString()} />
                    <FilterTab active={filter === 'SUBMITTED'} onClick={() => handleFilterChange('SUBMITTED')} label="Requires Review" count={counts.submitted.toString()} />
                    <FilterTab active={filter === 'ACCEPTED'} onClick={() => handleFilterChange('ACCEPTED')} label="Active Operations" count={counts.accepted.toString()} />
                    <FilterTab active={filter === 'REPORTERS'} onClick={() => handleFilterChange('REPORTERS')} label="Reporter Availability" count={reporters.length.toString()} />
                </div>
                <div className="ml-auto flex-shrink-0 h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm cursor-pointer hover:bg-muted hover:border-primary/20 transition-all text-muted-foreground sticky right-0 bg-background/80 backdrop-blur-sm sm:static sm:bg-transparent sm:backdrop-none">
                    <Filter className="h-3.5 w-3.5" />
                </div>
            </div>

            {/* Operational Grid */}
            <div className="glass-panel rounded-2xl sm:rounded-3xl overflow-hidden bg-card border border-border shadow-2xl">
                <div className="px-5 sm:px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 sm:h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] animate-pulse"></div>
                        <h3 className="text-[11px] sm:text-sm font-black text-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em] truncate">
                            {filter === 'REPORTERS' ? 'Reporter Availability Matrix' : 'Active Operations Matrix'}
                        </h3>
                    </div>
                    <div className="flex items-center justify-start sm:justify-end gap-5 sm:gap-8 text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                        <span className="flex items-center gap-2 flex-shrink-0"><Activity className="h-3 w-3" /> Nominal</span>
                        <div className="h-4 w-px bg-border"></div>
                        <span className="flex items-center gap-2 flex-shrink-0"><Zap className="h-3 w-3" /> 0.2ms</span>
                    </div>
                </div>

                <div className="divide-y divide-border">
                    {loading ? (
                        <div className="p-32 text-center text-muted-foreground uppercase font-black text-[10px] tracking-[0.5em] animate-pulse">Synchronizing Matrix Data...</div>
                    ) : filter === 'REPORTERS' ? (
                        reporters.filter(r => {
                            const q = searchQuery.toLowerCase()
                            return !searchQuery || `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
                        }).map(r => (
                            <div key={r.id} className="px-4 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xs border border-primary/20 uppercase tracking-widest">{r.firstName[0]}{r.lastName[0]}</div>
                                    <div>
                                        <p className="text-sm font-black text-foreground uppercase tracking-tight">{r.firstName} {r.lastName}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{r.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${r.availability ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border opacity-50'}`}>
                                            {r.availability ? 'Available' : 'No Data'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Schedule Intelligence</p>
                                        <p className="text-[10px] font-black text-foreground uppercase">{r.availability || 'Awaiting Input...'}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (bookings || []).filter(b => {
                        const q = searchQuery.toLowerCase()
                        const matchesStatus = filter === 'ALL' || b.bookingStatus === filter
                        const matchesSearch = !searchQuery ||
                            b.bookingNumber?.toLowerCase().includes(q) ||
                            b.contact?.companyName?.toLowerCase().includes(q) ||
                            b.contact?.firstName?.toLowerCase().includes(q) ||
                            b.contact?.lastName?.toLowerCase().includes(q)
                        return matchesStatus && matchesSearch
                    }).sort((a, b) => {
                        if (!a.isOpened && b.isOpened) return -1
                        if (a.isOpened && !b.isOpened) return 1
                        if (a.bookingStatus === 'SUBMITTED' && b.bookingStatus !== 'SUBMITTED') return -1
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    }).map(b => (
                        <div key={b.id} onClick={() => markAsOpened(b.id)} className={`px-4 sm:px-8 py-5 sm:py-6 hover:bg-primary/5 transition-all cursor-pointer group flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-l-4 transition-all ${!b.isOpened ? 'border-amber-500 bg-amber-500/10' : 'border-transparent hover:border-primary'}`}>
                            <div className="flex flex-row items-center gap-4 sm:gap-6 lg:gap-10">
                                <div className="flex flex-col items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-muted border border-border flex-shrink-0">
                                    <span className="text-[7px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{new Date(b.bookingDate).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-base sm:text-xl font-black text-foreground">{new Date(b.bookingDate).getDate()}</span>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex flex-col gap-1 sm:gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-1.5 py-0.5 rounded-lg text-[7px] sm:text-[9px] font-black border uppercase tracking-widest leading-none ${!b.isOpened ? 'bg-amber-500 text-white border-amber-600 animate-pulse' : 'bg-primary/10 text-primary border-primary/20'}`}>{b.bookingNumber}</span>
                                        </div>
                                        <h4 className="text-sm sm:text-lg font-black text-foreground uppercase tracking-tight leading-tight">{b.proceedingType}</h4>
                                    </div>
                                    <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                           <Building2 className="h-3 w-3" />
                                           <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{b.contact.companyName || `${b.contact.firstName} ${b.contact.lastName}`}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                           <Clock className="h-3 w-3" />
                                           <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{b.bookingTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                                <div className="flex items-center gap-3 p-2 rounded-2xl bg-muted/50 border border-border/50 overflow-x-auto no-scrollbar">
                                    {b.reporter ? (
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); setAssigningBookingId(b.id); setShowAssignModal(true) }} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground min-w-max shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                                <User className="h-3 w-3" />
                                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{b.reporter.firstName} {b.reporter.lastName}</span>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleUnassignReporter(b.id) }} className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-[8px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all">Unassign</button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); setAssigningBookingId(b.id); setShowAssignModal(true) }} className="px-3 py-2 rounded-xl bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10 hover:scale-105 transition-all">Assign</button>
                                            <button onClick={(e) => { e.stopPropagation(); toggleMarketplace(b.id, b.isMarketplace) }} className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase border tracking-widest transition-all ${b.isMarketplace ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}>{b.isMarketplace ? 'Unpublish' : 'Publish'}</button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {b.bookingStatus === 'SUBMITTED' && (
                                            <button onClick={(e) => { e.stopPropagation(); openReviewModal(b) }} className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-all">Approve</button>
                                        )}
                                        {!['COMPLETED', 'CANCELLED', 'DECLINED'].includes(b.bookingStatus) && (
                                        <button onClick={(e) => { 
                                            e.stopPropagation();
                                            setSelectedBookingId(b.id); 
                                            setInvoiceTargetId(b.id)
                                            setCompletedInvoiceId(null); 
                                            setShowCompleteModal(true);
                                            fetchPricingTemplate(b.id, b.contact?.rateTier || 'STANDARD');
                                        }} className="px-4 py-2 rounded-xl bg-foreground text-background text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-all">Complete & Bill</button>
                                        )}
                                        {b.bookingStatus === 'COMPLETED' && b.invoice?.id && (
                                            <Link href={`/admin/invoices/${b.invoice.id}`} onClick={(e) => e.stopPropagation()} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
                                               <DollarSign className="h-3 w-3" /> View Invoice
                                            </Link>
                                        )}
                                        <div className="px-3 py-2 border border-border rounded-xl text-[8px] font-black uppercase tracking-widest text-muted-foreground">{b.bookingStatus}</div>
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/bookings/${b.id}`) }} className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all flex-shrink-0">
                                    <ArrowRight className="h-4 sm:h-6 w-4 sm:w-6" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Billing Completion Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 lg:pl-80 animate-in fade-in duration-300">
                                <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={closeCompleteModal}></div>
                    <div className="relative w-full max-w-3xl bg-card rounded-[2rem] sm:rounded-[3.5rem] shadow-3xl border border-border flex flex-col max-h-[90vh] overflow-hidden p-6 sm:p-12">
                        <div className="flex items-center gap-4 sm:gap-8 mb-8 sm:mb-12 flex-shrink-0">
                            <div className="h-10 w-10 sm:h-16 sm:w-16 rounded-xl sm:rounded-[1.5rem] bg-foreground text-background flex items-center justify-center shadow-2xl flex-shrink-0">
                                <DollarSign className="h-5 w-5 sm:h-9 sm:w-9" />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-xl sm:text-3xl font-black text-foreground uppercase tracking-tight">Finalize & Bill</h2>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Invoicing Metadata</p>
                            </div>
                            <button onClick={closeCompleteModal} className="ml-auto h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-muted border border-border flex items-center justify-center">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar space-y-6 sm:space-y-10 pr-2">
                            {/* Rate Tiers */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-muted/50 p-4 rounded-2xl border border-border">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Rate Registry Template</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => fetchPricingTemplate(selectedBookingId!, 'STANDARD')} className={`flex-1 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${billingData.rateTier === 'STANDARD' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>Standard</button>
                                        <button onClick={() => fetchPricingTemplate(selectedBookingId!, 'PRIVATE')} className={`flex-1 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${billingData.rateTier === 'PRIVATE' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>Private Client</button>
                                    </div>
                                </div>
                            </div>

                            {/* Automated Expedite Sliders */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between ml-2">
                                    <label className="text-[10px] font-black text-foreground uppercase tracking-[0.4em]">Turnaround Scale</label>
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black border tracking-widest ${billingData.turnaroundDays <= 1 ? 'bg-rose-500 text-white border-rose-600 animate-pulse' : 'bg-muted text-muted-foreground border-border'}`}>
                                        {billingData.turnaroundDays === 0 ? 'IMMEDIATE (0-DAY)' : billingData.turnaroundDays === 10 ? 'REGULAR (10-DAY)' : `${billingData.turnaroundDays}-DAY EXPEDITE`}
                                    </span>
                                </div>
                                <div className="px-2">
                                   <input 
                                     type="range" min="0" max="10" step="1" 
                                     value={billingData.turnaroundDays} 
                                     onChange={(e) => setBillingData({...billingData, turnaroundDays: parseInt(e.target.value)})}
                                     className="w-full accent-primary h-2 bg-muted rounded-full appearance-none cursor-pointer"
                                   />
                                   <div className="flex justify-between mt-2 px-1 text-[8px] font-black text-muted-foreground uppercase">
                                      <span>Immediate</span>
                                      <span>Standard</span>
                                   </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black ml-2 text-muted-foreground uppercase tracking-widest">Page Count</label>
                                    <input type="number" value={billingData.pages} onChange={(e) => setBillingData({...billingData, pages: parseInt(e.target.value) || 0})} className="w-full px-4 py-4 rounded-2xl bg-muted/50 border border-border font-black text-2xl text-center outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black ml-2 text-muted-foreground uppercase tracking-widest">Addl. Copies</label>
                                    <input type="number" value={billingData.additionalCopies} onChange={(e) => setBillingData({...billingData, additionalCopies: parseInt(e.target.value) || 0})} className="w-full px-4 py-4 rounded-2xl bg-muted/50 border border-border font-black text-2xl text-center outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black ml-2 text-muted-foreground uppercase tracking-widest leading-none block">Extra Cert<br/>Orig</label>
                                    <input type="number" value={billingData.extraCertOriginals} onChange={(e) => setBillingData({...billingData, extraCertOriginals: parseInt(e.target.value) || 0})} className="w-full px-4 py-4 rounded-2xl bg-muted/50 border border-border font-black text-2xl text-center outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground" />
                                </div>
                            </div>

                            <div className="bg-muted/30 rounded-[2rem] p-6 border border-border grid grid-cols-2 gap-4">
                                <CheckboxItem label="Rough Draft" checked={billingData.hasRough} onChange={(v) => setBillingData({ ...billingData, hasRough: v })} />
                                <CheckboxItem label="Videography" checked={billingData.hasVideographer} onChange={(v) => setBillingData({ ...billingData, hasVideographer: v })} />
                                <CheckboxItem label="Interpreter" checked={billingData.hasInterpreter} onChange={(v) => setBillingData({ ...billingData, hasInterpreter: v })} />
                                <CheckboxItem label="Expert Witness" checked={billingData.hasExpert} onChange={(v) => setBillingData({ ...billingData, hasExpert: v })} />
                                <CheckboxItem label="Read & Sign" checked={billingData.hasReadAndSign} onChange={(v) => setBillingData({ ...billingData, hasReadAndSign: v })} />
                                <CheckboxItem label="Mini Transcript" checked={billingData.hasMini} onChange={(v) => setBillingData({ ...billingData, hasMini: v })} />
                                <CheckboxItem label="Index" checked={billingData.hasIndex} onChange={(v) => setBillingData({ ...billingData, hasIndex: v })} />
                                <CheckboxItem label="CART Services" checked={billingData.hasCart} onChange={(v) => setBillingData({ ...billingData, hasCart: v })} />
                                <CheckboxItem label="Paper Delivery (+$150)" checked={billingData.hasPaperDelivery} onChange={(v) => setBillingData({ ...billingData, hasPaperDelivery: v })} />
                                <CheckboxItem label="Pre-billed Review (+$1/pg)" checked={billingData.hasPreBilledReview} onChange={(v) => setBillingData({ ...billingData, hasPreBilledReview: v })} />
                                {billingData.rateTier === 'PRIVATE' && (
                                    <CheckboxItem label="On-Record Bust ($500 min)" checked={billingData.isOnRecordBust} onChange={(v) => setBillingData({ ...billingData, isOnRecordBust: v })} />
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black ml-2 text-muted-foreground uppercase">Afterhours (Hrs)</label>
                                    <input type="number" value={billingData.afterHoursCount} onChange={(e) => setBillingData({...billingData, afterHoursCount: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 rounded-xl bg-muted/50 border border-border font-black text-center outline-none focus:ring-2 focus:ring-primary/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black ml-2 text-muted-foreground uppercase">Wait Time (Hrs)</label>
                                    <input type="number" value={billingData.waitTimeCount} onChange={(e) => setBillingData({...billingData, waitTimeCount: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 rounded-xl bg-muted/50 border border-border font-black text-center outline-none focus:ring-2 focus:ring-primary/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black ml-2 text-primary uppercase">Location/Travel ($)</label>
                                    <input type="number" step="0.01" value={billingData.locationBaseFee} onChange={(e) => setBillingData({...billingData, locationBaseFee: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-center outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
                                </div>
                            </div>

                            <div className="bg-card rounded-[2rem] p-6 border border-border space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-2">Manual Dollar Overrides</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <OverrideField label="Page" value={billingData.overrides?.pageRate} onChange={(v) => setBillingData({ ...billingData, overrides: { ...billingData.overrides, pageRate: v } })} />
                                    <OverrideField label="Appr" value={billingData.overrides?.appearanceFee} onChange={(v) => setBillingData({ ...billingData, overrides: { ...billingData.overrides, appearanceFee: v } })} />
                                    <OverrideField label="Min" value={billingData.overrides?.minimumFee} onChange={(v) => setBillingData({ ...billingData, overrides: { ...billingData.overrides, minimumFee: v } })} />
                                    <OverrideField label="CART" value={billingData.overrides?.cartRate} onChange={(v) => setBillingData({ ...billingData, overrides: { ...billingData.overrides, cartRate: v } })} />
                                </div>
                            </div>

                            <div className="bg-foreground/5 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-foreground/10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Zap className="h-4 w-4 text-primary animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Calculation Matrix</span>
                                </div>
                                <div className="space-y-2">
                                    {calculation.breakdown.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[10px] font-black">
                                            <div className="flex flex-col">
                                                <span className="text-muted-foreground uppercase">{item.label}</span>
                                                <span className="text-[7px] text-muted-foreground/50 lowercase italic tracking-widest">{item.detail}</span>
                                            </div>
                                            <span className="text-foreground tracking-tighter">${item.value.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4 border-t border-foreground/10 flex justify-between items-end">
                                    <div className="space-y-1">
                                       <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Operational Sum</p>
                                       <p className="text-3xl font-black text-foreground tracking-tighter">${calculation.total.toFixed(2)}</p>
                                    </div>
                                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest border border-border px-2 py-1 rounded">Net 14</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-4">
                            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase text-center rounded-xl">{error}</div>}
                            <div className="flex gap-4">
                                <button onClick={closeCompleteModal} className="flex-1 py-4 rounded-2xl bg-muted border border-border text-[10px] font-black uppercase tracking-widest">{completedInvoiceId ? 'Close' : 'Abort'}</button>
                                {completedInvoiceId ? (
                                    <Link href={`/admin/invoices/${completedInvoiceId}`} className="flex-[2] py-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest text-center shadow-xl">View Final Invoice</Link>
                                ) : (
                                    <button
                                        onClick={handleComplete}
                                        disabled={isCompletingInvoice}
                                        aria-busy={isCompletingInvoice}
                                        className={`${completeButtonClasses} text-[10px]`}
                                    >
                                        {completeButtonLabel}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Direct Assignment Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowAssignModal(false)} />
                    <div className="relative w-full max-w-xl bg-card rounded-[2.5rem] p-8 border border-border shadow-3xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black uppercase tracking-tight">Direct Assignment</h2>
                            <button onClick={() => setShowAssignModal(false)} className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><X /></button>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                           {currentUser && (
                               <button onClick={() => handleAssignReporter(currentUser.id)} className="w-full p-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest">Assign to Myself</button>
                           )}
                           {reporters.map(r => (
                               <button key={r.id} onClick={() => handleAssignReporter(r.id)} className="w-full p-5 rounded-2xl bg-muted/30 border border-border flex items-center justify-between hover:bg-primary/5 transition-all group">
                                   <div className="flex items-center gap-4">
                                       <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black">{r.firstName[0]}{r.lastName[0]}</div>
                                       <div>
                                           <p className="text-sm font-black uppercase tracking-tight">{r.firstName} {r.lastName}</p>
                                           <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">{r.certification || 'Verified Operative'}</p>
                                       </div>
                                   </div>
                                   <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all" />
                               </button>
                           ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Review Modal */}
            {showReviewModal && reviewBooking && (
                <div className="fixed inset-0 z-[260] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-lg" onClick={() => setShowReviewModal(false)} />
                    <div className="relative w-full max-w-lg bg-card rounded-[2rem] border border-border shadow-3xl p-8 space-y-6">
                        <h2 className="text-xl font-black uppercase tracking-tight">Approve Operative Signal</h2>
                        <div className="p-4 bg-muted/40 rounded-2xl space-y-2 text-[10px] font-black uppercase tracking-widest">
                            <p className="text-muted-foreground">ID: {reviewBooking.bookingNumber}</p>
                            <p className="text-foreground">Type: {reviewBooking.proceedingType}</p>
                            <p className="text-foreground">Client: {reviewBooking.contact.companyName}</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={confirmReviewApproval} className="flex-1 py-3 bg-primary text-primary-foreground rounded-2xl font-black uppercase text-[10px] tracking-widest">Confirm & Approve</button>
                            <button onClick={() => setShowReviewModal(false)} className="flex-1 py-3 bg-muted rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add-On Modal */}
            {showAddonModal && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowAddonModal(false)} />
                    <div className="relative w-full max-w-xl bg-card rounded-[1.75rem] p-8 border border-border shadow-3xl">
                        <h3 className="text-sm font-black uppercase tracking-tight mb-4 text-foreground">Operational Add-On Signal</h3>
                        <div className="p-4 bg-muted/40 border border-border rounded-2xl text-xs leading-relaxed mb-6 italic">{addonText || 'No specific signal data detected.'}</div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowAddonModal(false)} className="px-4 py-2 rounded-xl bg-muted text-[10px] font-black uppercase tracking-widest">Ignore</button>
                                <button 
                                    onClick={async () => {
                                        if (!selectedBookingId) return
                                        setInvoiceTargetId(selectedBookingId)
                                        setAddonSaving(true)
                                        try {
                                            const token = localStorage.getItem('token')
                                            await fetch(`/api/bookings/${selectedBookingId}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                body: JSON.stringify({ specialRequirements: addonText })
                                            })
                                            setBillingData(prev => ({ ...prev, notes: addonText }) as any)
                                            setShowAddonModal(false)
                                            fetchBookings()
                                            setShowCompleteModal(true)
                                        } finally {
                                            setAddonSaving(false)
                                        }
                                    }}
                                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest"
                                >Accept & Bill</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function OverrideField({ label, value, onChange }: { label: string, value: number | undefined, onChange: (v: number | undefined) => void }) {
    return (
        <div className="space-y-1">
            <label className="text-[7px] font-black text-muted-foreground uppercase ml-1">{label}</label>
            <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] font-black opacity-40">$</span>
                <input
                    type="number" step="0.01" placeholder="Auto"
                    className="w-full pl-5 pr-2 py-1.5 rounded-lg bg-muted border border-border text-[10px] font-black outline-none focus:border-primary/50 transition-all"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                />
            </div>
        </div>
    )
}

function FilterTab({ label, count, active, onClick }: any) {
    return (
        <button onClick={onClick} className={`flex items-center gap-3 px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest whitespace-nowrap transition-all border ${active ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/30' : 'bg-card text-muted-foreground border-border hover:border-primary/20 hover:text-foreground'}`}>
            {label}
            <span className={`px-2 py-0.5 rounded-md text-[8px] ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{count}</span>
        </button>
    )
}

function CheckboxItem({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-card'}`} onClick={(e) => { e.preventDefault(); onChange(!checked); }}>
                {checked && <CheckCircle2 className="h-4 w-4" />}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
        </label>
    )
}

function Activity({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
