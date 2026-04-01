'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import AdminSidebar from './components/AdminSidebar'
import AdminHeader from './components/AdminHeader'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { LayoutDashboard, CalendarDays, ClipboardList, Users, FileText, Settings, BarChart3, Zap, MessageSquare, UsersRound, UserCheck, UserCog } from 'lucide-react'
import MobileTabNavigation from '@/app/components/MobileTabNavigation'

const adminMobileNav = [
    { name: 'Home', href: '/admin/dashboard', icon: LayoutDashboard },
    {
        name: 'Bookings',
        href: '/admin/bookings',
        icon: ClipboardList,
        subTabs: [
            { name: 'Pending', href: '/admin/bookings?filter=SUBMITTED' },
            { name: 'Active', href: '/admin/bookings?filter=ACCEPTED' },
            { name: 'Completed', href: '/admin/bookings?filter=COMPLETED' },
            { name: 'Declined', href: '/admin/bookings?filter=DECLINED' },
            { name: 'Availability', href: '/admin/bookings?filter=REPORTERS' },
        ]
    },
    { name: 'Calendar', href: '/admin/calendar', icon: CalendarDays, variant: 'calendar' as const },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Invoices', href: '/admin/invoices', icon: FileText },
    { name: 'Clients', href: '/admin/clients', icon: UserCheck },
    { name: 'Documents', href: '/admin/documents', icon: FileText },
    { name: 'Team', href: '/admin/team', icon: UsersRound },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Reporters', href: '/admin/reporters', icon: UserCog },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Analytics', href: '/admin/analytics', icon: Zap },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [showSidebar, setShowSidebar] = useState(true)

    return (
        <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPER_ADMIN', 'STAFF', 'REPORTER']}>
            <div className="flex h-screen overflow-hidden bg-background transition-colors duration-300">
                {/* Sidebar */}
                {showSidebar && (
                    <AdminSidebar
                        isCollapsed={isCollapsed}
                        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                        isOpen={false}
                        setIsOpen={() => { }}
                    />
                )}

                {/* Main area */}
                <div className={`
                    flex flex-1 flex-col overflow-hidden h-screen
                    transition-all duration-300 ease-in-out
                    ${!showSidebar ? 'pl-0' : (isCollapsed ? 'lg:pl-[68px]' : 'lg:pl-60')}
                `}>
                    <AdminHeader onToggleSidebar={() => setShowSidebar(!showSidebar)} />
                    <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
                        {children}
                    </main>
                </div>

                {/* Mobile Bottom Navigation */}
                <MobileTabNavigation navigation={adminMobileNav} />

                {/* Mobile overlay - Not needed */}
            </div>
        </ProtectedRoute>
    )
}
