'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Printer, Download, ArrowLeft, CreditCard, Check } from 'lucide-react'

export default function InvoiceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [invoice, setInvoice] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`/api/invoices/${params.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setInvoice(data)
                }
            } catch (error) {
                console.error('Failed to fetch invoice:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchInvoice()
    }, [params.id])

    const handlePrint = () => {
        window.print()
    }

    if (loading) return <div className="p-20 text-center font-black uppercase text-gray-400">Loading Secure Bill...</div>
    if (!invoice) return <div className="p-20 text-center">Bill not found.</div>

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-serif">
            {/* Control Bar (Hidden on Print) */}
            <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-50 print:hidden">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Ledger
                </button>
                <div className="flex items-center gap-4">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-gray-100 rounded-lg text-xs font-black uppercase hover:bg-gray-200 transition-all">
                        <Printer className="h-4 w-4" /> Print / PDF
                    </button>
                    {invoice.status !== 'PAID' && (
                        <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-xs font-black uppercase shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            <CreditCard className="h-4 w-4" /> Settle Bill
                        </button>
                    )}
                </div>
            </div>

            {/* Elite Invoice Template */}
            <div className="max-w-[850px] mx-auto my-12 bg-white shadow-2xl p-16 print:shadow-none print:my-0 min-h-[1100px] relative">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-16 border-b-2 border-gray-900 pb-10">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase leading-none mb-4">Marina Dubson</h1>
                        <div className="text-xs font-bold text-gray-600 space-y-1 uppercase tracking-widest">
                            <p>Marina Dubson Stenographic Services, LLC</p>
                            <p>12A Saturn Lane</p>
                            <p>Staten Island, NY 10314</p>
                            <p>(917) 494-1859</p>
                            <p>MarinaDubson@gmail.com</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-block py-2 px-6 border-2 border-gray-900 mb-6">
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Bill</h2>
                        </div>
                        <div className="text-xs font-black text-gray-900 space-y-2 uppercase text-right">
                            <p>JOB # {invoice.jobNumber}</p>
                            <p>DATE: {format(new Date(invoice.invoiceDate), 'MM/dd/yy')}</p>
                            <p>VOUCHER: {invoice.invoiceNumber}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-10 text-center">
                    <p className="text-[10px] font-black italic text-gray-500 uppercase tracking-[0.2em]">“Committed to accuracy, high quality and excellent customer service”</p>
                </div>

                {/* Main Table */}
                <div className="w-full">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b-2 border-gray-900">
                                <th className="text-left py-4 font-black uppercase tracking-widest">Service Description</th>
                                <th className="text-center py-4 font-black uppercase tracking-widest">Unit Value</th>
                                <th className="text-center py-4 font-black uppercase tracking-widest">Order</th>
                                <th className="text-right py-4 font-black uppercase tracking-widest">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Original */}
                            <tr className="group">
                                <td className="py-6">
                                    <p className="font-black text-gray-900 uppercase">Original Transcript</p>
                                    <p className="text-[10px] text-gray-500 font-medium italic">({invoice.pages}pgs x ${invoice.pageRate.toFixed(2)})</p>
                                </td>
                                <td className="text-center font-bold">${invoice.pageRate.toFixed(2)}pp</td>
                                <td className="text-center font-bold">{invoice.originalCopies}</td>
                                <td className="text-right font-black text-gray-900">${(invoice.pages * invoice.pageRate * invoice.originalCopies).toFixed(2)}</td>
                            </tr>

                            {/* Copy */}
                            {invoice.additionalCopies > 0 && (
                                <tr>
                                    <td className="py-6">
                                        <p className="font-black text-gray-900 uppercase">Transcript Copies</p>
                                        <p className="text-[10px] text-gray-500 font-medium italic">({invoice.pages}pgs x ${invoice.copyRate.toFixed(2)})</p>
                                    </td>
                                    <td className="text-center font-bold">${invoice.copyRate.toFixed(2)}pp</td>
                                    <td className="text-center font-bold">{invoice.additionalCopies}</td>
                                    <td className="text-right font-black text-gray-900">${(invoice.pages * invoice.copyRate * invoice.additionalCopies).toFixed(2)}</td>
                                </tr>
                            )}

                            {/* Appearance & Congestion */}
                            <tr>
                                <td className="py-6">
                                    <p className="font-black text-gray-900 uppercase">Appearance Fee & Operational Processing</p>
                                    <p className="text-[10px] text-gray-500 font-medium italic">Base Appearance + Operational Surcharge</p>
                                </td>
                                <td className="text-center font-bold">${((invoice.appearanceFee || 0) + (invoice.congestionFee || 0)).toFixed(2)}</td>
                                <td className="text-center font-bold">1</td>
                                <td className="text-right font-black text-gray-900">${((invoice.appearanceFee || 0) + (invoice.congestionFee || 0)).toFixed(2)}</td>
                            </tr>

                            {/* Realtime */}
                            {invoice.realtimeFee > 0 && (
                                <tr>
                                    <td className="py-6">
                                        <p className="font-black text-gray-900 uppercase">Realtime Feed</p>
                                        <p className="text-[10px] text-gray-500 font-medium italic">({invoice.pages}pgs x $1.50 per device)</p>
                                    </td>
                                    <td className="text-center font-bold">$1.50pp</td>
                                    <td className="text-center font-bold">{invoice.realtimeDevices || 1}</td>
                                    <td className="text-right font-black text-gray-900">${invoice.realtimeFee.toFixed(2)}</td>
                                </tr>
                            )}

                            {/* Roughs */}
                            {invoice.roughFee > 0 && (
                                <tr>
                                    <td className="py-6">
                                        <p className="font-black text-gray-900 uppercase">Rough Draft / Immediate Access</p>
                                        <p className="text-[10px] text-gray-500 font-medium italic">(+$1.25 per page per order)</p>
                                    </td>
                                    <td className="text-center font-bold">$1.25pp</td>
                                    <td className="text-center font-bold">1</td>
                                    <td className="text-right font-black text-gray-900">${invoice.roughFee.toFixed(2)}</td>
                                </tr>
                            )}

                            {/* Videographer */}
                            {invoice.videographerFee > 0 && (
                                <tr>
                                    <td className="py-6">
                                        <p className="font-black text-gray-900 uppercase">Videography Services</p>
                                        <p className="text-[10px] text-gray-500 font-medium italic">(+$1.25 per page)</p>
                                    </td>
                                    <td className="text-center font-bold">$1.25pp</td>
                                    <td className="text-center font-bold">1</td>
                                    <td className="text-right font-black text-gray-900">${invoice.videographerFee.toFixed(2)}</td>
                                </tr>
                            )}

                            {/* Interpreter */}
                            {invoice.interpreterFee > 0 && (
                                <tr>
                                    <td className="py-6">
                                        <p className="font-black text-gray-900 uppercase">Interpreter Coordination</p>
                                        <p className="text-[10px] text-gray-500 font-medium italic">(+$1.25 per page)</p>
                                    </td>
                                    <td className="text-center font-bold">$1.25pp</td>
                                    <td className="text-center font-bold">1</td>
                                    <td className="text-right font-black text-gray-900">${invoice.interpreterFee.toFixed(2)}</td>
                                </tr>
                            )}

                            {/* Expert */}
                            {invoice.expertFee > 0 && (
                                <tr>
                                    <td className="py-6">
                                        <p className="font-black text-gray-900 uppercase">Expert Witness Coordination</p>
                                        <p className="text-[10px] text-gray-500 font-medium italic">(+$2.00 per page)</p>
                                    </td>
                                    <td className="text-center font-bold">$2.00pp</td>
                                    <td className="text-center font-bold">1</td>
                                    <td className="text-right font-black text-gray-900">${invoice.expertFee.toFixed(2)}</td>
                                </tr>
                            )}

                            {/* Afterhours */}
                            {invoice.afterHoursFee > 0 && (
                                <tr>
                                    <td className="py-6">
                                        <p className="font-black text-gray-900 uppercase">Afterhours Surcharge</p>
                                        <p className="text-[10px] text-gray-500 font-medium italic">($100 per hour after 5:30 PM)</p>
                                    </td>
                                    <td className="text-center font-bold">$100.00/hr</td>
                                    <td className="text-center font-bold">{invoice.afterHoursCount || 1}</td>
                                    <td className="text-right font-black text-gray-900">${invoice.afterHoursFee.toFixed(2)}</td>
                                </tr>
                            )}

                            {/* Wait Time */}
                            {invoice.waitTimeFee > 0 && (
                                <tr>
                                    <td className="py-6">
                                        <p className="font-black text-gray-900 uppercase">Wait Time Surcharge</p>
                                        <p className="text-[10px] text-gray-500 font-medium italic">($100 per hour after 30 minutes)</p>
                                    </td>
                                    <td className="text-center font-bold">$100.00/hr</td>
                                    <td className="text-center font-bold">{invoice.waitTimeCount || 1}</td>
                                    <td className="text-right font-black text-gray-900">${invoice.waitTimeFee.toFixed(2)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary Section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Payment Selection for Task 7 */}
                    <div className="space-y-6 print:hidden">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Secure Payment Selection</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => {
                                    setInvoice({...invoice, paymentMethod: 'ACH/CHECK', processingFee: 0, total: (invoice.subtotal || 0) + (invoice.tax || 0) + (invoice.lateFee || 0)})
                                }}
                                className={`p-6 rounded-3xl border-2 transition-all text-left flex items-center justify-between group
                                    ${invoice.paymentMethod !== 'CREDIT_CARD' ? 'border-primary bg-primary/5 shadow-xl' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                            >
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Standard Settlement</p>
                                    <h5 className="text-sm font-black text-gray-900 uppercase">Check/ACH Transfer</h5>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">No additional processing fees</p>
                                </div>
                                <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${invoice.paymentMethod !== 'CREDIT_CARD' ? 'bg-primary border-primary text-white' : 'border-gray-100'}`}>
                                    {invoice.paymentMethod !== 'CREDIT_CARD' && <Check className="h-4 w-4" />}
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    const fee = ((invoice.subtotal || 0) + (invoice.tax || 0) + (invoice.lateFee || 0)) * 0.035
                                    setInvoice({...invoice, paymentMethod: 'CREDIT_CARD', processingFee: fee, total: (invoice.subtotal || 0) + (invoice.tax || 0) + (invoice.lateFee || 0) + fee})
                                }}
                                className={`p-6 rounded-3xl border-2 transition-all text-left flex items-center justify-between group
                                    ${invoice.paymentMethod === 'CREDIT_CARD' ? 'border-indigo-600 bg-indigo-50/30 shadow-xl' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                            >
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">Express Clearance</p>
                                    <h5 className="text-sm font-black text-gray-900 uppercase">Credit Card / PayPal</h5>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase mt-1">Automated 3.5% convenience fee</p>
                                </div>
                                <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${invoice.paymentMethod === 'CREDIT_CARD' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-100'}`}>
                                    {invoice.paymentMethod === 'CREDIT_CARD' && <Check className="h-4 w-4" />}
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-400">
                            <span>Subtotal</span>
                            <span className="text-gray-900 font-serif">${invoice.subtotal.toFixed(2)}</span>
                        </div>
                        {invoice.tax > 0 && (
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-400">
                                <span>Sales Tax</span>
                                <span className="text-gray-900 font-serif">${invoice.tax.toFixed(2)}</span>
                            </div>
                        )}
                        {(invoice.lateFee || 0) > 0 && (
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-rose-500">
                                <span>Late Payment Fee</span>
                                <span className="font-serif">+${invoice.lateFee.toFixed(2)}</span>
                            </div>
                        )}
                        {(invoice.processingFee || 0) > 0 && (
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-indigo-600">
                                <span>Processing Fee (3.5%)</span>
                                <span className="font-serif">+${invoice.processingFee.toFixed(2)}</span>
                            </div>
                        )}
                        <div className={`flex justify-between items-center p-6 text-white transition-colors duration-500 ${invoice.paymentMethod === 'CREDIT_CARD' ? 'bg-indigo-900' : 'bg-gray-900'}`}>
                            <span className="text-xs font-black uppercase tracking-[0.3em] font-poppins">Total Due</span>
                            <span className="text-2xl font-black font-serif">${invoice.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-32 border-t pt-10">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Tactical Notes:</h4>
                    <p className="text-xs font-bold text-gray-600 leading-relaxed uppercase">
                        {invoice.notes || "Professional services rendered for legal proceeding. Payment constitutes acceptance of final transcript accuracy."}
                    </p>
                </div>

                <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end opacity-20 print:bottom-10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Electronic Verification Point: MD-{invoice.id.slice(-8).toUpperCase()}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Page 01 of 01</p>
                </div>
            </div>
        </div>
    )
}
