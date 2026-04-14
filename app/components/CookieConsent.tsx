'use client'

import { useState, useEffect } from 'react'
import { Cookie, X, Shield, Settings } from 'lucide-react'
import Link from 'next/link'

interface CookiePreferences {
    essential: boolean
    analytics: boolean
    functional: boolean
    marketing: boolean
}

const COOKIE_CONSENT_KEY = 'md_cookie_consent'
const COOKIE_PREFERENCES_KEY = 'md_cookie_preferences'

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)
    const [showPreferences, setShowPreferences] = useState(false)
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true, // Always required
        analytics: false,
        functional: false,
        marketing: false,
    })

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
        if (!consent) {
            setIsVisible(true)
        } else {
            // Load saved preferences
            const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY)
            if (savedPrefs) {
                setPreferences(JSON.parse(savedPrefs))
            }
        }
    }, [])

    const handleAcceptAll = () => {
        const allAccepted: CookiePreferences = {
            essential: true,
            analytics: true,
            functional: true,
            marketing: true,
        }
        savePreferences(allAccepted)
    }

    const handleAcceptEssential = () => {
        const essentialOnly: CookiePreferences = {
            essential: true,
            analytics: false,
            functional: false,
            marketing: false,
        }
        savePreferences(essentialOnly)
    }

    const handleSavePreferences = () => {
        savePreferences(preferences)
    }

    const savePreferences = (prefs: CookiePreferences) => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
        localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs))
        setPreferences(prefs)
        setIsVisible(false)
        setShowPreferences(false)

        // Apply preferences (e.g., enable/disable analytics)
        applyCookiePreferences(prefs)
    }

    const applyCookiePreferences = (prefs: CookiePreferences) => {
        // Enable/disable Google Analytics based on preference
        if (prefs.analytics) {
            // Enable analytics
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('consent', 'update', {
                    analytics_storage: 'granted',
                })
            }
        } else {
            // Disable analytics
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('consent', 'update', {
                    analytics_storage: 'denied',
                })
            }
        }

        // Dispatch custom event for other components
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: prefs }))
        }
    }

    const togglePreference = (key: keyof CookiePreferences) => {
        if (key === 'essential') return // Cannot toggle essential
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {!showPreferences ? (
                    <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                                    <Cookie className="h-7 w-7 text-amber-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-1">We value your privacy</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                                        We use cookies to enhance your browsing experience, analyze site traffic, 
                                        and personalize content. By clicking &quot;Accept All&quot;, you consent to our use of cookies. 
                                        Read our{' '}
                                        <Link href="/privacy" className="text-amber-400 hover:text-amber-300 underline">
                                            Privacy Policy
                                        </Link>{' '}
                                        and{' '}
                                        <Link href="/gdpr" className="text-amber-400 hover:text-amber-300 underline">
                                            Cookie Policy
                                        </Link>{' '}
                                        for more information.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => setShowPreferences(true)}
                                    className="px-5 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all text-sm font-medium flex items-center gap-2"
                                >
                                    <Settings className="h-4 w-4" />
                                    Preferences
                                </button>
                                <button
                                    onClick={handleAcceptEssential}
                                    className="px-5 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
                                >
                                    Essential Only
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold transition-all text-sm"
                                >
                                    Accept All
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Cookie Preferences</h3>
                                    <p className="text-slate-400 text-sm">Manage your cookie settings</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPreferences(false)}
                                className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            {/* Essential Cookies */}
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="text-white font-bold">Essential Cookies</h4>
                                        <p className="text-slate-500 text-xs">Required for the website to function</p>
                                    </div>
                                    <div className="h-6 w-11 bg-emerald-500 rounded-full relative cursor-not-allowed">
                                        <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm">
                                    These cookies are necessary for the website to function and cannot be disabled. 
                                    They include session cookies for authentication and security features.
                                </p>
                            </div>

                            {/* Analytics Cookies */}
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="text-white font-bold">Analytics Cookies</h4>
                                        <p className="text-slate-500 text-xs">Help us improve our website</p>
                                    </div>
                                    <button
                                        onClick={() => togglePreference('analytics')}
                                        className={`h-6 w-11 rounded-full relative transition-colors ${
                                            preferences.analytics ? 'bg-emerald-500' : 'bg-slate-600'
                                        }`}
                                    >
                                        <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${
                                            preferences.analytics ? 'right-1' : 'left-1'
                                        }`}></div>
                                    </button>
                                </div>
                                <p className="text-slate-400 text-sm">
                                    These cookies help us understand how visitors interact with our website. 
                                    We use Google Analytics to collect anonymous usage data.
                                </p>
                            </div>

                            {/* Functional Cookies */}
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="text-white font-bold">Functional Cookies</h4>
                                        <p className="text-slate-500 text-xs">Enhanced functionality</p>
                                    </div>
                                    <button
                                        onClick={() => togglePreference('functional')}
                                        className={`h-6 w-11 rounded-full relative transition-colors ${
                                            preferences.functional ? 'bg-emerald-500' : 'bg-slate-600'
                                        }`}
                                    >
                                        <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${
                                            preferences.functional ? 'right-1' : 'left-1'
                                        }`}></div>
                                    </button>
                                </div>
                                <p className="text-slate-400 text-sm">
                                    These cookies enable enhanced functionality and personalization, such as 
                                    remembering your preferences and login state.
                                </p>
                            </div>

                            {/* Marketing Cookies */}
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="text-white font-bold">Marketing Cookies</h4>
                                        <p className="text-slate-500 text-xs">Personalized advertising</p>
                                    </div>
                                    <button
                                        onClick={() => togglePreference('marketing')}
                                        className={`h-6 w-11 rounded-full relative transition-colors ${
                                            preferences.marketing ? 'bg-emerald-500' : 'bg-slate-600'
                                        }`}
                                    >
                                        <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${
                                            preferences.marketing ? 'right-1' : 'left-1'
                                        }`}></div>
                                    </button>
                                </div>
                                <p className="text-slate-400 text-sm">
                                    These cookies may be used to deliver personalized advertisements and track 
                                    the effectiveness of our marketing campaigns.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-end">
                            <button
                                onClick={() => setShowPreferences(false)}
                                className="px-5 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSavePreferences}
                                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold transition-all text-sm"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Hook to check if a specific cookie type is allowed
export function useCookieConsent() {
    const [consent, setConsent] = useState<CookiePreferences | null>(null)

    useEffect(() => {
        const checkConsent = () => {
            const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY)
            if (saved) {
                setConsent(JSON.parse(saved))
            }
        }

        checkConsent()

        // Listen for updates
        const handleUpdate = (e: CustomEvent<CookiePreferences>) => {
            setConsent(e.detail)
        }

        window.addEventListener('cookieConsentUpdated', handleUpdate as EventListener)
        return () => window.removeEventListener('cookieConsentUpdated', handleUpdate as EventListener)
    }, [])

    return {
        consent,
        hasConsent: !!consent,
        analyticsAllowed: consent?.analytics ?? false,
        functionalAllowed: consent?.functional ?? false,
        marketingAllowed: consent?.marketing ?? false,
    }
}
