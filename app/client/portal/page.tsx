'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import {
    Calendar,
    FileText,
    MessageSquare,
    User,
    LogOut,
    Plus,
    Clock,
    ShieldCheck,
    CreditCard,
    Download,
    TrendingUp,
    ChevronRight,
    Search,
    Bell,
    Settings,
    LayoutDashboard,
    Upload,
    Send,
    Cpu,
    Copy,
    CheckCircle2,
    Mail,
    Phone,
    Hash,
    KeyRound,
    Loader2,
    X,
    AlertTriangle,
    DollarSign
} from 'lucide-react'
import ProfileUpload from '@/app/components/ui/ProfileUpload'
import LoadingOverlay from '@/app/components/ui/LoadingOverlay'

const parseDateInput = (value?: string | Date | null) => {
    if (!value) return null
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

const formatDateSafe = (value: string | Date | undefined | null, pattern: string, fallback = 'TBD') => {
    const date = parseDateInput(value)
    return date ? format(date, pattern) : fallback
}

export default function ClientPortal() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeTab = searchParams.get('tab') || 'overview'
    const [isPending, setIsPending] = useState(false)

    // Helper to switch tabs via URL
    const navigateTab = (tab: string) => {
        if (tab === activeTab) return
        setIsPending(true)
        setTimeout(() => {
            router.push(`/client/portal?tab=${tab}`)
            setIsPending(false)
        }, 500)
    }

    const [user, setUser] = useState<any>(null)
    // const [activeTab, setActiveTab] = useState('overview') // Removed local state
    const [bookings, setBookings] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])
    const [documents, setDocuments] = useState<any[]>([])
    const [invoices, setInvoices] = useState<any[]>([])
    const [messages, setMessages] = useState<any[]>([])
    const [stats, setStats] = useState({ active: 0, unpaid: 0, files: 0 })
    const [loading, setLoading] = useState(true)
    const [messageContent, setMessageContent] = useState('')
    const [sendingMessage, setSendingMessage] = useState(false)
    const [systemPolicy, setSystemPolicy] = useState<Record<string, string>>({})
    const [docSearchQuery, setDocSearchQuery] = useState('')
    const [documentBookingFilter, setDocumentBookingFilter] = useState('')
    const [uploadBookingId, setUploadBookingId] = useState('')
    const [uploadingDocument, setUploadingDocument] = useState(false)
    const [effectiveAddOnOptions, setEffectiveAddOnOptions] = useState<{ label: string; value: string }[]>([])

    // Cancel booking modal state
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelBookingId, setCancelBookingId] = useState<string | null>(null)
    const [cancelInfo, setCancelInfo] = useState<{
        canCancel: boolean
        deadline: string
        hoursRemaining?: number
        message: string
        lateFeeAmount?: number
        lateFeeLabel?: string
        lateFeePolicy?: string
    } | null>(null)
    const [cancelLoading, setCancelLoading] = useState(false)

    const lateFeeAmountValue = cancelInfo?.lateFeeAmount ?? 400
    const lateFeeLabel = cancelInfo?.lateFeeLabel ?? `Late Cancellation — $${lateFeeAmountValue.toFixed(0)} Fee`
    const lateFeeButtonLabel = `Cancel — $${lateFeeAmountValue.toFixed(2)} Fee`

    const userClientType = user?.contact?.clientType?.toUpperCase() || 'PRIVATE'
    const isAgencyClient = userClientType === 'AGENCY'
    const financialKey = isAgencyClient ? 'financial_responsibility_agency' : 'financial_responsibility_private'
    const defaultFinancial = isAgencyClient ? 45 : 30
    const financialResponsibilityDays = Number(systemPolicy[financialKey]) || defaultFinancial
    const defaultSummary = isAgencyClient
        ? 'Arbitration/Hearings, hearings, and realtime proceedings carry a $400 cancellation minimum after the deadline; other proceedings carry a $300 minimum.'
        : 'Cancellations between 3:00 PM and 6:00 PM on the previous business day incur a $300 fee; cancellations after 6:00 PM up until the job day incur a $400 fee.'
    const cancellationSummaryText = systemPolicy.cancellation_policy_text || defaultSummary
    const paymentTermsChoice = systemPolicy.payment_terms_choice || '30'
    const paymentTermsDescription = systemPolicy.payment_terms_description || 'Payment is due within 30 days of billing issuance.'
    const paymentTermsCopy = paymentTermsChoice === 'CUSTOM'
        ? (systemPolicy.payment_terms_custom || 'Custom agreement governs payment.')
        : `${paymentTermsChoice} Day Terms`
    const rateServicePreview = services.slice(0, 3)

    // Edit add-ons modal state
    const [editBookingId, setEditBookingId] = useState<string | null>(null)
    const [editNotes, setEditNotes] = useState('')
    const [editAddOnSelection, setEditAddOnSelection] = useState<string[]>([])
    const [editSaving, setEditSaving] = useState(false)

    const [scrolled, setScrolled] = useState(false)

    // Auto-scroll ref
    const msgScrollRef = useRef<HTMLDivElement>(null)
    const scrollToBottom = () => msgScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    useEffect(() => { if (activeTab === 'messages') scrollToBottom() }, [messages, activeTab])

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const fetchAllData = useCallback(async (isPoll = false) => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                if (!isPoll) router.push('/login')
                return
            }

            const [userRes, bookingsRes, servicesRes, docsRes, invoicesRes, messagesRes, addOnsRes, policyRes] = await Promise.all([
                fetch('/api/auth/me', { cache: 'no-store', headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/bookings', { cache: 'no-store', headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/services', { cache: 'no-store', headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/documents', { cache: 'no-store', headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/invoices', { cache: 'no-store', headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/messages', { cache: 'no-store', headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/add-ons', { cache: 'no-store', headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/system-policy', { cache: 'no-store', headers: { 'Authorization': `Bearer ${token}` } })
            ])

            const userData = await userRes.json()
            const bookingsData = await bookingsRes.json()
            const servicesData = await servicesRes.json()
            const docsData = await docsRes.json()
            const invoicesData = await invoicesRes.json()
            const messagesData = await messagesRes.json()
            const addOnsData = await addOnsRes.json()
            const policyData = await policyRes.json()

            if (userData.user) setUser(userData.user)

            const userBookings = Array.isArray(bookingsData.bookings) ? bookingsData.bookings : []
            setBookings(userBookings)
            setServices(Array.isArray(servicesData.services) ? servicesData.services : [])
            setDocuments(Array.isArray(docsData.documents) ? docsData.documents : [])
            // Restrict invoices to this client/contact
            const rawInvoices = Array.isArray(invoicesData.invoices) ? invoicesData.invoices : []
            const contactId = userData.user?.contactId
            const scopedInvoices = rawInvoices.filter((inv: any) =>
                contactId ? inv.contactId === contactId : inv.contact?.email === userData.user?.email
            )
            setInvoices(scopedInvoices)
            setMessages(Array.isArray(messagesData.messages) ? messagesData.messages : [])
            setEffectiveAddOnOptions(Array.isArray(addOnsData.options) ? addOnsData.options : [])
            if (policyData?.policies) {
                setSystemPolicy(policyData.policies)
            }

            // Calculate stats
            const active = userBookings.filter((b: any) => ['SUBMITTED', 'ACCEPTED', 'CONFIRMED'].includes(b.bookingStatus)).length
            const unpaidTotal = scopedInvoices
                .filter((i: any) => i.status !== 'PAID')
                .reduce((sum: number, i: any) => sum + (Number(i.total) || 0), 0)

            setStats({
                active,
                unpaid: unpaidTotal,
                files: docsData.documents?.length || 0
            })
        } catch (error) {
            console.error('Failed to fetch portal data:', error)
        } finally {
            if (!isPoll) setLoading(false)
        }
    }, [router])

    useEffect(() => {
        fetchAllData()
        const interval = setInterval(() => fetchAllData(true), 60000)
        return () => clearInterval(interval)
    }, [fetchAllData])

    const uploadAcceptTypes = '.pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg'
    const allowedUploadCopy = 'Allowed: PDF, DOC/DOCX, TXT, RTF, XLSX, PPTX, PNG, JPG'

    const handleDocumentUpload = async (file: File) => {
        if (!file) return
        setUploadingDocument(true)
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                alert('Authentication required to upload documents.')
                return
            }

            const formData = new FormData()
            formData.append('file', file)
            formData.append('category', 'CLIENT_UPLOAD')
            if (uploadBookingId) {
                formData.append('bookingId', uploadBookingId)
            }

            const res = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (res.ok) {
                const newDoc = await res.json()
                setDocuments(prev => [newDoc, ...prev])
                setStats(prev => ({ ...prev, files: prev.files + 1 }))
            } else {
                const err = await res.json()
                alert(err.error || 'Document upload failed')
            }
        } catch (error) {
            console.error('Document upload failed:', error)
            alert('Document upload failed. Please try again.')
        } finally {
            setUploadingDocument(false)
        }
    }

    const lowercaseSearch = docSearchQuery.toLowerCase().trim()
    const visibleDocuments = documents
        .filter(doc => !lowercaseSearch || doc.fileName.toLowerCase().includes(lowercaseSearch))
        .filter(doc => !documentBookingFilter || doc.bookingId === documentBookingFilter)

    const handleSendMessage = async () => {
        if (!messageContent.trim()) return
        setSendingMessage(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: messageContent })
            })
            if (res.ok) {
                const newMessage = await res.json()
                setMessages([...messages, newMessage]) // Append to bottom
                setMessageContent('')
            }
        } catch (error) {
            console.error('Failed to send message:', error)
        } finally {
            setSendingMessage(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Keep rememberMe email so it's still pre-filled on next login
        router.push('/login')
    }

    const handleAvatarUpdate = async (url: string) => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/profile/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ avatar: url })
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
                localStorage.setItem('user', JSON.stringify(data.user))
                window.dispatchEvent(new Event('user-profile-updated'))
            }
        } catch (error) {
            console.error('Failed to update avatar:', error)
        }
    }

    const handleDeleteBooking = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this assignment protocol? This action is irreversible.')) return
        setIsPending(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/bookings?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setBookings(bookings.filter(b => b.id !== id))
            } else {
                const err = await res.json()
                alert(`Cancellation Failed: ${err.error}`)
            }
        } catch (error) {
            console.error('Delete booking failed:', error)
        } finally {
            setIsPending(false)
        }
    }

    // Smart cancel: checks 3PM deadline, shows fee modal
    const openCancelModal = async (bookingId: string) => {
        setCancelBookingId(bookingId)
        setCancelLoading(true)
        setShowCancelModal(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setCancelInfo(data)
        } catch (err) {
            console.error('Failed to check cancellation policy:', err)
            setCancelInfo(null)
        } finally {
            setCancelLoading(false)
        }
    }

    const openEditAddOns = (booking: any) => {
        setEditBookingId(booking.id)
        // Show an empty field with only placeholder text (no prefill)
        setEditNotes('')
        setEditAddOnSelection([])
    }

    const isEditAddOnSelected = (value: string) => editAddOnSelection.includes(value)
    const toggleEditAddOn = (value: string) => {
        setEditAddOnSelection(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
    }

    const saveEditAddOns = async () => {
        if (!editBookingId) return
        setEditSaving(true)
        try {
            const token = localStorage.getItem('token')
            const addOnNotes: string[] = []
            editAddOnSelection.forEach(value => {
                const option = effectiveAddOnOptions.find(o => o.value === value)
                if (option) addOnNotes.push(`${option.label} requested`)
            })

            const mergedNotes = [
                editNotes.trim(),
                addOnNotes.length ? `Add-Ons: ${addOnNotes.join('; ')}` : ''
            ].filter(Boolean).join('\n')

            const res = await fetch(`/api/bookings/${editBookingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ specialRequirements: mergedNotes })
            })
            if (res.ok) {
                const updated = await res.json()
                setBookings(bookings.map(b => b.id === updated.id ? { ...b, ...updated } : b))
                setEditBookingId(null)
            } else {
                const err = await res.json()
                alert(err.error || 'Unable to update add-ons')
            }
        } catch (e) {
            console.error('Save add-ons failed', e)
        } finally {
            setEditSaving(false)
        }
    }

    const confirmCancelBooking = async () => {
        if (!cancelBookingId) return
        setIsPending(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/bookings/${cancelBookingId}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                setBookings(bookings.map(b =>
                    b.id === cancelBookingId ? { ...b, bookingStatus: 'CANCELLED' } : b
                ))
                setShowCancelModal(false)
                setCancelBookingId(null)
                setCancelInfo(null)
                if (data.feeApplied) {
                    alert(`Booking cancelled. A $${data.feeAmount?.toFixed(2)} late cancellation fee has been invoiced to your account.`)
                }
            } else {
                alert(`Failed to cancel: ${data.error}`)
            }
        } catch (error) {
            console.error('Cancel booking failed:', error)
        } finally {
            setIsPending(false)
        }
    }

    const [contactMessage, setContactMessage] = useState('')
    const [contactSending, setContactSending] = useState(false)
    const [contactSent, setContactSent] = useState(false)
    const [copied, setCopied] = useState<string | null>(null)

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(key)
            setTimeout(() => setCopied(null), 2000)
        })
    }

    const handleContactAdmin = async () => {
        if (!contactMessage.trim()) return
        setContactSending(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: `[ADMIN REQUEST] ${contactMessage}` })
            })
            if (res.ok) {
                setContactSent(true)
                setContactMessage('')
                setTimeout(() => setContactSent(false), 4000)
            }
        } catch (err) {
            console.error('Failed to contact admin:', err)
        } finally {
            setContactSending(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm text-muted-foreground">Loading your portal…</p>
            </div>
        </div>
    )

    if (!user) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="h-10 w-10 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin"></div>
            <h2 className="text-xl font-black text-foreground">Session expired</h2>
            <p className="text-sm text-muted-foreground">We couldn&apos;t load your profile. Please sign in again.</p>
            <button
                onClick={() => router.push('/login')}
                className="luxury-button px-6 py-3"
            >
                Go to Login
            </button>
        </div>
    )



    return (
        <div className="px-2 sm:px-4 py-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in relative">
            {isPending && <LoadingOverlay />}
            {/* Client Profile Hero */}
            <div className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0 w-full md:w-auto">
                        <ProfileUpload
                            currentImage={user.avatar}
                            onUploadComplete={handleAvatarUpdate}
                        />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-5xl lg:text-5xl font-black text-foreground tracking-tighter uppercase leading-[0.8]">
                            Welcome back, <span className="text-primary italic">{user.firstName}</span>
                        </h2>
                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">Direct Client • Law Firm Professional</p>
                            <span className="hidden md:block h-1 w-1 rounded-full bg-border" />
                            <div className="flex items-center gap-1.5 text-blue-500 font-bold text-[9px] uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                <ShieldCheck className="h-3 w-3" /> Priority Status
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Link href="/client/bookings/new" className="luxury-button flex items-center gap-3 px-8 py-4 rounded-2xl bg-foreground text-background font-black text-[10px] uppercase tracking-[0.3em] w-full text-center">
                        <Plus className="h-4 w-4" /> <span>New Assignment</span>
                    </Link>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Click here to get started</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
                            <button onClick={() => navigateTab('bookings')} className="p-6 rounded-2xl bg-card border border-border/50 text-left hover:border-primary/40 transition-all hover:bg-primary/[0.02]">
                                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4 shadow-lg shadow-primary/10">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Active Bookings</p>
                                <p className="text-3xl font-black text-primary tracking-tighter uppercase">{stats.active}</p>
                            </button>

                            <button onClick={() => navigateTab('rates')} className="p-6 rounded-2xl bg-card border border-border/50 text-left hover:border-amber-500/40 transition-all hover:bg-amber-500/[0.02]">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 mb-4 shadow-lg shadow-amber-500/10">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Outstanding Balance</p>
                                <p className="text-3xl font-black text-amber-500 tracking-tighter uppercase">${stats.unpaid.toLocaleString()}</p>
                            </button>

                            <button onClick={() => navigateTab('documents')} className="p-6 rounded-2xl bg-card border border-border/50 text-left hover:border-violet-500/40 transition-all hover:bg-violet-500/[0.02]">
                                <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-500 mb-4 shadow-lg shadow-violet-500/10">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">My Documents</p>
                                <p className="text-3xl font-black text-violet-500 tracking-tighter uppercase">{stats.files}</p>
                            </button>
                        </div>

                        {/* Recent bookings */}
                        <div className="md-card overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                                <h3 className="font-semibold text-foreground">Recent Bookings</h3>
                                <button onClick={() => navigateTab('bookings')}
                                    className="text-sm text-primary hover:underline font-medium">View all</button>
                            </div>
                            <div className="divide-y divide-border">
                                {bookings.length > 0 ? (
                                    bookings.slice(0, 5).map(booking => (
                                        <ActivityRow
                                            key={booking.id}
                                            id={booking.bookingNumber}
                                            title={booking.service?.serviceName || booking.proceedingType}
                                            date={formatDateSafe(booking.bookingDate, 'MMM d, yyyy')}
                                            status={booking.bookingStatus}
                                            reporter={booking.reporter}
                                            onClick={() => booking.bookingStatus === 'ACCEPTED' && router.push(`/client/confirm/${booking.id}`)}
                                        />
                                    ))
                                ) : (
                                    <div className="py-16 text-center">
                                        <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">No bookings yet.</p>
                                        <Link href="/client/bookings/new" className="btn-primary mt-4 inline-flex text-sm">
                                            Schedule your first booking
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact card */}
                        <div className="md-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/20">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-foreground mb-0.5">Need assistance?</h4>
                                <p className="text-sm text-muted-foreground">Contact our team directly for any questions about scheduling or documents.</p>
                            </div>
                            <button onClick={() => navigateTab('messages')} className="btn-secondary text-sm flex-shrink-0">
                                Send a message
                            </button>
                        </div>
                    </>
                )}

                {activeTab === 'bookings' && (
                    <div className="md-card overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h3 className="font-semibold text-foreground">My Bookings</h3>
                            <Link href="/client/bookings/new" className="btn-primary text-sm">
                                <Plus className="h-4 w-4" /> New Booking
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(booking => (
                                <div key={booking.id} className={`p-5 md:p-8 rounded-3xl border transition-all group ${booking.bookingStatus === 'SUBMITTED' ? 'bg-amber-500/5 border-amber-500/20 shadow-lg shadow-amber-500/5' : 'bg-card border-border hover:border-primary/20 hover:shadow-2xl'}`}>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${booking.bookingStatus === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-600' : 'bg-muted/50 text-primary'}`}>
                                                <Calendar className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{booking.bookingNumber}</p>
                                                <h4 className="text-lg font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
                                                    {booking.service?.serviceName || booking.proceedingType}
                                                </h4>
                                                <p className="text-xs font-medium text-muted-foreground">{formatDateSafe(booking.bookingDate, 'EEEE, MMMM dd, yyyy')}</p>
                                                {booking.reporter && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-2.5 w-2.5 text-primary" />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                                            Reporter: {booking.reporter.firstName} {booking.reporter.lastName}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors
                                                                ${booking.bookingStatus === 'COMPLETED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                        booking.bookingStatus === 'ACCEPTED' ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' :
                                                            booking.bookingStatus === 'CONFIRMED' ? 'bg-primary/5 text-primary border-primary/10' :
                                                                booking.bookingStatus === 'SUBMITTED' ? 'bg-amber-500 text-white border-amber-600' :
                                                                    booking.bookingStatus === 'CANCELLED' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                                                        'bg-muted text-muted-foreground border-border'}`}>
                                                    {booking.bookingStatus}
                                                </span>
                                                {booking.bookingStatus === 'COMPLETED' && booking.invoice?.id && (
                                                    <Link
                                                        href={`/client/invoices/${booking.invoice.id}`}
                                                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 hover:border-emerald-500 flex items-center gap-1.5"
                                                    >
                                                        <DollarSign className="h-3 w-3" /> View Bill
                                                    </Link>
                                                )}
                                                {['SUBMITTED', 'ACCEPTED', 'CONFIRMED'].includes(booking.bookingStatus) && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openEditAddOns(booking) }}
                                                        className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/20 hover:border-primary flex items-center gap-1.5"
                                                        title="Edit add-ons / special requirements"
                                                    >
                                                        <Plus className="h-3 w-3" /> Add-Ons
                                                    </button>
                                                )}
                                                {/* Cancel button — available on all active statuses */}
                                                {['SUBMITTED', 'ACCEPTED', 'CONFIRMED', 'PENDING', 'MAYBE'].includes(booking.bookingStatus) && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openCancelModal(booking.id) }}
                                                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 hover:border-rose-500 flex items-center gap-1.5"
                                                        title="Cancel booking"
                                                    >
                                                        <X className="h-3 w-3" /> Cancel
                                                    </button>
                                                )}
                                            </div>
                                            {booking.bookingStatus === 'ACCEPTED' && (
                                                <Link href={`/client/confirm/${booking.id}`} className="text-[10px] font-black text-rose-600 uppercase underline tracking-widest">
                                                    Confirm Now
                                                </Link>
                                            )}
                                            {booking.bookingStatus === 'SUBMITTED' && (
                                                <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest animate-pulse">Awaiting Activation</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
                }
                {
                    activeTab === 'documents' && (
                        <div className="glass-panel rounded-[2.5rem] p-5 md:p-10">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">My Documents</h3>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:w-auto">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="relative flex-1 min-w-[220px]">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                placeholder="Search Documents..."
                                                value={docSearchQuery}
                                                onChange={(e) => setDocSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                            <span>Filter:</span>
                                            <select
                                                value={documentBookingFilter}
                                                onChange={(e) => setDocumentBookingFilter(e.target.value)}
                                                className="rounded-xl border border-border bg-card px-3 py-2 text-[9px] font-black uppercase tracking-tight outline-none"
                                            >
                                                <option value="">All bookings</option>
                                                {bookings.map((booking) => (
                                                    <option key={booking.id} value={booking.id}>
                                                        #{booking.bookingNumber} • {booking.proceedingType}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                        <span>Attach to booking</span>
                                        <select
                                            value={uploadBookingId}
                                            onChange={(e) => setUploadBookingId(e.target.value)}
                                            className="rounded-xl border border-border bg-card px-3 py-2 text-[9px] font-black uppercase tracking-tight outline-none"
                                        >
                                            <option value="">General document</option>
                                            {bookings.map((booking) => (
                                                <option key={booking.id} value={booking.id}>
                                                    #{booking.bookingNumber} • {booking.proceedingType}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                                <p>{allowedUploadCopy}</p>
                                {uploadingDocument && <span className="text-primary">Uploading document...</span>}
                            </div>
                            <div className="mb-6">
                                <label className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${uploadingDocument ? 'cursor-not-allowed bg-primary/40 text-primary-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                                    <Upload className="h-4 w-4" />
                                    <span>{uploadingDocument ? 'Uploading…' : 'Upload document'}</span>
                                    <input
                                        type="file"
                                        accept={uploadAcceptTypes}
                                        className="hidden"
                                        disabled={uploadingDocument}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            e.target.value = ''
                                            if (!file) return
                                            await handleDocumentUpload(file)
                                        }}
                                    />
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {visibleDocuments.length > 0 ? visibleDocuments.map(doc => (
                                    <div key={doc.id} className="p-6 rounded-2xl bg-card border border-border flex flex-col gap-4 hover:shadow-xl hover:border-primary/10 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${doc.fileType.includes('pdf') ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-foreground group-hover:text-primary transition-colors uppercase">{doc.fileName}</p>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase mt-1">
                                                    {doc.category.replace('_', ' ')} • {formatDateSafe(doc.createdAt, 'MMM dd')}
                                                </p>
                                            </div>
                                        </div>
                                        {doc.booking && (
                                            <div className="flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-primary">
                                                <span>#{doc.booking.bookingNumber}</span>
                                                <span className="text-muted-foreground">({doc.booking.proceedingType})</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-2">
                                                Download
                                                <Download className="h-4 w-4" />
                                            </a>
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                                                {new Date(doc.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-border rounded-[2rem]">
                                        <FileText className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No documents yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'rates' && (
                        <div className="glass-panel rounded-[2.5rem] p-5 md:p-10">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Rates & Billing</h3>
                                <div className="flex items-center gap-3 px-6 py-3 bg-primary/5 rounded-2xl border border-primary/20">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Outstanding:</span>
                                    <span className="text-lg font-black text-primary">${stats.unpaid.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="glass-panel rounded-[2rem] p-6 border border-border bg-background/80 space-y-3 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Financial Responsibility</p>
                                        <h4 className="text-3xl font-black text-foreground tracking-tight">{financialResponsibilityDays} Days</h4>
                                        <p className="text-[10px] uppercase tracking-tight text-muted-foreground mt-1">{isAgencyClient ? 'Agency Terms • Direct Deposit' : 'Client Terms • Standard Billing'}</p>
                                    </div>
                                    <div className="px-4 py-2 rounded-full border border-primary text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                        {isAgencyClient ? 'Agency' : 'Client'}
                                    </div>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">{cancellationSummaryText}</p>
                                <div className="mt-3 space-y-1">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Payment Terms</p>
                                    <p className="text-xs text-foreground font-semibold uppercase tracking-widest">{paymentTermsCopy}</p>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">{paymentTermsDescription}</p>
                                </div>
                                {isAgencyClient && (
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
                                        Agencies settle via direct deposit; billing records are maintained outside this portal. Contact the operations desk for statements.
                                    </p>
                                )}
                            </div>
                            {rateServicePreview.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {rateServicePreview.map(service => (
                                        <div key={service.id} className="p-6 rounded-2xl border border-border bg-card">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">{service.serviceName || 'Service'}</p>
                                            <p className="text-2xl font-black text-foreground">${Number(service.defaultMinimumFee ?? service.minimumFee ?? 400).toFixed(2)}</p>
                                            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] mt-2">Minimum Booking Fee</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="space-y-4">
                                {isAgencyClient ? (
                                    <div className="p-8 rounded-3xl bg-card border border-border text-center">
                                        <h4 className="text-lg font-black text-foreground uppercase tracking-tight mb-3">Agency Payments</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Agencies manage settlements via direct deposit. Billing statements and records are handled through your agency ledger; contact operations for copies.
                                        </p>
                                    </div>
                                ) : invoices.length > 0 ? invoices.map(invoice => (
                                    <div key={invoice.id} className="p-8 rounded-3xl bg-card border border-border hover:border-primary/20 hover:shadow-2xl transition-all group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                            <div className="flex items-center gap-6">
                                                <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <CreditCard className="h-7 w-7" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{invoice.invoiceNumber}</p>
                                                    <h4 className="text-lg font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
                                                        {invoice.booking?.service?.serviceName || invoice.booking?.proceedingType || 'Services Rendering'}
                                                    </h4>
                                                    <p className="text-xs font-medium text-muted-foreground">Issued: {formatDateSafe(invoice.invoiceDate, 'MMM dd, yyyy')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Total Due</p>
                                                    <p className="text-xl font-black text-foreground">${invoice.total.toLocaleString()}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-3">
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border
                                                            ${invoice.status === 'PAID' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                                        {invoice.status === 'SENT' ? 'BILLED / INVOICED' : invoice.status}
                                                    </span>
                                                    {invoice.status !== 'PAID' && (
                                                        <button className="text-[10px] font-black text-primary uppercase underline tracking-widest">Pay Bill</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center border-2 border-dashed border-border rounded-[2rem]">
                                        <CreditCard className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                                        <p className="text-xs font-black uppercase tracking-widest">No active bills found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'messages' && (
                        <div className="glass-panel rounded-[2.5rem] h-[700px] flex flex-col overflow-hidden bg-card border border-border">
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Messages</h3>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Direct channel to admin support</p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest">Live</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                                {messages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-muted-foreground">
                                        <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
                                        <p className="text-sm font-semibold text-foreground">No messages yet</p>
                                        <p className="text-xs text-muted-foreground">Start a thread and we will respond here.</p>
                                    </div>
                                )}
                                {messages.slice().reverse().map(msg => (
                                    <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-3 rounded-2xl border text-sm leading-relaxed ${msg.senderId === user?.id
                                            ? 'bg-primary text-primary-foreground border-primary/30 rounded-br-sm'
                                            : 'bg-muted text-foreground border-border rounded-bl-sm'
                                            }`}>
                                            <p className="text-[10px] uppercase font-black tracking-widest mb-1 text-muted-foreground">{msg.sender?.firstName || 'Support'}</p>
                                            <p>{msg.content}</p>
                                                    <p className="text-[9px] text-muted-foreground mt-1">{formatDateSafe(msg.createdAt, 'MMM d, hh:mm a')}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={msgScrollRef} />
                            </div>

                            <div className="p-5 border-t border-border bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <textarea
                                        className="flex-1 resize-none min-h-[80px] p-4 rounded-2xl bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Type your message..."
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={sendingMessage}
                                        className="h-[80px] w-20 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'services' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {services
                                    .filter(s => s.active)
                                    .map(service => (
                                    <button
                                        key={service.id}
                                        onClick={() => router.push(`/client/bookings/new?serviceId=${service.id}`)}
                                        className="text-left glass-panel rounded-[2.5rem] p-8 border border-border hover:shadow-2xl hover:border-primary/10 transition-all group w-full"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="h-12 w-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Cpu className="h-6 w-6" />
                                            </div>
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-100">Operational</span>
                                        </div>
                                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{service.serviceName}</h3>
                                        <p className="text-xs text-muted-foreground font-medium mb-8 leading-relaxed line-clamp-2">{service.description || 'Enterprise-grade stenographic data processing service.'}</p>

                                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                                            <div>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Base Rate</p>
                                                <p className="text-[10px] font-black text-foreground uppercase">Upon Approval</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Remote</p>
                                                <p className="text-[10px] font-black text-foreground uppercase">Per Quote</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">On-Site</p>
                                                <p className="text-[10px] font-black text-foreground uppercase">Authorized</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                {
                    activeTab === 'settings' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                            {/* ── User Identity Card ── */}
                            <div className="glass-panel rounded-[2rem] p-6 sm:p-8 border border-border">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <ShieldCheck className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Identity Management</h3>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Biometric & system credentials</p>
                                    </div>
                                </div>

                                {/* Profile Pic Upload */}
                                <div className="mb-8">
                                    <ProfileUpload
                                        label="Your Remote / On-Site Profile"
                                        currentImage={user.avatar}
                                        onUploadComplete={handleAvatarUpdate}
                                    />
                                </div>

                                {/* Profile hero */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-2xl bg-muted/40 border border-border mb-6">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg flex-shrink-0">
                                        {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-black text-foreground uppercase tracking-tight">{user.firstName} {user.lastName}</h4>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                        <span className="mt-1 inline-flex px-3 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">{user.role}</span>
                                    </div>
                                </div>

                                {/* Credentials Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* User ID */}
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                            <Hash className="h-3 w-3" /> Your User ID
                                        </label>
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-border group">
                                            <code className="flex-1 text-xs font-mono text-foreground truncate select-all">{user.id}</code>
                                            <button
                                                onClick={() => copyToClipboard(user.id, 'id')}
                                                className="h-7 w-7 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all flex-shrink-0"
                                                title="Copy User ID"
                                            >
                                                {copied === 'id' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                            <Mail className="h-3 w-3" /> Login Email
                                        </label>
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-border">
                                            <code className="flex-1 text-xs font-mono text-foreground truncate select-all">{user.email}</code>
                                            <button
                                                onClick={() => copyToClipboard(user.email, 'email')}
                                                className="h-7 w-7 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all flex-shrink-0"
                                                title="Copy Email"
                                            >
                                                {copied === 'email' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                            <ShieldCheck className="h-3 w-3" /> Account Role
                                        </label>
                                        <div className="flex items-center p-3 rounded-xl bg-muted border border-border">
                                            <span className="text-xs font-black text-foreground uppercase tracking-wide">{user.role}</span>
                                        </div>
                                    </div>

                                    {/* Password placeholder */}
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                            <KeyRound className="h-3 w-3" /> Password
                                        </label>
                                        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-muted border border-border">
                                            <span className="text-sm text-muted-foreground tracking-widest">••••••••••••</span>
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest cursor-pointer hover:underline" onClick={() => navigateTab('messages')}>Reset via Admin</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info note */}
                                <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                                    <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                        To update your credentials or reset your password, please contact the admin team using the form below. For security, credentials cannot be self-modified.
                                    </p>
                                </div>
                            </div>

                            {/* ── Contact Admin ── */}
                            <div className="glass-panel rounded-[2rem] p-6 sm:p-8 border border-border">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                                        <MessageSquare className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Contact Admin</h3>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">For ID updates, password resets, or billing queries</p>
                                    </div>
                                </div>

                                {/* Contact channels */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                    {[
                                        { icon: <MessageSquare className="h-4 w-4" />, label: 'Portal Message', desc: 'Fastest — avg 2h response', action: () => navigateTab('messages'), color: 'text-primary bg-primary/10 border-primary/20' },
                                        { icon: <Mail className="h-4 w-4" />, label: 'Email Admin', desc: 'admin@marinadubson.com', action: () => window.open('mailto:admin@marinadubson.com'), color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
                                        { icon: <Phone className="h-4 w-4" />, label: 'Phone Support', desc: '(212) 555-0100', action: () => window.open('tel:+12125550100'), color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
                                    ].map((ch, i) => (
                                        <button
                                            key={i}
                                            onClick={ch.action}
                                            className={`flex flex-col items-start gap-2 p-4 rounded-2xl border hover:shadow-lg transition-all group text-left ${ch.color}`}
                                        >
                                            <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                                                {ch.icon} {ch.label}
                                            </div>
                                            <p className="text-[9px] text-muted-foreground font-medium">{ch.desc}</p>
                                        </button>
                                    ))}
                                </div>

                                {/* Quick message form */}
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Quick Message to Admin</label>
                                    <textarea
                                        className="w-full p-4 rounded-2xl bg-muted/50 border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none"
                                        placeholder="Describe your request — e.g. 'Please reset my password' or 'I need to update my billing email to...' or 'My User ID access has changed...'"
                                        value={contactMessage}
                                        onChange={(e) => setContactMessage(e.target.value)}
                                    />

                                    {contactSent && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 animate-in fade-in duration-300">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Message sent! The admin team will respond shortly.</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleContactAdmin}
                                        disabled={contactSending || !contactMessage.trim()}
                                        className="btn-primary w-full justify-center py-3 disabled:opacity-50"
                                    >
                                        {contactSending ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                                        ) : (
                                            <><Send className="h-4 w-4" /> Send to Admin</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Sign Out */}
                            <div className="glass-panel rounded-[2rem] p-6 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-sm font-black text-foreground uppercase">Sign Out</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">You will be redirected to the login page.</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-destructive/30 text-destructive text-xs font-black uppercase tracking-widest hover:bg-destructive hover:text-white transition-all flex-shrink-0"
                                >
                                    <LogOut className="h-4 w-4" /> Sign Out
                                </button>
                            </div>
                        </div>
                    )
                }

            </div>

            {/* ── Cancel Booking Modal ── */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowCancelModal(false)} />
                    <div className="relative w-full max-w-md bg-card rounded-[2rem] p-7 shadow-3xl border border-border overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Cancel Booking</h3>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Review policy before confirming</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Policy Info */}
                        {cancelLoading ? (
                            <div className="py-10 flex flex-col items-center gap-3">
                                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Checking cancellation policy...</p>
                            </div>
                        ) : cancelInfo ? (
                            <>
                                {cancelInfo.canCancel ? (
                                    // FREE CANCELLATION
                                    <div className="mb-6 space-y-4">
                                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Free Cancellation</p>
                                            </div>
                                            <p className="text-xs text-emerald-700 leading-relaxed">{cancelInfo.message}</p>
                                        </div>
                                        <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 border border-border">
                                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Cancellation Deadline</p>
                                                <p className="text-xs font-bold text-foreground">{new Date(cancelInfo.deadline).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">You can cancel this booking at no charge. No invoice will be generated.</p>
                                    </div>
                                ) : (
                                    // LATE CANCELLATION — $400 FEE
                                    <div className="mb-6 space-y-4">
                                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle className="h-4 w-4 text-rose-500" />
                                        <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest">{lateFeeLabel}</p>
                                            </div>
                                            <p className="text-xs text-rose-700 leading-relaxed">{cancelInfo.lateFeePolicy ?? cancelInfo.message}</p>
                                        </div>
                                        <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 border border-border">
                                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Deadline Was</p>
                                                <p className="text-xs font-bold text-foreground">{new Date(cancelInfo.deadline).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Important Notice</p>
                                            <p className="text-xs text-amber-800 leading-relaxed">
                                                By proceeding, a <strong>${lateFeeAmountValue.toFixed(2)} cancellation invoice</strong> will be automatically generated and sent to your email. Payment is due within 14 days.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="flex-1 py-3 rounded-2xl bg-muted border border-border text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-foreground transition-all"
                                    >
                                        Keep Booking
                                    </button>
                                    <button
                                        onClick={confirmCancelBooking}
                                        className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${cancelInfo.canCancel
                                            ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20'
                                            : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20'
                                            }`}
                                    >
                                        {cancelInfo.canCancel ? 'Cancel — Free' : lateFeeButtonLabel}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground mb-6">Unable to load cancellation policy. Please try again.</p>
                                <button onClick={() => setShowCancelModal(false)} className="w-full py-3 rounded-2xl bg-muted border border-border text-muted-foreground font-black text-[10px] uppercase tracking-widest">Close</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Edit Add-Ons Modal ── */}
            {editBookingId && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setEditBookingId(null)} />
                    <div className="relative w-full max-w-lg bg-card rounded-[2rem] p-7 shadow-3xl border border-border overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Add-On Requests</h3>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Editable until final invoice is issued</p>
                            </div>
                            <button
                                onClick={() => setEditBookingId(null)}
                                className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {effectiveAddOnOptions.map(option => (
                                <label
                                    key={option.value}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-primary"
                                        checked={isEditAddOnSelected(option.value)}
                                        onChange={() => toggleEditAddOn(option.value)}
                                    />
                                    <span className="text-sm font-semibold text-foreground">{option.label}</span>
                                </label>
                            ))}
                        </div>

                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Add-On Notes / Special Requirements</label>
                        <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="w-full min-h-[140px] p-4 rounded-2xl bg-muted/50 border border-border text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Example: Add videographer; add realtime sync; expedite 1-day delivery..."
                        />
                        <p className="text-[10px] text-muted-foreground mt-2">We will apply these add-ons to this booking. Changes are allowed until the invoice is finalized.</p>

                        <div className="flex gap-3 justify-end mt-5">
                            <button
                                onClick={() => setEditBookingId(null)}
                                className="px-4 py-2.5 rounded-xl bg-muted border border-border text-muted-foreground text-[10px] font-black uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEditAddOns}
                                disabled={editSaving}
                                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg disabled:opacity-60"
                            >
                                {editSaving ? 'Requesting…' : 'Request Add-On'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatsCard({ label, value, icon, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-card p-8 rounded-[2rem] border border-border shadow-sm hover:shadow-xl transition-all group outline-none focus:ring-2 focus:ring-primary/20"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
            </div>
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{label}</h3>
            <p className="text-3xl font-black text-foreground tracking-tighter uppercase">{value}</p>
        </button>
    )
}

function ActivityRow({ id, title, date, status, reporter, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 cursor-pointer gap-4"
        >
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                <div className="flex-shrink-0 h-14 w-12 rounded-xl bg-card border border-border flex flex-col items-center justify-center shadow-sm overflow-hidden">
                    <span className="text-[8px] font-black text-muted-foreground uppercase leading-none mb-0.5">{date.split(' ')[0]}</span>
                    <span className="text-[14px] font-black text-foreground leading-none">{date.split(' ')[1].replace(',', '')}</span>
                    <span className="text-[8px] font-bold text-muted-foreground/60 leading-none mt-0.5">{date.split(' ')[2]}</span>
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors truncate">{title}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase shrink-0">{id} • Global Record</p>
                        {reporter && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-md border border-primary/20">
                                <User className="h-3 w-3 text-primary" />
                                <span className="text-[8px] font-black text-primary uppercase tracking-widest">Professional Assigned: {reporter.firstName} {reporter.lastName}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/10">
                {status === 'ACCEPTED' && (
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Action Required</span>
                )}
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors shrink-0
                    ${status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        status === 'ACCEPTED' ? 'bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-500/20' :
                            status === 'CONFIRMED' ? 'bg-primary/20 text-primary border-primary/30' :
                                'bg-muted/30 text-muted-foreground border-border/10'
                    }`}>
                    {status === 'ACCEPTED' ? 'Confirm' : status}
                </span>
            </div>
        </div>
    )
}
