import { useState } from 'react';

export default function StagingTools() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [companyData, setCompanyData] = useState<any>(null);
    const [generateMessage, setGenerateMessage] = useState('');

    // Signup Simulation States
    const [signupCompany, setSignupCompany] = useState('Test Security BV');
    const [signupEmail, setSignupEmail] = useState('test+1@dutygrid.test');
    const [signupEmployees, setSignupEmployees] = useState('5');
    const [signupPlan, setSignupPlan] = useState('professional');
    const [signupLoading, setSignupLoading] = useState(false);

    // Mail Sink states
    const [interceptedEmails, setInterceptedEmails] = useState<any[]>([]);
    const [emailLoading, setEmailLoading] = useState(false);

    const handleLoginAs = async (email: string) => {
        try {
            const res = await fetch('/api/internal/staging-tools/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                // Redirect completely to the main app side
                window.location.href = '/planning';
            } else {
                alert('Inloggen mislukt.');
            }
        } catch (error) {
            alert('Netwerkfout bij inloggen.');
        }
    };

    const handleSimulateSignup = async () => {
        setSignupLoading(true);
        setMessage('Signup funnel starten... Even geduld.');
        try {
            // Note for backend dev: We will build this endpoint next
            const res = await fetch('/api/internal/staging-tools/simulate-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyName: signupCompany, email: signupEmail, employees: signupEmployees, plan: signupPlan })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setMessage(data.message);
                setCompanyData(data.company); // Reuse companyData so the Role Jumps block activates
            } else {
                setMessage(`Fout: ${data.error || 'Onbekende fout'}`);
            }
        } catch (error) {
            setMessage('Netwerkfout bij signup simulatie.');
        } finally {
            setSignupLoading(false);
        }
    };

    const handleCreateCompany = async () => {
        setLoading(true);
        setMessage('Bedrijf aanmaken... Even geduld.');
        setCompanyData(null);
        try {
            const res = await fetch('/api/internal/staging-tools/create-company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setMessage(data.message);
                setCompanyData(data.company);
            } else {
                setMessage(`Fout: ${data.error || 'Onbekende fout'}`);
            }
        } catch (error) {
            setMessage('Netwerkfout bij het aanmaken van testbedrijf.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateData = async (preset: string) => {
        setGenerateMessage(`Genereren van '${preset}' data...`);
        try {
            const res = await fetch('/api/internal/staging-tools/generate-demo-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preset })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setGenerateMessage(data.message);
            } else {
                setGenerateMessage(`Fout: ${data.error}`);
            }
        } catch (error) {
            setGenerateMessage('Netwerkfout bij genereren.');
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-xl font-semibold mb-1">Test Toolkit <span className="text-xs bg-amber-100 text-amber-800 px-2 rounded-full align-middle ml-2">V2.0</span></h2>
                        <p className="text-sm text-slate-500">Exclusief voor veilige staging operaties zonder impact op échte data.</p>
                    </div>

                    {/* Status Bar (Guardrails) */}
                    <div className="flex gap-3 text-xs font-mono font-medium bg-slate-50 border border-slate-200 p-3 rounded text-slate-700 shadow-sm">
                        <div className="flex flex-col gap-1">
                            <span>ENV <span className="text-emerald-600">✅ STAGING</span></span>
                            <span>Mail <span className="text-emerald-600">✅ SINK</span></span>
                        </div>
                        <div className="w-px bg-slate-200 mx-1"></div>
                        <div className="flex flex-col gap-1">
                            <span>Stripe <span className="text-emerald-600">✅ STRIPE TEST</span></span>
                            <span>Tenant <span className={companyData ? "text-emerald-600" : "text-amber-600"}>{companyData ? `✅ TEST DATA (${companyData.name})` : "⚠️ Geen geselecteerd"}</span></span>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tool 1: Simuleer Nieuwe Registratie (BELANGRIJKSTE) */}
                    <div className="border border-blue-200 rounded-lg p-5 flex flex-col bg-blue-50/30 md:col-span-2 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">CORE FUNNEL</div>
                        <h3 className="font-semibold text-xl mb-1 text-blue-900">1️⃣ Simuleer Nieuwe Registratie</h3>
                        <p className="text-sm text-slate-600 mb-5">Maakt een volledig nieuw bedrijf alsof een klant zich net heeft geregistreerd. Verstuurt e-mails en triggert onboarding.</p>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrijfsnaam</label>
                                    <input
                                        type="text"
                                        value={signupCompany}
                                        onChange={e => setSignupCompany(e.target.value)}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                                    />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail (gebruik trap tricks)</label>
                                    <input
                                        type="email"
                                        value={signupEmail}
                                        onChange={e => setSignupEmail(e.target.value)}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Aantal Medewerkers</label>
                                    <input
                                        type="number"
                                        value={signupEmployees}
                                        onChange={e => setSignupEmployees(e.target.value)}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                                    />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gewenst Plan (Optioneel)</label>
                                    <select
                                        value={signupPlan}
                                        onChange={e => setSignupPlan(e.target.value)}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="starter">Starter</option>
                                        <option value="growth">Growth</option>
                                        <option value="professional">Professional (Trial Default)</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleSimulateSignup}
                                    disabled={signupLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium shadow-sm transition-colors disabled:opacity-50 h-[38px] whitespace-nowrap"
                                >
                                    {signupLoading ? 'Bezig...' : 'Start Signup Flow'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tool 2: Quick Test Company */}
                    <div className="border border-slate-200 rounded p-5 flex flex-col bg-slate-50">
                        <h3 className="font-semibold text-lg mb-1">2️⃣ Snelle Testomgeving</h3>
                        <p className="text-sm text-slate-500 mb-4 flex-1">Maakt direct een testbedrijf met demo accounts. Dit gebruik je als je snel features of de frontend wil testen zonder de hele funnel te doorlopen.</p>
                        <button
                            onClick={handleCreateCompany}
                            disabled={loading}
                            className="bg-[#0f172a] hover:bg-slate-800 text-white px-4 py-3 rounded font-medium shadow-sm transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Bezig met db scripts...' : 'Genereer testbedrijf'}
                        </button>
                    </div>

                    {/* Tool 3: Demo Data Presets */}
                    <div className="border border-slate-200 rounded p-5 flex flex-col bg-slate-50">
                        <h3 className="font-semibold text-lg mb-1">3️⃣ Demo Data Prestes</h3>
                        <p className="text-sm text-slate-500 mb-4 flex-1">Medewerkers, diensten, rapporten en incidenten worden toegevoegd. Dit is geen plan selectie, alleen testdata.</p>
                        <div className="flex gap-2">
                            <button onClick={() => handleGenerateData('small')} className="flex-1 bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 px-3 py-2 rounded text-sm font-medium shadow-sm transition-colors">Small</button>
                            <button onClick={() => handleGenerateData('growth')} className="flex-1 bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 px-3 py-2 rounded text-sm font-medium shadow-sm transition-colors">Growth</button>
                            <button onClick={() => handleGenerateData('pro')} className="flex-1 bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 px-3 py-2 rounded text-sm font-medium shadow-sm transition-colors">Pro</button>
                        </div>
                        {generateMessage && (
                            <p className="text-xs mt-3 text-emerald-600 font-medium">{generateMessage}</p>
                        )}
                    </div>

                    {/* Tool 5: Login als gebruiker (Role Jumps) */}
                    {companyData && (
                        <div className="border border-emerald-200 rounded p-5 flex flex-col bg-emerald-50/30 md:col-span-2">
                            <h3 className="font-semibold text-lg mb-1 text-emerald-900">🛡️ Login als gebruiker (Sessie Impersonatie)</h3>
                            <p className="text-sm text-slate-600 mb-4">Log in op het actieve testbedrijf (<span className="font-bold">{companyData.name}</span>) zonder wachtwoorden in te voeren.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button onClick={() => handleLoginAs(companyData.adminEmail)} className="flex flex-col items-center justify-center bg-white hover:bg-emerald-50 text-slate-800 px-3 py-3 rounded border border-emerald-200 shadow-sm transition-all group">
                                    <span className="text-lg mb-1">👑</span>
                                    <span className="font-bold">Admin</span>
                                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 transition-colors">{companyData.adminEmail}</span>
                                </button>
                                <button onClick={() => handleLoginAs(companyData.plannerEmail)} className="flex flex-col items-center justify-center bg-white hover:bg-emerald-50 text-slate-800 px-3 py-3 rounded border border-emerald-200 shadow-sm transition-all group">
                                    <span className="text-lg mb-1">🗂</span>
                                    <span className="font-bold">Planner</span>
                                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 transition-colors">{companyData.plannerEmail}</span>
                                </button>
                                <button onClick={() => handleLoginAs(companyData.guardEmail)} className="flex flex-col items-center justify-center bg-white hover:bg-emerald-50 text-slate-800 px-3 py-3 rounded border border-emerald-200 shadow-sm transition-all group">
                                    <span className="text-lg mb-1">🧑‍💼</span>
                                    <span className="font-bold">Medewerker</span>
                                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 transition-colors">{companyData.guardEmail}</span>
                                </button>
                            </div>

                            <div className="mt-4 flex justify-between items-center pt-4 border-t border-emerald-100">
                                <p className="text-xs text-slate-500">Klant wilt inloggen met wachtwoord? Wachtwoord voor alle 3 is: <span className="font-mono bg-white px-1 py-0.5 rounded border">{companyData.password}</span></p>

                                {/* Danger Zone: Reset testdata */}
                                <button
                                    onClick={async () => {
                                        if (!window.confirm("Weet je zeker dat je de test data voor dit bedrijf wilt wissen? Dit kan niet ongedaan worden gemaakt.")) return;
                                        try {
                                            const r = await fetch('/api/internal/staging-tools/reset-company', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: companyData.adminEmail }) });
                                            if (r.ok) { const d = await r.json(); alert(d.message); }
                                        } catch (e) { }
                                    }}
                                    className="text-xs text-red-500 hover:text-red-700 underline font-medium"
                                >
                                    Wis testdata voor account
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tool 4: Time Travel & Billing */}
                    <div className="border border-slate-200 rounded p-5 flex flex-col mt-2">
                        <h3 className="font-semibold text-lg mb-1">⏰ Time Travel & Billing</h3>
                        <p className="text-sm text-slate-500 mb-4">Simuleer abonnementen die verlopen of spoel de tijd door in de actieve testomgeving.</p>

                        <div className="flex flex-col gap-4">
                            <div>
                                <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Time Travel</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={async () => {
                                            if (!companyData) return alert('Selecteer of creëer eerst een testbedrijf');
                                            try {
                                                const r = await fetch('/api/internal/staging-tools/simulate-billing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'time_travel', days: 7, email: companyData.adminEmail }) });
                                                if (r.ok) { const d = await r.json(); alert(d.message); }
                                            } catch (e) { }
                                        }}
                                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                    >
                                        ⏳ +7 Dagen
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!companyData) return alert('Selecteer of creëer eerst een testbedrijf');
                                            try {
                                                const r = await fetch('/api/internal/staging-tools/simulate-billing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'time_travel', days: 14, email: companyData.adminEmail }) });
                                                if (r.ok) { const d = await r.json(); alert(d.message); }
                                            } catch (e) { }
                                        }}
                                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                    >
                                        ⏳ +14 Dagen
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!companyData) return alert('Selecteer of creëer eerst een testbedrijf');
                                            try {
                                                const r = await fetch('/api/internal/staging-tools/simulate-billing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'time_travel', days: 30, email: companyData.adminEmail }) });
                                                if (r.ok) { const d = await r.json(); alert(d.message); }
                                            } catch (e) { }
                                        }}
                                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                    >
                                        ⏳ +30 Dagen
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Billing Events (Stripe Simulator)</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={async () => {
                                            if (!companyData) { alert('Maak eerst een testbedrijf aan of simuleer een registratie.'); return; }
                                            try {
                                                const r = await fetch('/api/internal/staging-tools/simulate-billing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'expire_trial', email: companyData.adminEmail }) });
                                                if (r.ok) { const d = await r.json(); alert(d.message); }
                                            } catch (e) { }
                                        }}
                                        className="bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded text-sm font-medium"
                                    >
                                        ▶️ Expire Trial Nu
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (!companyData) { alert('Maak eerst een testbedrijf aan of simuleer een registratie.'); return; }
                                            try {
                                                const r = await fetch('/api/internal/staging-tools/simulate-billing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'simulate_active_monthly', email: companyData.adminEmail }) });
                                                if (r.ok) { const d = await r.json(); alert(d.message); }
                                            } catch (e) { }
                                        }}
                                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded text-sm font-medium"
                                    >
                                        💳 Activate Monthly
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (!companyData) { alert('Maak eerst een testbedrijf aan of simuleer een registratie.'); return; }
                                            try {
                                                const r = await fetch('/api/internal/staging-tools/simulate-billing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'simulate_active_yearly', email: companyData.adminEmail }) });
                                                if (r.ok) { const d = await r.json(); alert(d.message); }
                                            } catch (e) { }
                                        }}
                                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded text-sm font-medium"
                                    >
                                        💳 Activate Yearly
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (!companyData) { alert('Maak eerst een testbedrijf aan of simuleer een registratie.'); return; }
                                            if (!window.confirm("Weet je zeker dat je 'Betaling Mislukt' wil simuleren?")) return;
                                            try {
                                                const r = await fetch('/api/internal/staging-tools/simulate-billing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'simulate_past_due', email: companyData.adminEmail }) });
                                                if (r.ok) { const d = await r.json(); alert(d.message); }
                                            } catch (e) { }
                                        }}
                                        className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded text-sm font-medium"
                                    >
                                        ❌ Payment Failed
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Flags */}
                    <div className="border border-slate-200 rounded p-5 flex flex-col mt-2">
                        <h3 className="font-semibold text-lg mb-1">🚩 Feature Flags</h3>
                        <p className="text-sm text-slate-500 mb-4">Schakel test-functies in of uit voor het huidige actieve testbedrijf.</p>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked />
                                <div>
                                    <div className="text-sm font-medium text-slate-900">Enable GPS Locaties</div>
                                    <div className="text-xs text-slate-500">Toon de Live Map view in de interface</div>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked />
                                <div>
                                    <div className="text-sm font-medium text-slate-900">Enable Incident Module</div>
                                    <div className="text-xs text-slate-500">Sta rapportage van live incidenten toe</div>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <div>
                                    <div className="text-sm font-medium text-slate-900">Enable Client Portal <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded ml-1 text-slate-500">Beta</span></div>
                                    <div className="text-xs text-slate-500">Geef opdrachtgevers inzicht in rapportages</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Mail Sink */}
                    <div className="border border-slate-200 rounded p-5 flex flex-col md:col-span-2 mt-2">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-semibold text-lg">📬 Mail Sink Inbox</h3>
                            <button onClick={async () => {
                                setEmailLoading(true);
                                try {
                                    const res = await fetch('/api/internal/staging-tools/mail-sink');
                                    if (res.ok) { const data = await res.json(); setInterceptedEmails(data.emails); }
                                } catch (e) { }
                                setEmailLoading(false);
                            }} className="bg-slate-100 px-3 py-1 rounded text-sm hover:bg-slate-200 font-medium border border-slate-200 shadow-sm">
                                🔄 Hernieuwen
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Lees onderschepte uitgaande e-mails (wachtwoord-resets, facturen, trial waarschuwingen) die naar test-accounts zijn verstuurd.</p>

                        <div className="bg-slate-50 border border-slate-300 rounded overflow-hidden">
                            {emailLoading ? (
                                <div className="p-6 text-center text-slate-500">Laden...</div>
                            ) : interceptedEmails.length === 0 ? (
                                <div className="p-6 text-center text-slate-500">Geen e-mails afgevangen in de staging omgeving.</div>
                            ) : (
                                <ul className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
                                    {interceptedEmails.map((email: any) => (
                                        <li key={email.id} className="p-4 bg-white hover:bg-slate-50">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-sm text-slate-900">{email.subject || 'Geen onderwerp'}</span>
                                                <span className="text-[11px] font-mono whitespace-nowrap text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{new Date(email.sent_at).toLocaleString()}</span>
                                            </div>
                                            <div className="text-xs text-slate-600 mb-3 font-medium">Aan: <span className="text-blue-600">{email.to_email}</span></div>
                                            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-100 whitespace-pre-wrap font-mono leading-relaxed">
                                                {email.body}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
