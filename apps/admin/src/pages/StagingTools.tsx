import { useState } from 'react';
import TestCompanyBuilder from '../components/TestCompanyBuilder';

export default function StagingTools() {
    const [message, setMessage] = useState('');
    const [companyData, setCompanyData] = useState<any>(null);

    // Mail Sink states
    const [interceptedEmails, setInterceptedEmails] = useState<any[]>([]);
    const [emailLoading, setEmailLoading] = useState(false);

    const handleLoginAs = (email: string) => {
        // Direct physical navigation to the core app to guarantee cross-domain Set-Cookie (SSO bridge).
        const baseUrl = process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000'
            : 'https://www.dutygrid.nl';

        window.location.href = `${baseUrl}/api/internal/staging-tools/impersonate?email=${encodeURIComponent(email)}`;
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

                <TestCompanyBuilder onBuildComplete={(data) => {
                    setCompanyData(data);
                    setMessage(`Succes! ${data.name} is gebouwd.`);
                }} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tool 5: Login als gebruiker (Role Jumps) */}
                    {companyData && (
                        <div className="border border-emerald-200 rounded p-5 flex flex-col bg-emerald-50/30 md:col-span-2">
                            <h3 className="font-semibold text-lg mb-1 text-emerald-900">Login als gebruiker (Sessie Impersonatie)</h3>
                            <p className="text-sm text-slate-600 mb-4">Log in op het actieve testbedrijf (<span className="font-bold">{companyData.name}</span>) zonder wachtwoorden in te voeren.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button onClick={() => handleLoginAs(companyData.adminEmail)} className="flex flex-col items-center justify-center bg-white hover:bg-emerald-50 text-slate-800 px-3 py-3 rounded border border-emerald-200 shadow-sm transition-all group">
                                    <span className="font-bold mt-1">Admin</span>
                                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 transition-colors">{companyData.adminEmail}</span>
                                </button>
                                <button onClick={() => handleLoginAs(companyData.plannerEmail)} className="flex flex-col items-center justify-center bg-white hover:bg-emerald-50 text-slate-800 px-3 py-3 rounded border border-emerald-200 shadow-sm transition-all group">
                                    <span className="font-bold mt-1">Planner</span>
                                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 transition-colors">{companyData.plannerEmail}</span>
                                </button>
                                <button onClick={() => handleLoginAs(companyData.guardEmail)} className="flex flex-col items-center justify-center bg-white hover:bg-emerald-50 text-slate-800 px-3 py-3 rounded border border-emerald-200 shadow-sm transition-all group">
                                    <span className="font-bold mt-1">Medewerker</span>
                                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 transition-colors">{companyData.guardEmail}</span>
                                </button>
                            </div>

                            <div className="mt-4 flex justify-between items-center pt-4 border-t border-emerald-100">
                                <p className="text-xs text-slate-500">Klant wilt inloggen met wachtwoord? Wachtwoord voor alle 3 is: <span className="font-mono bg-white px-1 py-0.5 rounded border">{companyData.password}</span></p>

                                {/* Danger Zone: Reset testdata */}
                                <div className="flex items-center gap-3">
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
                                        Wis testdata (Behoud account)
                                    </button>

                                    <span className="text-slate-200">|</span>

                                    <button
                                        onClick={async () => {
                                            if (!window.confirm("CRITISCHE ACTIE! Weet je zeker dat je dit HELE COMMANDO BEDRIJF (inclusief login accounts) wilt verwijderen?")) return;
                                            try {
                                                const r = await fetch('/api/internal/staging-tools/delete-company', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: companyData.adminEmail }) });
                                                if (r.ok) { const d = await r.json(); alert(d.message); setCompanyData(null); }
                                            } catch (e) { }
                                        }}
                                        className="text-xs text-red-600 hover:text-red-800 underline font-bold"
                                    >
                                        Delete Test Company
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tool 4: Time Travel & Billing */}
                    <div className="border border-slate-200 rounded p-5 flex flex-col mt-2">
                        <h3 className="font-semibold text-lg mb-1">Time Travel & Billing</h3>
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
                                        +7 Dagen
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
                                        +14 Dagen
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
                                        +30 Dagen
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
                                        Expire Trial Nu
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
                                        Activate Monthly
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
                                        Activate Yearly
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
                                        Payment Failed
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Tool 5: Stress Testing & Webhooks */}
                    <div className="border border-slate-200 rounded p-5 flex flex-col mt-2">
                        <h3 className="font-semibold text-lg mb-1">Stress Tests & Webhooks</h3>
                        <p className="text-sm text-slate-500 mb-4">Injecteer extreme belasting en simuleer lifecycle events via de fysieke Stripe endpoint.</p>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <div className="border border-slate-200 rounded p-4">
                                <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Extreme Volume Generation</h4>
                                <button
                                    onClick={async () => {
                                        if (!companyData) return alert('Selecteer of creëer eerst een testbedrijf');
                                        const conf = window.confirm("Dit injecteert 250+ diensten, 65 werknemers en 35 incidenten om de React boom extreem te belasten. Doorgaan?");
                                        if (!conf) return;
                                        try {
                                            const r = await fetch('/api/internal/staging-tools/generate-demo-data', {
                                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ preset: 'stress_test', email: companyData.adminEmail })
                                            });
                                            const res = await r.json(); alert(r.ok ? res.message : (res.error || 'Mislukt'));
                                        } catch (e) { alert('Netwerk fout'); }
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded flex items-center justify-center gap-2 border border-purple-200 font-medium"
                                >
                                    Injecteer Stress Test (250+ Diensten)
                                </button>
                            </div>

                            <div className="border border-slate-200 rounded p-4 flex flex-col gap-2">
                                <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Stripe Webhook Mocks</h4>
                                <button
                                    onClick={async () => {
                                        if (!companyData) return alert('Maak eerst een testbedrijf aan');
                                        try {
                                            const r = await fetch('/api/webhooks/stripe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'invoice.payment_succeeded', data: { object: { customer_email: companyData.adminEmail, amount_paid: 30000, status: 'paid' } } }) });
                                            alert(r.ok ? 'Webhook [Succeeded] 200 OK' : `Webhook faalde met status HTTP ${r.status}`);
                                        } catch (e) { alert('Netwerk fout bij Webhook'); }
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-100 rounded flex items-center gap-2 border border-emerald-200"
                                >Webhook: Payment Succeeded</button>
                                <button
                                    onClick={async () => {
                                        if (!companyData) return alert('Maak eerst een testbedrijf aan');
                                        try {
                                            const r = await fetch('/api/webhooks/stripe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'invoice.payment_failed', data: { object: { customer_email: companyData.adminEmail, amount_due: 30000, status: 'open' } } }) });
                                            alert(r.ok ? 'Webhook [Failed] 200 OK' : `Webhook faalde met status HTTP ${r.status}`);
                                        } catch (e) { alert('Netwerk fout bij Webhook'); }
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-orange-700 hover:bg-orange-100 rounded flex items-center gap-2 border border-orange-200"
                                >Webhook: Payment Failed</button>
                                <button
                                    onClick={async () => {
                                        if (!companyData) return alert('Maak eerst een testbedrijf aan');
                                        try {
                                            const r = await fetch('/api/webhooks/stripe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'customer.subscription.deleted', data: { object: { customer_email: companyData.adminEmail, status: 'canceled' } } }) });
                                            alert(r.ok ? 'Webhook [Canceled] 200 OK' : `Webhook faalde met status HTTP ${r.status}`);
                                        } catch (e) { alert('Netwerk fout bij Webhook'); }
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-100 rounded flex items-center gap-2 border border-red-200"
                                >Webhook: Sub Canceled</button>
                            </div>
                        </div>
                    </div>
                    {/* Mail Sink */}
                    <div className="border border-slate-200 rounded p-5 flex flex-col md:col-span-2 mt-2">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-semibold text-lg">Mail Sink Inbox</h3>
                            <button onClick={async () => {
                                setEmailLoading(true);
                                try {
                                    const res = await fetch('/api/internal/staging-tools/mail-sink');
                                    if (res.ok) { const data = await res.json(); setInterceptedEmails(data.emails); }
                                } catch (e) { }
                                setEmailLoading(false);
                            }} className="bg-slate-100 px-3 py-1 rounded text-sm hover:bg-slate-200 font-medium border border-slate-200 shadow-sm">
                                Hernieuwen
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

                    {/* Nuke Everything Button */}
                    <div className="mt-12 text-center relative z-10 border-t border-red-100 pt-8 pb-12">
                        <button
                            onClick={async () => {
                                const confirm1 = window.confirm("WAARSCHUWING! Je staat op het punt om ALLE gegenereerde testbedrijven en mock-datarecords permanent te verwijderen uit de database. Doorgaan?");
                                if (!confirm1) return;
                                const confirm2 = window.prompt("Type 'NUKE' om deze destructieve actie te bevestigen.");
                                if (confirm2 !== 'NUKE') { alert('Actie geannuleerd.'); return; }

                                try {
                                    const r = await fetch('/api/internal/staging-tools/nuke-companies', { method: 'POST' });
                                    if (r.ok) {
                                        const d = await r.json();
                                        alert(d.message + "\\n\\nDe applicatie wordt nu herladen om de cache te wissen.");
                                        window.location.reload();
                                    }
                                    else { alert('Fout bij uitvoeren nucleaire actie'); }
                                } catch (e) { alert('Netwerk fout'); }
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm font-bold shadow-sm uppercase tracking-wide"
                        >
                            Nuke ALL Test Companies
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
