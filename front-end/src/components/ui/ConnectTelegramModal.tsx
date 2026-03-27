import React, { useState } from "react";
import { FiX, FiLoader, FiSmartphone, FiLock, FiShield } from "react-icons/fi";
import { tgSendCode, tgVerify, tgVerify2FA } from "../../services/telegram.service";
import { useTelegramStore } from "../../store/useTelegramStore";

interface Props {
  onClose: () => void;
}

type Step = "phone" | "code" | "2fa";

const ConnectTelegramModal: React.FC<Props> = ({ onClose }) => {
  const { setConnected, fetchPanels } = useTelegramStore();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    if (!phone.trim()) { setError("Enter your phone number."); return; }
    setError("");
    setLoading(true);
    try {
      const data = await tgSendCode(phone.trim());
      if (!data.success) { setError(data.message ?? "Failed to send code."); return; }
      setPendingToken(data.pendingToken);
      setStep("code");
    } catch {
      setError("Cannot reach server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) { setError("Enter the code from Telegram."); return; }
    setError("");
    setLoading(true);
    try {
      const data = await tgVerify(pendingToken, code.trim());
      if (!data.success) { setError(data.message ?? "Invalid code."); return; }
      if (data.needs2FA) {
        setPendingToken(data.pendingToken);
        setStep("2fa");
        return;
      }
      setConnected(data.account);
      await fetchPanels();
      onClose();
    } catch {
      setError("Cannot reach server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!password) { setError("Enter your cloud password."); return; }
    setError("");
    setLoading(true);
    try {
      const data = await tgVerify2FA(pendingToken, password);
      if (!data.success) { setError(data.message ?? "Wrong password."); return; }
      setConnected(data.account);
      await fetchPanels();
      onClose();
    } catch {
      setError("Cannot reach server.");
    } finally {
      setLoading(false);
    }
  };

  const stepInfo = {
    phone: { icon: <FiSmartphone size={22} className="text-cyan-400" />, title: "Connect Telegram", sub: "Enter your phone number to sign in to your Telegram account." },
    code:  { icon: <FiShield size={22} className="text-cyan-400" />,     title: "Enter OTP Code",   sub: `Telegram sent a code to ${phone}. Enter it below.` },
    "2fa": { icon: <FiLock size={22} className="text-cyan-400" />,       title: "Two-Step Verification", sub: "Enter your Telegram cloud password." },
  };

  const info = stepInfo[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-gray-950 border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {info.icon}
            <h2 className="text-base font-bold text-white">{info.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-400">{info.sub}</p>

          {step === "phone" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                placeholder="+628123456789"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <p className="text-xs text-gray-600 mt-1.5">Include country code, e.g. +62 for Indonesia</p>
            </div>
          )}

          {step === "code" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Verification Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder="12345"
                maxLength={10}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors font-mono tracking-widest text-center"
              />
            </div>
          )}

          {step === "2fa" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Cloud Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify2FA()}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          {step !== "phone" && (
            <button
              onClick={() => { setStep(step === "2fa" ? "code" : "phone"); setError(""); }}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={step === "phone" ? handleSendCode : step === "code" ? handleVerify : handleVerify2FA}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-semibold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <FiLoader className="animate-spin" size={14} />}
            {step === "phone" ? "Send Code" : step === "code" ? "Verify" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectTelegramModal;
