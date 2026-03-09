import { useState, useEffect } from 'react';
import { Rocket, Settings, CheckCircle } from 'lucide-react';

interface TestEnvironmentConfig {
    company: { name: string; email: string; employees: string };
    mode: 'blank' | 'demo' | 'preset_small' | 'preset_growth' | 'preset_pro';
    plan: 'trial' | 'starter' | 'growth' | 'professional' | 'enterprise';
    trialDuration: 14 | 30;
    billingStatus: 'trialing' | 'active_monthly' | 'active_yearly' | 'past_due' | 'canceled';
    timeOffsetDays: 0 | 7 | 14 | 30;
    seedData: {
        employees: boolean;
        shifts: boolean;
        incidents: boolean;
        clients: boolean;
        invoices: boolean;
    };
    featureFlags: { gps: boolean; incidents: boolean; clients: boolean; };
    customShifts: { count: number; months: number; };
}

interface Props {
    onBuildComplete: (companyData: any) => void;
}

export default function TestCompanyBuilder({ onBuildComplete }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const [config, setConfig] = useState<TestEnvironmentConfig>({
        company: { name: `Test Security BV (${randomSuffix})`, email: `test+${randomSuffix.toLowerCase()}@dutygrid.test`, employees: '12' },
        mode: 'blank',
        plan: 'trial',
        trialDuration: 14,
        billingStatus: 'trialing',
        timeOffsetDays: 0,
        seedData: { employees: false, shifts: false, incidents: false, clients: false, invoices: false },
        featureFlags: { gps: false, incidents: false, clients: false },
        customShifts: { count: 10, months: 1 }
    });

    // Auto-update presets when "mode" changes
    useEffect(() => {
        if (config.mode === 'blank') {
            setConfig(c => ({
                ...c,
                seedData: { employees: false, shifts: false, incidents: false, clients: false, invoices: false }
            }));
        } else if (config.mode === 'demo') {
            setConfig(c => ({
                ...c,
                seedData: { employees: true, shifts: true, incidents: true, clients: true, invoices: true }
            }));
        } else if (config.mode === 'preset_small') {
            setConfig(c => ({
                ...c,
                company: { ...c.company, employees: '3' },
                plan: 'starter',
                seedData: { employees: true, shifts: true, incidents: false, clients: true, invoices: false }
            }));
        } else if (config.mode === 'preset_growth') {
            setConfig(c => ({
                ...c,
                company: { ...c.company, employees: '15' },
                plan: 'growth',
                seedData: { employees: true, shifts: true, incidents: true, clients: true, invoices: true }
            }));
        } else if (config.mode === 'preset_pro') {
            setConfig(c => ({
                ...c,
                company: { ...c.company, employees: '40' },
                plan: 'professional',
                seedData: { employees: true, shifts: true, incidents: true, clients: true, invoices: true }
            }));
        }
    }, [config.mode]);

    const handleBuild = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/internal/staging-tools/build-environment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                onBuildComplete(data.company);
            } else {
                setError(data.error || 'Failed to build environment');
            }
        } catch (err) {
            setError('Network error preventing build');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Rocket size={20} className="text-blue-400" /> Test Company Builder
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Configure and generate a full environment in one click.</p>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm font-medium border border-red-200">{error}</div>}

                {/* Section 1: Core Company */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b">
                        <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                        Company Setup
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                            <input type="text" value={config.company.name} onChange={e => setConfig({ ...config, company: { ...config.company, name: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email</label>
                            <input type="email" value={config.company.email} onChange={e => setConfig({ ...config, company: { ...config.company, email: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Employees</label>
                            <input type="number" value={config.company.employees} onChange={e => setConfig({ ...config, company: { ...config.company, employees: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Section 2: Environment Type */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b">
                        <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                        Environment Mode
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        {[
                            { id: 'blank', label: 'Blank Tenant', desc: 'No dummy data' },
                            { id: 'demo', label: 'Full Demo', desc: 'Random seed data' },
                            { id: 'preset_small', label: 'Preset: Small', desc: '3 staff, 3 shifts' },
                            { id: 'preset_growth', label: 'Preset: Growth', desc: '15 staff, 20 shifts' },
                            { id: 'preset_pro', label: 'Preset: Pro', desc: '40 staff, 100 shifts' },
                        ].map((m: any) => (
                            <button
                                key={m.id}
                                onClick={() => setConfig({ ...config, mode: m.id })}
                                className={`p-3 border rounded-lg text-left transition-all ${config.mode === m.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                            >
                                <div className={`font-semibold text-sm ${config.mode === m.id ? 'text-blue-900' : 'text-slate-800'}`}>
                                    {config.mode === m.id && <CheckCircle size={14} className="inline mr-1 text-blue-600" />} {m.label}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">{m.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 3: Plan & Billing */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b">
                        <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                        Plan & Billing Simulation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Plan</label>
                            <select value={config.plan} onChange={e => setConfig({ ...config, plan: e.target.value as any })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white">
                                <option value="trial">Trial (Pro Features)</option>
                                <option value="starter">Starter</option>
                                <option value="growth">Growth</option>
                                <option value="professional">Professional</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>

                        {config.plan === 'trial' && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Trial Duration</label>
                                <select value={config.trialDuration} onChange={e => setConfig({ ...config, trialDuration: Number(e.target.value) as any })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white">
                                    <option value={14}>14 Days</option>
                                    <option value={30}>30 Days</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Status</label>
                            <select value={config.billingStatus} onChange={e => setConfig({ ...config, billingStatus: e.target.value as any })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white">
                                <option value="trialing">Trialing</option>
                                <option value="active_monthly">Active (Monthly)</option>
                                <option value="active_yearly">Active (Yearly)</option>
                                <option value="past_due">Payment Failed / Past Due</option>
                                <option value="canceled">Trial Expired / Canceled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Time Simulation</label>
                            <select value={config.timeOffsetDays} onChange={e => setConfig({ ...config, timeOffsetDays: Number(e.target.value) as any })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white">
                                <option value={0}>Today (No offset)</option>
                                <option value={7}>+ 7 Days</option>
                                <option value={14}>+ 14 Days</option>
                                <option value={30}>+ 30 Days (Force Renewal)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 4: Data Seed Toggles */}
                {config.mode !== 'blank' && (
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b">
                            <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                            Seed Data Generation
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {Object.entries(config.seedData).map(([key, val]) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                                    <input type="checkbox" checked={val} onChange={e => setConfig({ ...config, seedData: { ...config.seedData, [key]: e.target.checked } })} className="w-4 h-4 text-blue-600 rounded" />
                                    <span className="text-sm font-medium text-slate-700 capitalize">Generate {key}</span>
                                </label>
                            ))}
                        </div>

                        {config.seedData.shifts && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Aantal Test Diensten (voor jouw Medewerker-Account)</label>
                                    <input
                                        type="number"
                                        value={config.customShifts.count}
                                        onChange={e => setConfig({ ...config, customShifts: { ...config.customShifts, count: parseInt(e.target.value) || 0 } })}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Spreiding & Periode</label>
                                    <select
                                        value={config.customShifts.months}
                                        onChange={e => setConfig({ ...config, customShifts: { ...config.customShifts, months: Number(e.target.value) } })}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
                                    >
                                        <option value={1}>1 Maand (Huidige maand)</option>
                                        <option value={2}>2 Maanden (Huidig + Volgende)</option>
                                        <option value={3}>3 Maanden Vooruit</option>
                                        <option value={6}>6 Maanden Vooruit</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Section 5: Feature Flags Override */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b">
                        <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                        Feature Flags Override
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" checked={config.featureFlags.gps} onChange={e => setConfig({ ...config, featureFlags: { ...config.featureFlags, gps: e.target.checked } })} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                            <div>
                                <div className="text-sm font-medium text-slate-900">Enable GPS Locaties</div>
                                <div className="text-xs text-slate-500">Live Map view aan voor tenant</div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" checked={config.featureFlags.incidents} onChange={e => setConfig({ ...config, featureFlags: { ...config.featureFlags, incidents: e.target.checked } })} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                            <div>
                                <div className="text-sm font-medium text-slate-900">Enable Incidenten</div>
                                <div className="text-xs text-slate-500">Logboek rapportage aan</div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" checked={config.featureFlags.clients} onChange={e => setConfig({ ...config, featureFlags: { ...config.featureFlags, clients: e.target.checked } })} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                            <div>
                                <div className="text-sm font-medium text-slate-900">Enable Client Portal</div>
                                <div className="text-xs text-slate-500">Externe inlog voor opdrachtgevers</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={handleBuild}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Settings size={18} className="animate-spin" /> : <Rocket size={18} />}
                        {loading ? 'Building Environment...' : 'Create Test Environment'}
                    </button>
                </div>
            </div>
        </div>
    );
}
