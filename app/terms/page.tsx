export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 py-32 px-8">
            <div className="max-w-4xl mx-auto space-y-16">
                <div className="space-y-6">
                    <h1 className="text-6xl font-black uppercase tracking-tighter">Service <span className="text-blue-500 italic">Terms</span></h1>
                    <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs">Agreement Matrix v4.1</p>
                </div>

                <div className="grid gap-12 text-slate-400 leading-relaxed font-medium">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">1. Assignment Protocol</h2>
                        <p>
                            By initializing a booking on the MD portal, you agree to our assignment protocols.
                            Mininum fees apply to all court appearances ($400 baseline). Cancellation within 24 hours of
                            booking may trigger a severance fee.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">2. Signal Accuracy</h2>
                        <p>
                            We strive for 100% stenographic precision. In the event of a signal discrepancy,
                            clients have 48 hours to request a re-sync or audit of the holographic transcript.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">3. Payment Systems</h2>
                        <p>
                            Invoices are generated automatically upon task completion. Net 30 is the standard
                            protocol unless an expedited settlement arrangement is established. Overdue signals
                            may lead to account suspension.
                        </p>
                    </section>

                    <div className="h-px w-full bg-white/5 my-12"></div>

                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
                        Signal authorization implies total agreement with the above matrix.
                    </p>
                </div>
            </div>
        </div>
    )
}
