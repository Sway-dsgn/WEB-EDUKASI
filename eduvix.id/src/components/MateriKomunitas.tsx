import React, { useState } from "react";
import {
  Users,
  Heart,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  PenTool,
  PlusCircle,
  Hash,
  Send,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CommunityMaterial, UserStats } from "../types";

interface MateriKomunitasProps {
  stats: UserStats;
  materials: CommunityMaterial[];
  onAddMaterial: (mat: CommunityMaterial) => void;
  onLikeMaterial: (id: string) => void;
}

export default function MateriKomunitas({
  stats,
  materials,
  onAddMaterial,
  onLikeMaterial
}: MateriKomunitasProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<CommunityMaterial | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form input states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Logika Terapan");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim() || !summary.trim() || !content.trim()) {
      setFormError("Seluruh kolom wajib diisi.");
      return;
    }

    const newMat: CommunityMaterial = {
      id: `comm-user-${Date.now()}`,
      title: title.trim(),
      author: stats.username.replace(/_/g, " "),
      summary: summary.trim(),
      content: content.trim(),
      likes: 1,
      category: category,
      createdAt: new Date().toISOString().split("T")[0],
      hasLiked: true
    };

    onAddMaterial(newMat);
    
    // Clear inputs and close
    setTitle("");
    setSummary("");
    setContent("");
    setShowForm(false);
  };

  return (
    <div className="pb-12 space-y-6">
      <AnimatePresence mode="wait">
        {selectedMaterial ? (
          // Reading Full community Article
          <motion.div
            key="reader"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <button
              onClick={() => setSelectedMaterial(null)}
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft size={16} /> Kembali ke Artikel Komunitas
            </button>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-2xl space-y-6">
              {/* Header meta indicators */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-900/40 px-2.5 py-0.5 rounded-full">
                  {selectedMaterial.category}
                </span>
                <span className="text-zinc-500 font-mono text-[11px]">
                  Ditulis oleh <strong className="text-zinc-300 font-semibold">{selectedMaterial.author}</strong> • {selectedMaterial.createdAt}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight leading-snug">
                {selectedMaterial.title}
              </h2>

              <div className="w-full h-[1px] bg-zinc-800" />

              {/* Body article content split on paragraph blocks */}
              <div className="space-y-4 text-zinc-300 text-sm leading-relaxed pt-2">
                {selectedMaterial.content.split("\n").map((para, idx) => {
                  const line = para.trim();
                  if (line.startsWith("###")) {
                    return (
                      <h4 key={idx} className="text-white font-bold text-base mt-6 mb-2">
                        {line.replace("###", "").trim()}
                      </h4>
                    );
                  }
                  if (line.startsWith("####")) {
                    return (
                      <h5 key={idx} className="text-blue-400 font-semibold text-sm mt-4 mb-1">
                        {line.replace("####", "").trim()}
                      </h5>
                    );
                  }
                  if (line.startsWith("*") || line.startsWith("-")) {
                    return (
                      <div key={idx} className="pl-6 py-1 flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <p>{line.replace(/^[-*]\s*/, "")}</p>
                      </div>
                    );
                  }
                  if (line.startsWith("1.")) {
                    return (
                      <div key={idx} className="pl-6 py-1 flex items-start gap-2.5 font-sans">
                        <span className="text-indigo-400 font-bold font-mono">{idx + 1}.</span>
                        <p>{line.replace(/^\d+\.\s*/, "")}</p>
                      </div>
                    );
                  }
                  if (line === "") return <div key={idx} className="h-2" />;
                  return <p key={idx}>{line}</p>;
                })}
              </div>

              {/* Like action widget */}
              <div className="flex items-center justify-between pt-6 border-t border-zinc-800/80 mt-8">
                <button
                  onClick={() => {
                    onLikeMaterial(selectedMaterial.id);
                    // update active item
                    setSelectedMaterial(prev => prev ? {
                      ...prev,
                      likes: prev.hasLiked ? prev.likes - 1 : prev.likes + 1,
                      hasLiked: !prev.hasLiked
                    } : null);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    selectedMaterial.hasLiked
                      ? "bg-rose-950/20 border-rose-500/40 text-rose-400 font-bold"
                      : "bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-zinc-400"
                  }`}
                >
                  <Heart size={15} fill={selectedMaterial.hasLiked ? "currentColor" : "none"} />
                  {selectedMaterial.hasLiked ? "Batal Suka" : "Sukai Artikel ini"} • {selectedMaterial.likes}
                </button>
                <div className="text-zinc-500 text-xs">Apakah tulisan ini melatih akurasi nalar Anda?</div>
              </div>
            </div>
          </motion.div>
        ) : showForm ? (
          // Compose Article Form Screen
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-white font-sans font-bold text-base flex items-center gap-2">
                  <PenTool size={18} className="text-blue-500" />
                  Rancang Publikasi Kritik Anda
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-zinc-500 hover:text-white text-xs cursor-pointer"
                >
                  Batal
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-500 text-xs rounded-lg text-center">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                    Judul Artikel
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Menguji Klais Sunk Cost di Bisnis Teman"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-950 text-white px-3.5 py-2.5 rounded-xl border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                      Kategori Studi
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-950 text-white px-3 py-2.5 rounded-xl border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs font-sans cursor-pointer"
                    >
                      <option value="Logika Terapan">Logika Terapan</option>
                      <option value="Metode Ilmiah">Metode Ilmiah</option>
                      <option value="Cacat Logika">Cacat Logika</option>
                      <option value="Bias Pikiran">Bias Pikiran</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                      Nama Penulis
                    </label>
                    <input
                      type="text"
                      disabled
                      value={stats.username.replace(/_/g, " ")}
                      className="w-full bg-zinc-950/50 text-zinc-500 px-3 py-2.5 rounded-xl border border-zinc-800 outline-none text-xs font-sans select-none capitalize"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                    Ringkasan Singkat (Summary)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Artikel ringkas membongkar trik penipuan berbasis kupon..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full bg-zinc-950 text-white px-3.5 py-2.5 rounded-xl border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                    Isi Artikel Lengkap
                  </label>
                  <textarea
                    required
                    rows={8}
                    placeholder="Tulis tulisan argumentatif Anda menggunakan logika kritis di sini..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-zinc-950 text-white p-3.5 rounded-xl border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-sans"
                  />
                </div>

                <div className="p-3 bg-blue-950/20 border border-blue-500/10 rounded-xl space-y-1 text-zinc-400 text-[10px] leading-relaxed">
                  <div className="flex gap-1.5 text-blue-400 font-bold leading-none items-center mb-0.5">
                    <AlertCircle size={12} /> Pedoman Penulisan:
                  </div>
                  Tulisan wajib objektif, menjauhi celaan pribadi (Ad Hominem), membagi premis dengan jelas, dan menyandarkan pada bukti empiris atau pemecahan silogisme deduktif.
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1 text-xs cursor-pointer shadow-lg shadow-blue-600/10"
                >
                  <Send size={14} /> Terbitkan ke Hub Komunitas
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          // Main Index Library View
          <motion.div
            key="index"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Index Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-sans text-white flex items-center gap-2">
                  <Users size={22} className="text-blue-500" />
                  Materi & Artikel Komunitas
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Temukan rujukan analisis, esai, dan kasus logika terapan yang dipublikasikan oleh pembelajar.
                </p>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all self-start sm:self-center shadow-md cursor-pointer"
              >
                <PlusCircle size={16} /> Tulis Artikel
              </button>
            </div>

            {/* List display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {materials.map((mat) => (
                <div
                   key={mat.id}
                   className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Top line author details */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-900/40 px-2 py-0.5 rounded-full font-semibold">
                        {mat.category}
                      </span>
                      <span className="text-zinc-500 text-[10px] font-mono">
                        {mat.createdAt}
                      </span>
                    </div>

                    {/* Article title header */}
                    <div className="space-y-1 select-none">
                      <h4 className="text-white font-bold font-sans text-sm block line-clamp-1 leading-snug">
                        {mat.title}
                      </h4>
                      <span className="text-zinc-500 text-[10px] font-mono mt-0.5 block capitalize">
                        Penulis: {mat.author}
                      </span>
                    </div>

                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                      {mat.summary}
                    </p>
                  </div>

                  {/* Actions line footer */}
                  <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                    <button
                      onClick={() => onLikeMaterial(mat.id)}
                      className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        mat.hasLiked
                          ? "bg-rose-950/20 border-rose-500/30 text-rose-400"
                          : "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-rose-450"
                      }`}
                    >
                      <Heart size={12} fill={mat.hasLiked ? "currentColor" : "none"} />
                      <span>{mat.likes} Suka</span>
                    </button>

                    <button
                      onClick={() => setSelectedMaterial(mat)}
                      className="text-xs text-blue-400 font-semibold hover:text-blue-300 flex items-center gap-0.5 cursor-pointer"
                    >
                      Baca Selengkapnya
                      <ArrowRight size={14} className="mt-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
