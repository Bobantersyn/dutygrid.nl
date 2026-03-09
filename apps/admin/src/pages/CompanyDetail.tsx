import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function CompanyDetail() {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Account');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchCompanyData();
    }, [id]);

    const fetchCompanyData = async () => {
        try {
            const res = await fetch(`/api/internal/companies/${id}`);
            const json = await res.json();
            if (res.ok) {
                setData(json);
            } else {
                setError(json.error || 'Failed to fetch company details');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const [selectedImpersonateId, setSelectedImpersonateId] = useState<string>('');

    const handleImpersonate = async (userIdToImpersonate: string) => {
        const allUsers = data?.users ? [data.company, ...data.users] : [data.company];
        const targetUser = allUsers.find((u: any) => String(u.id) === String(userIdToImpersonate)) || data.company;

        if (!confirm(`Weet je zeker dat je wilt inloggen als ${targetUser.email}? Je huidige sessie op de achtergrond blijft actief.`)) return;

        setActionLoading(true);
        try {
            const res = await fetch('/api/internal/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_user_id: userIdToImpersonate })
            });
            const result = await res.json();
            if (res.ok && result.success) {
                // Redirection should take them to the main app URL
                const baseUrl = process.env.NODE_ENV === 'development'
                    ? 'http://localhost:3000'
                    : 'https://www.dutygrid.nl';
                window.location.href = baseUrl + result.redirectUrl;
            } else {
                alert('Inloggen mislukt: ' + result.error + (result.details ? '\n\nDetails: ' + result.details : ''));
            }
        } catch (err) {
            alert('Netwerk fout tijdens inloggen.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdatePlan = async (newPlan: string) => {
        if (!confirm(`Change plan to ${newPlan}?`)) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/internal/companies/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_plan', plan: newPlan })
            });
            if (res.ok) fetchCompanyData();
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Aan het laden...</div>;
    if (error || !data) return <div className="p-8 text-center text-red-500">{error || 'Company not found'}</div>;

    const { company, users, activity } = data;

    const tabs = ['Account', 'Users', 'Subscription', 'Billing', 'Activity'];
    const isTestCompany = company.email.includes('.dutygrid-staging.local') || company.email.includes('test+');

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Link to="/companies" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition mb-2">
                <ArrowLeft size={16} /> Terug naar overzicht
            </Link>

            {/* Header Profile - Mobile Friendly */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="w-full md:w-auto">
                    <h1 className="text-2xl font-bold text-gray-900 break-words">{company.name}</h1>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">KvK: {company.kvk_number || 'Onbekend'} • Eigenaar: <span className="break-all">{company.email}</span></p>
                    <div className="mt-4 flex flex-wrap gap-2 md:gap-3">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded capitalize">
                            {company.subscription_status}
                        </span>
                        {company.subscription_status === 'trialing' && (
                            <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-1 rounded">
                                Trial tot: {new Date(company.trial_ends_at).toLocaleDateString('nl-NL')}
                            </span>
                        )}
                        {isTestCompany && (
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded">
                                STAGING DATA
                            </span>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-2">
                    {isTestCompany ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm w-full md:w-72 shadow-sm">
                            <p className="font-semibold text-slate-800 mb-3 flex items-center justify-between">
                                Testomgeving Logins
                                <span className="text-xs font-normal text-slate-500">(1-Klik)</span>
                            </p>
                            <div className="flex flex-col gap-3">
                                <select
                                    className="border border-slate-300 rounded-md text-sm p-2 w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                    value={selectedImpersonateId || String(company.id)}
                                    onChange={(e) => setSelectedImpersonateId(e.target.value)}
                                >
                                    <option value={String(company.id)}>👑 Admin (Eigenaar)</option>
                                    {users.filter((u: any) => String(u.id) !== String(company.id)).map((u: any) => (
                                        <option key={u.id} value={String(u.id)}>
                                            {u.email.includes('planner') ? '🗂 Planner' : u.email.includes('medewerker') ? '🧑‍💼 Beveiliger' : '👤 Gast'} - {u.email.split('@')[0]}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    disabled={actionLoading}
                                    onClick={() => handleImpersonate(selectedImpersonateId || String(company.id))}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-md hover:bg-emerald-700 transition disabled:opacity-50 w-full shadow-sm"
                                >
                                    <ShieldAlert size={16} /> Direct Inloggen
                                </button>
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                    <p className="text-xs text-slate-500 text-center">
                                        Vast wachtwoord voor handmatig testen:<br />
                                        <code className="bg-white border text-emerald-700 px-1.5 py-0.5 rounded mt-1 inline-block font-mono font-bold select-all">TestPassword123!</code>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            disabled={actionLoading}
                            onClick={() => handleImpersonate(String(company.id))}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition disabled:opacity-50 w-full shadow-sm"
                        >
                            <ShieldAlert size={16} /> Impersonate Eigenaar
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs Layout */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'Account' && (
                        <div className="space-y-4 max-w-lg">
                            <h3 className="text-lg font-medium border-b pb-2">Account Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-gray-500">Bedrijfsnaam</div>
                                <div className="font-medium">{company.name}</div>
                                <div className="text-gray-500">Bedrijfsgrootte</div>
                                <div className="font-medium">{company.company_size || 'Onbekend'} personeel</div>
                                <div className="text-gray-500">Geregistreerd</div>
                                <div className="font-medium">{new Date(company.created_at).toLocaleString('nl-NL')}</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Users' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium border-b pb-2">Platform Admins ({users.length})</h3>
                            <table className="w-full text-left border-collapse text-sm">
                                <thead><tr className="border-b"><th className="pb-2">Naam</th><th className="pb-2">Email</th><th className="pb-2">Toegevoegd</th></tr></thead>
                                <tbody>
                                    {users.map((u: any) => (
                                        <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50"><td className="py-3">{u.name}</td><td className="py-3 text-gray-500">{u.email}</td><td className="py-3">{new Date(u.created_at).toLocaleDateString('nl-NL')}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'Subscription' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Huidig Pakket</h3>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-900 capitalize">{company.subscription_status}</p>
                                    {company.subscription_status === 'trialing' && (
                                        <p className="text-sm text-gray-500 mt-1">Eindigt op: {new Date(company.trial_ends_at).toLocaleString('nl-NL')}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {['starter', 'growth', 'professional', 'enterprise'].map(plan => (
                                        <button
                                            key={plan}
                                            onClick={() => handleUpdatePlan(plan)}
                                            disabled={company.subscription_status === plan || actionLoading}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded border ${company.subscription_status === plan ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} disabled:opacity-50`}
                                        >
                                            Set {plan}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 space-y-2">
                                <h4 className="font-medium text-sm text-gray-900 border-b pb-2">Admin Overrides</h4>
                                <p className="text-sm text-gray-500 mb-4">Hier kun je handmatig de limieten voor dit bedrijf aanpassen (buiten hun actuele plan om).</p>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition">Verleng Trial (+14 dagen)</button>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition">Pas Gebruikerslimiet aan</button>
                                    <button className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium shadow-sm border border-red-200 rounded hover:bg-red-100 transition">Pauzeer / Blokkeer Account</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Activity' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium border-b pb-2">Recente Activiteit</h3>
                            {activity.length === 0 ? (
                                <p className="text-gray-500 text-sm py-4">Geen activiteit gevonden voor deze tenant.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {activity.map((act: any) => (
                                        <li key={act.id} className="text-sm pb-3 border-b border-gray-100 last:border-0">
                                            <p className="font-medium text-gray-900">{act.action_type}</p>
                                            <p className="text-gray-500">{act.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(act.created_at).toLocaleString('nl-NL')}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
