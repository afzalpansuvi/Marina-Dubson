'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Mail,
    Lock,
    User,
    Briefcase,
    Globe,
    ArrowRight,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    AlertCircle,
    ChevronLeft
} from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [step, setStep] = useState(1) // 1: Role selection, 2: Form
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'CLIENT', // Default
        clientType: 'PRIVATE' as 'PRIVATE' | 'AGENCY'
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                setTimeout(() => router.push('/login'), 2000)
            } else {
                setError(data.error || 'Registration failed. Please try again.')
            }
        } catch (err) {
            setError('Could not connect to the server. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-poppins relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>

            <div className="w-full max-w-5xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block px-6 py-2 rounded-2xl bg-white shadow-sm border border-gray-100 mb-6 font-black text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        MARIA DUBSON
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Join the Platform</h1>
                    <p className="text-gray-500 font-medium mt-2">Elite stenographic services for elite legal teams</p>
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100 p-8 md:p-12">
                    {success ? (
                        <div className="text-center py-10 animate-in zoom-in-95">
                            <div className="h-24 w-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase">Account Created</h2>
                            <p className="text-gray-500 font-medium mt-3 max-w-xs mx-auto">Welcome to the team! You can now log in to access your portal.</p>
                            <button onClick={() => router.push('/login')} className="mt-8 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline flex items-center justify-center gap-2 mx-auto">
                                Go to Login <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    ) : step === 1 ? (
                        <div className="space-y-8 animate-in fade-in transition-all duration-500">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] text-center">Select Your Account Purpose</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                                <RoleCard
                                    icon={<Globe className="h-10 w-10" />}
                                    title="Private Client"
                                    desc="Book reporters and manage case transcripts."
                                    active={formData.role === 'CLIENT' && formData.clientType === 'PRIVATE'}
                                    onClick={() => setFormData({ ...formData, role: 'CLIENT', clientType: 'PRIVATE' })}
                                    color="blue"
                                />
                                <RoleCard
                                    icon={<ShieldCheck className="h-10 w-10" />}
                                    title="Agency"
                                    desc="Manage coverage requests on behalf of your clients."
                                    active={formData.role === 'CLIENT' && formData.clientType === 'AGENCY'}
                                    onClick={() => setFormData({ ...formData, role: 'CLIENT', clientType: 'AGENCY' })}
                                    color="teal"
                                />
                                <RoleCard
                                    icon={<Briefcase className="h-10 w-10" />}
                                    title="Reporter"
                                    desc="Receive assignments and deliver excellence."
                                    active={formData.role === 'REPORTER'}
                                    onClick={() => setFormData({ ...formData, role: 'REPORTER' })}
                                    color="purple"
                                />
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-5 rounded-[1.5rem] bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-center gap-4"
                            >
                                Continue to Information <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                            <button 
                                onClick={() => setStep(1)} 
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors mb-6 group"
                            >
                                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                Return to Role Selection
                            </button>

                            {error && (
                                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 animate-shake">
                                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                    <p className="text-sm font-bold text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                    <input
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
                                        placeholder="Jane"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                    <input
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
                                        placeholder="jane.doe@firm.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-tight text-right">Min. 8 characters with at least 1 symbol</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 rounded-[1.5rem] bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 mt-8"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Complete Registration <ArrowRight className="h-4 w-4" /></>}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm font-medium text-gray-500 capitalize">
                        Already have an account?{' '}
                        <Link href="/login" className="font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest text-xs px-2">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

function RoleCard({ icon, title, desc, active, onClick, color }: any) {
    const themes: any = {
        blue: active ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10' : 'border-gray-100 hover:border-blue-200',
        purple: active ? 'border-purple-500 bg-purple-50/50 shadow-lg shadow-purple-500/10' : 'border-gray-100 hover:border-purple-200',
        teal: active ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/10' : 'border-gray-100 hover:border-emerald-200',
    }
    const iconThemes: any = {
        blue: active ? 'text-blue-600' : 'text-gray-400',
        purple: active ? 'text-purple-600' : 'text-gray-400',
        teal: active ? 'text-emerald-600' : 'text-gray-400',
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-8 rounded-[2rem] border-2 transition-all text-left flex flex-col group ${themes[color]}`}
        >
            <div className={`mb-6 transition-transform group-hover:scale-110 ${iconThemes[color]}`}>
                {icon}
            </div>
            <h3 className={`text-lg font-black uppercase tracking-tight mb-2 ${active ? 'text-gray-900' : 'text-gray-500'}`}>{title}</h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">{desc}</p>
            {active && (
                <div className="mt-4 h-6 w-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle2 className={`h-4 w-4 ${iconThemes[color]}`} />
                </div>
            )}
        </button>
    )
}
