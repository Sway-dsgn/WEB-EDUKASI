import React, { useState } from "react";
import {
  ShoppingBag,
  Award,
  Ticket,
  User,
  CheckCircle,
  Gem,
  AlertCircle,
  Zap,
  Crown,
  Sparkles,
  BookOpen,
  Search,
  Gift,
  ChevronRight,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { motion } from "motion/react";
import { StoreItem, UserStats } from "../types";
import { storeItems } from "../data/store";

interface StoreProps {
  stats: UserStats;
  onPurchaseItem: (itemId: string, cost: number) => void;
  onEquipItem: (itemId: string, category: string) => void;
}

export default function Store({ stats, onPurchaseItem, onEquipItem }: StoreProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState("");
  const [purchaseErrorMsg, setPurchaseErrorMsg] = useState("");

  const categories = [
    { id: "all", label: "Semua Hadiah", icon: <ShoppingBag size={14} /> },
    { id: "avatar", label: "Aksesoris Profil", icon: <User size={14} /> },
    { id: "sertifikat", label: "Sertifikasi", icon: <Award size={14} /> },
    { id: "kupon", label: "Voucher Buku", icon: <Ticket size={14} /> },
    { id: "merchandise", label: "Merchandise", icon: <BookOpen size={14} /> }
  ];

  // Map item ID to gorgeous Lucide icon for huge centered card preview
  const getItemIcon = (id: string) => {
    switch (id) {
      case "ninja_avatar":
        return <User className="text-indigo-400 w-16 h-16" strokeWidth={1.5} />;
      case "xp_booster":
        return <Zap className="text-emerald-400 w-16 h-16" strokeWidth={1.5} />;
      case "royal_crown":
        return <Crown className="text-amber-400 w-16 h-16" strokeWidth={1.5} />;
      case "rainbow_infinity":
        return <Sparkles className="text-pink-400 w-16 h-16" strokeWidth={1.5} />;
      case "avatar-socrates":
        return <User className="text-purple-400 w-12 h-12" strokeWidth={1.5} />;
      case "avatar-philosopher":
        return <User className="text-yellow-400 w-12 h-12" strokeWidth={1.5} />;
      case "cert-basics":
        return <Award className="text-indigo-300 w-14 h-14" strokeWidth={1.5} />;
      case "cert-advanced":
        return <Award className="text-rose-400 w-14 h-14" strokeWidth={1.5} />;
      case "kupon-books":
        return <Ticket className="text-teal-400 w-14 h-14" strokeWidth={1.5} />;
      case "merch-notebook":
        return <BookOpen className="text-sky-300 w-14 h-14" strokeWidth={1.5} />;
      default:
        return <Gift className="text-zinc-400 w-12 h-12" />;
    }
  };

  const getItemColorClass = (type: string) => {
    if (type === "avatar") return "text-indigo-400";
    if (type === "sertifikat") return "text-amber-400";
    return "text-emerald-400";
  };

  // Filter and search logic
  const filteredItems = storeItems
    .filter(item => {
      // Category check
      if (activeCategory !== "all" && item.category !== activeCategory) return false;
      // Search check
      if (searchQuery.trim() !== "") {
        return (
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    });

  const handleBuy = (item: StoreItem) => {
    setPurchaseSuccessMsg("");
    setPurchaseErrorMsg("");

    // Verify ownership
    if (stats.purchasedItems.includes(item.id)) {
      setPurchaseErrorMsg("Anda sudah mengklaim hadiah ini sebelumnya.");
      return;
    }

    // Verify coin points
    if (stats.points < item.cost) {
      setPurchaseErrorMsg(`Koin tidak mencukupi untuk memesan. Butuh ${item.cost} koin (Saldo Anda: ${stats.points} koin).`);
      return;
    }

    if (confirm(`Yakin ingin membeli "${item.title}" seharga ${item.cost} koin?`)) {
      onPurchaseItem(item.id, item.cost);
      setPurchaseSuccessMsg(`Berhasil membeli item: "${item.title}"! Aksesoris siap dipasang di profil Anda.`);
    }
  };

  // Render list of acquired items (Purchased History)
  const purchasedHistoryItems = storeItems.filter(item => stats.purchasedItems.includes(item.id));

  return (
    <div className="space-y-6 pb-16">
      
      {/* Search Input and Top Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-sans text-white flex items-center gap-2 tracking-tight">
            <ShoppingBag size={24} className="text-indigo-500 animate-pulse" />
            Toko Hadiah EDUVIX
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Gunakan akumulasi Koin yang Anda raih dari pengerjaan materi & kuis untuk ditukarkan dengan aneka voucher edukatif.
          </p>
        </div>

        {/* Live Search input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari item di toko..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 font-sans focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* SALDO KOIN KAMU - Display Large Box */}
      <div className="bg-gradient-to-r from-zinc-900 to-indigo-950/20 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between shadow-xl relative overflow-hidden group">
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/15 transition-all duration-700" />
        <div className="space-y-1 z-10">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold font-sans block">Saldo Koin Kamu</span>
          <h2 className="text-3xl md:text-4xl font-black text-amber-500 font-sans drop-shadow-[0_2px_10px_rgba(245,158,11,0.15)] flex items-center gap-2">
            <Gem size={28} className="text-amber-500 animate-bounce" fill="currentColor" />
            {stats.points} <span className="text-sm font-semibold text-zinc-400">Koin</span>
          </h2>
        </div>
        <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-amber-500/10 z-10">
          🪙
        </div>
      </div>

      {/* Alerts logs */}
      {purchaseSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-start gap-2.5 leading-relaxed"
        >
          <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-emerald-400" />
          <p>{purchaseSuccessMsg}</p>
        </motion.div>
      )}

      {purchaseErrorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-start gap-2.5 leading-relaxed"
        >
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-400" />
          <p>{purchaseErrorMsg}</p>
        </motion.div>
      )}

      {/* Main layout with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Store Tabs Filter and Store Grid Cards (Takes 3 cols on large screen) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Filter Categories list */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-zinc-800/80 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setPurchaseSuccessMsg("");
                  setPurchaseErrorMsg("");
                }}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white border-indigo-500 font-bold shadow-md shadow-indigo-600/10"
                    : "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 my-2">
            <span className="text-xs font-bold text-zinc-400 font-sans tracking-wide">Koleksi Spesial</span>
            <div className="h-[1px] bg-zinc-800 flex-1" />
          </div>

          {/* Grid layout containing 2 columns per the request */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item, i) => {
              const isOwned = stats.purchasedItems.includes(item.id);
              const cannotAfford = stats.points < item.cost;
              
              // Equip state checks
              const isEquipped = 
                (item.category === "avatar" && item.id !== "rainbow_infinity" && stats.equippedAvatar === item.id) ||
                (item.id === "rainbow_infinity" && stats.equippedBorder === item.id);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-zinc-90 w-full bg-zinc-900 border ${
                    isOwned ? "border-zinc-800/80" : "border-zinc-800 hover:border-indigo-500/60"
                  } rounded-2xl p-4 flex flex-col gap-4 relative transition-all duration-300 group`}
                >
                  {/* Owned floating badge */}
                  {isOwned && (
                    <div className="absolute top-3.5 right-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black tracking-wide leading-none z-10 animate-fade">
                      Dimiliki
                    </div>
                  )}

                  {/* Centered Large Item Preview block */}
                  <div className="h-40 bg-zinc-950 rounded-xl flex items-center justify-center overflow-hidden relative group-hover:scale-[0.98] transition-all duration-300">
                    <div className="absolute inset-x-0 bottom-0 top-0 opacity-10 bg-gradient-to-t from-indigo-600 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Centered Large SVG Icon Representation */}
                    {getItemIcon(item.id)}
                  </div>

                  {/* Info titles */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase font-black">
                        {item.category === "avatar" ? "Profil" : item.category}
                      </span>
                    </div>
                    <h3 className="text-zinc-100 font-sans font-bold text-sm leading-tight group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2 h-8">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer control panel with price & action buttons */}
                  <div className="mt-auto pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                    
                    {/* Price tag display */}
                    <div className="flex items-center gap-1 text-sm font-extrabold text-amber-500 font-sans">
                      {/* For special Rainbow Infinity, show crossed-off original price of 500! */}
                      {item.id === "rainbow_infinity" && (
                        <span className="line-through text-zinc-500 text-[10px] mr-2 font-normal flex items-center gap-0.5">
                          🪙 500
                        </span>
                      )}
                      
                      <span>🪙 {item.cost}</span>

                      {/* Sale percentage highlight */}
                      {item.id === "rainbow_infinity" && (
                        <span className="ml-1.5 px-1 bg-red-600/30 text-red-500 text-[9px] font-black rounded border border-red-500/10">
                          -20%
                        </span>
                      )}
                    </div>

                    {/* Interactive Button */}
                    {isOwned ? (
                      // If owned, allow equipping (Pakai) or display status
                      item.category === "avatar" ? (
                        <button
                          onClick={() => onEquipItem(item.id, item.id === "rainbow_infinity" ? "border" : "avatar")}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            isEquipped
                              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30"
                              : "bg-indigo-600 hover:bg-indigo-500 text-white"
                          }`}
                        >
                          {isEquipped ? "✓ Dipakai" : "Pakai Item"}
                        </button>
                      ) : (
                        <span className="px-3 py-2 text-[10px] font-bold text-zinc-500 bg-zinc-950/80 border border-zinc-800 rounded-xl select-none">
                          Sudah Diklaim
                        </span>
                      )
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                          cannotAfford
                            ? "bg-zinc-950 border border-zinc-800 text-zinc-500/80 cursor-default"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/15"
                        }`}
                      >
                        Beli Sekarang
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                <p className="text-zinc-500 text-xs">Tidak menemukan produk hadiah yang serasi.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Informational Widget Panels (Takes 1 col on large screen) */}
        <div className="space-y-6">
          
          {/* Informational Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-400 font-sans tracking-wide pb-2 border-b border-zinc-800/60">
              Informasi Toko
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 text-center">
                <span className="text-xl font-black text-indigo-400 block font-mono">
                  {storeItems.length}
                </span>
                <span className="text-[9px] text-zinc-500 font-sans font-semibold block uppercase">
                  Item Tersedia
                </span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 text-center">
                <span className="text-xs font-extrabold text-amber-500 block font-sans py-1">
                  Baru!
                </span>
                <span className="text-[9px] text-zinc-500 font-sans font-semibold block uppercase">
                  Mei Koleksi
                </span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              🪙 Koin didapatkan secara otomatis setiap kali Anda menuntaskan sesi bacaan materi, menjawab kuis evaluasi, atau check-in harian.
            </p>
          </div>

          {/* Riwayat Pembelian (Purchased History Sidebar widget) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-400 font-sans tracking-wide pb-2 border-b border-zinc-800/60">
              Riwayat Pembelian
            </h3>

            {purchasedHistoryItems.length > 0 ? (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {purchasedHistoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b border-zinc-800 Last:border-none"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-zinc-950 border border-zinc-800 text-indigo-400 rounded-lg">
                        <ShieldCheck size={14} className="text-indigo-400" />
                      </div>
                      <div className="leading-none">
                        <span className="text-[11px] font-bold text-zinc-300 block">
                          {item.title}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono">
                          Siap digunakan
                        </span>
                      </div>
                    </div>
                    <span className="text-[8px] text-zinc-500 bg-zinc-950 border border-zinc-800/80 px-2 py-1 rounded-md flex items-center gap-1 font-mono">
                      <Calendar size={10} /> Aktif
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-[11px] text-zinc-500">Belum ada riwayat pembelian koin.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
