'use client'

import { Bell, Search, MessageSquare, Settings, LogOut, User, Moon, Sun, ChevronDown, Check, Clock, Menu, RefreshCw } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/theme-context'
import { format } from 'date-fns'

// Page title map
const PAGE_TITLES: Record<string, string> = {
    '/admin/dashboard': 'Dashboard',
    '/admin/calendar': 'Calendar',
    '/admin/bookings': 'Bookings',
    '/admin/jobs': 'Jobs',
    '/admin/invoices': 'Invoices',
    '/admin/reports': 'Reports',
    '/admin/team': 'Team',
    '/admin/clients': 'Clients',
    '/admin/reporters': 'Reporters',
    '/admin/messages': 'Messages',
    '/admin/content': 'Content',
    '/admin/blogs': 'Blog Management',
    '/admin/email-campaigns': 'Email Campaigns',
    '/admin/services': 'Services',
    '/admin/settings': 'Settings',
    '/admin/analytics': 'Analytics',
}

export default function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
    const router = useRouter()
    const pathname = usePathname()
    const { theme, toggleTheme } = useTheme()
    const [user, setUser] = useState<any>(null)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const [isMsgOpen, setIsMsgOpen] = useState(false)

    const [pendingBookings, setPendingBookings] = useState<any[]>([])
    const [addonAlerts, setAddonAlerts] = useState<any[]>([])
    const [recentMessages, setRecentMessages] = useState<any[]>([])
    const [unreadMsgCount, setUnreadMsgCount] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')

    const notifRef = useRef<HTMLDivElement>(null)
    const msgRef = useRef<HTMLDivElement>(null)
    const profileRef = useRef<HTMLDivElement>(null)

    // Determine page title
    const pageTitle = Object.entries(PAGE_TITLES).find(([key]) =>
        pathname === key || pathname.startsWith(key + '/')
    )?.[1] ?? 'Admin'

    useEffect(() => {
        const syncUser = () => {
            const stored = localStorage.getItem('user')
            if (stored) setUser(JSON.parse(stored))
        }
        syncUser()

        // Sync across components and tabs
        window.addEventListener('user-profile-updated', syncUser)
        window.addEventListener('storage', syncUser)

        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false)
            if (msgRef.current && !msgRef.current.contains(event.target as Node)) setIsMsgOpen(false)
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('user-profile-updated', syncUser)
            window.removeEventListener('storage', syncUser)
        }
    }, [])

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            // Fetch Pending Bookings (Notifications)
            const bookingRes = await fetch('/api/bookings?status=SUBMITTED&limit=10', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (bookingRes.ok) {
                const data = await bookingRes.json()
                setPendingBookings(data.bookings || [])
            }

            // Fetch add-on alerts (bookings with special requirements)
            const addonRes = await fetch('/api/bookings?limit=25', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (addonRes.ok) {
                const data = await addonRes.json()
                const list = (data.bookings || []).filter((b: any) =>
                    b.specialRequirements && b.specialRequirements.trim().length > 0 &&
                    ['SUBMITTED', 'ACCEPTED', 'CONFIRMED'].includes(b.bookingStatus)
                )
                setAddonAlerts(list.slice(0, 5))
            }

            // Fetch Messages
            const msgRes = await fetch('/api/messages?limit=5', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (msgRes.ok) {
                const data = await msgRes.json()
                const msgs = data.messages || []
                setRecentMessages(msgs)
                setUnreadMsgCount(msgs.filter((m: any) => !m.isRead && m.recipientId === (user?.id || user?.userId)).length)
            }
        } catch { /* silent */ }
    }, [user?.id, user?.userId])

    useEffect(() => {
        fetchData()
        const id = setInterval(fetchData, 30_000)
        return () => clearInterval(id)
    }, [fetchData])

    useEffect(() => {
        const handler = () => fetchData()
        window.addEventListener('admin-notifications-refresh', handler)
        return () => window.removeEventListener('admin-notifications-refresh', handler)
    }, [fetchData])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        router.push('/')
    }

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            router.push(`/admin/bookings?q=${encodeURIComponent(searchTerm.trim())}`)
        }
    }

    const initials = user
        ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`
        : 'MD'

    return (
        <header className="sticky top-0 z-[450] flex items-center justify-between gap-4
                           h-[64px] px-3 sm:px-6
                           bg-card/90 backdrop-blur-md border-b border-border">

            {/* Left: Sidebar Toggle + Page Identity */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <button
                    onClick={onToggleSidebar}
                    className="hidden lg:flex p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-95"
                    title="Toggle Sidebar"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Mobile Identifier */}
                <div className="lg:hidden flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <span className="text-[10px] font-black uppercase tracking-tighter">ADM</span>
                    </div>
                </div>

                {/* Page title — desktop */}
                <div className="hidden lg:block pl-1">
                    <h1 className="text-base font-semibold text-foreground tracking-tight">
                        {pageTitle}
                    </h1>
                </div>
            </div>

            {/* Center Search */}
            <div className="hidden sm:flex flex-1 max-w-xs">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                        className="w-full bg-muted/40 border border-border rounded-xl
                               pl-9 pr-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-foreground
                               placeholder:text-muted-foreground/50
                               focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50
                               transition-all duration-200"
                    />
                </div>
            </div>

            <div className="flex-1 sm:hidden" />

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <button onClick={() => { fetchData(); window.dispatchEvent(new Event('user-profile-updated')); }}
                    className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all active:scale-90 group"
                    aria-label="Refresh Data">
                    <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                </button>

                <button onClick={toggleTheme}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-90"
                    aria-label="Toggle theme">
                    {theme === 'light'
                        ? <Moon className="h-4 w-4" />
                        : <Sun className="h-4 w-4 text-amber-500" />
                    }
                </button>
                <div className="relative" ref={msgRef}>
                    <button
                        onClick={() => { setIsMsgOpen(!isMsgOpen); setIsNotifOpen(false); setIsProfileOpen(false); }}
                        className={`p-2 rounded-lg transition-all border ${isMsgOpen ? 'bg-muted border-border text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted border-transparent hover:border-border'}`}
                        aria-label="Messages">
                        <MessageSquare className="h-4 w-4" />
                        {unreadMsgCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-0.5 text-[10px] font-bold
                                             bg-primary text-white rounded-full flex items-center justify-center border border-card">
                                {unreadMsgCount}
                            </span>
                        )}
                    </button>

                    {isMsgOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[500]">
                            <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted/30">
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Messages</h3>
                                <Link href="/admin/messages" onClick={() => setIsMsgOpen(false)} className="text-[10px] font-bold text-primary hover:underline">Open Messages</Link>
                            </div>
                            <div className="max-h-[350px] overflow-y-auto">
                                {recentMessages.length > 0 ? (
                                    recentMessages.map((msg) => (
                                        <button
                                            key={msg.id}
                                            onClick={() => {
                                                router.push('/admin/messages');
                                                setIsMsgOpen(false);
                                            }}
                                            className="w-full px-4 py-3 flex gap-3 hover:bg-muted transition-colors border-b border-border/50 text-left last:border-0"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                                {msg.sender?.firstName?.[0] ?? '?'}{msg.sender?.lastName?.[0] ?? ''}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <p className="text-xs font-bold text-foreground truncate">{msg.sender?.firstName} {msg.sender?.lastName}</p>
                                                    <p className="text-[8px] font-medium text-muted-foreground whitespace-nowrap">{format(new Date(msg.createdAt), 'HH:mm')}</p>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground truncate">{msg.content}</p>
                                            </div>
                                            {!msg.isRead && msg.recipientId === (user?.id || user?.userId) && (
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="py-8 text-center">
                                        <MessageSquare className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No messages yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => { setIsNotifOpen(!isNotifOpen); setIsMsgOpen(false); setIsProfileOpen(false); }}
                        className={`relative p-2 rounded-lg transition-all border ${isNotifOpen ? 'bg-muted border-border text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted border-transparent hover:border-border'}`}
                        aria-label="Notifications">
                        <Bell className="h-4 w-4" />
                        {(pendingBookings.length > 0 || addonAlerts.length > 0) && (
                            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-0.5 text-[10px] font-bold
                                             bg-amber-500 text-white rounded-full flex items-center justify-center border border-card animate-pulse">
                                {pendingBookings.length + addonAlerts.length}
                            </span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[500]">
                            <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted/30">
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Notifications</h3>
                                <Link href="/admin/bookings" onClick={() => setIsNotifOpen(false)} className="text-[10px] font-bold text-primary hover:underline">Monitor All</Link>
                            </div>
                            <div className="max-h-[350px] overflow-y-auto">
                                {pendingBookings.length === 0 && addonAlerts.length === 0 && (
                                    <div className="py-8 text-center">
                                        <Bell className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">All clear</p>
                                    </div>
                                )}

                                {pendingBookings.slice(0, 5).map((booking) => (
                                    <button
                                        key={booking.id}
                                        onClick={() => {
                                            router.push(`/admin/bookings?id=${booking.id}`);
                                            setIsNotifOpen(false);
                                        }}
                                        className="w-full px-4 py-3 flex gap-3 hover:bg-muted transition-colors border-b border-border/50 text-left last:border-0 group"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-foreground uppercase tracking-tight mb-0.5 truncate">{booking.proceedingType}</p>
                                            <p className="text-[9px] font-medium text-muted-foreground uppercase">{booking.contact?.companyName || 'Private Client'}</p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Check className="h-3 w-3 text-amber-500" />
                                                <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">New Booking</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}

                                {addonAlerts.map((booking) => (
                                    <button
                                        key={`addon-${booking.id}`}
                                        onClick={() => {
                                            router.push(`/admin/bookings?id=${booking.id}`);
                                            setIsNotifOpen(false);
                                            window.dispatchEvent(new CustomEvent('admin-open-addon', { 
                                                detail: { 
                                                    id: booking.id, 
                                                    text: booking.specialRequirements,
                                                    clientName: booking.contact?.companyName || (booking.contact ? `${booking.contact.firstName} ${booking.contact.lastName}` : 'Unknown Client')
                                                } 
                                            }))
                                        }}
                                        className="w-full px-4 py-3 flex gap-3 hover:bg-primary/5 transition-colors border-b border-border/50 text-left last:border-0 group"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <Bell className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-foreground uppercase tracking-tight mb-0.5 truncate">{booking.proceedingType}</p>
                                            <p className="text-[9px] font-medium text-muted-foreground uppercase">{booking.contact?.companyName || (booking.contact ? `${booking.contact.firstName} ${booking.contact.lastName}` : 'Private Client')}</p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Check className="h-3 w-3 text-primary" />
                                                <span className="text-[8px] font-black text-primary uppercase tracking-widest">Add-on request</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); setIsMsgOpen(false); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${isProfileOpen ? 'bg-muted border-border' : 'hover:bg-muted border-transparent hover:border-border'}`}
                    >
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-semibold text-foreground leading-none">
                                {user?.firstName ?? 'Admin'}
                            </p>
                        </div>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 z-[500]
                                        bg-card border border-border rounded-xl shadow-xl
                                        overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-border bg-muted/20">
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {user?.email ?? ''}
                                </p>
                            </div>
                            <div className="py-1.5">
                                <Link href="/admin/settings" onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    My Profile
                                </Link>
                                <Link href="/admin/settings" onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                    Settings
                                </Link>
                            </div>
                            <div className="border-t border-border py-1.5">
                                <button onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left
                                               text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                                    <LogOut className="h-4 w-4" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
