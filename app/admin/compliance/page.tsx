'use client'

import { useEffect, useState } from 'react'
import {
    Shield,
    Lock,
    FileText,
    Clock,
    AlertTriangle,
    CheckCircle,
    Eye,
    Database,
    UserX,
    Download,
    RefreshCw,
    ChevronRight,
    ExternalLink,
    AlertCircle,
    Calendar
} from 'lucide-react'
import Link from 'next/link'

interface DataRetentionPolicy {
    id: string
    dataCategory: string
    retentionPeriod: string
    description: string
    legalBasis: string
    autoDelete: boolean
    currentRecords?: number
}

interface DataRequest {
    id: string
    requestType: string
    status: string
    email: string
    name: string
    requestedAt: string
    daysRemaining: number
}

interface SecurityIncident {
    id: string
    incidentType: string
    severity: string
    status: string
    description: string
    affectedUsers: number
    detectedAt: string
}

export default function ComplianceAdminPage() {
    const [activeTab, setActiveTab] = useState('OVERVIEW')
    const [retentionPolicies, setRetentionPolicies] = useState<DataRetentionPolicy[]>([])
    const [dataRequests, setDataRequests] = useState<DataRequest[]>([])
    const [incidents, setIncidents] = useState<SecurityIncident[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchComplianceData()
    }, [])

    const fetchComplianceData = async () => {
        try {
            // Fetch retention policies
            const policiesRes = await fetch('/api/admin/compliance/retention-policies')
            if (policiesRes.ok) {
                setRetentionPolicies(await policiesRes.json())
            }

            // Fetch data requests
            const requestsRes = await fetch('/api/admin/compliance/data-requests')
            if (requestsRes.ok) {
                setDataRequests(await requestsRes.json())
            }

            // Fetch security incidents
            const incidentsRes = await fetch('/api/admin/compliance/security-incidents')
            if (incidentsRes.ok) {
                setIncidents(await incidentsRes.json())
            }
        } catch (error) {
            console.error('Error fetching compliance data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20'
            case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
            case 'MEDIUM': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'RESOLVED':
                return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            case 'IN_PROGRESS':
                return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
            case 'PENDING':
                return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            default:
                return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
        }
    }

    const getRequestTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'ACCESS': 'Right to Access',
            'RECTIFICATION': 'Right to Rectification',
            'ERASURE': 'Right to Erasure',
            'RESTRICT': 'Right to Restrict Processing',
            'PORTABILITY': 'Right to Data Portability'
        }
        return labels[type] || type
    }

    const pendingRequests = dataRequests.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS')
    const openIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED')

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tight">Compliance Center</h1>
                                <p className="text-slate-500 text-sm">GDPR & NY SHIELD Act Management</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/privacy"
                            target="_blank"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all text-sm"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View Privacy Policy
                        </Link>
                        <button
                            onClick={fetchComplianceData}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center gap-3 mb-3">
                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold text-sm uppercase">Compliance Status</span>
                        </div>
                        <p className="text-2xl font-black text-white">Active</p>
                        <p className="text-slate-500 text-xs mt-1">NY SHIELD Act & GDPR</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-center gap-3 mb-3">
                            <UserX className="h-5 w-5 text-amber-400" />
                            <span className="text-amber-400 font-bold text-sm uppercase">Pending Requests</span>
                        </div>
                        <p className="text-2xl font-black text-white">{pendingRequests.length}</p>
                        <p className="text-slate-500 text-xs mt-1">Data subject requests</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            <span className="text-red-400 font-bold text-sm uppercase">Open Incidents</span>
                        </div>
                        <p className="text-2xl font-black text-white">{openIncidents.length}</p>
                        <p className="text-slate-500 text-xs mt-1">Security incidents</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-3">
                            <Database className="h-5 w-5 text-blue-400" />
                            <span className="text-blue-400 font-bold text-sm uppercase">Data Retention</span>
                        </div>
                        <p className="text-2xl font-black text-white">{retentionPolicies.length}</p>
                        <p className="text-slate-500 text-xs mt-1">Active policies</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                    {[
                        { id: 'OVERVIEW', label: 'Overview', icon: Shield },
                        { id: 'REQUESTS', label: 'Data Requests', icon: UserX },
                        { id: 'RETENTION', label: 'Data Retention', icon: Clock },
                        { id: 'INCIDENTS', label: 'Security Incidents', icon: AlertTriangle },
                        { id: 'AUDIT', label: 'Access Audit', icon: Eye },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                    : 'bg-white/[0.02] border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* OVERVIEW Tab */}
                        {activeTab === 'OVERVIEW' && (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-emerald-400" />
                                            Compliance Framework
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                                <div>
                                                    <p className="text-white font-medium">NY SHIELD Act</p>
                                                    <p className="text-slate-500 text-sm">Data security & breach notification</p>
                                                </div>
                                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                                <div>
                                                    <p className="text-white font-medium">GDPR</p>
                                                    <p className="text-slate-500 text-sm">EU data protection regulation</p>
                                                </div>
                                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                                <div>
                                                    <p className="text-white font-medium">GBL Section 349</p>
                                                    <p className="text-slate-500 text-sm">NY deceptive practices law</p>
                                                </div>
                                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Lock className="h-5 w-5 text-blue-400" />
                                            Security Measures
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                'AES-256 encryption at rest',
                                                'TLS 1.3 encryption in transit',
                                                'Multi-factor authentication',
                                                'Role-based access controls',
                                                'Regular security audits',
                                                'Automated backup systems',
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 text-slate-400 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20">
                                    <div className="flex items-start gap-4">
                                        <AlertCircle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="text-lg font-bold text-amber-400 mb-2">Action Required</h3>
                                            <p className="text-slate-400 text-sm leading-relaxed">
                                                Ensure all data subject requests are processed within 30 days as required by 
                                                the NY SHIELD Act and GDPR. Currently {pendingRequests.length} request(s) pending.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* DATA REQUESTS Tab */}
                        {activeTab === 'REQUESTS' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">Data Subject Requests</h3>
                                    <span className="text-slate-500 text-sm">
                                        {dataRequests.length} total requests
                                    </span>
                                </div>

                                {dataRequests.length === 0 ? (
                                    <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
                                        <UserX className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400">No data requests found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {dataRequests.map((request) => (
                                            <div
                                                key={request.id}
                                                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(request.status)}`}>
                                                                {request.status}
                                                            </span>
                                                            <span className="text-white font-medium">
                                                                {getRequestTypeLabel(request.requestType)}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-400 text-sm">
                                                            {request.name} ({request.email})
                                                        </p>
                                                        <p className="text-slate-500 text-xs">
                                                            Requested: {new Date(request.requestedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {request.daysRemaining > 0 && request.status === 'PENDING' && (
                                                            <div className="text-right">
                                                                <p className={`text-sm font-bold ${request.daysRemaining < 7 ? 'text-red-400' : 'text-amber-400'}`}>
                                                                    {request.daysRemaining} days
                                                                </p>
                                                                <p className="text-slate-500 text-xs">to respond</p>
                                                            </div>
                                                        )}
                                                        <button className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all">
                                                            <ChevronRight className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* RETENTION Tab */}
                        {activeTab === 'RETENTION' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">Data Retention Policies</h3>
                                    <span className="text-slate-500 text-sm">
                                        {retentionPolicies.length} policies configured
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Data Category</th>
                                                <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Retention Period</th>
                                                <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Legal Basis</th>
                                                <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Records</th>
                                                <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Auto-Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {retentionPolicies.map((policy) => (
                                                <tr key={policy.id} className="border-b border-white/5">
                                                    <td className="py-4 px-4">
                                                        <p className="text-white font-medium">{policy.dataCategory}</p>
                                                        <p className="text-slate-500 text-xs">{policy.description}</p>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="text-slate-300">{policy.retentionPeriod.replace(/_/g, ' ')}</span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="text-slate-300">{policy.legalBasis.replace(/_/g, ' ')}</span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="text-blue-400 font-medium">
                                                            {policy.currentRecords?.toLocaleString() || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            policy.autoDelete
                                                                ? 'text-emerald-400 bg-emerald-500/10'
                                                                : 'text-slate-400 bg-slate-500/10'
                                                        }`}>
                                                            {policy.autoDelete ? 'Enabled' : 'Manual'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* INCIDENTS Tab */}
                        {activeTab === 'INCIDENTS' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">Security Incidents</h3>
                                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm">
                                        <AlertTriangle className="h-4 w-4" />
                                        Report Incident
                                    </button>
                                </div>

                                {incidents.length === 0 ? (
                                    <div className="p-12 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                                        <Shield className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                                        <p className="text-emerald-400 font-medium">No security incidents reported</p>
                                        <p className="text-slate-500 text-sm mt-1">Your data is secure</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {incidents.map((incident) => (
                                            <div
                                                key={incident.id}
                                                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getSeverityColor(incident.severity)}`}>
                                                                {incident.severity}
                                                            </span>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(incident.status)}`}>
                                                                {incident.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-white font-medium">{incident.incidentType}</p>
                                                        <p className="text-slate-400 text-sm line-clamp-2">{incident.description}</p>
                                                        <div className="flex items-center gap-4 text-slate-500 text-xs">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(incident.detectedAt).toLocaleDateString()}
                                                            </span>
                                                            <span>{incident.affectedUsers} affected users</span>
                                                        </div>
                                                    </div>
                                                    <button className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all">
                                                        <ChevronRight className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AUDIT Tab */}
                        {activeTab === 'AUDIT' && (
                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-blue-400" />
                                        Data Access Audit
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-6">
                                        Access audit logs are retained for 26 months in compliance with NY SHIELD Act requirements. 
                                        Use the filters below to search access logs.
                                    </p>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">User ID</label>
                                            <input
                                                type="text"
                                                placeholder="Enter user ID"
                                                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Resource Type</label>
                                            <select className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-blue-500/50">
                                                <option value="">All Resources</option>
                                                <option value="CONTACT">Contacts</option>
                                                <option value="BOOKING">Bookings</option>
                                                <option value="INVOICE">Invoices</option>
                                                <option value="DOCUMENT">Documents</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Date Range</label>
                                            <select className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-blue-500/50">
                                                <option value="7">Last 7 days</option>
                                                <option value="30">Last 30 days</option>
                                                <option value="90">Last 90 days</option>
                                                <option value="custom">Custom range</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all text-sm font-medium">
                                            <Eye className="h-4 w-4" />
                                            Search Logs
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Download className="h-5 w-5 text-emerald-400" />
                                        Export Compliance Reports
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <button className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all text-left">
                                            <p className="text-white font-medium mb-1">Data Retention Report</p>
                                            <p className="text-slate-500 text-sm">Export current retention policy status</p>
                                        </button>
                                        <button className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all text-left">
                                            <p className="text-white font-medium mb-1">Access Audit Report</p>
                                            <p className="text-slate-500 text-sm">Export access logs for compliance review</p>
                                        </button>
                                        <button className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all text-left">
                                            <p className="text-white font-medium mb-1">Data Subject Requests Report</p>
                                            <p className="text-slate-500 text-sm">Export all data request history</p>
                                        </button>
                                        <button className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all text-left">
                                            <p className="text-white font-medium mb-1">Security Incident Report</p>
                                            <p className="text-slate-500 text-sm">Export security incident history</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
