'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    Calendar,
    FileText,
    LayoutDashboard,
    CreditCard,
    MessageSquare,
    CheckCircle,
    Clock,
    ShieldAlert,
    User,
    Plus,
    Download,
    Search,
    ChevronRight,
    ChevronLeft,
    Globe,
    Briefcase,
    Zap,
    Loader2,
    MapPin
} from 'lucide-react'

// Requirement 10 & 18: Expedite labels are now fetched from DB for real-time sync.

export default function NewBookingPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const requestedServiceId = searchParams.get('serviceId')
    const [step, setStep] = useState(1)
    const [services, setServices] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [addOnOptions, setAddOnOptions] = useState<any[]>([])
    const [isExpediteChecked, setIsExpediteChecked] = useState(false)

    const [formData, setFormData] = useState({
        serviceId: '',
        proceedingType: '',
        bookingDate: '',
        bookingTime: '09:00',
        appearanceType: '' as any, // Req 13: Must choose delivery method, no default.
        location: '',
        jurisdiction: '',
        specialRequirements: '',
        addOns: {
            expedite: '', // This will hold the turnaround value if checked
        },
        selectedAddOns: [] as string[],
        otherAddOnNotes: ''
    })

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return

                const res = await fetch('/api/services', {
                    cache: 'no-store',
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (res.ok) {
                    const data = await res.json()
                    const servicesList = Array.isArray(data.services) ? data.services : []
                    setServices(servicesList)
                    if (servicesList.length > 0) {
                        const requested = servicesList.find((s: any) => s.id === requestedServiceId)
                        const chosen = requested || servicesList[0]
                        setFormData(prev => ({
                            ...prev,
                            serviceId: chosen.id,
                            proceedingType: chosen.serviceName.toUpperCase()
                        }))
                    }
                }
            } catch (error) {
                console.error('Failed to fetch services:', error)
            }
        }
        fetchServices()
    }, [requestedServiceId])

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch('/api/add-ons', {
                    cache: 'no-store',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                })
                if (res.ok) {
                    const data = await res.json()
                    setAddOnOptions(Array.isArray(data.options) ? data.options : [])
                }
            } catch (error) {
                console.error('Failed to load add-on options:', error)
            }
        }
        fetchOptions()
    }, [])

    const activeAddOnOptions = addOnOptions.filter(o => 
        o.active && 
        o.category === 'ADD_ON' && 
        ['ROUGH_DRAFT', 'REAL_TIME', 'CART_SERVICES'].includes(o.value)
    )
    const displayExpediteOptions = addOnOptions.filter(o => 
        o.active && 
        o.category === 'EXPEDITE'
    ).sort((a, b) => parseFloat(b.value) - parseFloat(a.value))

    const toggleAddOnOption = (value: string) => {
        setFormData(prev => {
            const exists = prev.selectedAddOns.includes(value)
            const selected = exists ? prev.selectedAddOns.filter(v => v !== value) : [...prev.selectedAddOns, value]
            return { ...prev, selectedAddOns: selected }
        })
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            // Prepare Add-Ons: Only include expedite if checked
            const finalAddOns = {
                ...formData.addOns,
                expedite: isExpediteChecked ? formData.addOns.expedite : null
            }

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    addOns: finalAddOns,
                    hasRough: formData.selectedAddOns.includes('ROUGH_DRAFT'),
                    hasRealtime: formData.selectedAddOns.includes('REAL_TIME'),
                    hasCart: formData.selectedAddOns.includes('CART_SERVICES')
                })
            })

            if (res.ok) {
                setStep(4)
            } else {
                const err = await res.json()
                alert(`Booking failed: ${err.error || 'Server error'}`)
            }
        } catch (error) {
            console.error('Submit error:', error)
            alert('Failed to submit booking. Network error.')
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 pb-32 font-poppins">
            {/* Tactical Step Indicator */}
            <div className="flex items-center justify-center gap-8 mb-16 px-4">
                {[1, 2, 3].map(s => (
                    <div key={s} className="flex items-center gap-4">
                        <button onClick={() => s < step && setStep(s)} className={`flex flex-col items-center gap-2 group transition-all ${s > step ? 'opacity-40 pointer-events-none' : ''}`}>
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${step >= s ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
                                {s === 1 ? <User className="h-5 w-5" /> : s === 2 ? <MapPin className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>Step 0{s}</span>
                        </button>
                        {s < 3 && <div className={`h-0.5 w-16 rounded-full ${step > s ? 'bg-primary' : 'bg-muted'}`}></div>}
                    </div>
                ))}
            </div>

            <div className="glass-panel rounded-[3rem] p-10 md:p-16 relative overflow-hidden bg-white border border-slate-100 shadow-3xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-indigo-600"></div>

                {step === 1 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Proceeding Type</label>
                                <select className="luxury-input h-14" value={formData.serviceId} onChange={(e) => {
                                    const serviceId = e.target.value;
                                    const service = services.find(s => s.id === serviceId);
                                    setFormData({ 
                                        ...formData, 
                                        serviceId, 
                                        proceedingType: service?.serviceName?.toUpperCase() || '' 
                                    });
                                }}>
                                    <option value="">Select Proceeding Portfolio</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.serviceName}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Jurisdiction / Venue</label>
                                <input className="luxury-input h-14" placeholder="E.G. SUPREME COURT, NY COUNTY" value={formData.jurisdiction} onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-10 border-t border-border/50">
                            <button onClick={() => router.push('/client/bookings')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2">
                                <ChevronLeft /> BACK
                            </button>
                            <button onClick={() => setStep(2)} disabled={!formData.serviceId} className="bg-primary text-white rounded-2xl px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] shadow-3xl flex items-center gap-4 hover:bg-foreground hover:text-white transition-all group disabled:opacity-40">
                                FORWARD <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Delivery Method</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setFormData({...formData, appearanceType: 'REMOTE'})} className={`py-5 rounded-2xl border transition-all text-[9px] font-black uppercase tracking-widest ${formData.appearanceType === 'REMOTE' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-muted/50 border-gray-100'}`}>Remote Access</button>
                                    <button onClick={() => setFormData({...formData, appearanceType: 'IN_PERSON'})} className={`py-5 rounded-2xl border transition-all text-[9px] font-black uppercase tracking-widest ${formData.appearanceType === 'IN_PERSON' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-muted/50 border-gray-100'}`}>In-Person Presence</button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Scheduling Date</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                                    <input type="date" className="luxury-input h-14 pl-12" value={formData.bookingDate} onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Booking Start Time</label>
                                <div className="relative group">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                                    <input type="time" className="luxury-input h-14 pl-12" value={formData.bookingTime} onChange={(e) => setFormData({ ...formData, bookingTime: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Venue / Address Logistics</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                                    <input className="luxury-input h-14 pl-12" placeholder="STREET ADDRESS OR ZOOM/WEBEX LINK" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-10 border-t border-border/50">
                            <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2">
                                <ChevronLeft /> BACK
                            </button>
                            <button onClick={() => setStep(3)} disabled={!formData.bookingDate || !formData.appearanceType} className="bg-primary text-white rounded-2xl px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] shadow-3xl flex items-center gap-4 hover:bg-foreground transition-all disabled:opacity-40">
                                FORWARD <ChevronRight />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="space-y-8">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Add-on Enhancements</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {activeAddOnOptions.filter(o => o.value !== 'CART_SERVICES').map(option => (
                                    <label key={option.value} className={`flex items-center gap-4 p-6 rounded-2xl border transition-all cursor-pointer ${formData.selectedAddOns.includes(option.value) ? 'bg-primary/5 border-primary shadow-inner' : 'bg-muted/50 border-gray-100'}`}>
                                        <input type="checkbox" className="h-5 w-5 accent-primary rounded-lg" checked={formData.selectedAddOns.includes(option.value)} onChange={() => toggleAddOnOption(option.value)} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{option.label}</span>
                                    </label>
                                ))}
                                
                                {/* Requirement 11: Distinct CART Services Option */}
                                {activeAddOnOptions.find(o => o.value === 'CART_SERVICES') && (
                                    <label className={`flex items-center gap-4 p-6 rounded-2xl border transition-all cursor-pointer ${formData.selectedAddOns.includes('CART_SERVICES') ? 'bg-indigo-50 border-indigo-500 shadow-inner' : 'bg-muted/50 border-gray-100'}`}>
                                        <div className="h-10 w-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" className="h-5 w-5 accent-indigo-600 rounded-lg" checked={formData.selectedAddOns.includes('CART_SERVICES')} onChange={() => toggleAddOnOption('CART_SERVICES')} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-900 leading-none">CART Services (ADA)</span>
                                                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-[8px] font-black uppercase tracking-widest">Accessibility</span>
                                            </div>
                                        </div>
                                    </label>
                                )}

                                {/* Expedite Manual Toggle */}
                                <label className={`flex items-center gap-4 p-6 rounded-2xl border transition-all cursor-pointer ${isExpediteChecked ? 'bg-emerald-50 border-emerald-500 shadow-inner' : 'bg-muted/50 border-gray-100'}`}>
                                    <input type="checkbox" className="h-5 w-5 accent-emerald-600 rounded-lg" checked={isExpediteChecked} onChange={(e) => setIsExpediteChecked(e.target.checked)} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Expedite Request</span>
                                </label>
                            </div>
                        </div>

                        {isExpediteChecked && (
                            <div className="space-y-4 p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] animate-in slide-in-from-top-4 duration-500">
                                <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="h-3 w-3" /> Expedite Turnaround (Requirement 10)
                                </label>
                                <select className="luxury-input h-14 bg-white" value={formData.addOns.expedite} onChange={(e) => setFormData({ ...formData, addOns: { ...formData.addOns, expedite: e.target.value } })}>
                                    <option value="">Select Turnaround (Requirement 10)</option>
                                    {displayExpediteOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                                <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.2em] italic">Turnaround premium is applied as a percentage of the base page rate.</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Protocol Notes (Requirement 9)</label>
                            <textarea className="luxury-input min-h-[140px] py-6 resize-none" placeholder="Provide terminology preferences, case nuances, or witness specifics..." value={formData.specialRequirements} onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })} />
                        </div>

                        <div className="flex items-center justify-between pt-10 border-t border-border/50">
                            <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2">
                                <ChevronLeft /> BACK
                            </button>
                            <button onClick={() => handleSubmit()} disabled={loading} className="bg-foreground text-white rounded-2xl px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] shadow-3xl flex items-center gap-4 hover:bg-primary transition-all disabled:opacity-40">
                                {loading ? <Loader2 className="animate-spin" /> : <>Finalize Booking <CheckCircle className="h-4 w-4" /></>}
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                   <div className="py-24 text-center animate-in zoom-in-95 duration-700">
                       <div className="h-24 w-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                           <CheckCircle className="h-10 w-10 text-emerald-500" />
                       </div>
                       <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">Request Successful</h3>
                       <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto uppercase tracking-widest">Your booking request has been staged for concierge review. You will receive an operational confirmation shortly.</p>
                       <div className="mt-12 flex justify-center gap-4">
                           <button onClick={() => router.push('/client/bookings')} className="px-8 py-4 bg-muted rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all">View Active Jobs</button>
                           <button onClick={() => window.location.reload()} className="px-8 py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">New Request</button>
                       </div>
                   </div>
                )}
            </div>
        </div>
    )
}
