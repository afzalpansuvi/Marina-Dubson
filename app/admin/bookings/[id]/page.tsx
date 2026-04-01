'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, User, FileText, Loader2 } from 'lucide-react'

export default function BookingDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [booking, setBooking] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [services, setServices] = useState<any[]>([])
    const [saving, setSaving] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editData, setEditData] = useState<any>({})

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    router.push('/login')
                    return
                }

                const [bookingRes, servicesRes] = await Promise.all([
                    fetch(`/api/bookings/${params.id}`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/services', { headers: { Authorization: `Bearer ${token}` } })
                ])

                if (!bookingRes.ok) throw new Error('Booking not found')
                
                const bookingData = await bookingRes.json()
                const servicesData = await servicesRes.json()

                setBooking(bookingData)
                setServices(servicesData.services || [])
                setEditData({
                    serviceId: bookingData.serviceId,
                    proceedingType: bookingData.proceedingType,
                    lockedAppearanceFee: bookingData.lockedAppearanceFee || 0,
                    lockedPageRate: bookingData.lockedPageRate || 0,
                    lockedMinimumFee: bookingData.lockedMinimumFee || 0,
                })
            } catch (e: any) {
                setError(e.message || 'Unable to load data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [params.id, router])

    const handleSave = async () => {
        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/bookings/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            })
            if (res.ok) {
                const updated = await res.json()
                setBooking(updated)
                setEditMode(false)
            } else {
                alert('Update failed')
            }
        } catch (error) {
            console.error('Update error:', error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-lg font-bold text-foreground">Booking not found</p>
                <button onClick={() => router.back()} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Go back
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
            <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 rounded-lg border border-border hover:border-primary/40">
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Booking</p>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">#{booking.bookingNumber || booking.id}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard icon={<Calendar className="h-5 w-5" />} label="Date" value={new Date(booking.bookingDate).toLocaleDateString()} />
                <InfoCard icon={<Clock className="h-5 w-5" />} label="Time" value={booking.bookingTime} />
                <InfoCard icon={<MapPin className="h-5 w-5" />} label="Location" value={booking.location || 'Remote'} />
                <InfoCard icon={<User className="h-5 w-5" />} label="Client" value={booking.contact?.companyName || `${booking.contact?.firstName || ''} ${booking.contact?.lastName || ''}`} />
                <InfoCard icon={<FileText className="h-5 w-5" />} label="Proceeding" value={booking.proceedingType} />
                <InfoCard icon={<FileText className="h-5 w-5" />} label="Service" value={booking.service?.serviceName} />
            </div>

            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Special Requirements</p>
                <div className="p-4 rounded-2xl bg-muted/40 border border-border text-sm leading-relaxed">
                    {booking.specialRequirements || 'None provided.'}
                </div>
            </div>

            <div className="flex gap-3">
                <Link href="/admin/bookings" className="btn-secondary px-4 py-3 text-[10px] font-black uppercase tracking-widest">
                    Back to bookings
                </Link>
                <button 
                    onClick={() => setEditMode(!editMode)} 
                    className="btn-primary px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl"
                >
                    {editMode ? 'Cancel Editing' : 'Management Protocol'}
                </button>
            </div>

            {/* Management Protocol panel: edit the booking detail matrix */}
            {editMode && (
                <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-indigo-100 bg-indigo-50/5 p-10 animate-in slide-in-from-bottom-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-1 w-8 bg-indigo-500 rounded-full"></div>
                        <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest">Order Specification Matrix</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Classify Service</label>
                            <select 
                                className="luxury-input h-14" 
                                value={editData.serviceId} 
                                onChange={e => setEditData({...editData, serviceId: e.target.value})}
                            >
                                {services.map((s: any) => <option key={s.id} value={s.id}>{s.serviceName}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Proceeding Label</label>
                            <input 
                                className="luxury-input h-14" 
                                value={editData.proceedingType} 
                                onChange={e => setEditData({...editData, proceedingType: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Appearance $</label>
                            <input type="number" step="0.01" className="luxury-input h-12" value={editData.lockedAppearanceFee} onChange={e => setEditData({...editData, lockedAppearanceFee: parseFloat(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Page Rate $</label>
                            <input type="number" step="0.01" className="luxury-input h-12" value={editData.lockedPageRate} onChange={e => setEditData({...editData, lockedPageRate: parseFloat(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Cover Charge (Min) $</label>
                            <input type="number" step="0.01" className="luxury-input h-12" value={editData.lockedMinimumFee} onChange={e => setEditData({...editData, lockedMinimumFee: parseFloat(e.target.value)})} />
                        </div>
                    </div>

                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : null} Commit Structural Updates
                    </button>
                    <p className="mt-4 text-[9px] font-bold text-indigo-400 uppercase tracking-widest text-center italic">Req 12: Updating these details will sync directly to the upcoming invoice protocol.</p>
                </div>
            )}
        </div>
    )
}

function InfoCard({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
        </div>
    )
}
