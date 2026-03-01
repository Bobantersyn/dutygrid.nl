import { useNavigate } from 'react-router';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md w-full">
        <h1 className="text-6xl font-black text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagina niet gevonden</h2>
        <p className="text-gray-500 mb-8">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Terug naar Dashboard
        </button>
      </div>
    </div>
  );
}
