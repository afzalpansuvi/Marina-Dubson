import { Scale, FileText, Shield, Clock, DollarSign, AlertTriangle, CheckCircle, Mail, Lock, Globe } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Terms of Service | Marina Dubson Stenographic Services',
    description: 'Read the Terms of Service for Marina Dubson Stenographic Services. Learn about our booking policies, payment terms, and legal agreements.',
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 py-32 px-8">
            <div className="max-w-5xl mx-auto space-y-16">
                {/* Header */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                        <Scale className="h-4 w-4" />
                        Legal Agreement
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">
                        Terms of <span className="text-blue-500 italic">Service</span>
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Last Updated: April 15, 2026 | Effective Date: April 15, 2026
                    </p>
                    <p className="text-slate-400 max-w-3xl leading-relaxed">
                        These Terms of Service ("Terms") constitute a legally binding agreement between you and 
                        <strong> Marina Dubson Stenographic Services</strong> ("we," "us," or "our") regarding your use of our 
                        website, booking portal, and court reporting services. By accessing or using our services, you agree to these Terms.
                    </p>
                </div>

                {/* Important Notice */}
                <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-amber-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-amber-400 uppercase tracking-tight">Important Legal Notice</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Please read these Terms carefully. They include important information about your legal rights and 
                                remedies, including limitations on our liability and requirements for dispute resolution. 
                                If you do not agree to these Terms, you may not use our services.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table of Contents */}
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight mb-6">Contents</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { num: '1', text: 'Acceptance of Terms' },
                            { num: '2', text: 'Service Description' },
                            { num: '3', text: 'User Accounts and Registration' },
                            { num: '4', text: 'Booking and Cancellation Policy' },
                            { num: '5', text: 'Payment Terms' },
                            { num: '6', text: 'Intellectual Property' },
                            { num: '7', text: 'Confidentiality' },
                            { num: '8', text: 'Data Protection and Privacy' },
                            { num: '9', text: 'Limitation of Liability' },
                            { num: '10', text: 'Indemnification' },
                            { num: '11', text: 'Dispute Resolution' },
                            { num: '12', text: 'Governing Law' },
                            { num: '13', text: 'Changes to Terms' },
                            { num: '14', text: 'Contact Information' },
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

                {/* Section 1: Acceptance */}
                <section id="section-1" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">1. Acceptance of Terms</h2>
                    </div>
                    
                    <div className="pl-16 space-y-4 text-slate-400 leading-relaxed">
                        <p>
                            By accessing our website, creating an account, booking services, or using any of our offerings, 
                            you acknowledge that you have read, understood, and agree to be bound by these Terms of Service 
                            and our <Link href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>.
                        </p>
                        <p>
                            If you are using our services on behalf of a company, organization, or other legal entity, 
                            you represent and warrant that you have the authority to bind that entity to these Terms.
                        </p>
                        <p>
                            We reserve the right to modify these Terms at any time. Changes will be effective immediately 
                            upon posting to our website. Your continued use of our services after any changes indicates 
                            your acceptance of the modified Terms.
                        </p>
                    </div>
                </section>

                {/* Section 2: Service Description */}
                <section id="section-2" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">2. Service Description</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <p className="text-slate-400 leading-relaxed">
                            Marina Dubson Stenographic Services provides professional court reporting and stenographic services, including:
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                'Court reporting for depositions, hearings, and trials',
                                'Real-time transcription services',
                                'Videography and video conferencing support',
                                'Interpreter and translation services',
                                'Exhibit management and document handling',
                                'Expedited and rush transcript delivery',
                                'Online booking and case management portal',
                                'Secure document delivery and storage',
                            ].map((service, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                    <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                                    <span className="text-slate-300 text-sm">{service}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                            <h4 className="text-white font-bold mb-2">Service Availability</h4>
                            <p className="text-slate-400 text-sm">
                                We strive to provide uninterrupted service but do not guarantee that our services will always 
                                be available, secure, or error-free. We reserve the right to modify, suspend, or discontinue 
                                any part of our services at any time without notice.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 3: User Accounts */}
                <section id="section-3" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">3. User Accounts and Registration</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-3">Account Creation</h4>
                                <p className="text-slate-400 text-sm mb-3">
                                    To access certain features of our services, you must create an account. You agree to:
                                </p>
                                <ul className="space-y-2 text-slate-400 text-sm">
                                    <li>• Provide accurate, current, and complete information during registration</li>
                                    <li>• Maintain and promptly update your account information</li>
                                    <li>• Maintain the security of your password and account credentials</li>
                                    <li>• Notify us immediately of any unauthorized access or security breach</li>
                                    <li>• Accept responsibility for all activities that occur under your account</li>
                                </ul>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-3">Account Types</h4>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <h5 className="text-blue-400 font-bold text-sm mb-2">Client Accounts</h5>
                                        <p className="text-slate-400 text-xs">For law firms and legal professionals booking court reporting services.</p>
                                    </div>
                                    <div>
                                        <h5 className="text-emerald-400 font-bold text-sm mb-2">Reporter Accounts</h5>
                                        <p className="text-slate-400 text-xs">For certified court reporters accepting assignments.</p>
                                    </div>
                                    <div>
                                        <h5 className="text-purple-400 font-bold text-sm mb-2">Staff Accounts</h5>
                                        <p className="text-slate-400 text-xs">For internal team members managing operations.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20">
                                <h4 className="text-red-400 font-bold mb-2">Account Termination</h4>
                                <p className="text-slate-400 text-sm">
                                    We reserve the right to suspend or terminate your account at any time for violations 
                                    of these Terms, fraudulent activity, or any other reason at our sole discretion. 
                                    Upon termination, your right to use our services immediately ceases.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Booking Policy */}
                <section id="section-4" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">4. Booking and Cancellation Policy</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                <h4 className="text-emerald-400 font-bold mb-4">Booking Confirmation</h4>
                                <ul className="space-y-3 text-slate-400 text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span>All bookings require advance notice (minimum 24-48 hours)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span>Written confirmation will be provided upon booking acceptance</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span>Reporter assignment is confirmed 24 hours before the proceeding</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                                <h4 className="text-amber-400 font-bold mb-4">Cancellation Policy</h4>
                                <ul className="space-y-3 text-slate-400 text-sm">
                                    <li className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <span>More than 48 hours notice: No cancellation fee</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <span>24-48 hours notice: 50% of appearance fee</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <span>Less than 24 hours: Full appearance fee charged</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                            <h4 className="text-white font-bold mb-3">No-Show Policy</h4>
                            <p className="text-slate-400 text-sm">
                                If the proceeding is cancelled or postponed without adequate notice, or if our reporter 
                                arrives and the proceeding does not occur, the full scheduled fees will be charged. 
                                This includes appearance fees, waiting time, and any applicable minimum charges.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 5: Payment Terms */}
                <section id="section-5" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">5. Payment Terms</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <h4 className="text-white font-bold mb-3">Fee Structure</h4>
                                <p className="text-slate-400 text-sm mb-3">
                                    Our fees are based on the service type, location, and any special requirements. 
                                    Standard fees include:
                                </p>
                                <ul className="space-y-2 text-slate-400 text-sm">
                                    <li>• <strong className="text-white">Appearance Fee:</strong> Base charge for reporter attendance</li>
                                    <li>• <strong className="text-white">Page Rate:</strong> Per-page charge for transcript preparation</li>
                                    <li>• <strong className="text-white">Minimum Fee:</strong> $400 baseline for all appearances</li>
                                    <li>• <strong className="text-white">Expedite Fees:</strong> Additional charges for rush delivery</li>
                                    <li>• <strong className="text-white">Add-on Services:</strong> Real-time, video, rough drafts, etc.</li>
                                </ul>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                    <h4 className="text-white font-bold mb-3">Payment Terms</h4>
                                    <ul className="space-y-2 text-slate-400 text-sm">
                                        <li>• Net 30 days from invoice date</li>
                                        <li>• Accepted: ACH, Check, Credit Card</li>
                                        <li>• Online payment portal available</li>
                                        <li>• Late fees apply after 30 days</li>
                                    </ul>
                                </div>
                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                    <h4 className="text-white font-bold mb-3">Late Payment</h4>
                                    <ul className="space-y-2 text-slate-400 text-sm">
                                        <li>• 1.5% monthly service charge on overdue balances</li>
                                        <li>• Account may be suspended for non-payment</li>
                                        <li>• Collection costs may be added to balance</li>
                                        <li>• Future bookings may require prepayment</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 6: Intellectual Property */}
                <section id="section-6" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">6. Intellectual Property</h2>
                    </div>
                    
                    <div className="pl-16 space-y-4 text-slate-400 leading-relaxed">
                        <p>
                            All content on our website, including text, graphics, logos, and software, is the property of 
                            Marina Dubson Stenographic Services or our licensors and is protected by copyright, trademark, 
                            and other intellectual property laws.
                        </p>
                        <p>
                            <strong className="text-white">Transcript Ownership:</strong> Upon full payment, transcripts 
                            and work product are owned by the client who ordered the services. Until payment is received, 
                            we retain all rights to the work product.
                        </p>
                        <p>
                            You may not reproduce, distribute, modify, create derivative works of, publicly display, 
                            publicly perform, republish, download, store, or transmit any of the material on our website 
                            without our prior written consent.
                        </p>
                    </div>
                </section>

                {/* Section 7: Confidentiality */}
                <section id="section-7" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">7. Confidentiality</h2>
                    </div>
                    
                    <div className="pl-16 space-y-4 text-slate-400 leading-relaxed">
                        <p>
                            We understand the sensitive nature of legal proceedings and are committed to maintaining 
                            strict confidentiality. All our reporters are bound by confidentiality agreements and 
                            professional ethics rules.
                        </p>
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                            <h4 className="text-white font-bold mb-3">Confidentiality Obligations</h4>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li>• All case information and proceedings are treated as confidential</li>
                                <li>• Transcripts are only released to authorized parties</li>
                                <li>• Reporters do not discuss case details outside the proceeding</li>
                                <li>• Secure handling and storage of all case materials</li>
                                <li>• Compliance with attorney-client privilege protections</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 8: Data Protection */}
                <section id="section-8" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">8. Data Protection and Privacy</h2>
                    </div>
                    
                    <div className="pl-16 space-y-4 text-slate-400 leading-relaxed">
                        <p>
                            Your privacy is important to us. Our collection and use of personal information is governed 
                            by our <Link href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>, 
                            which is incorporated into these Terms by reference.
                        </p>
                        <p>
                            We comply with the <strong className="text-white">NY SHIELD Act</strong> and applicable data 
                            protection laws. We implement appropriate technical and organizational measures to protect 
                            your personal data against unauthorized access, alteration, disclosure, or destruction.
                        </p>
                        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                            <p className="text-slate-400 text-sm">
                                For more information about how we handle your data, including your rights under applicable 
                                privacy laws, please review our{' '}
                                <Link href="/gdpr" className="text-emerald-400 hover:text-emerald-300">Data Protection page</Link>.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 9: Limitation of Liability */}
                <section id="section-9" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Scale className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">9. Limitation of Liability</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL MARINA DUBSON 
                                STENOGRAPHIC SERVICES, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR 
                                AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE 
                                DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER 
                                INTANGIBLE LOSSES.
                            </p>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THESE TERMS OR 
                                OUR SERVICES SHALL NOT EXCEED THE AMOUNT YOU PAID TO US FOR THE SPECIFIC SERVICE GIVING 
                                RISE TO THE LIABILITY IN THE TWELVE (12) MONTHS PRIOR TO THE CLAIM.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-white font-bold">Exceptions</h4>
                            <p className="text-slate-400 text-sm">
                                The above limitations do not apply to: (a) damages caused by our gross negligence or willful misconduct; 
                                (b) our breach of confidentiality obligations; (c) our violation of applicable professional standards; 
                                or (d) any liability that cannot be excluded or limited under applicable law.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 10: Indemnification */}
                <section id="section-10" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">10. Indemnification</h2>
                    </div>
                    
                    <div className="pl-16 space-y-4 text-slate-400 leading-relaxed">
                        <p>
                            You agree to defend, indemnify, and hold harmless Marina Dubson Stenographic Services and its 
                            licensors, service providers, employees, agents, officers, and directors from and against any 
                            claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including 
                            reasonable attorneys' fees) arising out of or relating to:
                        </p>
                        <ul className="space-y-2 text-slate-400 ml-4">
                            <li>• Your violation of these Terms</li>
                            <li>• Your use of our services</li>
                            <li>• Your violation of any rights of a third party</li>
                            <li>• Your violation of any applicable laws or regulations</li>
                        </ul>
                    </div>
                </section>

                {/* Section 11: Dispute Resolution */}
                <section id="section-11" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Scale className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">11. Dispute Resolution</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                            <h4 className="text-white font-bold mb-3">Informal Resolution</h4>
                            <p className="text-slate-400 text-sm">
                                Before filing a claim, you agree to attempt to resolve any dispute informally by contacting 
                                us at <a href="mailto:disputes@marinadubson.com" className="text-blue-400 hover:text-blue-300">disputes@marinadubson.com</a>. 
                                We'll try to resolve the dispute informally for at least 30 days before either party 
                                initiates formal proceedings.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                            <h4 className="text-white font-bold mb-3">Arbitration Agreement</h4>
                            <p className="text-slate-400 text-sm mb-3">
                                Any dispute arising from or relating to these Terms or our services shall be resolved 
                                through binding arbitration in accordance with the rules of the American Arbitration Association.
                            </p>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li>• Arbitration will be conducted in New York, New York</li>
                                <li>• The arbitrator's decision will be final and binding</li>
                                <li>• Each party bears its own costs, unless the arbitrator orders otherwise</li>
                                <li>• Class action and representative action waivers apply</li>
                            </ul>
                        </div>

                        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                            <h4 className="text-amber-400 font-bold mb-2">Opt-Out</h4>
                            <p className="text-slate-400 text-sm">
                                You may opt out of this arbitration agreement by sending written notice to 
                                <a href="mailto:legal@marinadubson.com" className="text-amber-400 hover:text-amber-300"> legal@marinadubson.com</a> 
                                within 30 days of first accepting these Terms.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 12: Governing Law */}
                <section id="section-12" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Globe className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">12. Governing Law</h2>
                    </div>
                    
                    <div className="pl-16 space-y-4 text-slate-400 leading-relaxed">
                        <p>
                            These Terms and any dispute arising from them shall be governed by and construed in accordance 
                            with the laws of the State of New York, without regard to its conflict of law provisions.
                        </p>
                        <p>
                            Any legal action or proceeding arising under these Terms shall be brought exclusively in the 
                            federal or state courts located in New York County, New York. You consent to personal jurisdiction 
                            and venue in such courts.
                        </p>
                    </div>
                </section>

                {/* Section 13: Changes to Terms */}
                <section id="section-13" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">13. Changes to Terms</h2>
                    </div>
                    
                    <div className="pl-16 space-y-4 text-slate-400 leading-relaxed">
                        <p>
                            We may revise and update these Terms from time to time at our sole discretion. All changes 
                            are effective immediately when we post them and apply to all access to and use of our services 
                            thereafter.
                        </p>
                        <p>
                            Your continued use of our services following the posting of revised Terms means that you accept 
                            and agree to the changes. You are expected to check this page frequently so you are aware of any 
                            changes.
                        </p>
                    </div>
                </section>

                {/* Section 14: Contact */}
                <section id="section-14" className="space-y-6 scroll-mt-32">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Mail className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">14. Contact Information</h2>
                    </div>
                    
                    <div className="pl-16 space-y-6">
                        <p className="text-slate-400 leading-relaxed">
                            If you have any questions about these Terms of Service, please contact us:
                        </p>
                        
                        <div className="p-8 rounded-3xl bg-blue-600/5 border border-blue-500/20">
                            <h3 className="text-xl font-bold text-blue-400 mb-4">Marina Dubson Stenographic Services</h3>
                            <div className="space-y-3 text-slate-400">
                                <p>Email: <a href="mailto:legal@marinadubson.com" className="text-blue-400 hover:text-blue-300">legal@marinadubson.com</a></p>
                                <p>Phone: (212) 555-0123</p>
                                <p>Address: 123 Legal Plaza, Suite 500, New York, NY 10001</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link 
                                href="/privacy" 
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
                            >
                                <Lock className="h-4 w-4" />
                                Privacy Policy
                            </Link>
                            <Link 
                                href="/gdpr" 
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
                            >
                                <Shield className="h-4 w-4" />
                                Data Protection
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
