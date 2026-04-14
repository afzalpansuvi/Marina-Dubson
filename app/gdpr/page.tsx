import { Globe, Shield, Lock, Cpu, FileText, Eye, Trash2, Download, XCircle, CheckCircle, Scale, Server, Mail } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'GDPR & Data Protection | Marina Dubson Stenographic Services',
    description: 'Learn about our GDPR compliance, data protection measures, and your privacy rights under European and New York data protection laws.',
}

export default function GDPRPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 py-32 px-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full"></div>

            <div className="max-w-5xl mx-auto space-y-16 relative z-10">
                {/* Header */}
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            <Shield className="h-4 w-4" />
                            GDPR Compliant
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                            <Shield className="h-4 w-4" />
                            NY SHIELD Act Compliant
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">
                        Data <span className="text-emerald-500 italic">Protection</span>
                    </h1>
                    <p className="text-slate-500 font-medium">
                        GDPR & NY SHIELD Act Compliance Framework
                    </p>
                    <p className="text-slate-400 max-w-3xl leading-relaxed">
                        Marina Dubson Stenographic Services is committed to protecting your personal data in compliance 
                        with the <strong>General Data Protection Regulation (GDPR)</strong> for EU residents and the 
                        <strong>NY SHIELD Act</strong> for New York residents. This page outlines your rights and our obligations.
                    </p>
                </div>

                {/* Dual Compliance Notice */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="h-6 w-6 text-emerald-400" />
                            <h3 className="text-lg font-bold text-emerald-400 uppercase tracking-tight">GDPR Compliance</h3>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            For EU residents, we comply with the General Data Protection Regulation (GDPR), providing 
                            comprehensive rights over your personal data including access, rectification, erasure, and portability.
                        </p>
                    </div>
                    <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="h-6 w-6 text-blue-400" />
                            <h3 className="text-lg font-bold text-blue-400 uppercase tracking-tight">NY SHIELD Act</h3>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            For New York residents, we comply with the Stop Hacks and Improve Electronic Data Security (SHIELD) Act, 
                            implementing robust safeguards and breach notification procedures.
                        </p>
                    </div>
                </div>

                {/* Data Controller / Processor Section */}
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-6">Our Role in Data Processing</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Server className="h-5 w-5 text-emerald-400" />
                                As Data Processor
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                When providing court reporting services to law firms and legal entities, we act as a 
                                <strong> Data Processor</strong>. We process personal data only on behalf of our clients 
                                (Data Controllers) and in accordance with their instructions and applicable law.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-400" />
                                As Data Controller
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                For our direct relationships with clients, reporters, and website visitors, we act as a 
                                <strong> Data Controller</strong>. We determine the purposes and means of processing your 
                                personal data.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Your Rights Section */}
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Your Data Protection Rights</h2>
                        <p className="text-slate-400">
                            Under GDPR and NY SHIELD Act, you have the following rights regarding your personal data:
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <RightCard
                            title="Right to Access"
                            desc="Request a complete copy of all personal data we hold about you. We provide this within 30 days."
                            icon={<Eye className="h-6 w-6" />}
                            article="GDPR Article 15"
                        />
                        <RightCard
                            title="Right to Rectification"
                            desc="Request correction of inaccurate or incomplete personal data. We update records promptly."
                            icon={<CheckCircle className="h-6 w-6" />}
                            article="GDPR Article 16"
                        />
                        <RightCard
                            title="Right to Erasure"
                            desc="Request deletion of your personal data ('Right to be Forgotten'), subject to legal obligations."
                            icon={<Trash2 className="h-6 w-6" />}
                            article="GDPR Article 17"
                        />
                        <RightCard
                            title="Right to Restrict Processing"
                            desc="Request limitation on how we process your data in certain circumstances."
                            icon={<Lock className="h-6 w-6" />}
                            article="GDPR Article 18"
                        />
                        <RightCard
                            title="Right to Data Portability"
                            desc="Receive your data in a structured, machine-readable format or transfer it to another controller."
                            icon={<Download className="h-6 w-6" />}
                            article="GDPR Article 20"
                        />
                        <RightCard
                            title="Right to Object"
                            desc="Object to processing based on legitimate interests or for direct marketing purposes."
                            icon={<XCircle className="h-6 w-6" />}
                            article="GDPR Article 21"
                        />
                    </div>
                </div>

                {/* How to Exercise Rights */}
                <div className="p-8 rounded-3xl bg-emerald-600/5 border border-emerald-500/20">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-6">How to Exercise Your Rights</h2>
                    <div className="space-y-6">
                        <p className="text-slate-400 leading-relaxed">
                            To exercise any of your data protection rights, please contact us using the information below. 
                            We will respond within <strong>30 days</strong> of receiving your request. For complex requests, 
                            we may extend this period by two months and will inform you of the extension.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-emerald-400" />
                                    Contact Information
                                </h3>
                                <div className="space-y-2 text-slate-400 text-sm">
                                    <p>Email: <a href="mailto:privacy@marinadubson.com" className="text-emerald-400 hover:text-emerald-300">privacy@marinadubson.com</a></p>
                                    <p>Phone: (212) 555-0123</p>
                                    <p>Address: 123 Legal Plaza, Suite 500, New York, NY 10001</p>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-emerald-400" />
                                    Required Information
                                </h3>
                                <ul className="space-y-2 text-slate-400 text-sm">
                                    <li>• Your full name and contact details</li>
                                    <li>• Description of your request</li>
                                    <li>• Proof of identity (if requested)</li>
                                    <li>• Any relevant account information</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                            <p className="text-slate-400 text-sm">
                                <strong className="text-amber-400">Note:</strong> We may need to verify your identity before 
                                processing your request to ensure we do not disclose your information to unauthorized parties. 
                                This is for your protection.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Legal Basis for Processing */}
                <div className="space-y-8">
                    <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Legal Basis for Processing</h2>
                    <p className="text-slate-400">
                        Under GDPR Article 6, we process your personal data based on the following legal grounds:
                    </p>

                    <div className="space-y-4">
                        {[
                            { 
                                basis: 'Contractual Necessity (Art. 6(1)(b))', 
                                desc: 'Processing necessary for the performance of our service contract with you, including scheduling reporters, delivering transcripts, and processing payments.',
                                examples: 'Booking services, invoicing, reporter assignment'
                            },
                            { 
                                basis: 'Legal Obligation (Art. 6(1)(c))', 
                                desc: 'Processing necessary to comply with legal obligations, including court requirements, tax laws, and professional regulations.',
                                examples: 'Tax record keeping, court-ordered document retention'
                            },
                            { 
                                basis: 'Legitimate Interests (Art. 6(1)(f))', 
                                desc: 'Processing necessary for our legitimate business interests, provided your rights and interests do not override these.',
                                examples: 'Fraud prevention, network security, service improvement'
                            },
                            { 
                                basis: 'Consent (Art. 6(1)(a))', 
                                desc: 'Processing based on your explicit consent, which you can withdraw at any time.',
                                examples: 'Marketing communications, optional analytics cookies'
                            },
                        ].map((item, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-2">{item.basis}</h4>
                                <p className="text-slate-400 text-sm mb-3">{item.desc}</p>
                                <p className="text-emerald-400 text-xs">
                                    <strong>Examples:</strong> {item.examples}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data Transfers */}
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-6">International Data Transfers</h2>
                    <div className="space-y-4">
                        <p className="text-slate-400 leading-relaxed">
                            As a New York-based company serving international clients, we may transfer personal data outside 
                            the European Economic Area (EEA). When we do, we ensure appropriate safeguards are in place:
                        </p>
                        <ul className="space-y-3 text-slate-400">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>We use Standard Contractual Clauses (SCCs) approved by the European Commission for transfers to the US</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>All data transfers use encryption (TLS 1.3) to protect data in transit</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>We only transfer data to jurisdictions with adequate data protection laws or with appropriate safeguards</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Security Measures */}
                <div className="space-y-8">
                    <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Security Measures</h2>
                    <p className="text-slate-400">
                        We implement comprehensive technical and organizational measures to protect your personal data:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                            <h3 className="text-emerald-400 font-bold mb-4 uppercase text-sm">Technical Measures</h3>
                            <ul className="space-y-3 text-slate-400 text-sm">
                                <li className="flex items-start gap-2">
                                    <Lock className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span>AES-256 encryption for data at rest</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Lock className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span>TLS 1.3 encryption for data in transit</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Lock className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span>Multi-factor authentication (MFA)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Lock className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span>Regular security audits and penetration testing</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Lock className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span>Role-based access controls (RBAC)</span>
                                </li>
                            </ul>
                        </div>
                        <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                            <h3 className="text-blue-400 font-bold mb-4 uppercase text-sm">Organizational Measures</h3>
                            <ul className="space-y-3 text-slate-400 text-sm">
                                <li className="flex items-start gap-2">
                                    <Shield className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Employee data protection training</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Confidentiality agreements with all staff</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Data Protection Impact Assessments (DPIAs)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Incident response and breach notification procedures</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Regular policy reviews and updates</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Breach Notification */}
                <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/20">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-6">Data Breach Notification</h2>
                    <div className="space-y-4">
                        <p className="text-slate-400 leading-relaxed">
                            In the unlikely event of a personal data breach, we will:
                        </p>
                        <ul className="space-y-3 text-slate-400">
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 font-bold">1.</span>
                                <span>Notify the relevant supervisory authority within 72 hours of becoming aware of the breach (GDPR requirement)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 font-bold">2.</span>
                                <span>Notify affected individuals without undue delay if the breach is likely to result in high risk to their rights and freedoms</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 font-bold">3.</span>
                                <span>Notify New York residents within 30 days as required by the NY SHIELD Act</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 font-bold">4.</span>
                                <span>Document all breaches, including their effects and remedial actions taken</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Complaints */}
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-6">Right to Lodge a Complaint</h2>
                    <p className="text-slate-400 leading-relaxed mb-6">
                        If you believe we have not handled your personal data in accordance with applicable data protection laws, 
                        you have the right to lodge a complaint with:
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                            <h4 className="text-emerald-400 font-bold mb-2">EU Residents</h4>
                            <p className="text-slate-400 text-sm">
                                Your local Data Protection Authority (DPA) in the EU member state where you reside or work.
                            </p>
                        </div>
                        <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                            <h4 className="text-blue-400 font-bold mb-2">New York Residents</h4>
                            <p className="text-slate-400 text-sm">
                                New York State Attorney General's Office<br />
                                <a href="https://ag.ny.gov" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                    ag.ny.gov
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Related Links */}
                <div className="flex flex-wrap gap-4">
                    <Link 
                        href="/privacy" 
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
                    >
                        <FileText className="h-4 w-4" />
                        View Privacy Policy
                    </Link>
                    <Link 
                        href="/terms" 
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
                    >
                        <Scale className="h-4 w-4" />
                        View Terms of Service
                    </Link>
                    <Link 
                        href="/contact" 
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    >
                        <Mail className="h-4 w-4" />
                        Contact Data Protection Officer
                    </Link>
                </div>

                {/* Footer */}
                <div className="pt-12 border-t border-white/10">
                    <p className="text-center text-slate-500 text-sm">
                        © {new Date().getFullYear()} Marina Dubson Stenographic Services. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}

function RightCard({ title, desc, icon, article }: { title: string; desc: string; icon: React.ReactNode; article: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all group h-full">
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform flex-shrink-0">
                    {icon}
                </div>
                <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white">{title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-400/60 bg-emerald-500/5 px-2 py-1 rounded">
                        {article}
                    </span>
                </div>
            </div>
        </div>
    )
}
