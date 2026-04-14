"use client";

import { useState } from "react";
import { executeSocialPost } from "@/app/admin/actions";

interface SocialPreviewModalProps {
  videoUrl: string;
  caption: string;
  onClose: () => void;
}

export default function SocialPreviewModal({ videoUrl, caption, onClose }: SocialPreviewModalProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePost = async () => {
    setIsPosting(true);
    setError(null);
    try {
      const res = await executeSocialPost(videoUrl, caption);
      if (res.success) {
        setResult(res.result);
      } else {
        setError(res.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        
        {/* Video Preview */}
        <div className="w-full md:w-[400px] aspect-[9/16] bg-black flex items-center justify-center">
            <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="h-full w-full object-contain"
            />
        </div>

        {/* Info & Actions */}
        <div className="flex-1 p-8 flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Previsualización Social</h2>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Caption Generada (Gemini)</label>
                <textarea 
                    className="w-full bg-slate-950 border border-white/5 rounded-xl p-4 text-sm text-slate-300 h-32 focus:outline-none focus:border-emerald-500/50"
                    defaultValue={caption}
                />
            </div>

            <div className="mt-auto space-y-4">
                {!result && !error && (
                    <button 
                        onClick={handlePost}
                        disabled={isPosting}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isPosting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Publicando en Redes...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                Publicar en TikTok e Instagram
                            </>
                        )}
                    </button>
                )}

                {result && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                        <p className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ¡Publicado con éxito!
                        </p>
                        <p className="text-slate-500 text-xs mt-1">ID de post: {result.id || "En cola"}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                        <p className="text-red-400 text-sm font-bold">Error al publicar</p>
                        <p className="text-slate-500 text-xs mt-1">{error}</p>
                    </div>
                )}

                <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest leading-relaxed">
                    Asegúrate de que tus cuentas estén conectadas en tu dashboard de Ayrshare.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
