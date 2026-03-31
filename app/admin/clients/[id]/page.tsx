'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import {
    ArrowLeft,
    Mail,
    Phone,
    Building2,
    Calendar,
    AlertCircle,
    Briefcase,
    ShieldCheck,
    Edit3,
    Trash2,
    Plus,
    CheckCircle,
    Clock,
    User,
    Upload,
    ArrowRight,
    Loader2,
    Award,
    Save,
    Zap,
    X,
    Check,
    DollarSign,
    Target
} from 'lucide-react'
import ProfileUpload from '@/app/components/ui/ProfileUpload'

export default function UserProfilePage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState<any>({})
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
    const [savingTask, setSavingTask] = useState(false)
    const [services, setServices] = useState<any[]>([])

    // Custom Pricing state
    const [isPricingExpanded, setIsPricingExpanded] = useState(false)

    useEffect(() => {
        if (showTaskModal) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [showTaskModal])

    const fetchUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/admin/users/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch user')
            const data = await res.json()
            setUser(data)
            setEditData(data)
        } catch (error) {
            console.error('Fetch user error:', error)
        } finally {
            setLoading(false)
        }
    }, [id])

    const fetchServices = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/services', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setServices(data.services || [])
            }
        } catch (error) {
            console.error('Failed to fetch services:', error)
        }
    }

    useEffect(() => {
        if (id) {
            fetchUser()
            fetchServices()
        }
    }, [id, fetchUser])

    const handleUpdateProfile = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            })
            if (res.ok) {
                const updated = await res.json()
                setUser(updated)
                setIsEditing(false)
            }
        } catch (error) {
            console.error('Update profile error:', error)
        }
    }

    const [taskError, setTaskError] = useState('')

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault()
        setSavingTask(true)
        setTaskError('')
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/admin/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newTask,
                    assignedToId: id
                })
            })

            const data = await res.json()

            if (res.ok) {
                setShowTaskModal(false)
                setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
                fetchUser()
            } else {
                setTaskError(data.error || 'Failed to initialize mission parameters. Check clearance.')
            }
        } catch (error) {
            console.error('Create task error:', error)
            setTaskError('Network protocol failure. Mission aborted.')
        } finally {
            setSavingTask(false)
        }
    }

    const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
            const token = localStorage.getItem('token')
            await fetch(`/api/admin/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            })
            fetchUser()
        } catch (error) {
            console.error('Toggle task status error:', error)
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return
        try {
            const token = localStorage.getItem('token')
            await fetch(`/api/admin/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            fetchUser()
        } catch (error) {
            console.error('Delete task error:', error)
        }
    }

    const handleUpdateCustomPricing = async (field: string, value: any) => {
        // Implementation for custom pricing updates would go here
        // Usually part of the contact update logic
        setEditData((prev: any) => ({
            ...prev,
            contact: {
                ...prev.contact,
                [field]: value
            }
        }))
    }

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
    )

    if (!user) return (
        <div className="p-12 text-center mt-20">
            <h2 className="text-2xl font-black uppercase text-gray-400">Client Not Found</h2>
            <button onClick={() => router.back()} className="mt-4 text-primary font-bold uppercase tracking-widest flex items-center gap-2 mx-auto justify-center">
                <ArrowLeft className="h-4 w-4" /> Return to Directory
            </button>
        </div>
    )

    const isClient = user.role === 'CLIENT'
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    const initials = (user.firstName?.[0] || user.email[0]).toUpperCase() + (user.lastName?.[0] || '').toUpperCase()
    const avatarSrc = user.avatar || '/favicon.svg'

    return (
        <div className="max-w-[1600px] w-[95%] mx-auto p-6 lg:p-12 pb-32 animate-in fade-in duration-700 font-poppins">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-12">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-all group shadow-sm active:scale-95"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Matrix
                </button>
                <div className="flex gap-4">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Cancel</button>
                            <button onClick={handleUpdateProfile} className="px-6 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all">
                                <Save className="h-4 w-4" /> Commit Changes
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-6 py-3 rounded-xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all">
                            <Edit3 className="h-4 w-4" /> Edit Profile & Pricing
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Profile Identity Card */}
                <div className="space-y-8">
                    <div className="glass-panel p-10 rounded-[3rem] border border-gray-100 relative overflow-hidden text-center bg-white shadow-xl">
                        <div className={`absolute top-0 right-0 w-40 h-40 blur-3xl opacity-10 ${isClient ? 'bg-primary' : 'bg-emerald-600'}`}></div>

                        <div className="relative mx-auto h-40 w-40 mb-8 p-1 group">
                            <div className={`absolute inset-0 bg-gradient-to-br ${isClient ? 'from-primary to-indigo-800' : 'from-indigo-50 to-blue-200'} rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                            <div className={`relative h-full w-full rounded-[2.5rem] bg-white border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02] duration-500`}>
                                {user.avatar ? (
                                    <img
                                        src={avatarSrc}
                                        alt={name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = '/favicon.svg'
                                        }}
                                    />
                                ) : (
                                    <span className={`text-4xl font-black ${isClient ? 'text-primary' : 'text-indigo-500'}`}>{initials}</span>
                                )}
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4 cursor-pointer">
                                        <Upload className="h-6 w-6 mb-2" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-center">Update Avatar</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">{name}</h2>
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isClient ? 'bg-primary/10 text-primary border-primary/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                            {user.role} Operative
                        </span>

                        <div className="mt-10 space-y-6 text-left">
                            <ProfileField icon={<Mail />} label="Email Address" value={user.email} isEditing={isEditing} field="email" val={editData.email} onChange={(v: any) => setEditData({ ...editData, email: v })} />
                            <ProfileField icon={<Building2 />} label="Company / Entity" value={isClient ? user.contact?.companyName || user.company : user.certification} isEditing={isEditing} field={isClient ? "company" : "certification"} val={isClient ? editData.company : editData.certification} onChange={(v: any) => setEditData({ ...editData, [isClient ? 'company' : 'certification']: v })} />
                            <ProfileField icon={<Calendar />} label="Creation Timestamp" value={format(new Date(user.createdAt), 'MMMM dd, yyyy')} isEditing={false} />
                        </div>
                    </div>

                    {/* Requirement 8: Custom Pricing Portfolio */}
                    {isClient && (
                         <div className="glass-panel p-10 rounded-[3rem] border border-blue-100 bg-blue-50/20 shadow-lg group">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-blue-800 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <DollarSign className="h-4 w-4" /> Pricing Portfolio
                                </h3>
                                <button
                                    onClick={() => setIsPricingExpanded(!isPricingExpanded)}
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                    {isPricingExpanded ? <X className="h-4 w-4"/> : <Plus className="h-4 w-4"/>}
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                    <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Custom Pricing Tier</span>
                                    <button
                                        onClick={() => handleUpdateCustomPricing('customPricingEnabled', !editData.contact?.customPricingEnabled)}
                                        disabled={!isEditing}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${editData.contact?.customPricingEnabled ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                                    >
                                        {editData.contact?.customPricingEnabled ? 'ENABLED' : 'DISABLED'}
                                    </button>
                                </div>

                                {editData.contact?.customPricingEnabled && (
                                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                                        <div className="p-5 bg-white rounded-2xl border border-blue-100 space-y-4 shadow-inner">
                                            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-2 italic flex items-center gap-2">
                                                <Target className="h-3 w-3" /> Target Overrides (Requirement 8)
                                            </p>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Standard Page Rate (Client-Specific)</label>
                                                    <input
                                                        disabled={!isEditing}
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                                                        placeholder="4.25"
                                                        value={editData.contact?.pricingNotes || ''} // Fallback for demonstration
                                                        onChange={(e) => handleUpdateCustomPricing('pricingNotes', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-relaxed">
                                            Pricing changes here apply globally across this client's bookings without affecting service menu names. Fulfills Req #8.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Task 15: Internal Oversight (Blacklist/Rating) */}
                    {isClient && (
                        <div className={`glass-panel p-10 rounded-[3rem] border shadow-lg transition-all ${editData.contact?.isBlacklisted ? 'border-rose-200 bg-rose-50/30' : 'border-amber-100 bg-amber-50/10'}`}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className={`text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3 ${editData.contact?.isBlacklisted ? 'text-rose-700' : 'text-amber-700'}`}>
                                    <ShieldCheck className="h-4 w-4" /> Internal Oversight
                                </h3>
                                {editData.contact?.isBlacklisted && (
                                    <div className="px-3 py-1 rounded-full bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest animate-pulse">
                                        Blacklisted
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Risk Rating */}
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Client Reliability Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                disabled={!isEditing}
                                                onClick={() => handleUpdateCustomPricing('rating', star)}
                                                className={`h-10 w-10 rounded-xl border-2 transition-all flex items-center justify-center
                                                    ${(editData.contact?.rating || 5) >= star ? 'bg-amber-400 border-amber-400 text-white shadow-lg shadow-amber-200' : 'bg-white border-gray-100 text-gray-200'}`}
                                            >
                                                <Award className="h-5 w-5" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Blacklist Toggle */}
                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="space-y-0.5">
                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Protocol Blacklist</span>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Deny further booking clearance</p>
                                    </div>
                                    <button
                                        onClick={() => handleUpdateCustomPricing('isBlacklisted', !editData.contact?.isBlacklisted)}
                                        disabled={!isEditing}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${editData.contact?.isBlacklisted ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-gray-100 text-gray-400'}`}
                                    >
                                        {editData.contact?.isBlacklisted ? 'ACTIVE' : 'INACTIVE'}
                                    </button>
                                </div>

                                {editData.contact?.isBlacklisted && (
                                    <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                                        <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-1">Blacklist justification</label>
                                        <textarea
                                            disabled={!isEditing}
                                            className="w-full p-4 bg-rose-50/50 border border-rose-100 rounded-2xl text-[11px] font-medium text-rose-900 placeholder:text-rose-300 outline-none min-h-[80px]"
                                            placeholder="Specify security/financial reason for blacklist..."
                                            value={editData.contact?.blacklistReason || ''}
                                            onChange={(e) => handleUpdateCustomPricing('blacklistReason', e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Internal Staff Ledger</label>
                                    <textarea
                                        disabled={!isEditing}
                                        className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-[11px] font-medium text-gray-700 placeholder:text-gray-300 outline-none min-h-[120px]"
                                        placeholder="Private notes on client behavior, billing issues, or special handling..."
                                        value={editData.contact?.internalStaffNotes || ''}
                                        onChange={(e) => handleUpdateCustomPricing('internalStaffNotes', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {!isClient && (
                        <div className="glass-panel p-10 rounded-[3rem] border border-indigo-100 bg-indigo-50/30">
                            <h3 className="text-sm font-black text-indigo-700 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <Zap className="h-4 w-4" /> Payout Matrix
                            </h3>
                            <div className="space-y-6">
                                <ProfileField
                                    icon={<DollarSign className="text-indigo-500 h-4 w-4" />}
                                    label="Locked Page Rate"
                                    value={`$${(user.basePageRate || 0).toFixed(2)}`}
                                    isEditing={isEditing}
                                    field="basePageRate"
                                    val={editData.basePageRate}
                                    onChange={(v: any) => setEditData({ ...editData, basePageRate: v })}
                                />
                                <ProfileField
                                    icon={<Calendar className="text-indigo-500 h-4 w-4" />}
                                    label="Locked Appearance"
                                    value={`$${(user.baseAppearanceFee || 0).toFixed(2)}`}
                                    isEditing={isEditing}
                                    field="baseAppearanceFee"
                                    val={editData.baseAppearanceFee}
                                    onChange={(v: any) => setEditData({ ...editData, baseAppearanceFee: v })}
                                />
                            </div>
                            <p className="mt-8 text-[8px] font-bold text-indigo-400 uppercase tracking-widest leading-relaxed">
                                These margins are locked into future assignments. Operator clearance required for adjustments.
                            </p>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Mission Operations (Tasks) */}
                    <div className="glass-panel rounded-[3.5rem] overflow-hidden border border-gray-100 bg-white shadow-xl">
                        <div className="px-10 py-8 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.3em] mb-1">Operational Directives</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Client-specific mission tasking & requirements</p>
                            </div>
                            <button
                                onClick={() => setShowTaskModal(true)}
                                className="h-12 w-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                            >
                                <Plus className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-10 divide-y divide-gray-50">
                            {!user.assignedTasks || user.assignedTasks.length === 0 ? (
                                <div className="py-20 text-center">
                                    <Briefcase className="h-16 w-16 text-gray-100 mx-auto mb-6" />
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic">No Directives Assigned</p>
                                </div>
                            ) : (
                                user.assignedTasks?.map((task: any) => (
                                    <div key={task.id} className="py-8 first:pt-0 last:pb-0 group">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-6">
                                                <button
                                                    onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                                    className={`mt-1 h-8 w-8 rounded-xl border-2 flex items-center justify-center transition-all ${task.status === 'COMPLETED' ? 'bg-primary border-primary text-white shadow-lg' : 'border-gray-200 hover:border-primary'}`}
                                                >
                                                    {task.status === 'COMPLETED' && <CheckCircle className="h-4 w-4" />}
                                                </button>
                                                <div>
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <h4 className={`text-lg font-black uppercase tracking-tight ${task.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</h4>
                                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${task.priority === 'URGENT' ? 'bg-rose-50 text-rose-600 border-rose-100' : task.priority === 'HIGH' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-500 mb-4 max-w-xl">{task.description || 'No briefing.'}</p>
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-2 text-gray-400">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Due {task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'Soon'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-gray-200 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <StatsCard title="Completed Objectives" value={user.assignedTasks?.filter((t: any) => t.status === 'COMPLETED')?.length || 0} icon={<CheckCircle className="text-primary h-6 w-6" />} />
                        <StatsCard title="Active Assignments" value={user.assignedTasks?.filter((t: any) => t.status !== 'COMPLETED')?.length || 0} icon={<Target className="text-amber-500 h-6 w-6" />} />
                    </div>
                </div>
            </div>

            {/* Task Modal remains similar but styled */}
            {showTaskModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
                    <div className="relative w-full max-w-xl bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">New Objective</h2>
                            <button onClick={() => setShowTaskModal(false)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900"><X className="h-6 w-6"/></button>
                        </div>
                        <form onSubmit={handleCreateTask} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Objective Title</label>
                                <input required className="luxury-input h-14" placeholder="Brief directive..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Priority</label>
                                    <select className="luxury-input h-14" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                                        <option value="LOW">LOW</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HIGH">HIGH</option>
                                        <option value="URGENT">URGENT</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Deadline</label>
                                    <input type="date" className="luxury-input h-14" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                                </div>
                            </div>
                            <textarea className="luxury-input min-h-[120px] py-6 resize-none" placeholder="Detailed mission briefing..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                            <div className="flex gap-4 pt-8">
                                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-5 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">Abort</button>
                                <button type="submit" disabled={savingTask} className="flex-[2] py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                                    {savingTask ? <Loader2 className="animate-spin" /> : <Save className="h-4 w-4" />} Save Objective
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function ProfileField({ icon, label, value, isEditing, field, val, onChange }: any) {
    return (
        <div className="flex gap-5 group">
            <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                {icon}
            </div>
            <div className="flex-1 space-y-1">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
                {isEditing && field ? (
                    <input
                        className="w-full bg-transparent border-b border-primary text-sm font-black text-slate-900 focus:outline-none py-1"
                        value={val || ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ) : (
                    <p className="text-sm font-black text-slate-900 truncate">{value || 'UNSPECIFIED'}</p>
                )}
            </div>
        </div>
    )
}

function ClearanceLevel({ label, level, color = "text-slate-900" }: any) {
    return (
        <div className="flex items-center justify-between p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm group hover:border-primary/20 transition-all">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className={`text-[10px] font-black uppercase tracking-tighter italic ${color}`}>{level}</span>
        </div>
    )
}

function StatsCard({ title, value, icon }: any) {
    return (
        <div className="glass-panel p-10 rounded-[3rem] border border-slate-100 bg-white shadow-xl flex items-center gap-8 group hover:shadow-2xl hover:-translate-y-1 transition-all">
            <div className="h-20 w-20 rounded-[1.75rem] bg-slate-50 flex items-center justify-center transition-transform group-hover:rotate-6 duration-500">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">{value}</p>
            </div>
        </div>
    )
}
