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

    const handleImpersonate = async () => {
        if (!confirm(`Are you sure you want to log in as ${data.company.name}? Your actions will be logged.`)) return;

        setActionLoading(true);
        try {
            const res = await fetch('/api/internal/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_user_id: data.company.id })
            });
            const result = await res.json();
            if (res.ok && result.success) {
                // Redirection should take them to the main app URL (port 4000 usually)
                window.location.href = 'http://localhost:4000' + result.redirectUrl;
            } else {
                alert('Failed to impersonate: ' + result.error + (result.details ? '\n\nDetails: ' + result.details : ''));
            }
        } catch (err) {
            alert('Network error');
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

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Link to="/companies" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
                <ArrowLeft size={16} /> Terug naar overzicht
            </Link>

            {/* Header Profile */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                    <p className="text-gray-500 mt-1">KvK: {company.kvk_number || 'Onbekend'} • Eigenaar: {company.email}</p>
                    <div className="mt-4 flex gap-3">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded capitalize">
                            {company.subscription_status}
                        </span>
                        {company.subscription_status === 'trialing' && (
                            <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-1 rounded">
                                Trial tot: {new Date(company.trial_ends_at).toLocaleDateString('nl-NL')}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        disabled={actionLoading}
                        onClick={handleImpersonate}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
                    >
                        <ShieldAlert size={16} /> Impersonate Admin
                    </button>
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
