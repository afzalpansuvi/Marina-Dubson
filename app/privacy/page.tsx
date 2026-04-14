import { Shield, Lock, Eye, FileText, Clock, Trash2, Cookie, Mail, Server, UserX } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Privacy Policy | Marina Dubson Stenographic Services',
    description: 'Learn how Marina Dubson Stenographic Services collects, uses, and protects your personal information in compliance with NY SHIELD Act and GBL Section 349.',
}

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 py-32 px-8">
            <div className="max-w-5xl mx-auto space-y-16">
                {/* Header */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                        <Shield className="h-4 w-4" />
                        NY SHIELD Act & GBL Section 349 Compliant
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">
                        Privacy <span className="text-blue-500 italic">Policy</span>
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Last Updated: April 15, 2026 | Effective Date: April 15, 2026
                    </p>
                    <p className="text-slate-400 max-w-3xl leading-relaxed">
                        Marina Dubson Stenographic Services ("we," "us," or "our") is committed to protecting your privacy. 
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information 
                        in compliance with the <strong>New York SHIELD Act</strong> and <strong>General Business Law Section 349</strong>.
                    </p>
                </div>

                {/* Compliance Notice */}
                <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-6 w-6 text-amber-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-amber-400 uppercase tracking-tight">Legal Compliance Notice</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                This privacy policy is provided in compliance with New York General Business Law Section 349, 
                                which prohibits deceptive acts and practices. We clearly disclose what data we collect, how we use it, 
                                and your rights regarding your personal information.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table of Contents */}
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight mb-6">Contents</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { num: '1', text: 'Information We Collect' },
                            { num: '2', text: 'How We Use Your Information' },
                            { num: '3', text: 'Legal Basis for Processing' },
                            { num: '4', text: 'Data Sharing and Disclosure' },
                            { num: '5', text: 'Data Security and Safeguards' },
                            { num: '6', text: 'Data Retention Periods' },
                            { num: '7', text: 'Your Privacy Rights' },
                            { num: '8', text: 'Cookie Policy' },
                            { num: '9', text: 'Medical and Health Data Protection' },
                            { num: '10', text: 'Breach Notification Procedures' },
                            { num: '11', text: 'Contact Information' },
                        ].map((item) => (
                            <a 
                                key={item.num}
                                href={`#section-${item.num}`}
                                className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-colors"
                            >
                                <span className="text-blue-500 font-bold">{item.num}.</span>
                                <span className="text-sm">{item.text}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Section 1: Information We Collect */}
                <section id="section-1" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Eye className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">1. Information We Collect</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <p className="text-slate-400 leading-relaxed">
                            We collect the following categories of personal information to provide court reporting and 
                            stenographic services:
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4">Client Information</h3>
                                <ul className="space-y-2 text-slate-400 text-sm">
                                    <li>• Full legal name</li>
                                    <li>• Email address</li>
                                    <li>• Phone number</li>
                                    <li>• Company/organization name</li>
                                    <li>• Billing address and zip code</li>
                                    <li>• Payment information (processed securely via Stripe/PayPal)</li>
                                </ul>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4">Reporter Information</h3>
                                <ul className="space-y-2 text-slate-400 text-sm">
                                    <li>• Full legal name</li>
                                    <li>• Email address</li>
                                    <li>• Phone number</li>
                                    <li>• Professional certifications</li>
                                    <li>• Tax identification number (encrypted)</li>
                                    <li>• Payment preferences (ACH, Check, Wire)</li>
                                </ul>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4">Booking & Case Data</h3>
                                <ul className="space-y-2 text-slate-400 text-sm">
                                    <li>• Case names and numbers</li>
                                    <li>• Proceeding type and jurisdiction</li>
                                    <li>• Hearing dates, times, and locations</li>
                                    <li>• Special requirements and notes</li>
                                    <li>• Document transcripts and exhibits</li>
                                </ul>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 border-amber-500/30">
                                <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Medical & Health Data
                                </h3>
                                <ul className="space-y-2 text-slate-400 text-sm">
                                    <li>• Medical records from EUOs</li>
                                    <li>• Health insurance provider information</li>
                                    <li>• Treatment history and diagnoses</li>
                                    <li>• Physical injury details</li>
                                    <li className="text-amber-400">• Protected under NY SHIELD Act (March 2025)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Automatically Collected Information</h3>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li>• IP address and browser type</li>
                                <li>• Device information and operating system</li>
                                <li>• Pages visited and time spent on site</li>
                                <li>• Referring website addresses</li>
                                <li>• Cookies and similar tracking technologies</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 2: How We Use Your Information */}
                <section id="section-2" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Server className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">2. How We Use Your Information</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <p className="text-slate-400 leading-relaxed">
                            We use your personal information for the following purposes:
                        </p>
                        
                        <div className="space-y-4">
                            {[
                                { title: 'Service Delivery', desc: 'To schedule, coordinate, and deliver court reporting services, including assigning reporters to cases and managing bookings.' },
                                { title: 'Billing and Invoicing', desc: 'To generate invoices, process payments, and maintain financial records for accounting purposes.' },
                                { title: 'Communication', desc: 'To send booking confirmations, case updates, service notifications, and respond to inquiries.' },
                                { title: 'Legal Compliance', desc: 'To comply with legal obligations, court requirements, and professional standards.' },
                                { title: 'Quality Assurance', desc: 'To maintain service quality, handle disputes, and improve our offerings.' },
                                { title: 'Security', desc: 'To protect against fraud, unauthorized access, and ensure data integrity.' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-blue-400 font-bold text-sm">{idx + 1}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-1">{item.title}</h4>
                                        <p className="text-slate-400 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 3: Legal Basis */}
                <section id="section-3" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">3. Legal Basis for Processing</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <p className="text-slate-400 leading-relaxed">
                            Under the NY SHIELD Act and applicable privacy laws, we process your personal information based on:
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { basis: 'Contractual Necessity', desc: 'Processing is necessary to fulfill our service agreement with you.' },
                                { basis: 'Legal Obligation', desc: 'Processing required to comply with court orders and legal proceedings.' },
                                { basis: 'Legitimate Interest', desc: 'Processing necessary for business operations, security, and fraud prevention.' },
                                { basis: 'Consent', desc: 'Where required by law, we obtain your explicit consent before processing.' },
                            ].map((item, idx) => (
                                <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                    <h4 className="text-white font-bold mb-2">{item.basis}</h4>
                                    <p className="text-slate-400 text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 4: Data Sharing */}
                <section id="section-4" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <UserX className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">4. Data Sharing and Disclosure</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <p className="text-slate-400 leading-relaxed">
                            We do not sell your personal information. We may share your data only in the following circumstances:
                        </p>
                        
                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-2">Service Providers</h4>
                                <p className="text-slate-400 text-sm">
                                    We share data with trusted third-party service providers who assist with payment processing 
                                    (Stripe, PayPal), email delivery, and cloud hosting. All providers are contractually bound 
                                    to maintain confidentiality and security.
                                </p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-2">Legal Requirements</h4>
                                <p className="text-slate-400 text-sm">
                                    We may disclose information when required by law, court order, or to protect our rights, 
                                    property, or safety, or that of our clients and reporters.
                                </p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-2">Business Transfers</h4>
                                <p className="text-slate-400 text-sm">
                                    In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                                    as part of the business assets, subject to the same privacy protections.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 5: Data Security */}
                <section id="section-5" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">5. Data Security and Safeguards</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <p className="text-slate-400 leading-relaxed">
                            In compliance with the NY SHIELD Act, we implement comprehensive administrative, technical, and 
                            physical safeguards to protect your personal information:
                        </p>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                <h4 className="text-emerald-400 font-bold mb-3 uppercase text-sm">Administrative</h4>
                                <ul className="space-y-2 text-slate-400 text-sm">
                                    <li>• Employee training on data protection</li>
                                    <li>• Access control policies</li>
                                    <li>• Regular security assessments</li>
                                    <li>• Incident response procedures</li>
                                </ul>
                            </div>
                            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                <h4 className="text-emerald-400 font-bold mb-3 uppercase text-sm">Technical</h4>
                                <ul className="space-y-2 text-slate-400 text-sm">
                                    <li>• AES-256 encryption at rest</li>
                                    <li>• TLS 1.3 encryption in transit</li>
                                    <li>• Multi-factor authentication</li>
                                    <li>• Regular security updates</li>
                                </ul>
                            </div>
                            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                <h4 className="text-emerald-400 font-bold mb-3 uppercase text-sm">Physical</h4>
                                <ul className="space-y-2 text-slate-400 text-sm">
                                    <li>• Secure data center facilities</li>
                                    <li>• Access logging and monitoring</li>
                                    <li>• Environmental controls</li>
                                    <li>• Backup and disaster recovery</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 6: Data Retention */}
                <section id="section-6" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">6. Data Retention Periods</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <p className="text-slate-400 leading-relaxed">
                            We retain your personal information only for as long as necessary to fulfill the purposes outlined 
                            in this policy, unless a longer retention period is required by law:
                        </p>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-white font-bold">Data Category</th>
                                        <th className="text-left py-3 px-4 text-white font-bold">Retention Period</th>
                                        <th className="text-left py-3 px-4 text-white font-bold">Legal Basis</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-400">
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4">Client contact information</td>
                                        <td className="py-3 px-4">7 years after last activity</td>
                                        <td className="py-3 px-4">Business records, tax compliance</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4">Booking and case records</td>
                                        <td className="py-3 px-4">10 years after case completion</td>
                                        <td className="py-3 px-4">Legal proceedings, malpractice coverage</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4">Financial and billing records</td>
                                        <td className="py-3 px-4">7 years per IRS requirements</td>
                                        <td className="py-3 px-4">Tax compliance, audit requirements</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4">Medical and health data</td>
                                        <td className="py-3 px-4">7 years after case completion</td>
                                        <td className="py-3 px-4">NY SHIELD Act, HIPAA alignment</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4">Website analytics and logs</td>
                                        <td className="py-3 px-4">26 months</td>
                                        <td className="py-3 px-4">Security monitoring, fraud prevention</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4">Inactive account data</td>
                                        <td className="py-3 px-4">Deleted after 2 years of inactivity</td>
                                        <td className="py-3 px-4">Data minimization principle</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                            <div className="flex items-start gap-3">
                                <Trash2 className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-white font-bold mb-1">Secure Deletion Process</h4>
                                    <p className="text-slate-400 text-sm">
                                        When data reaches the end of its retention period, we securely delete or anonymize it 
                                        using industry-standard methods. Backup data is purged according to our backup retention schedule.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 7: Your Rights */}
                <section id="section-7" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <UserX className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">7. Your Privacy Rights</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <p className="text-slate-400 leading-relaxed">
                            Under New York law and the NY SHIELD Act, you have the following rights regarding your personal information:
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { right: 'Right to Access', desc: 'Request a copy of the personal information we hold about you.' },
                                { right: 'Right to Rectification', desc: 'Request correction of inaccurate or incomplete information.' },
                                { right: 'Right to Deletion', desc: 'Request deletion of your personal information, subject to legal retention requirements.' },
                                { right: 'Right to Restrict Processing', desc: 'Request limitation on how we use your data in certain circumstances.' },
                                { right: 'Right to Data Portability', desc: 'Receive your data in a structured, commonly used format.' },
                                { right: 'Right to Object', desc: 'Object to processing based on legitimate interests or direct marketing.' },
                            ].map((item, idx) => (
                                <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                    <h4 className="text-white font-bold mb-2">{item.right}</h4>
                                    <p className="text-slate-400 text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                            <h4 className="text-blue-400 font-bold mb-3">How to Exercise Your Rights</h4>
                            <p className="text-slate-400 text-sm mb-4">
                                To exercise any of these rights, please contact us using the information in Section 11. 
                                We will respond within 30 days of receiving your request. We may need to verify your identity 
                                before processing your request.
                            </p>
                            <Link 
                                href="/contact" 
                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm"
                            >
                                <Mail className="h-4 w-4" />
                                Contact us to exercise your rights
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Section 8: Cookie Policy */}
                <section id="section-8" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Cookie className="h-6 w-6 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">8. Cookie Policy</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <p className="text-slate-400 leading-relaxed">
                            Our website uses cookies and similar tracking technologies to enhance your browsing experience, 
                            analyze site traffic, and understand where our visitors come from.
                        </p>
                        
                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-2">Essential Cookies</h4>
                                <p className="text-slate-400 text-sm">
                                    Required for the website to function properly. These cannot be disabled. They include 
                                    session cookies for authentication and security features.
                                </p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-2">Analytics Cookies</h4>
                                <p className="text-slate-400 text-sm">
                                    Help us understand how visitors interact with our website. We use Google Analytics 
                                    to collect anonymous usage data. You can opt out of these cookies.
                                </p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-2">Functional Cookies</h4>
                                <p className="text-slate-400 text-sm">
                                    Enable enhanced functionality and personalization, such as remembering your preferences 
                                    and login state.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                            <h4 className="text-amber-400 font-bold mb-2">Managing Cookies</h4>
                            <p className="text-slate-400 text-sm">
                                You can control cookies through your browser settings. Most browsers allow you to refuse 
                                cookies or delete existing ones. However, disabling essential cookies may affect website functionality.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 9: Medical Data Protection */}
                <section id="section-9" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-rose-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">9. Medical and Health Data Protection</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                            <h3 className="text-rose-400 font-bold mb-3">NY SHIELD Act Medical Data Expansion (March 2025)</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                As of March 2025, the NY SHIELD Act was expanded to explicitly include medical information 
                                and health insurance information as categories of private data. This applies to our handling 
                                of <strong>Examinations Under Oath (EUOs)</strong> which may contain:
                            </p>
                            <ul className="mt-4 space-y-2 text-slate-400 text-sm">
                                <li>• Medical records, treatment histories, and diagnoses</li>
                                <li>• Health insurance provider information</li>
                                <li>• Details about physical injuries and medical conditions</li>
                                <li>• Names of treating physicians and medical facilities</li>
                            </ul>
                        </div>

                        <h4 className="text-white font-bold">Enhanced Protections for Medical Data:</h4>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-2">Data Classification</h4>
                                <p className="text-slate-400 text-sm">
                                    All medical and health-related data is classified as "Highly Sensitive" and receives 
                                    the highest level of protection in our systems.
                                </p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-2">Encryption Requirements</h4>
                                <p className="text-slate-400 text-sm">
                                    Medical data is encrypted both in transit (TLS 1.3) and at rest (AES-256) with 
                                    additional access logging.
                                </p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-2">Access Controls</h4>
                                <p className="text-slate-400 text-sm">
                                    Access to medical data is restricted to authorized personnel only, based on role-based 
                                    permissions and need-to-know principles.
                                </p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-2">Audit Logging</h4>
                                <p className="text-slate-400 text-sm">
                                    All access to medical data is logged and monitored. Regular audits are conducted to 
                                    ensure compliance with access policies.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 10: Breach Notification */}
                <section id="section-10" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">10. Breach Notification Procedures</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <p className="text-slate-400 leading-relaxed">
                            Under the NY SHIELD Act, we have established procedures to detect, respond to, and notify 
                            affected individuals of any data security breach:
                        </p>
                        
                        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                            <h3 className="text-red-400 font-bold mb-4">Our Breach Response Protocol</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-red-400 font-bold text-sm">1</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">Detection and Assessment</h4>
                                        <p className="text-slate-400 text-sm">
                                            We continuously monitor our systems for unauthorized access. Upon detection, 
                                            we immediately assess the scope and nature of the breach.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-red-400 font-bold text-sm">2</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">Containment</h4>
                                        <p className="text-slate-400 text-sm">
                                            We take immediate steps to stop the breach, secure affected systems, and 
                                            prevent further unauthorized access.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-red-400 font-bold text-sm">3</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">Notification (Within 30 Days)</h4>
                                        <p className="text-slate-400 text-sm">
                                            If your personal information was compromised, we will notify you within 30 days 
                                            of discovering the breach. Notification will include:
                                        </p>
                                        <ul className="mt-2 ml-4 space-y-1 text-slate-400 text-sm">
                                            <li>• Description of the incident</li>
                                            <li>• Types of information involved</li>
                                            <li>• Steps we have taken</li>
                                            <li>• Steps you should take</li>
                                            <li>• Contact information for questions</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-red-400 font-bold text-sm">4</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">Recovery and Prevention</h4>
                                        <p className="text-slate-400 text-sm">
                                            We restore affected systems, implement additional safeguards, and review our 
                                            security measures to prevent future incidents.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 11: Contact */}
                <section id="section-11" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Mail className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">11. Contact Information</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <p className="text-slate-400 leading-relaxed">
                            If you have any questions about this Privacy Policy, your personal information, or wish to 
                            exercise your privacy rights, please contact us:
                        </p>
                        
                        <div className="p-8 rounded-3xl bg-blue-600/5 border border-blue-500/20">
                            <h3 className="text-xl font-bold text-blue-400 mb-4">Data Protection Officer</h3>
                            <div className="space-y-3 text-slate-400">
                                <p><strong className="text-white">Marina Dubson Stenographic Services</strong></p>
                                <p>Email: <a href="mailto:privacy@marinadubson.com" className="text-blue-400 hover:text-blue-300">privacy@marinadubson.com</a></p>
                                <p>Phone: (212) 555-0123</p>
                                <p>Address: 123 Legal Plaza, Suite 500, New York, NY 10001</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                            <h4 className="text-white font-bold mb-3">Changes to This Policy</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                We may update this Privacy Policy from time to time to reflect changes in our practices, 
                                legal requirements, or operational needs. We will notify you of any material changes by 
                                posting the updated policy on this page with a revised "Last Updated" date. We encourage 
                                you to review this policy periodically.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link 
                                href="/gdpr" 
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
                            >
                                <Shield className="h-4 w-4" />
                                View GDPR Compliance
                            </Link>
                            <Link 
                                href="/terms" 
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
                            >
                                <FileText className="h-4 w-4" />
                                View Terms of Service
                            </Link>
                        </div>
                    </div>
                </section>

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
