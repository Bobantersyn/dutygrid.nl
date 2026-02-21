"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Settings, Users, Palette, Save, Plus, Trash2,
    Shield, Key, User, Tag, ArrowLeft, Activity
} from "lucide-react";
import { ObjectLabelSettings } from "@/components/Admin/ObjectLabelSettings";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <a
                        href="/"
                        className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-flex items-center gap-1"
                    >
                        <ArrowLeft size={16} />
                        Terug naar Dashboard
                    </a>
                    <h1 className="text-3xl font-bold text-gray-900">Systeeminstellingen</h1>
                    <p className="text-gray-600 mt-1">Beheer globale configuratie en gebruikers</p>

                    <div className="flex gap-6 mt-6">
                        <TabButton
                            active={activeTab === "general"}
                            onClick={() => setActiveTab("general")}
                            icon={<Settings size={18} />}
                            label="Algemeen"
                        />
                        <TabButton
                            active={activeTab === "users"}
                            onClick={() => setActiveTab("users")}
                            icon={<Users size={18} />}
                            label="Gebruikers"
                        />
                        <TabButton
                            active={activeTab === "theme"}
                            onClick={() => setActiveTab("theme")}
                            icon={<Palette size={18} />}
                            label="Thema"
                        />
                        <TabButton
                            active={activeTab === "labels"}
                            onClick={() => setActiveTab("labels")}
                            icon={<Tag size={18} />}
                            label="Object Labels"
                        />
                        <TabButton
                            active={activeTab === "logs"}
                            onClick={() => setActiveTab("logs")}
                            icon={<Activity size={18} />}
                            label="Logboek"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === "general" && <GeneralSettings />}
                {activeTab === "users" && <UserManagement />}
                {activeTab === "theme" && <ThemeSettings />}
                {activeTab === "labels" && <ObjectLabelSettings />}
                {activeTab === "logs" && <AuditLogView />}
            </div>
        </div>
    );
}

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${active
                ? "border-blue-600 text-blue-600 font-medium"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function GeneralSettings() {
    const queryClient = useQueryClient();
    const [msg, setMsg] = useState<string | null>(null);

    const { data: settings, isLoading } = useQuery({
        queryKey: ["system-settings"],
        queryFn: async () => {
            const res = await fetch("/api/system-settings");
            if (!res.ok) throw new Error("Failed to fetch settings");
            return res.json();
        }
    });

    const mutation = useMutation({
        mutationFn: async ({ key, value }: { key: string; value: string }) => {
            const res = await fetch("/api/system-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, value })
            });
            if (!res.ok) throw new Error("Failed to save");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["system-settings"] });
            setMsg("Instellingen opgeslagen!");
            setTimeout(() => setMsg(null), 3000);
        }
    });

    if (isLoading) return <div>Laden...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Globale Instellingen</h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Standaard Reiskostenvergoeding (€/km)</label>
                    <div className="flex gap-2">
                        <input
                            type="number" step="0.01"
                            defaultValue={settings?.travel_cost_per_km || 0.23}
                            onBlur={(e) => mutation.mutate({ key: 'travel_cost_per_km', value: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="flex items-center text-gray-500">per km</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Dit geldt voor alle medewerkers tenzij anders aangegeven in hun profiel.</p>
                </div>

                {/* Placeholder for Logo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Strijdlogo (URL of Upload)</label>
                    <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-center text-gray-500">
                        Logo upload functionaliteit volgt in Phase 3.5
                    </div>
                </div>

                {msg && <div className="text-green-600 font-medium">{msg}</div>}
            </div>
        </div>
    );
}

function UserManagement() {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "beveiliger" });
    const [error, setError] = useState(null);

    const { data: users, isLoading } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            setIsAdding(false);
            setFormData({ name: "", email: "", password: "", role: "beveiliger" });
            setError(null);
        },
        onError: (err: any) => setError(err.message)
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    if (isLoading) return <div>Laden...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Gebruikersbeheer</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Nieuwe Gebruiker
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4">Nieuw Account Aanmaken</h3>
                    {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium mb-1">Naam</label>
                            <input
                                type="text" required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">E-mail</label>
                            <input
                                type="email" required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Wachtwoord</label>
                            <input
                                type="password" required minLength={6}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Rol</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="beveiliger">Beveiliger</option>
                                <option value="beveiliger_extended">Beveiliger (+ eigen rooster)</option>
                                <option value="planner">Planner</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button disabled={createMutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                {createMutation.isPending ? "Aanmaken..." : "Opslaan"}
                            </button>
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                Annuleren
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Naam</th>
                            <th className="px-6 py-4 font-semibold">Email</th>
                            <th className="px-6 py-4 font-semibold">Rol</th>
                            <th className="px-6 py-4 font-semibold">Aangemaakt op</th>
                            <th className="px-6 py-4 font-semibold">Acties</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {(users || []).map((user: any) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        {user.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 border-b border-gray-100">{user.email}</td>
                                <td className="px-6 py-4 border-b border-gray-100">
                                    <BadgeRole role={user.user_role} />
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm border-b border-gray-100">
                                    {new Date(user.created_at).toLocaleDateString('nl-NL')}
                                </td>
                                <td className="px-6 py-4 border-b border-gray-100">
                                    <button className="text-red-500 hover:bg-red-50 p-2 rounded" title="Verwijderen (Demo: Disabled)">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function RoleIcon({ role }: { role: string }) {
    if (role === 'admin') return <Shield size={14} className="mr-1" />;
    if (role === 'planner') return <Key size={14} className="mr-1" />;
    return <User size={14} className="mr-1" />;
}

function BadgeRole({ role }: { role: string }) {
    let color = "bg-gray-100 text-gray-700";
    if (role === 'admin') color = "bg-purple-100 text-purple-700";
    if (role === 'planner') color = "bg-blue-100 text-blue-700";
    if (role?.includes('beveiliger')) color = "bg-green-100 text-green-700";

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            <RoleIcon role={role} />
            {role || 'user'}
        </span>
    );
}

function ThemeSettings() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Thema & Weergave</h2>

            <div className="grid grid-cols-2 gap-4">
                <label className="cursor-pointer">
                    <input type="radio" name="theme" className="peer sr-only" defaultChecked />
                    <div className="p-4 border-2 border-blue-600 bg-white rounded-lg peer-checked:ring-2 ring-blue-200">
                        <div className="h-20 bg-gray-50 mb-2 rounded border border-gray-200"></div>
                        <div className="font-medium text-center">Light Mode</div>
                    </div>
                </label>

                <label className="cursor-pointer opacity-50 cursor-not-allowed" title="Coming soon">
                    <input type="radio" name="theme" className="peer sr-only" disabled />
                    <div className="p-4 border-2 border-gray-200 bg-gray-900 text-white rounded-lg">
                        <div className="h-20 bg-gray-800 mb-2 rounded border border-gray-700"></div>
                        <div className="font-medium text-center">Dark Mode</div>
                    </div>
                </label>
            </div>
        </div>
    );
}

function AuditLogView() {
    const { data, isLoading } = useQuery({
        queryKey: ["audit-logs"],
        queryFn: async () => {
            const res = await fetch("/api/audit?limit=50");
            if (!res.ok) throw new Error("Failed to fetch logs");
            return res.json();
        }
    });

    if (isLoading) return <div>Laden...</div>;

    const logs = data?.logs || [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Systeem Logboek</h2>
                <p className="text-sm text-gray-500 mt-1">Recente acties en wijzigingen (Laatste 50)</p>
            </div>
            {logs.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Geen logs gevonden.</div>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Tijd</th>
                            <th className="px-6 py-3 font-semibold">Actie</th>
                            <th className="px-6 py-3 font-semibold">Entiteit</th>
                            <th className="px-6 py-3 font-semibold">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {logs.map((log: any) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                                    {new Date(log.created_at).toLocaleString('nl-NL', {
                                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                    })}
                                </td>
                                <td className="px-6 py-3">
                                    <span className="font-medium text-gray-900">{log.action}</span>
                                </td>
                                <td className="px-6 py-3 text-gray-600">
                                    {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                                </td>
                                <td className="px-6 py-3 text-gray-500 max-w-md truncate">
                                    {log.details ? JSON.stringify(log.details) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
