import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import CompaniesList from './pages/CompaniesList';
import CompanyDetail from './pages/CompanyDetail';
import StagingTools from './pages/StagingTools';

function AdminLayout() {
    const location = useLocation();

    // Tijdelijk altijd tonen, omdat het achter de Super Admin login zit.
    // Later kunnen we dit beveiligen tot enkel een specifieke 'staging' URL.
    const isStaging = true;

    return (
        <div className="flex h-screen w-full bg-gray-50 text-slate-900">
            <aside className="w-64 bg-[#0f172a] text-white flex flex-col hidden md:flex h-full">
                <nav className="flex-1 p-4 pt-6 space-y-2">
                    <Link to="/companies" className={`flex items-center space-x-2 p-2 rounded transition-colors ${location.pathname.startsWith('/companies') ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800'}`}>
                        <span>Bedrijven</span>
                    </Link>
                    {isStaging && (
                        <Link to="/staging-tools" className={`flex items-center space-x-2 p-2 rounded transition-colors ${location.pathname.startsWith('/staging-tools') ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800'}`}>
                            <span>Test Toolkit</span>
                        </Link>
                    )}
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Systeem Log wordt momenteel nog gebouwd.'); }} className="flex items-center space-x-2 p-2 text-slate-300 hover:bg-slate-800 rounded transition-colors mt-8">
                        <span>Systeem Log</span>
                    </a>
                </nav>
                <div className="p-6 mt-auto">
                    <div className="text-xl font-bold text-white tracking-tight">DutyGrid Admin</div>
                    <div className="text-xs text-slate-500 mt-1">v2.1 Staging</div>
                </div>
            </aside>
            <main className="flex-1 overflow-auto flex flex-col">
                <header className="h-16 bg-white border-b flex shrink-0 items-center px-6 justify-between shadow-sm z-10">
                    <h1 className="text-xl font-semibold">Platform Management</h1>
                    <div className="flex items-center gap-4">
                        {isStaging && <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold border border-amber-300">STAGING</span>}
                        <span className="text-sm font-medium text-gray-600">Super Admin</span>
                        <button onClick={() => {
                            document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            window.location.href = "/superadmin/login";
                        }} className="text-sm text-gray-500 hover:text-red-600 border px-3 py-1.5 rounded transition shadow-sm">Log Uit</button>
                    </div>
                </header>
                <div className="p-8 pb-12 flex-1">
                    <Routes>
                        <Route path="/" element={<Navigate to="/companies" replace />} />
                        <Route path="/companies" element={<CompaniesList />} />
                        <Route path="/companies/:id" element={<CompanyDetail />} />
                        {isStaging && <Route path="/staging-tools" element={<StagingTools />} />}
                    </Routes>
                </div>
            </main>
        </div>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AdminLayout />} />
        </Routes>
    );
}

export default App;
