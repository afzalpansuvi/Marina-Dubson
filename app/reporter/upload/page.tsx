'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Calendar,
    FileText,
    Upload,
    ShieldCheck,
    Terminal,
    ChevronLeft,
    CheckCircle,
    Loader2,
    ArrowRight,
    Zap,
    MapPin,
    Building2,
    Clock,
    AlertCircle
} from 'lucide-react'

export default function ReporterUploadPage() {
    const [step, setStep] = useState(1)
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [activeAssignment, setActiveAssignment] = useState<any>(null)

    const assignments = [
        { id: 'BK-9802', client: 'Levine & Assoc.', date: 'FEB 14', case: 'Smith v. Jones' },
        { id: 'BK-9831', client: 'Global Tech', date: 'FEB 15', case: 'Patent Infringement' }
    ]

    const handleFileUpload = (e: any) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            setStep(3)
        }
    }

    const simulateUpload = () => {
        setIsUploading(true)
        setTimeout(() => {
            setIsUploading(false)
            setStep(4)
        }, 3000)
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Professional Operations Header */}
            <header className="sticky top-0 z-50 w-full bg-card/90 backdrop-blur-md border-b border-border px-8 py-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/reporter/portal" className="flex items-center gap-4 group">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground transform -rotate-6 group-hover:rotate-0 transition-transform">
                            <ChevronLeft className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Return to Console</span>
                    </Link>
                    <div className="flex items-center gap-3 italic">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Digital Asset Protocol Active</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-8 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black tracking-tighter uppercase mb-4 text-foreground">
                        Asset <span className="text-primary italic">Submission</span>
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed uppercase tracking-widest text-[10px]">Professional Transcript Delivery System v4.0</p>
                </div>

                <div className="glass-panel bg-card rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl border border-border">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.05]">
                        <Terminal className="h-32 w-32 text-primary" />
                    </div>

                    {step === 1 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-foreground uppercase tracking-widest text-center">Select Associated Assignment</h3>
                                <div className="grid gap-4">
                                    {assignments.map(a => (
                                        <button
                                            key={a.id}
                                            onClick={() => { setActiveAssignment(a); setStep(2); }}
                                            className="p-8 rounded-[2rem] bg-muted/30 border border-border flex items-center justify-between hover:bg-card hover:border-primary/50 hover:shadow-xl transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-8">
                                                <div className="h-14 w-14 rounded-2xl bg-card border border-border flex flex-col items-center justify-center shadow-sm group-hover:bg-primary/5 transition-colors">
                                                    <span className="text-[9px] font-black text-primary">{a.date.split(' ')[0]}</span>
                                                    <span className="text-xl font-black text-foreground">{a.date.split(' ')[1]}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{a.id}</span>
                                                        <h4 className="text-lg font-black text-foreground uppercase tracking-tight">{a.case}</h4>
                                                    </div>
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{a.client}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && activeAssignment && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500 text-center">
                            <div className="flex flex-col items-center">
                                <div className="h-20 w-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary mb-8">
                                    <FileText className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">Transcript Metadata Confirmed</h3>
                                <p className="text-muted-foreground font-medium text-sm mt-2 uppercase tracking-widest">Case: {activeAssignment.case}</p>
                            </div>

                            <div className="relative group">
                                <label className="flex flex-col items-center justify-center w-full h-[300px] border-2 border-dashed border-border rounded-[2.5rem] cursor-pointer bg-muted/20 group-hover:bg-primary/5 group-hover:border-primary/40 transition-all">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-12 h-12 mb-4 text-muted-foreground group-hover:text-primary animate-bounce opacity-40" />
                                        <p className="mb-2 text-sm font-black text-foreground uppercase tracking-widest">Upload Prime Digital Asset</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">PDF, TXT, OR PTX (MAX 50MB)</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Back to Assignment List
                            </button>
                        </div>
                    )}

                    {step === 3 && selectedFile && (
                        <div className="space-y-10 animate-in zoom-in-95 duration-500 text-center">
                            <div className="p-10 rounded-[2.5rem] bg-primary/5 border border-primary/20 inline-block mx-auto mb-8">
                                <FileText className="h-12 w-12 text-primary" />
                                <p className="text-sm font-black text-foreground mt-4 uppercase tracking-tighter">{selectedFile.name}</p>
                                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • READY FOR SUBMISSION</p>
                            </div>

                            <div className="flex flex-col gap-4 max-w-sm mx-auto">
                                <button
                                    onClick={simulateUpload}
                                    disabled={isUploading}
                                    className="luxury-button py-5 w-full shadow-2xl shadow-primary/20"
                                >
                                    {isUploading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : <>Finalize Encryption & Send <Zap className="h-5 w-5" /></>}
                                </button>
                                <button
                                    onClick={() => setStep(2)}
                                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-4"
                                >
                                    Cancel & Reselect
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="py-20 text-center animate-in scale-in-95 duration-1000">
                            <div className="h-32 w-32 bg-primary rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-2xl relative">
                                <CheckCircle className="h-14 w-14 text-primary-foreground" />
                                <div className="absolute inset-0 bg-primary rounded-[3rem] animate-ping opacity-20 pointer-events-none"></div>
                            </div>
                            <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter mb-4">Transmission Successful</h2>
                            <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed mb-12">The digital asset has been stored securely. The legal firm associated with <strong>{activeAssignment?.id}</strong> has been notified via secure channel.</p>
                            <div className="flex items-center justify-center gap-8">
                                <Link
                                    href="/reporter/portal"
                                    className="luxury-button py-5 px-12"
                                >
                                    View Payout Status
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
                    <StatusFeature icon={<Clock className="h-4 w-4" />} title="LATENCY" value="1.2ms" />
                    <StatusFeature icon={<Building2 className="h-4 w-4" />} title="POINT" value="NYC-CENTRAL" />
                    <StatusFeature icon={<AlertCircle className="h-4 w-4" />} title="CHECKS" value="PASSED" />
                </div>
            </main>
        </div>
    )
}

function StatusFeature({ icon, title, value }: any) {
    return (
        <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border">
            <div className="text-primary">{icon}</div>
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{title}</span>
                <span className="text-[10px] font-black text-foreground uppercase">{value}</span>
            </div>
        </div>
    )
}
