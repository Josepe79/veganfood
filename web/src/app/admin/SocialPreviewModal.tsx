"use client";

import { useState } from "react";
import { executeSocialPost } from "@/app/admin/actions";

interface SocialPreviewModalProps {
  videoUrl: string;
  captions: {
    igTikTok: string;
    ytShorts: { title: string; desc: string };
    whatsapp: string;
  };
  onClose: () => void;
}

export default function SocialPreviewModal({ videoUrl, captions, onClose }: SocialPreviewModalProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"IG" | "YT" | "WA">("IG");

  const handlePost = async () => {
    setIsPosting(true);
    setError(null);
    try {
      // Ayrshare post (por defecto usa igTikTok caption)
      const res = await executeSocialPost(videoUrl, captions.igTikTok);
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
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        
        {/* Video Preview */}
        <div className="w-full md:w-[380px] bg-black flex items-center justify-center relative group">
            <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="h-full w-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                Preview 9:16
            </div>
        </div>

        {/* Info & Actions */}
        <div className="flex-1 p-8 flex flex-col bg-gradient-to-br from-slate-900 to-slate-950">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Social Media Engine</h2>
                    <p className="text-slate-500 text-sm">Contenido generado por IA listo para publicar.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Platform Tabs */}
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl mb-6 border border-white/5">
                {[
                    { id: "IG", label: "IG/TikTok", icon: "✨" },
                    { id: "YT", label: "YouTube", icon: "📺" },
                    { id: "WA", label: "WhatsApp", icon: "💬" }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === tab.id ? "bg-white/10 text-white shadow-inner" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto mb-8 pr-2">
                {activeTab === "IG" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <label className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Instagram & TikTok Caption</label>
                        <textarea 
                            readOnly
                            className="w-full bg-slate-950 border border-white/5 rounded-2xl p-5 text-sm text-slate-300 h-40 focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                            value={captions.igTikTok}
                        />
                    </div>
                )}

                {activeTab === "YT" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div>
                            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Shorts Title</label>
                            <input 
                                readOnly
                                className="w-full bg-slate-950 border border-white/5 rounded-xl px-5 py-3 text-sm text-white focus:outline-none"
                                value={captions.ytShorts.title}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Shorts Description</label>
                            <textarea 
                                readOnly
                                className="w-full bg-slate-950 border border-white/5 rounded-xl p-5 text-sm text-slate-300 h-32 focus:outline-none"
                                value={captions.ytShorts.desc}
                            />
                        </div>
                    </div>
                )}

                {activeTab === "WA" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <label className="block text-[10px] font-bold text-green-500 uppercase tracking-widest">WhatsApp Business Message</label>
                        <textarea 
                            readOnly
                            className="w-full bg-slate-950 border border-white/5 rounded-2xl p-5 text-sm text-slate-300 h-40 focus:outline-none focus:border-green-500/50 leading-relaxed"
                            value={captions.whatsapp}
                        />
                    </div>
                )}
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-4">
                {!result && !error && (
                    <button 
                        onClick={handlePost}
                        disabled={isPosting}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
                    >
                        {isPosting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Procesando Publicación...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                Lanzar a Instagram & TikTok
                            </>
                        )}
                    </button>
                )}

                {result && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl animate-in zoom-in-95 duration-300">
                        <p className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ¡Publicación en marcha!
                        </p>
                        <p className="text-slate-500 text-[10px] mt-2 font-mono break-all uppercase">Check dashboard de Ayrshare para seguimiento.</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl">
                        <p className="text-red-400 text-sm font-bold">Obstáculo en el camino</p>
                        <p className="text-slate-500 text-[10px] mt-1 break-words">{error}</p>
                    </div>
                )}

                <p className="text-[9px] text-slate-600 text-center uppercase tracking-[0.2em] leading-relaxed">
                    Powered by VeganFood Social Engine & Ayrshare API
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
