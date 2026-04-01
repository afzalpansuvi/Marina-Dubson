'use client'

import { useState, useEffect } from 'react'
import {
    Plus,
    Trash2,
    Edit,
    Save,
    X,
    Search,
    Activity,
    Shield,
    DollarSign,
    Cpu,
    Zap,
    MessageSquare,
    Copy
} from 'lucide-react'

export default function ServicesAdmin() {
    const [services, setServices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [saving, setSaving] = useState(false)
    const [view, setView] = useState<'ACTIVE' | 'TEMPLATES'>('ACTIVE')
    const [formData, setFormData] = useState({
        serviceName: '',
        category: 'COURT_REPORTING',
        subService: 'DEPOSITION',
        defaultMinimumFee: 400,
        pageRate: 0,
        appearanceFeeRemote: 0,
        appearanceFeeInPerson: 0,
        realtimeFee: 0,
        expediteImmediate: 0,
        expedite1Day: 0,
        expedite2Day: 0,
        expedite3Day: 0,
        description: '',
        active: true,
        isTemplate: false,
    })

    useEffect(() => {
        fetchServices()
    }, [view])

    const fetchServices = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/services?isTemplate=${view === 'TEMPLATES'}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setServices(data.services || [])
        } catch (error) {
            console.error('Failed to fetch services:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (id?: string) => {
        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const method = id ? 'PATCH' : 'POST'
            const url = id ? `/api/services/${id}` : '/api/services'

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setIsEditing(null)
                setIsAdding(false)
                fetchServices()
                resetForm()
            }
        } catch (error) {
            console.error('Failed to save service:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/services/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) fetchServices()
        } catch (error) {
            console.error('Failed to delete service:', error)
        }
    }

    const resetForm = () => {
        setFormData({
            serviceName: '',
            category: 'COUR_REPORTING',
            subService: 'DEPOSITION',
            defaultMinimumFee: 400,
            pageRate: 0,
            appearanceFeeRemote: 0,
            appearanceFeeInPerson: 0,
            realtimeFee: 0,
            expediteImmediate: 1.25,
            expedite1Day: 1.10,
            expedite2Day: 1.00,
            expedite3Day: 0.90,
            description: '',
            active: true,
            isTemplate: view === 'TEMPLATES',
        })
    }

    const startEdit = (service: any) => {
        setIsEditing(service.id)
        setFormData(service)
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto font-poppins pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase flex items-center gap-4">
                        Service <span className="brand-gradient italic">Catalog</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] tracking-widest font-black uppercase border border-emerald-500/20 italic">
                            <Activity className="h-3 w-3 animate-pulse" /> Live Grid
                        </div>
                    </h1>
                    <p className="text-muted-foreground font-medium tracking-tight uppercase text-xs mt-2">Configuration matrix for all stenographic service endpoints.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex bg-muted p-1.5 rounded-2xl border border-border">
                        <button onClick={() => setView('ACTIVE')} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${view === 'ACTIVE' ? 'bg-white text-primary shadow-lg shadow-black/5' : 'text-slate-400 hover:text-slate-600'}`}>Standard Catalog</button>
                        <button onClick={() => setView('TEMPLATES')} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${view === 'TEMPLATES' ? 'bg-white text-primary shadow-lg shadow-black/5' : 'text-slate-400 hover:text-slate-600'}`}>Reusable Templates</button>
                    </div>
                    <button
                        onClick={() => { setIsAdding(true); resetForm(); }}
                        className="luxury-button py-4 flex items-center gap-3 shadow-xl shadow-primary/20"
                    >
                        <Plus className="h-5 w-5" /> Add {view === 'TEMPLATES' ? 'Template' : 'Service'}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <ContentStat label={`Total ${view === 'TEMPLATES' ? 'Templates' : 'Services'}`} value={services.length} icon={<Cpu />} color="text-primary" />
                <ContentStat label="System Ready" value={services.filter(s => s.active).length} icon={<Activity />} color="text-emerald-500" />
                <ContentStat label="Avg Rate" value={`$${(services.reduce((acc, s) => acc + s.pageRate, 0) / (services.length || 1)).toFixed(2)}`} icon={<DollarSign />} color="text-primary" />
                <ContentStat label="Mode" value={view} icon={<Shield />} color="text-indigo-500" />
            </div>

            {/* Quick Seed Action for User */}
            {services.length === 0 && !loading && (
                <div className="p-12 rounded-[3rem] bg-amber-500/5 border-2 border-dashed border-amber-500/20 text-center space-y-6">
                    <div className="h-20 w-20 bg-amber-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-amber-500">
                        <Plus className="h-10 w-10" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-amber-500 uppercase">Operational Void Detected</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mt-2 uppercase text-[10px] font-bold tracking-widest">No {view.toLowerCase()} added yet. Add your first {view === 'TEMPLATES' ? 'template' : 'service'} to begin.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map(service => (
                    <div key={service.id} className="group relative bg-card rounded-[2.5rem] p-8 border border-border hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                            {service.isTemplate ? <Copy className="h-24 w-24 text-indigo-500" /> : <Cpu className="h-24 w-24 text-primary" />}
                        </div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${service.active ? (service.isTemplate ? 'bg-indigo-500/10 text-indigo-500' : 'bg-primary/10 text-primary') : 'bg-muted text-muted-foreground grayscale'} border border-border`}>
                                {service.isTemplate ? <Copy className="h-7 w-7" /> : <Cpu className="h-7 w-7" />}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => startEdit(service)} className="h-10 w-10 rounded-xl bg-muted border border-border text-muted-foreground hover:text-primary transition-all flex items-center justify-center">
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDelete(service.id)} className="h-10 w-10 rounded-xl bg-muted border border-border text-muted-foreground hover:text-rose-500 transition-all flex items-center justify-center">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2 group-hover:text-primary transition-colors relative z-10">{service.serviceName}</h3>
                        <div className="flex gap-2 mb-6 relative z-10">
                            <span className="px-3 py-1 bg-muted text-[9px] font-black text-muted-foreground rounded-full uppercase tracking-widest border border-border">{service.category}</span>
                            <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest border ${service.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                {service.active ? 'Active' : 'Offline'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border relative z-10">
                            <div>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Page Rate</p>
                                <p className="text-lg font-black text-foreground uppercase tracking-tighter">${service.pageRate}/pg</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Remote Fee</p>
                                <p className="text-lg font-black text-foreground uppercase tracking-tighter">${service.appearanceFeeRemote}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Add/Edit */}
            {(isAdding || isEditing) && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12 lg:pl-80 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => { setIsAdding(false); setIsEditing(null); }}></div>
                    <div className="relative bg-card rounded-[3.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-12 shadow-3xl border border-border custom-scrollbar">
                        <button
                            onClick={() => { setIsAdding(false); setIsEditing(null); }}
                            className="absolute top-10 right-10 h-12 w-12 rounded-2xl bg-muted border border-border text-muted-foreground hover:text-foreground transition-all flex items-center justify-center"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-10">
                            {isEditing ? 'Edit' : 'Add'} {formData.isTemplate ? 'Template' : 'Service'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Service Identity</label>
                                <input
                                    className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold uppercase tracking-widest placeholder:text-muted-foreground/30"
                                    value={formData.serviceName}
                                    onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
                                    placeholder="e.g. Platinum Stenographic"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Category Matrix</label>
                                <select
                                    className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold uppercase tracking-widest"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="COURT_REPORTING">COURT REPORTING</option>
                                    <option value="ACCESSIBILITY">ACCESSIBILITY</option>
                                </select>
                            </div>

                            <Field label="Base Page Rate ($)" value={formData.pageRate} onChange={(v: any) => setFormData({ ...formData, pageRate: parseFloat(v) })} />
                            <Field label="Remote Presence Fee ($)" value={formData.appearanceFeeRemote} onChange={(v: any) => setFormData({ ...formData, appearanceFeeRemote: parseFloat(v) })} />
                            <Field label="On-Site Attendance ($)" value={formData.appearanceFeeInPerson} onChange={(v: any) => setFormData({ ...formData, appearanceFeeInPerson: parseFloat(v) })} />
                            <Field label="Real-time Stream Sync ($)" value={formData.realtimeFee} onChange={(v: any) => setFormData({ ...formData, realtimeFee: parseFloat(v) })} />

                            <div className="md:col-span-2 space-y-4">
                                <label className="flex items-center gap-4 p-6 rounded-2xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-all">
                                    <input 
                                        type="checkbox" 
                                        className="h-6 w-6 accent-indigo-600 rounded-lg" 
                                        checked={formData.isTemplate} 
                                        onChange={e => setFormData({ ...formData, isTemplate: e.target.checked })} 
                                    />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Save as Reusable Template</p>
                                        <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest italic mt-0.5">Templates are hidden from standard booking flows and reserved for administrative protocols.</p>
                                    </div>
                                </label>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Description & Structural Details</label>
                                <textarea
                                    className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-6 min-h-[120px] outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold uppercase tracking-widest placeholder:text-muted-foreground/30 resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="DETAILED CAPABILITIES AND PROTOCOLS..."
                                />
                            </div>
                        </div>

                        <div className="mt-12 flex justify-end gap-4">
                            <button
                                onClick={() => { setIsAdding(false); setIsEditing(null); }}
                                className="px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                            >
                                Abort Sequence
                            </button>
                            <button
                                onClick={() => handleSave(isEditing || undefined)}
                                disabled={saving}
                                className="luxury-button px-12 py-5 shadow-2xl shadow-primary/30 flex items-center gap-3 disabled:opacity-50"
                            >
                                {saving ? <Cpu className="h-4 w-4 animate-spin" /> : null}
                                {saving ? 'Processing...' : (isEditing ? 'Save Changes' : (formData.isTemplate ? 'Create Template' : 'Add Service'))}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function Field({ label, value, onChange }: any) {
    return (
        <div className="space-y-4">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">{label}</label>
            <input
                type="number"
                step="0.01"
                className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold uppercase tracking-widest"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    )
}

function ContentStat({ label, value, icon, color }: any) {
    return (
        <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex items-center gap-6 group overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 ${color}`}>
                {icon}
            </div>
            <div className={`h-14 w-14 rounded-2xl bg-muted flex items-center justify-center ${color} border border-border group-hover:bg-primary/10 transition-all`}>
                <div className="scale-110">{icon}</div>
            </div>
            <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-2xl font-black text-foreground leading-none uppercase tracking-tight">{value}</p>
            </div>
        </div>
    )
}
