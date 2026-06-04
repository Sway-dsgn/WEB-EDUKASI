import React, { useState } from "react";
import { User, Lock, Mail, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import EduvixLogo from "./EduvixLogo";

interface LoginRegisterProps {
  onLoginSuccess: (username: string, email: string) => void;
}

export default function LoginRegister({ onLoginSuccess }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDemoLogin = () => {
    setUsername("budi_kritis");
    onLoginSuccess("budi_kritis", "budi@eduvix.id");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim()) {
      setErrorMsg("Username harus diisi");
      return;
    }
    if (!isLogin && !email.includes("@")) {
      setErrorMsg("Format e-mail tidak valid");
      return;
    }
    if (password.length < 4) {
      setErrorMsg("Password minimal 4 karakter");
      return;
    }

    // Success simulation
    const finalEmail = isLogin ? `${username}@eduvix.id` : email;
    onLoginSuccess(username.toLowerCase().replace(/\s+/g, "_"), finalEmail);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative gradient glowing spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl "
      >
        {/* App Title Header */}
        <div className="flex flex-col items-center text-center mb-8 gap-1.5">
          <EduvixLogo size={60} showText={true} textColorClassName="text-3xl font-extrabold" />
          <p className="text-zinc-400 text-xs">
            Platform Belajar Berpikir Kritis & Logika Terapan
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-zinc-950 p-1 rounded-xl mb-6 border border-zinc-800">
          <button
            onClick={() => {
              setIsLogin(true);
              setErrorMsg("");
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              isLogin
                ? "bg-blue-600 text-white shadow-md font-semibold"
                : "text-zinc-500 hover:text-zinc-100"
            }`}
          >
            Masuk Akun
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setErrorMsg("");
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              !isLogin
                ? "bg-blue-600 text-white shadow-md font-semibold"
                : "text-zinc-500 hover:text-zinc-100"
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-950/50 border border-red-500/30 text-red-400 text-xs rounded-lg text-center"
          >
            {errorMsg}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <User size={18} />
              </span>
              <input
                type="text"
                placeholder="cth: budi_kritis"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950 text-white pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  placeholder="budi@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 text-white pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 text-white pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-lg shadow-blue-600/10 active:scale-[0.98]"
          >
            {isLogin ? "Masuk ke Platform" : "Buat Akun Sekarang"}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-4 text-zinc-500 text-xs font-mono">
            ATAU COBA LANGSUNG
          </span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <button
          onClick={handleDemoLogin}
          className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-blue-400 hover:text-blue-300 font-medium py-2.5 rounded-xl transition-colors text-sm"
        >
          Masuk Instan dengan Akun Demo
        </button>

        <div className="text-center mt-6 text-zinc-500 text-xs">
          Dengan mendaftar, Anda menyetujui Ketentuan Berlatih Berpikir Rasional EDUVIX.ID
        </div>
      </motion.div>
    </div>
  );
}
