import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Search, ArrowRight, Activity, Users } from 'lucide-react';

export default function CompaniesList() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await fetch('/api/internal/companies');
                if (res.status === 401 || res.status === 403) {
                    navigate('/login');
                    return;
                }
                const data = await res.json();
                if (data.companies) {
                    setCompanies(data.companies);
                } else {
                    setError(data.error || 'Failed to fetch companies');
                }
            } catch (err) {
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, [navigate]);

    const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.owner_email.toLowerCase().includes(search.toLowerCase()) ||
        (c.kvk_number && c.kvk_number.includes(search))
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Building2 className="text-blue-600" />
                    Alle Bedrijven
                </h1>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Zoek op naam, email of KvK..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                            <th className="px-6 py-4">Bedrijf</th>
                            <th className="px-6 py-4">Pakket</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Gebruikers / Medewerkers</th>
                            <th className="px-6 py-4 text-right">Actie</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Aan het laden...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Geen bedrijven gevonden.</td></tr>
                        ) : filtered.map(company => {
                            const now = new Date();
                            const isTrial = company.current_plan === 'trialing';
                            const trialEnds = new Date(company.trial_ends_at);
                            const trialActive = isTrial && trialEnds > now;

                            return (
                                <tr key={company.owner_id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-900">{company.name}</p>
                                        <p className="text-xs text-gray-500">{company.owner_email}</p>
                                        {company.kvk_number && <p className="text-xs text-gray-400 mt-0.5">KvK: {company.kvk_number}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${company.current_plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                                                company.current_plan === 'professional' ? 'bg-blue-100 text-blue-800' :
                                                    company.current_plan === 'growth' ? 'bg-indigo-100 text-indigo-800' :
                                                        company.current_plan === 'starter' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                            }`}>
                                            {company.current_plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isTrial ? (
                                            trialActive ? (
                                                <span className="text-orange-600 text-xs font-semibold">Proefperiode (tot {trialEnds.toLocaleDateString('nl-NL')})</span>
                                            ) : (
                                                <span className="text-red-600 text-xs font-semibold">Verlopen</span>
                                            )
                                        ) : (
                                            <span className="text-green-600 text-xs font-semibold flex items-center gap-1"><Activity size={14} /> Actief</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                                            <span className="flex items-center gap-2"><Users size={14} className="text-gray-400" /> {company.total_users} Admins/Planners</span>
                                            <span className="flex items-center gap-2"><Users size={14} className="text-blue-400" /> {company.total_employees} Medewerkers</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/companies/${company.owner_id}`} className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                                            <ArrowRight size={20} />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
