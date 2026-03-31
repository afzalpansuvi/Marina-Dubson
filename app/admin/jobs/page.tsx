'use client'

import { useState, useEffect } from 'react'
import {
    Briefcase,
    CheckCircle,
    Clock,
    FileText,
    MoreVertical,
    UserCheck,
    Users,
    Search,
    Filter,
    Plus,
    Target,
    Zap,
    ArrowUpRight,
    TrendingUp,
    Shield,
    Trash2,
    Edit3,
    ArrowRight,
    X,
    Calendar,
    MapPin,
    AlertCircle,
    Building2,
    DollarSign,
    Check,
    Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function AdministrativeJobNexus() {
    const router = useRouter()
    const [bookings, setBookings] = useState<any[]>([])
    const [contacts, setContacts] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])
    const [reporters, setReporters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedJob, setSelectedJob] = useState<any>(null)

    // Form states
    const [formData, setFormData] = useState({
        contactId: '',
        serviceId: '',
        proceedingType: '',
        bookingDate: '',
        bookingTime: '09:00',
        location: '',
        venue: '',
        appearanceType: 'REMOTE' as 'REMOTE' | 'IN_PERSON',
        specialRequirements: '',
        priority: 'MEDIUM'
    })

    const [editFormData, setEditFormData] = useState<any>(null)
    const [saving, setSaving] = useState(false)

    // Claims states
    const [showClaimsModal, setShowClaimsModal] = useState(false)
    const [selectedBookingClaims, setSelectedBookingClaims] = useState<any[]>([])
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
    const [assigningJobId, setAssigningJobId] = useState<string | null>(null)
    const [assignStatus, setAssignStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
                fetchInitialData()
            }
        } catch (error) {
            console.error('Failed to accept claim:', error)
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

    useEffect(() => {
        if (showAddModal || showEditModal) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [showAddModal, showEditModal])

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const [bRes, cRes, sRes, rRes] = await Promise.all([
                fetch('/api/bookings', { headers }),
                fetch('/api/contacts', { headers }),
                fetch('/api/services', { headers }),
                fetch('/api/admin/users', { headers })
            ])

            const [bData, cData, sData, rData] = await Promise.all([
                bRes.json(),
                cRes.json(),
                sRes.json(),
                rRes.json()
            ])

            setBookings(Array.isArray(bData.bookings) ? bData.bookings : [])
            setContacts(Array.isArray(cData.contacts) ? cData.contacts : [])
            setServices(Array.isArray(sData.services) ? sData.services : [])
            setReporters((rData.users || []).filter((u: any) => u.role === 'REPORTER'))
        } catch (error) {
            console.error('Failed to fetch jobs data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setShowAddModal(false)
                fetchInitialData()
                // Reset form
                setFormData({
                    contactId: '',
                    serviceId: '',
                    proceedingType: '',
                    bookingDate: '',
                    bookingTime: '09:00',
                    location: '',
                    venue: '',
                    appearanceType: 'REMOTE',
                    specialRequirements: '',
                    priority: 'MEDIUM'
                })
            } else {
                const errorData = await res.json()
                alert(`Creation failed: ${errorData.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to create job:', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateJob = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedJob) return
        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            // Prepare payload: Convert empty strings back to null for Prisma
            const payload = {
                ...editFormData,
                reporterId: editFormData.reporterId === '' ? null : editFormData.reporterId
            }

            const res = await fetch(`/api/bookings/${selectedJob.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setShowEditModal(false)
                fetchInitialData()
            } else {
                const errorData = await res.json()
                alert(`Update failed: ${errorData.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to update job:', error)
            alert('Communication with the job nexus failed. System error detected.')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteJob = async (id: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                fetchInitialData()
            }
        } catch (error) {
            console.error('Failed to delete job:', error)
        }
    }

    const openEditModal = (job: any) => {
        setSelectedJob(job)
        setEditFormData({
            bookingStatus: job.bookingStatus,
            isMarketplace: job.isMarketplace,
            reporterId: job.reporterId || '',
            notes: job.notes || '',
            lockedReporterPageRate: job.lockedReporterPageRate || '',
            lockedReporterAppearanceFee: job.lockedReporterAppearanceFee || ''
        })
        setShowEditModal(true)
    }

    const filteredBookings = bookings.filter(b => {
        const query = searchQuery.toLowerCase()
        return (
            b.bookingNumber?.toLowerCase().includes(query) ||
            b.proceedingType?.toLowerCase().includes(query) ||
            b.contact?.companyName?.toLowerCase().includes(query) ||
            b.contact?.firstName?.toLowerCase().includes(query) ||
            b.contact?.lastName?.toLowerCase().includes(query)
        )
    })


    const [publishingJobId, setPublishingJobId] = useState<string | null>(null)

    const toggleMarketplace = async (job: any) => {
        if (publishingJobId === job.id) return
        setPublishingJobId(job.id)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/bookings/${job.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isMarketplace: !job.isMarketplace })
            })
            if (res.ok) {
                fetchInitialData()
            } else {
                alert('Failed to update marketplace status')
            }
        } catch (error) {
            console.error('Marketplace toggle error:', error)
        } finally {
            setPublishingJobId(null)
        }
    }

    const handleAssignToMyself = async (jobId: string) => {
        if (!confirm('Assign this job to yourself and remove it from the marketplace?')) return
        setAssignStatus(null)
        setAssigningJobId(jobId)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/bookings/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ bookingId: jobId })
            })
            if (!res.ok) {
                const data = await res.json().catch(() => null)
                throw new Error(data?.error || 'Assignment failed')
            }
            setAssignStatus({ type: 'success', text: 'Job assigned to you and removed from the marketplace.' })
            fetchInitialData()
        } catch (error: any) {
            console.error('Assign job failed:', error)
            setAssignStatus({ type: 'error', text: error.message || 'Unable to assign job.' })
        } finally {
            setAssigningJobId(null)
        }
    }

    const sectors = [
        { title: 'Pending Intake', status: ['SUBMITTED', 'PENDING'], colorClass: 'text-amber-600 bg-amber-50 border-amber-200' },
        { title: 'Confirmed / Active', status: ['ACCEPTED', 'CONFIRMED'], colorClass: 'text-blue-600 bg-blue-50 border-blue-200' },
        { title: 'Completed', status: ['COMPLETED'], colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 pb-24 animate-in fade-in duration-500 font-poppins bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        Job Inventory
                    </h1>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">Assignment Lifecycle & Resource Management</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 shadow-sm"
                            placeholder="Search by ID or type..."
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white rounded-xl px-6 py-3 font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus className="h-4 w-4" /> New Job Entry
                    </button>
                </div>
            </div>

            {assignStatus && (
                <div className={`max-w-7xl mx-auto px-6 ${assignStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-600'} text-xs font-black uppercase tracking-[0.3em]`}>
                    {assignStatus.text}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <JobStat label="Total Jobs" value={bookings.length.toString()} trend="Global Pool" icon={<Briefcase />} color="text-blue-600" />
                <JobStat label="Unassigned" value={bookings.filter(b => !b.reporterId).length.toString()} trend="Pending Reporter" icon={<Users />} color="text-slate-400" />
                <JobStat label="Active Jobs" value={bookings.filter(b => b.bookingStatus === 'ACCEPTED' || b.bookingStatus === 'CONFIRMED').length.toString()} trend="Daily Ops" icon={<Clock />} color="text-blue-600" />
                <JobStat label="Market Live" value={bookings.filter(b => b.isMarketplace).length.toString()} trend="Pending Claims" icon={<TrendingUp />} color="text-emerald-600" />
            </div>

            {/* Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {sectors.map((sector, idx) => {
                    const sectorBookings = filteredBookings.filter(b => sector.status.includes(b.bookingStatus))
                    return (
                        <div key={idx} className="space-y-6">
                            <div className={`flex items-center justify-between p-4 rounded-xl border-l-4 ${sector.colorClass} shadow-sm bg-white`}>
                                <span className="text-xs font-bold uppercase tracking-widest">{sector.title}</span>
                                <span className="text-xs font-extrabold">{sectorBookings.length}</span>
                            </div>
                            <div className="space-y-4">
                                {sectorBookings.length === 0 ? (
                                    <div className="py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                        <p className="text-xs font-bold text-slate-400 uppercase">No jobs here</p>
                                    </div>
                                ) : (
                                    sectorBookings.map(job => (
                                        <JobOperationalCard
                                            key={job.id}
                                            job={job}
                                            isPublishing={publishingJobId === job.id}
                                            isAssigning={assigningJobId === job.id}
                                            onToggleMarket={() => toggleMarketplace(job)}
                                            onDelete={() => handleDeleteJob(job.id)}
                                            onEdit={() => openEditModal(job)}
                                            onViewClaims={() => viewClaims(job.id)}
                                            onAssignToSelf={() => handleAssignToMyself(job.id)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Claims Modal */}
            {showClaimsModal && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowClaimsModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 uppercase">Marketplace Claims</h2>
                            <button onClick={() => setShowClaimsModal(false)} className="p-2 rounded-xl bg-slate-100 text-slate-500"><X /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {selectedBookingClaims.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No claims received yet</div>
                            ) : (
                                selectedBookingClaims.map((claim) => (
                                    <div key={claim.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                {claim.reporter.firstName[0]}{claim.reporter.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{claim.reporter.firstName} {claim.reporter.lastName}</p>
                                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest italic">Reporter Interested</p>
                                            </div>
                                        </div>
                                        {claim.status === 'PENDING' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => declineClaim(claim.id)} className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50">Decline</button>
                                                <button onClick={() => acceptClaim(claim.id)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700">Accept</button>
                                            </div>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${claim.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                {claim.status}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modals... (Add/Edit modals simplified below) */}
            {showAddModal && <JobModal title="New Job" onClose={() => setShowAddModal(false)} onSubmit={handleCreateJob} saving={saving} data={formData} setData={setFormData} contacts={contacts} services={services} />}
            {showEditModal && <EditModal title="Edit Job" onClose={() => setShowEditModal(false)} onSubmit={handleUpdateJob} saving={saving} data={editFormData} setData={setEditFormData} job={selectedJob} reporters={reporters} />}
        </div>
    )
}

function JobOperationalCard({ job, onDelete, onEdit, onToggleMarket, isPublishing, onViewClaims, onAssignToSelf, isAssigning }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{job.bookingNumber}</span>
                <div className="flex gap-2 flex-wrap">
                    {job.isMarketplace && (
                        <button onClick={onViewClaims} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="View Claims">
                            <TrendingUp className="h-4 w-4" />
                        </button>
                    )}
                    {!job.reporterId && onAssignToSelf && (
                        <button
                            onClick={onAssignToSelf}
                            disabled={isAssigning}
                            className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all bg-foreground/5 text-foreground hover:bg-foreground hover:text-white disabled:opacity-50"
                        >
                            {isAssigning ? 'Assigning…' : 'Assign Job to Myself'}
                        </button>
                    )}
                    <button onClick={onEdit} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors">
                        <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={onDelete} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-2">{job.proceedingType}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2 mb-6">
                <Building2 className="h-3.5 w-3.5" />
                {job.contact?.companyName || `${job.contact?.firstName} ${job.contact?.lastName}`}
            </p>

            <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                <div>
                    {job.reporter ? (
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                                <UserCheck className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 uppercase">{job.reporter.firstName}</span>
                        </div>
                    ) : (
                        <span className="text-[11px] font-bold text-red-600 italic uppercase">Unassigned</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Marketplace Toggle - Publish/Unpublish only */}
                    <button
                        onClick={onToggleMarket}
                        disabled={isPublishing}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${job.isMarketplace ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                            }`}
                    >
                        {isPublishing ? '...' : job.isMarketplace ? 'Unpublish' : 'Publish'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function JobStat({ label, value, trend, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <div className={`${color} opacity-20 group-hover:opacity-100 transition-opacity`}>{icon}</div>
            </div>
            <div className="text-3xl font-black text-slate-900">{value}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{trend}</p>
        </div>
    )
}

// Simplified Modals to follow
function JobModal({ title, onClose, onSubmit, saving, data, setData, contacts, services }: any) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 uppercase">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 text-slate-500"><X /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <select className="luxury-input h-14" value={data.contactId} onChange={e => setData({ ...data, contactId: e.target.value })} required>
                            <option value="">Select Contact</option>
                            {contacts.map((c: any) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                        </select>
                        <select className="luxury-input h-14" value={data.serviceId} onChange={e => setData({ ...data, serviceId: e.target.value })} required>
                            <option value="">Select Service Portfolio</option>
                            {services.map((s: any) => <option key={s.id} value={s.id}>{s.serviceName}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <select className="luxury-input h-14 font-extrabold" value={data.proceedingType} onChange={e => setData({ ...data, proceedingType: e.target.value })} required>
                            <option value="">Select Proceeding Protocol</option>
                            {services.map((s: any) => <option key={s.id} value={s.serviceName.toUpperCase()}>{s.serviceName}</option>)}
                            <option value="OTHER">OTHER</option>
                        </select>
                        <select className="luxury-input h-14" value={data.appearanceType} onChange={e => setData({ ...data, appearanceType: e.target.value })}>
                            <option value="REMOTE">REMOTE</option>
                            <option value="IN_PERSON">IN_PERSON</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                            <input type="date" className="luxury-input h-14 pl-12" value={data.bookingDate} onChange={e => setData({ ...data, bookingDate: e.target.value })} required />
                        </div>
                        <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                            <input type="time" className="luxury-input h-14 pl-12" value={data.bookingTime} onChange={e => setData({ ...data, bookingTime: e.target.value })} required />
                        </div>
                    </div>
                    <input className="luxury-input h-14" placeholder="Venue / Address" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} />
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold uppercase rounded-xl">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-4 bg-blue-600 text-white font-bold uppercase rounded-xl hover:bg-blue-700 disabled:opacity-50">
                            {saving ? 'Processing...' : 'Deploy Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function EditModal({ title, onClose, onSubmit, saving, data, setData, reporters }: any) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-slate-900 uppercase mb-8">{title}</h2>
                <form onSubmit={onSubmit} className="space-y-6">
                    <select className="luxury-input h-14" value={data.bookingStatus} onChange={e => setData({ ...data, bookingStatus: e.target.value })}>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="DECLINED">DECLINED</option>
                    </select>
                    <select className="luxury-input h-14" value={data.reporterId} onChange={e => setData({ ...data, reporterId: e.target.value })}>
                        <option value="">Unassigned</option>
                        {reporters.map((r: any) => <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>)}
                    </select>

                    {data.reporterId && (
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Locked Page Rate (Payable)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100"
                                        value={data.lockedReporterPageRate || ''}
                                        onChange={e => setData({ ...data, lockedReporterPageRate: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Locked Appearance (Payable)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100"
                                        value={data.lockedReporterAppearanceFee || ''}
                                        onChange={e => setData({ ...data, lockedReporterAppearanceFee: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <textarea className="luxury-input min-h-[80px]" placeholder="Staff Notes" value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })} />
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold uppercase rounded-xl">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-4 bg-blue-600 text-white font-bold uppercase rounded-xl hover:bg-blue-700">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
