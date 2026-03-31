'use client'

import Image from 'next/image'
import React from 'react'
import { PublicTopBar, PublicHeader, PublicFooter } from '../components/landing/PublicLayout'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="bg-white min-h-screen">
            <PublicTopBar />
            <PublicHeader />

            <section className="relative h-[300px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1920&q=80"
                        alt="Contact Hero"
                        fill
                        className="object-cover brightness-[0.4]"
                    />
                </div>
                <div className="relative z-10 text-center">
                    <h1 className="text-5xl font-black text-white uppercase italic">Contact</h1>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    <div className="space-y-16">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-[#1a1a1a] uppercase italic">CALL</h2>
                            <a href="tel:+10000000000" className="text-2xl font-bold text-[#0071c5] hover:underline">+1 (917) 494-1859</a>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-[#1a1a1a] uppercase italic">Email</h2>
                            <a href="mailto:MarinaDubson@gmail.com" className="text-2xl font-bold text-[#0071c5] hover:underline">MarinaDubson@gmail.com</a>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-[#1a1a1a] uppercase italic">Address</h2>
                            <p className="text-2xl font-bold text-[#0071c5]">12A Saturn Lane, Staten Island, NY</p>
                        </div>

                        <div className="flex items-center gap-6 pt-4">
                            {/* Social Icons Placeholder */}
                            <div className="h-12 w-12 rounded-full border-2 border-gray-100 flex items-center justify-center text-[#0071c5] hover:bg-[#0071c5] hover:text-white transition-all cursor-pointer">F</div>
                            <div className="h-12 w-12 rounded-full border-2 border-gray-100 flex items-center justify-center text-[#0071c5] hover:bg-[#0071c5] hover:text-white transition-all cursor-pointer">T</div>
                            <div className="h-12 w-12 rounded-full border-2 border-gray-100 flex items-center justify-center text-[#0071c5] hover:bg-[#0071c5] hover:text-white transition-all cursor-pointer">I</div>
                            <div className="h-12 w-12 rounded-full border-2 border-gray-100 flex items-center justify-center text-[#0071c5] hover:bg-[#0071c5] hover:text-white transition-all cursor-pointer">L</div>
                        </div>
                    </div>

                    <form className="space-y-8 p-12 bg-white rounded-[3rem] border border-gray-100 shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">First Name</label>
                                <input className="w-full bg-gray-50 border border-gray-100 rounded-xl p-5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#0071c5]/20 text-gray-900" placeholder="First Name" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">First Name</label>
                                <input className="w-full bg-gray-50 border border-gray-100 rounded-xl p-5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#0071c5]/20 text-gray-900" placeholder="First Name" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Email</label>
                                <input className="w-full bg-gray-50 border border-gray-100 rounded-xl p-5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#0071c5]/20 text-gray-900" placeholder="Email" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Phone Number</label>
                                <input className="w-full bg-gray-50 border border-gray-100 rounded-xl p-5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#0071c5]/20 text-gray-900" placeholder="Phone Number" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Zip Code</label>
                            <select className="w-full bg-gray-50 border border-gray-100 rounded-xl p-5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#0071c5]/20 text-gray-900 appearance-none">
                                <option>Select Your Zip Code</option>
                            </select>
                        </div>
                        <button className="w-full bg-[#0071c5] hover:bg-[#0051a8] text-white py-6 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl">
                            Join Now
                        </button>
                    </form>
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
