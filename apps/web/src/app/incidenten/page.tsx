"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertTriangle, Camera, ArrowLeft, Send, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { LoadingState } from "@/components/Dashboard/LoadingState";

type IncidentForm = {
    description: string;
};

export default function IncidentReportingPage() {
    const { userLoading } = useUserRole();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<IncidentForm>();
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: IncidentForm) => {
        try {
            setErrorMsg("");
            const payload = {
                description: data.description,
                // In a true implementation, we would upload the photo to Vercel Blob or AWS S3 here
                // and pass the resulting URL to our database.
                photo_url: previewUrl ? "blob-storage-placeholder-url.jpg" : null
            };

            const res = await fetch("/api/incidents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Fout bij het opslaan van het incident");
            }

            setSuccess(true);
            reset();
            setPreviewUrl(null);
        } catch (err: any) {
            setErrorMsg(err.message);
        }
    };

    if (userLoading) return <LoadingState />;

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-sm w-full border border-slate-100">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Melding Verzonden</h2>
                    <p className="text-slate-500 mb-8">
                        Het incident is succesvol vastgelegd en direct zichtbaar voor de beheerder.
                    </p>
                    <a
                        href="/"
                        className="block w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                    >
                        Terug naar Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Header */}
            <div className="bg-red-600 text-white pt-12 pb-6 px-4 rounded-b-3xl shadow-sm relative">
                <div className="flex items-center gap-3">
                    <a href="/" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <ArrowLeft size={20} />
                    </a>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <AlertTriangle size={24} />
                        Incident Melden
                    </h1>
                </div>
                <p className="mt-3 text-red-100 text-sm max-w-sm ml-12">
                    Leg onregelmatigheden of incidenten direct vast. Geef een duidelijke omschrijving en voeg bewijsmateriaal toe.
                </p>
            </div>

            <main className="max-w-md mx-auto px-4 py-6 -mt-4 relative z-10">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {errorMsg && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm flex items-start gap-3">
                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                            <p>{errorMsg}</p>
                        </div>
                    )}

                    {/* Photo Upload Section */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                        <label className="block text-sm font-semibold text-slate-700 mb-3 ml-1 flex items-center gap-2">
                            <Camera size={16} className="text-slate-400" />
                            Foto toevoegen (optioneel)
                        </label>

                        {previewUrl ? (
                            <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video mb-2 group">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setPreviewUrl(null)}
                                    className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 mb-3 group-hover:scale-110 transition-transform">
                                        <ImageIcon size={24} />
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium">Tik om camera te openen</p>
                                    <p className="text-xs text-slate-400 mt-1">Direct bewijs vastleggen</p>
                                </div>
                                {/* The capture="environment" hint requests the back camera on mobile devices */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                            </label>
                        )}
                    </div>

                    {/* Description Section */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
                        <label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">
                            Wat is er gebeurd? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register("description", { required: "Vul een omschrijving in van het incident." })}
                            placeholder="Beschrijf duidelijk de locatie, betrokken personen en de gebeurtenissen..."
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl resize-none h-48 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900"
                        ></textarea>
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-3 ml-1">{errors.description.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send size={20} />
                                Melding Versturen
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
}
