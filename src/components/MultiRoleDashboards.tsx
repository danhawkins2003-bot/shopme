import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  User, 
  ShoppingBag, 
  DollarSign, 
  Check, 
  X, 
  Copy, 
  Link2, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  Bell, 
  Truck, 
  Wallet, 
  ShieldAlert, 
  Star, 
  Clock, 
  HelpCircle,
  Eye,
  Camera,
  Layers,
  ChevronRight,
  ArrowRightLeft,
  ArrowLeft,
  MessageSquare,
  Tag,
  Gift,
  LogOut,
  Settings,
  Globe,
  Lock,
  Store,
  FileText,
  Coins,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Heart,
  Percent,
  History
} from "lucide-react";
import SellerWorkspace from "./SellerWorkspace";

interface MultiRoleDashboardsProps {
  user: any;
  setUser: (user: any) => void;
  token: string | null;
  products: any[];
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  showToast: (msg: string) => void;
  formatFCFA: (amount: number) => string;
  closeDrawer: () => void;
  onSelectProduct: (product: any) => void;
  onLogout?: () => void;
  onTabChange?: (tab: string) => void;
  initialView?: "vendeur" | "client" | "menu";
  onTrackOrder?: (orderId: string) => void;
}

interface WalletSectionProps {
  wallet: any;
  formatFCFA: (amount: number) => string;
}

const WalletSection: React.FC<WalletSectionProps> = ({ wallet, formatFCFA }) => {
  if (!wallet) {
    return (
      <div className="bg-stone-50 border border-stone-200 p-5 text-center">
        <Coins className="w-8 h-8 text-neutral-300 mx-auto mb-2 animate-pulse" />
        <p className="text-xs text-neutral-400">Chargement de votre portefeuille en cours...</p>
      </div>
    );
  }

  const ledger = wallet.ledger || [];
  
  const totalVentes = ledger
    .filter((tx: any) => tx.type === "vente")
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  const totalCommissions = ledger
    .filter((tx: any) => tx.type === "commission")
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  const totalRetraits = ledger
    .filter((tx: any) => tx.type === "retrait_demande")
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  const totalRemboursements = ledger
    .filter((tx: any) => tx.type === "retrait_rembourse")
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  return (
    <div className="bg-white border border-stone-200 p-4 space-y-4 font-sans text-left">
      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-[#b8901c]" />
          <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Portefeuille Virtuel</h4>
        </div>
        <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200/50 px-1.5 py-0.5 uppercase">Miabé Asi Gateway</span>
      </div>

      {/* Main Balance */}
      <div className="bg-gradient-to-r from-neutral-900 to-stone-800 text-white p-4 text-center relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Solde Actuel</span>
          <h3 className="text-2xl font-mono font-black text-[#d4af37] mt-1">{formatFCFA(wallet.balance)}</h3>
          <p className="text-[8.5px] text-stone-400 mt-1.5 font-mono">ID de compte : {wallet.userId}</p>
        </div>
        <div className="absolute -right-6 -bottom-6 text-stone-800 opacity-20 pointer-events-none">
          <Wallet className="w-24 h-24" />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-emerald-50/50 border border-emerald-100 p-2">
          <span className="text-neutral-400 block font-bold uppercase tracking-wide text-[8.5px]">Ventes brutes (+)</span>
          <strong className="text-emerald-700 font-mono text-xs">{formatFCFA(totalVentes)}</strong>
        </div>
        <div className="bg-amber-50/30 border border-amber-100/50 p-2">
          <span className="text-neutral-400 block font-bold uppercase tracking-wide text-[8.5px]">Commissions Miabé Asi (-)</span>
          <strong className="text-amber-800 font-mono text-xs">{formatFCFA(totalCommissions)}</strong>
        </div>
        <div className="bg-rose-50/50 border border-rose-100 p-2">
          <span className="text-neutral-400 block font-bold uppercase tracking-wide text-[8.5px]">Retraits demandés (-)</span>
          <strong className="text-rose-700 font-mono text-xs">{formatFCFA(totalRetraits)}</strong>
        </div>
        <div className="bg-blue-50/50 border border-blue-100 p-2">
          <span className="text-neutral-400 block font-bold uppercase tracking-wide text-[8.5px]">Remboursements (+)</span>
          <strong className="text-blue-700 font-mono text-xs">{formatFCFA(totalRemboursements)}</strong>
        </div>
      </div>

      {/* Transactions list */}
      <div className="space-y-2">
        <p className="font-extrabold text-[9.5px] uppercase text-neutral-800 tracking-wider">Journal des Transactions</p>
        {ledger.length === 0 ? (
          <p className="text-[10px] text-neutral-400 italic text-center py-4 bg-neutral-50 border border-neutral-100">Aucun enregistrement comptable disponible.</p>
        ) : (
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {ledger.slice().reverse().map((tx: any) => {
              let typeLabel = tx.type;
              let typeClass = "bg-neutral-100 text-neutral-700 border-neutral-200";
              let amountPrefix = "";
              let amountClass = "text-neutral-700";

              if (tx.type === "vente") {
                typeLabel = "Vente";
                typeClass = "bg-emerald-100 text-emerald-800 border-emerald-200/50";
                amountPrefix = "+";
                amountClass = "text-emerald-600";
              } else if (tx.type === "commission") {
                typeLabel = "Commission";
                typeClass = "bg-amber-100 text-amber-800 border-amber-200/50";
                amountPrefix = "-";
                amountClass = "text-amber-700";
              } else if (tx.type === "retrait_demande") {
                typeLabel = "Débit Retrait";
                typeClass = "bg-rose-100 text-rose-800 border-rose-200/50";
                amountPrefix = "-";
                amountClass = "text-rose-600";
              } else if (tx.type === "retrait_rembourse") {
                typeLabel = "Remboursement";
                typeClass = "bg-blue-100 text-blue-800 border-blue-200/50";
                amountPrefix = "+";
                amountClass = "text-blue-600";
              } else if (tx.type === "retrait_complete") {
                typeLabel = "Retrait Réussi";
                typeClass = "bg-slate-100 text-slate-800 border-slate-200";
                amountPrefix = "";
                amountClass = "text-slate-600";
              }

              return (
                <div key={tx.id} className="border border-stone-100 p-2 bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 border rounded-sm tracking-wider ${typeClass}`}>
                      {typeLabel}
                    </span>
                    <strong className={`font-mono text-xs font-black ${amountClass}`}>
                      {amountPrefix}{formatFCFA(tx.amount)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-neutral-400">
                    <span className="truncate max-w-[170px] text-neutral-500 font-sans">{tx.description}</span>
                    <span className="font-mono text-[8px] shrink-0">{new Date(tx.date).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="text-[7.5px] font-mono text-neutral-300">
                    TxID: {tx.id}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default function MultiRoleDashboards({
  user,
  setUser,
  token,
  products,
  setProducts,
  showToast,
  formatFCFA,
  closeDrawer,
  onSelectProduct,
  onLogout,
  onTabChange,
  initialView,
  onTrackOrder
}: MultiRoleDashboardsProps) {
  const [currentView, setCurrentView] = useState<"menu" | "client" | "vendeur" | "affilie" | "notifications" | "help" | "profile_settings" | "promos" | "favorites">(initialView === "vendeur" ? "vendeur" : "menu");
  const [activeTab, setActiveTab] = useState<"client" | "vendeur" | "affilie" | "notifications">(initialView === "vendeur" ? "vendeur" : "client");

  useEffect(() => {
    if (initialView && initialView !== "menu") {
      setCurrentView(initialView);
      if (initialView === "vendeur" || initialView === "client" || initialView === "affilie" || initialView === "notifications") {
        setActiveTab(initialView);
      }
    } else if (initialView === "menu") {
      setCurrentView("menu");
    }
  }, [initialView]);

  useEffect(() => {
    onTabChange?.(currentView);
  }, [currentView, onTabChange]);

  // Profile Settings Edit States
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editQuartier, setEditQuartier] = useState(user?.quartier || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Seller Space Security PIN States
  const [isVendeurUnlocked, setIsVendeurUnlocked] = useState(false);
  const [vendeurPinInput, setVendeurPinInput] = useState("");
  const [pinSetupValue, setPinSetupValue] = useState("");
  const [pinSetupConfirm, setPinSetupConfirm] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetStep, setResetStep] = useState<"password" | "new_pin">("password");
  
  // Real-time security state
  const [pinLockSeconds, setPinLockSeconds] = useState<number>(0);
  const [pinAttemptsLeft, setPinAttemptsLeft] = useState<number>(5);

  // Affiliate Space Security PIN States
  const [isAffilieUnlocked, setIsAffilieUnlocked] = useState(false);
  const [affiliePinInput, setAffiliePinInput] = useState("");
  const [affiliePinSetupValue, setAffiliePinSetupValue] = useState("");
  const [affiliePinSetupConfirm, setAffiliePinSetupConfirm] = useState("");
  const [affiliePinError, setAffiliePinError] = useState(false);
  const [isResettingAffiliePin, setIsResettingAffiliePin] = useState(false);
  const [affilieResetPasswordInput, setAffilieResetPasswordInput] = useState("");
  const [affilieResetError, setAffilieResetError] = useState("");
  const [affilieResetStep, setAffilieResetStep] = useState<"password" | "new_pin">("password");
  
  // Real-time security state for Affiliate
  const [affiliePinLockSeconds, setAffiliePinLockSeconds] = useState<number>(0);
  const [affiliePinAttemptsLeft, setAffiliePinAttemptsLeft] = useState<number>(5);

  // Auto-lock feature: Lock Espace Vendeur after 15 minutes of inactivity
  useEffect(() => {
    if (!isVendeurUnlocked) return;

    let timeoutId: any;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsVendeurUnlocked(false);
        showToast("🕒 Votre espace de vente a été automatiquement verrouillé pour inactivité.");
      }, 15 * 60 * 1000); // 15 minutes
    };

    // Track user movements/clicks to reset inactivity timer
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // start

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [isVendeurUnlocked]);

  // Real-time countdown for brute-force block
  useEffect(() => {
    if (pinLockSeconds > 0) {
      const timer = setInterval(() => {
        setPinLockSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPinAttemptsLeft(5);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [pinLockSeconds]);

  // Auto-lock feature: Lock Espace Affilié after 15 minutes of inactivity
  useEffect(() => {
    if (!isAffilieUnlocked) return;

    let timeoutId: any;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsAffilieUnlocked(false);
        showToast("🕒 Votre espace affilié a été automatiquement verrouillé pour inactivité.");
      }, 15 * 60 * 1000); // 15 minutes
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // start

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [isAffilieUnlocked]);

  // Real-time countdown for brute-force block for Affiliate
  useEffect(() => {
    if (affiliePinLockSeconds > 0) {
      const timer = setInterval(() => {
        setAffiliePinLockSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setAffiliePinAttemptsLeft(5);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [affiliePinLockSeconds]);

  const renderVendeurSecurityGateway = () => {
    const hasPin = !!user?.vendeurPin;

    const handlePinKeyPress = async (digit: string) => {
      if (pinError || pinLockSeconds > 0) return;
      if (hasPin) {
        if (vendeurPinInput.length < 4) {
          const newVal = vendeurPinInput + digit;
          setVendeurPinInput(newVal);
          if (newVal.length === 4) {
            try {
              const res = await fetch("/api/auth/verify-pin", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": token || ""
                },
                body: JSON.stringify({ pin: newVal })
              });
              const data = await res.json();
              if (data.success) {
                setIsVendeurUnlocked(true);
                setVendeurPinInput("");
                setPinAttemptsLeft(5);
                showToast("🔓 Espace vendeur déverrouillé avec succès !");
              } else {
                setPinError(true);
                if (data.locked) {
                  setPinLockSeconds(data.remainingSeconds || 300);
                  setPinAttemptsLeft(0);
                } else {
                  const remainingAttempts = typeof data.failedAttempts !== "undefined" ? Math.max(0, 5 - data.failedAttempts) : 4;
                  setPinAttemptsLeft(remainingAttempts);
                }
                setTimeout(() => {
                  setVendeurPinInput("");
                  setPinError(false);
                }, 600);
                showToast(`❌ ${data.error || "Code PIN incorrect."}`);
              }
            } catch {
              showToast("Erreur lors de la vérification du code PIN.");
            }
          }
        }
      } else {
        // SETUP MODE
        if (pinSetupValue.length < 4) {
          setPinSetupValue(prev => prev + digit);
        } else if (pinSetupConfirm.length < 4) {
          setPinSetupConfirm(prev => prev + digit);
        }
      }
    };

    const handleBackspace = () => {
      if (pinLockSeconds > 0) return;
      if (hasPin) {
        setVendeurPinInput(prev => prev.slice(0, -1));
      } else {
        if (pinSetupConfirm.length > 0) {
          setPinSetupConfirm(prev => prev.slice(0, -1));
        } else {
          setPinSetupValue(prev => prev.slice(0, -1));
        }
      }
    };

    const handleClear = () => {
      if (pinLockSeconds > 0) return;
      if (hasPin) {
        setVendeurPinInput("");
      } else {
        setPinSetupValue("");
        setPinSetupConfirm("");
      }
    };

    const handlePinSetupSubmit = async () => {
      if (pinSetupValue.length !== 4) {
        showToast("Le code PIN doit comporter exactement 4 chiffres.");
        return;
      }
      if (pinSetupValue !== pinSetupConfirm) {
        showToast("Les deux codes saisis ne correspondent pas.");
        setPinSetupConfirm("");
        return;
      }

      try {
        const res = await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token || ""
          },
          body: JSON.stringify({ vendeurPin: pinSetupValue })
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setIsVendeurUnlocked(true);
          setPinSetupValue("");
          setPinSetupConfirm("");
          showToast("🔒 Code PIN configuré ! Votre espace vendeur est désormais sécurisé.");
        } else {
          showToast(`Erreur : ${data.error}`);
        }
      } catch {
        showToast("Erreur lors de la configuration du code PIN.");
      }
    };

    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setResetError("");
      if (!resetPasswordInput) {
        setResetError("Veuillez saisir votre mot de passe.");
        return;
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: user?.email,
            password: resetPasswordInput
          })
        });
        const data = await res.json();
        if (data.success) {
          setResetStep("new_pin");
          setResetPasswordInput("");
          showToast("Saisie validée. Définissez votre nouveau code PIN.");
        } else {
          setResetError("Mot de passe incorrect.");
        }
      } catch {
        setResetError("Erreur lors de la vérification du mot de passe.");
      }
    };

    const handleNewPinResetSubmit = async () => {
      if (pinSetupValue.length !== 4) {
        showToast("Le code PIN doit comporter 4 chiffres.");
        return;
      }
      if (pinSetupValue !== pinSetupConfirm) {
        showToast("Les codes PIN ne correspondent pas.");
        setPinSetupConfirm("");
        return;
      }

      try {
        const res = await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token || ""
          },
          body: JSON.stringify({ vendeurPin: pinSetupValue })
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setIsVendeurUnlocked(true);
          setIsResettingPin(false);
          setResetStep("password");
          setPinSetupValue("");
          setPinSetupConfirm("");
          showToast("🔓 Code PIN réinitialisé et espace déverrouillé !");
        } else {
          showToast(`Erreur : ${data.error}`);
        }
      } catch {
        showToast("Erreur lors de l'enregistrement du code PIN.");
      }
    };

    if (isResettingPin) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[450px] p-6 bg-white rounded-2xl border border-stone-200 shadow-sm max-w-md mx-auto my-auto text-left font-sans animate-fade-in select-none">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4 border border-amber-200">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>

          <h3 className="font-display font-extrabold uppercase text-xs tracking-wider text-neutral-900 mb-1">
            Réinitialiser votre Code PIN
          </h3>
          <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest mb-6">
            Sécurité Espace Vendeur
          </p>

          {resetStep === "password" ? (
            <form onSubmit={handleResetPasswordSubmit} className="w-full space-y-4">
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Par mesure de sécurité, veuillez saisir le mot de passe de votre compte client Miabé Asi pour configurer un nouveau code PIN.
              </p>
              
              <div>
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                  Mot de passe de votre compte
                </label>
                <input
                  type="password"
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  placeholder="Saisissez votre mot de passe"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                  required
                />
                {resetError && (
                  <p className="text-[10px] text-red-600 font-bold mt-1.5">{resetError}</p>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPin(false);
                    setResetError("");
                    setResetPasswordInput("");
                  }}
                  className="flex-1 py-2 border border-stone-200 hover:bg-stone-50 text-neutral-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center bg-transparent"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Confirmer
                </button>
              </div>
            </form>
          ) : (
            <div className="w-full space-y-4 text-center">
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Choisissez un nouveau code PIN à 4 chiffres facile à retenir mais difficile à deviner.
              </p>

              {/* Secure Dots Visualizer */}
              <div className="flex flex-col items-center gap-4 py-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-neutral-400 mb-2">
                    {pinSetupValue.length < 4 ? "Saisir le nouveau PIN" : "Confirmer le nouveau PIN"}
                  </p>
                  <div className="flex justify-center gap-3">
                    {[0, 1, 2, 3].map((idx) => {
                      const hasDigit = pinSetupValue.length < 4
                        ? idx < pinSetupValue.length
                        : idx < pinSetupConfirm.length;
                      return (
                        <div
                          key={idx}
                          className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                            hasDigit
                              ? "bg-[#0b4d26] border-[#0b4d26] scale-110 shadow-xs"
                              : "border-stone-300 bg-stone-100"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {pinSetupValue.length === 4 && pinSetupConfirm.length === 4 && (
                  <button
                    type="button"
                    onClick={handleNewPinResetSubmit}
                    className="mt-2 px-6 py-2 bg-[#0b4d26] text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-emerald-700 cursor-pointer transition-all"
                  >
                    Valider le code PIN
                  </button>
                )}
              </div>

              {/* Digital Pad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto select-none">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinKeyPress(num)}
                    className="w-14 h-14 rounded-full border border-stone-200 hover:border-neutral-900 flex items-center justify-center font-bold text-base text-neutral-800 bg-stone-50 hover:bg-white active:scale-95 transition-all cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-neutral-900 cursor-pointer transition-all"
                >
                  Effacer
                </button>
                <button
                  type="button"
                  onClick={() => handlePinKeyPress("0")}
                  className="w-14 h-14 rounded-full border border-stone-200 hover:border-neutral-900 flex items-center justify-center font-bold text-base text-neutral-800 bg-stone-50 hover:bg-white active:scale-95 transition-all cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-neutral-900 cursor-pointer transition-all"
                >
                  Retour
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] p-6 bg-[#FAF9F5] rounded-2xl border border-stone-200 shadow-sm max-w-sm mx-auto my-auto text-center font-sans animate-fade-in select-none">
        <div className="w-14 h-14 rounded-full bg-[#0b4d26]/10 flex items-center justify-center mb-4 border border-[#0b4d26]/20 relative">
          <Lock className="w-6 h-6 text-[#0b4d26] animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-[#0b4d26] animate-ping opacity-25" style={{ animationDuration: "3s" }} />
        </div>

        <h3 className="font-display font-extrabold uppercase text-xs tracking-wider text-neutral-900 mb-1">
          {hasPin ? "Déverrouiller l'Espace Vendeur" : "Sécurisez votre Espace Vendeur"}
        </h3>
        <p className="text-[9px] text-[#d4af37] font-extrabold uppercase tracking-widest mb-4">
          Protection d'accès Miabé Asi
        </p>

        {!hasPin ? (
          // SETUP FLOW
          <div className="space-y-4 w-full">
            <p className="text-[11.5px] text-neutral-500 leading-relaxed px-2">
              Pour protéger votre portefeuille financier, vos transactions d'argent et la gestion de vos fiches de produits, veuillez définir un <strong>code PIN de sécurité à 4 chiffres</strong>.
            </p>

            {/* Visualizer Dots */}
            <div className="flex flex-col items-center gap-2 py-2">
              <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">
                {pinSetupValue.length < 4 ? "Saisir le Code PIN" : "Confirmer le Code PIN"}
              </p>
              
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => {
                  const hasDigit = pinSetupValue.length < 4
                    ? idx < pinSetupValue.length
                    : idx < pinSetupConfirm.length;
                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                        hasDigit
                          ? "bg-[#0b4d26] border-[#0b4d26] scale-110 shadow-xs"
                          : "border-stone-300 bg-stone-100"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {pinSetupValue.length === 4 && pinSetupConfirm.length === 4 && (
              <button
                type="button"
                onClick={handlePinSetupSubmit}
                className="w-full py-2.5 bg-[#0b4d26] hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-sm"
              >
                Activer et sécuriser l'espace
              </button>
            )}
          </div>
        ) : (
          // UNLOCK FLOW
          <div className="space-y-5 w-full">
            <p className="text-[11.5px] text-neutral-500 leading-relaxed">
              Veuillez saisir votre code PIN de sécurité secret de boutique pour accéder à votre espace de vente.
            </p>

            {pinLockSeconds > 0 ? (
              <div className="bg-red-50 border border-red-200/60 p-3.5 rounded-xl text-red-700 text-xs text-left animate-pulse space-y-1">
                <p className="font-bold">🔒 Espace temporairement bloqué !</p>
                <p className="text-[10px] leading-relaxed text-red-600 font-medium">
                  Trop de tentatives erronées. Par mesure de protection financière, cet espace est inaccessible.
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[11px] font-black uppercase tracking-wider text-red-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                  <span>Réessayer dans {pinLockSeconds}s</span>
                </div>
              </div>
            ) : (
              <>
                {/* Visualizer Dots with shake error styling */}
                <div className={`flex justify-center gap-3.5 py-1 ${pinError ? "animate-shake" : ""}`}>
                  {[0, 1, 2, 3].map((idx) => {
                    const hasDigit = idx < vendeurPinInput.length;
                    return (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-full border transition-all duration-300 ${
                          pinError
                            ? "bg-red-600 border-red-600 animate-shake"
                            : hasDigit
                              ? "bg-[#0b4d26] border-[#0b4d26] scale-110 shadow-sm"
                              : "border-stone-300 bg-stone-100"
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">
                  {pinAttemptsLeft === 5 ? (
                    <span className="text-stone-400">Équipement hautement sécurisé</span>
                  ) : pinAttemptsLeft <= 2 ? (
                    <span className="text-rose-600 animate-pulse font-extrabold">⚠️ Attention : plus que {pinAttemptsLeft} tentatives</span>
                  ) : (
                    <span className="text-amber-600">{pinAttemptsLeft} tentatives restantes</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Numeric PIN Pad Grid */}
        <div className="grid grid-cols-3 gap-3.5 max-w-[240px] mx-auto mt-4 select-none w-full">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              disabled={pinError || pinLockSeconds > 0}
              onClick={() => handlePinKeyPress(num)}
              className="w-14 h-14 rounded-full border border-stone-200/80 hover:border-[#0b4d26] flex items-center justify-center font-bold text-base text-neutral-800 bg-white hover:bg-emerald-50/20 active:scale-95 transition-all cursor-pointer disabled:opacity-30"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={pinLockSeconds > 0}
            onClick={handleClear}
            className="w-14 h-14 rounded-full flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-neutral-900 cursor-pointer transition-all disabled:opacity-30"
          >
            Effacer
          </button>
          <button
            type="button"
            disabled={pinError || pinLockSeconds > 0}
            onClick={() => handlePinKeyPress("0")}
            className="w-14 h-14 rounded-full border border-stone-200/80 hover:border-[#0b4d26] flex items-center justify-center font-bold text-base text-neutral-800 bg-white hover:bg-emerald-50/20 active:scale-95 transition-all cursor-pointer disabled:opacity-30"
          >
            0
          </button>
          <button
            type="button"
            disabled={pinLockSeconds > 0}
            onClick={handleBackspace}
            className="w-14 h-14 rounded-full flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-neutral-900 cursor-pointer transition-all disabled:opacity-30"
          >
            Retour
          </button>
        </div>

        {hasPin && (
          <div className="mt-5 flex flex-col gap-1.5 w-full">
            <button
              type="button"
              onClick={() => {
                setIsResettingPin(true);
                setResetStep("password");
              }}
              className="text-[10px] text-amber-600 hover:text-amber-700 font-extrabold uppercase tracking-wider bg-transparent border-0 cursor-pointer"
            >
              Code PIN oublié ? Réinitialiser
            </button>
          </div>
        )}

        <div className="mt-5 border-t border-stone-200 pt-4 w-full">
          <button
            type="button"
            onClick={() => {
              setCurrentView("menu");
              setActiveTab("client");
            }}
            className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 flex items-center justify-center gap-1.5 mx-auto bg-transparent border-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au site principal</span>
          </button>
        </div>
      </div>
    );
  };

  const renderAffilieSecurityGateway = () => {
    const hasPin = !!user?.affiliatePin;

    const handlePinKeyPress = async (digit: string) => {
      if (affiliePinError || affiliePinLockSeconds > 0) return;
      if (hasPin) {
        if (affiliePinInput.length < 4) {
          const newVal = affiliePinInput + digit;
          setAffiliePinInput(newVal);
          if (newVal.length === 4) {
            try {
              const res = await fetch("/api/auth/verify-pin", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": token || ""
                },
                body: JSON.stringify({ pin: newVal, type: "affiliate" })
              });
              const data = await res.json();
              if (data.success) {
                setIsAffilieUnlocked(true);
                setAffiliePinInput("");
                setAffiliePinAttemptsLeft(5);
                showToast("🔓 Espace affilié déverrouillé avec succès !");
              } else {
                setAffiliePinError(true);
                const remainingAttempts = typeof data.failedAttempts !== "undefined" ? Math.max(0, 5 - data.failedAttempts) : 4;
                setAffiliePinAttemptsLeft(remainingAttempts);
                if (remainingAttempts === 0) {
                  setAffiliePinLockSeconds(300);
                }
                setTimeout(() => {
                  setAffiliePinInput("");
                  setAffiliePinError(false);
                }, 600);
                showToast(`❌ ${data.error || "Code PIN incorrect."}`);
              }
            } catch {
              showToast("Erreur lors de la vérification du code PIN.");
            }
          }
        }
      } else {
        // SETUP MODE
        if (affiliePinSetupValue.length < 4) {
          setAffiliePinSetupValue(prev => prev + digit);
        } else if (affiliePinSetupConfirm.length < 4) {
          setAffiliePinSetupConfirm(prev => prev + digit);
        }
      }
    };

    const handleBackspace = () => {
      if (affiliePinLockSeconds > 0) return;
      if (hasPin) {
        setAffiliePinInput(prev => prev.slice(0, -1));
      } else {
        if (affiliePinSetupConfirm.length > 0) {
          setAffiliePinSetupConfirm(prev => prev.slice(0, -1));
        } else {
          setAffiliePinSetupValue(prev => prev.slice(0, -1));
        }
      }
    };

    const handleClear = () => {
      if (affiliePinLockSeconds > 0) return;
      if (hasPin) {
        setAffiliePinInput("");
      } else {
        setAffiliePinSetupValue("");
        setAffiliePinSetupConfirm("");
      }
    };

    const handlePinSetupSubmit = async () => {
      if (affiliePinSetupValue.length !== 4) {
        showToast("Le code PIN doit comporter exactement 4 chiffres.");
        return;
      }
      if (affiliePinSetupValue !== affiliePinSetupConfirm) {
        showToast("Les deux codes saisis ne correspondent pas.");
        setAffiliePinSetupConfirm("");
        return;
      }

      try {
        const res = await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token || ""
          },
          body: JSON.stringify({ affiliatePin: affiliePinSetupValue })
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setIsAffilieUnlocked(true);
          setAffiliePinSetupValue("");
          setAffiliePinSetupConfirm("");
          showToast("🔒 Code PIN configuré ! Votre espace affilié est désormais sécurisé.");
        } else {
          showToast(`Erreur : ${data.error}`);
        }
      } catch {
        showToast("Erreur lors de la configuration du code PIN.");
      }
    };

    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAffilieResetError("");
      if (!affilieResetPasswordInput) {
        setAffilieResetError("Veuillez saisir votre mot de passe.");
        return;
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: user?.email,
            password: affilieResetPasswordInput
          })
        });
        const data = await res.json();
        if (data.success) {
          setAffilieResetStep("new_pin");
          setAffilieResetPasswordInput("");
          showToast("Saisie validée. Définissez votre nouveau code PIN.");
        } else {
          setAffilieResetError("Mot de passe incorrect.");
        }
      } catch {
        setAffilieResetError("Erreur lors de la vérification du mot de passe.");
      }
    };

    const handleNewPinResetSubmit = async () => {
      if (affiliePinSetupValue.length !== 4) {
        showToast("Le code PIN doit comporter 4 chiffres.");
        return;
      }
      if (affiliePinSetupValue !== affiliePinSetupConfirm) {
        showToast("Les codes PIN ne correspondent pas.");
        setAffiliePinSetupConfirm("");
        return;
      }

      try {
        const res = await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token || ""
          },
          body: JSON.stringify({ affiliatePin: affiliePinSetupValue })
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setIsAffilieUnlocked(true);
          setIsResettingAffiliePin(false);
          setAffilieResetStep("password");
          setAffiliePinSetupValue("");
          setAffiliePinSetupConfirm("");
          showToast("🔓 Code PIN réinitialisé et espace déverrouillé !");
        } else {
          showToast(`Erreur : ${data.error}`);
        }
      } catch {
        showToast("Erreur lors de l'enregistrement du code PIN.");
      }
    };

    if (isResettingAffiliePin) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[450px] p-6 bg-white rounded-2xl border border-stone-200 shadow-sm max-w-md mx-auto my-auto text-left font-sans animate-fade-in select-none">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-200">
            <Lock className="w-6 h-6 text-emerald-600" />
          </div>

          <h3 className="font-display font-extrabold uppercase text-xs tracking-wider text-neutral-900 mb-1">
            Réinitialiser votre Code PIN
          </h3>
          <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest mb-6">
            Sécurité Espace Affilié
          </p>

          {affilieResetStep === "password" ? (
            <form onSubmit={handleResetPasswordSubmit} className="w-full space-y-4">
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Par mesure de sécurité, veuillez saisir le mot de passe de votre compte client Miabé Asi pour configurer un nouveau code PIN.
              </p>
              
              <div>
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                  Mot de passe de votre compte
                </label>
                <input
                  type="password"
                  value={affilieResetPasswordInput}
                  onChange={(e) => setAffilieResetPasswordInput(e.target.value)}
                  placeholder="Saisissez votre mot de passe"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                  required
                />
                {affilieResetError && (
                  <p className="text-[10px] text-red-600 font-bold mt-1.5">{affilieResetError}</p>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingAffiliePin(false);
                    setAffilieResetError("");
                    setAffilieResetPasswordInput("");
                  }}
                  className="flex-1 py-2 border border-stone-200 hover:bg-stone-50 text-neutral-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center bg-transparent"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Confirmer
                </button>
              </div>
            </form>
          ) : (
            <div className="w-full space-y-4 text-center">
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Choisissez un nouveau code PIN à 4 chiffres facile à retenir mais difficile à deviner.
              </p>

              {/* Secure Dots Visualizer */}
              <div className="flex flex-col items-center gap-4 py-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-neutral-400 mb-2">
                    {affiliePinSetupValue.length < 4 ? "Saisir le nouveau PIN" : "Confirmer le nouveau PIN"}
                  </p>
                  <div className="flex justify-center gap-3">
                    {[0, 1, 2, 3].map((idx) => {
                      const hasDigit = affiliePinSetupValue.length < 4
                        ? idx < affiliePinSetupValue.length
                        : idx < affiliePinSetupConfirm.length;
                      return (
                        <div
                          key={idx}
                          className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                            hasDigit
                              ? "bg-emerald-600 border-emerald-600 scale-110 shadow-xs"
                              : "border-stone-300 bg-stone-100"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {affiliePinSetupValue.length === 4 && affiliePinSetupConfirm.length === 4 && (
                  <button
                    type="button"
                    onClick={handleNewPinResetSubmit}
                    className="mt-2 px-6 py-2 bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-emerald-700 cursor-pointer transition-all"
                  >
                    Valider le code PIN
                  </button>
                )}
              </div>

              {/* Digital Pad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto select-none">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinKeyPress(num)}
                    className="w-14 h-14 rounded-full border border-stone-200 hover:border-neutral-900 flex items-center justify-center font-bold text-base text-neutral-800 bg-stone-50 hover:bg-white active:scale-95 transition-all cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-neutral-900 cursor-pointer transition-all"
                >
                  Effacer
                </button>
                <button
                  type="button"
                  onClick={() => handlePinKeyPress("0")}
                  className="w-14 h-14 rounded-full border border-stone-200 hover:border-neutral-900 flex items-center justify-center font-bold text-base text-neutral-800 bg-stone-50 hover:bg-white active:scale-95 transition-all cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-neutral-900 cursor-pointer transition-all"
                >
                  Retour
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] p-6 bg-[#FAF9F5] rounded-2xl border border-stone-200 shadow-sm max-w-sm mx-auto my-auto text-center font-sans animate-fade-in select-none">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 relative">
          <Lock className="w-6 h-6 text-emerald-600 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-emerald-600 animate-ping opacity-25" style={{ animationDuration: "3s" }} />
        </div>

        <h3 className="font-display font-extrabold uppercase text-xs tracking-wider text-neutral-900 mb-1">
          {hasPin ? "Déverrouiller l'Espace Affilié" : "Sécurisez votre Espace Affilié"}
        </h3>
        <p className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-widest mb-4">
          Protection d'accès Miabé Asi
        </p>

        {!hasPin ? (
          // SETUP FLOW
          <div className="space-y-4 w-full">
            <p className="text-[11.5px] text-neutral-500 leading-relaxed px-2">
              Pour protéger votre portefeuille d'affiliation, vos commissions d'argent et vos gains cumulés, veuillez définir un <strong>code PIN de sécurité à 4 chiffres</strong>.
            </p>

            {/* Visualizer Dots */}
            <div className="flex flex-col items-center gap-2 py-2">
              <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">
                {affiliePinSetupValue.length < 4 ? "Saisir le Code PIN" : "Confirmer le Code PIN"}
              </p>
              
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => {
                  const hasDigit = affiliePinSetupValue.length < 4
                    ? idx < affiliePinSetupValue.length
                    : idx < affiliePinSetupConfirm.length;
                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                        hasDigit
                          ? "bg-emerald-600 border-emerald-600 scale-110 shadow-xs"
                          : "border-stone-300 bg-stone-100"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {affiliePinSetupValue.length === 4 && affiliePinSetupConfirm.length === 4 && (
              <button
                type="button"
                onClick={handlePinSetupSubmit}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-sm"
              >
                Activer et sécuriser l'espace
              </button>
            )}
          </div>
        ) : (
          // UNLOCK FLOW
          <div className="space-y-5 w-full">
            <p className="text-[11.5px] text-neutral-500 leading-relaxed">
              Veuillez saisir votre code PIN de sécurité secret pour accéder à votre espace affilié.
            </p>

            {affiliePinLockSeconds > 0 ? (
              <div className="bg-red-50 border border-red-200/60 p-3.5 rounded-xl text-red-700 text-xs text-left animate-pulse space-y-1">
                <p className="font-bold">🔒 Espace temporairement bloqué !</p>
                <p className="text-[10px] leading-relaxed text-red-600 font-medium">
                  Trop de tentative erronées. Par mesure de protection financière, cet espace est inaccessible.
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[11px] font-black uppercase tracking-wider text-red-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                  <span>Réessayer dans {affiliePinLockSeconds}s</span>
                </div>
              </div>
            ) : (
              <>
                {/* Visualizer Dots with shake error styling */}
                <div className={`flex justify-center gap-3.5 py-1 ${affiliePinError ? "animate-shake" : ""}`}>
                  {[0, 1, 2, 3].map((idx) => {
                    const hasDigit = idx < affiliePinInput.length;
                    return (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-full border transition-all duration-300 ${
                          affiliePinError
                            ? "bg-red-600 border-red-600 animate-shake"
                            : hasDigit
                              ? "bg-emerald-600 border-emerald-600 scale-110 shadow-sm"
                              : "border-stone-300 bg-stone-100"
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">
                  {affiliePinAttemptsLeft === 5 ? (
                    <span className="text-stone-400">Équipement hautement sécurisé</span>
                  ) : affiliePinAttemptsLeft <= 2 ? (
                    <span className="text-rose-600 animate-pulse font-extrabold">⚠️ Attention : plus que {affiliePinAttemptsLeft} tentatives</span>
                  ) : (
                    <span className="text-amber-600">{affiliePinAttemptsLeft} tentatives restantes</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto mt-4 select-none">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              disabled={affiliePinError || affiliePinLockSeconds > 0}
              onClick={() => handlePinKeyPress(num)}
              className="w-14 h-14 rounded-full border border-stone-200/85 hover:border-[#0b4d26] flex items-center justify-center font-bold text-base text-neutral-800 bg-white hover:bg-emerald-50/20 active:scale-95 transition-all cursor-pointer disabled:opacity-30"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={affiliePinLockSeconds > 0}
            onClick={handleClear}
            className="w-14 h-14 rounded-full flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-neutral-900 cursor-pointer transition-all disabled:opacity-30"
          >
            Effacer
          </button>
          <button
            type="button"
            disabled={affiliePinError || affiliePinLockSeconds > 0}
            onClick={() => handlePinKeyPress("0")}
            className="w-14 h-14 rounded-full border border-stone-200/80 hover:border-[#0b4d26] flex items-center justify-center font-bold text-base text-neutral-800 bg-white hover:bg-emerald-50/20 active:scale-95 transition-all cursor-pointer disabled:opacity-30"
          >
            0
          </button>
          <button
            type="button"
            disabled={affiliePinLockSeconds > 0}
            onClick={handleBackspace}
            className="w-14 h-14 rounded-full flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-neutral-900 cursor-pointer transition-all disabled:opacity-30"
          >
            Retour
          </button>
        </div>

        {hasPin && (
          <div className="mt-5 flex flex-col gap-1.5 w-full">
            <button
              type="button"
              onClick={() => {
                setIsResettingAffiliePin(true);
                setAffilieResetStep("password");
              }}
              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-extrabold uppercase tracking-wider bg-transparent border-0 cursor-pointer"
            >
              Code PIN oublié ? Réinitialiser
            </button>
          </div>
        )}

        <div className="mt-5 border-t border-stone-200 pt-4 w-full">
          <button
            type="button"
            onClick={() => {
              setCurrentView("menu");
              setActiveTab("client");
            }}
            className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-950 flex items-center justify-center gap-1.5 mx-auto bg-transparent border-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au site principal</span>
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
      setEditQuartier(user.quartier || "");
    }
  }, [user]);

  const handleProfileUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast("Le nom est obligatoire");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          quartier: editQuartier
        })
      });

      const data = await res.json();
      setIsUpdatingProfile(false);
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        showToast("✓ Profil enregistré avec succès !");
        setCurrentView("menu");
      } else {
        showToast(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setIsUpdatingProfile(false);
      console.error("Profile update error", err);
      showToast("Erreur de connexion.");
    }
  };

  // Client States
  const [clientOrders, setClientOrders] = useState<any[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Seller States
  const [vendeurMode, setVendeurMode] = useState<"autonome" | "assiste">("autonome");
  const [businessName, setBusinessName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  
  // Seller Registration Wizard States (Marketplace Onboarding)
  const [vendeurStep, setVendeurStep] = useState<"preferences" | "name" | "stock" | "payout" | "activation">("preferences");
  const [shopLanguage, setShopLanguage] = useState("Français (FR)");
  const [shopCountry, setShopCountry] = useState("Togo (TG)");
  const [shopCurrency, setShopCurrency] = useState("FCFA (XOF)");
  
  // First Listing states
  const [firstListingName, setFirstListingName] = useState("");
  const [firstListingPrice, setFirstListingPrice] = useState("");
  const [firstListingDesc, setFirstListingDesc] = useState("");
  const [firstListingCategory, setFirstListingCategory] = useState("Made in Togo Premium");
  const [firstListingImageUrl, setFirstListingImageUrl] = useState("https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400");
  
  // Payout info state
  const [sellerPayoutType, setSellerPayoutType] = useState<"Mix by Yas" | "Flooz" | "Virement" | "PayDunya">("PayDunya");
  const [sellerPayoutNumber, setSellerPayoutNumber] = useState("");
  
  const [acceptedCGU, setAcceptedCGU] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<"Offre 1" | "Offre 2" | "Offre 3">("Offre 1");
  const [paymentMethod, setPaymentMethod] = useState<"Mix by Yas" | "Flooz" | "PayDunya">("PayDunya");
  const [paymentTxId, setPaymentTxId] = useState("AUTO-" + Math.floor(100000 + Math.random() * 900000));
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  
  // New Product Form States
  const [newProdName, setNewProdName] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdPriceBarre, setNewProdPriceBarre] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Produits alimentaires");
  const [newProdImageUrl, setNewProdImageUrl] = useState("");
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [isEditingProduct, setIsEditingProduct] = useState<any | null>(null);

  // Redesigned Seller Dashboard States
  const [sellerActiveSubTab, setSellerActiveSubTab] = useState<string>("dashboard");
  const [sellerSearchQuery, setSellerSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [reviewsFilter, setReviewsFilter] = useState<number | null>(null);
  const [replyTextMap, setReplyTextMap] = useState<{[reviewId: string]: string}>({});
  const [localReviewReplies, setLocalReviewReplies] = useState<{[reviewId: string]: string[]}>({});
  const [localReviewList, setLocalReviewList] = useState<any[]>([
    { id: "rev_1", clientName: "Abalo K.", productName: "Pure Miel Sauvage", rating: 5, comment: "Excellente qualité de miel, livraison rapide à Lomé. Je recommande vivement !", date: "2026-06-25", replies: [] },
    { id: "rev_2", clientName: "Mawussi T.", productName: "Savon Noir au Curcuma", rating: 4, comment: "Très bon pour la peau, mousse bien. Petit retard de livraison de quelques heures.", date: "2026-06-23", replies: ["Merci pour votre retour ! Nous travaillons à améliorer les délais avec notre livreur."] },
    { id: "rev_3", clientName: "Koffi A.", productName: "Farine de Manioc de Kpalimé", rating: 5, comment: "Superbe ! Parfait pour faire le fufu. Très propre.", date: "2026-06-20", replies: [] },
    { id: "rev_4", clientName: "Emefa S.", productName: "Café Robusta Moulu", rating: 3, comment: "Le goût est bon mais le sachet s'est un peu ouvert pendant le transport.", date: "2026-06-18", replies: [] }
  ]);
  const [localMessageList, setLocalMessageList] = useState<any[]>([
    { id: "msg_1", senderName: "Komi Mensah", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", preview: "Bonjour, est-ce que le miel de 1L est disponible en stock ?", time: "Il y a 10 min", read: false, chatHistory: [
      { sender: "client", text: "Bonjour, est-ce que le miel de 1L est disponible en stock ?", time: "10:15" }
    ]},
    { id: "msg_2", senderName: "Amivi Lawson", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", preview: "Le savon convient-il aux peaux très sensibles ?", time: "Il y a 2 heures", read: true, chatHistory: [
      { sender: "client", text: "Le savon convient-il aux peaux très sensibles ?", time: "08:12" },
      { sender: "seller", text: "Bonjour Amivi ! Oui, notre savon au curcuma est 100% naturel et sans additifs chimiques, parfait pour les peaux sensibles.", time: "08:30" },
      { sender: "client", text: "Super, merci ! Je vais passer commande.", time: "08:45" }
    ]},
    { id: "msg_3", senderName: "Marc Wilson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", preview: "Livrez-vous à Kara ?", time: "Hier", read: true, chatHistory: [
      { sender: "client", text: "Livrez-vous à Kara ?", time: "Hier 14:00" },
      { sender: "seller", text: "Bonjour Marc, oui, nous livrons partout au Togo sous 48 heures via le point relais de Kara.", time: "Hier 15:10" }
    ]}
  ]);
  const [activeChatId, setActiveChatId] = useState<string | null>("msg_1");
  const [chatInputText, setChatInputText] = useState("");
  const [localPromotions, setLocalPromotions] = useState<any[]>([
    { id: "promo_1", code: "MIABEASI10", reduction: "10%", type: "Percentage", applyTo: "Tous les produits", status: "Active", usedCount: 14, expiry: "2026-08-31" },
    { id: "promo_2", code: "LOME500", reduction: "500 FCFA", type: "Fixed", applyTo: "Savon Noir au Curcuma", status: "Active", usedCount: 8, expiry: "2026-07-31" },
    { id: "promo_3", code: "FESTIVAL20", reduction: "20%", type: "Percentage", applyTo: "Miel Sauvage", status: "Expirée", usedCount: 32, expiry: "2026-06-15" }
  ]);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoReduc, setNewPromoReduc] = useState("");
  const [newPromoType, setNewPromoType] = useState("Percentage");
  const [newPromoExpiry, setNewPromoExpiry] = useState("2026-12-31");

  // Affiliate States
  const [isCopied, setIsCopied] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState<string>("Mix by Yas");
  const [withdrawalPhone, setWithdrawalPhone] = useState("");
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);

  // Notifications list
  const [notifications, setNotifications] = useState<any[]>([]);

  // Help Center States
  const [helpCategory, setHelpCategory] = useState<"general" | "buyer" | "seller" | "affiliate" | "logistics">("general");
  const [helpSearchQuery, setHelpSearchQuery] = useState("");

  const categories = [
    "Ustensiles de cuisine",
    "Meubles & Décoration",
    "Électronique",
    "Audio & Radio",
    "Gadgets électroniques",
    "Télévision",
    "Mode & beauté",
    "Bébé & Enfant",
    "Sports & Accessoires",
    "Univers femme",
    "Univers homme"
  ];

  // Load dashboards data
  useEffect(() => {
    if (!token) return;
    
    // Fetch notifications
    fetch("/api/auth/notifications", {
      headers: { "Authorization": token }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setNotifications(data);
    });

    // Fetch user orders
    fetch("/api/orders/my-orders", {
      headers: { "Authorization": token }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        if (user.role === "vendeur") {
          setSellerOrders(data);
        } else {
          setClientOrders(data);
        }
      }
    });

    // Fetch withdrawals history and wallet ledger if seller or affiliate
    if (user.role === "vendeur" || user.role === "affilie") {
      fetch("/api/withdrawals/my-withdrawals", {
        headers: { "Authorization": token || "" }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWithdrawalHistory(data);
      });

      fetch("/api/wallets/my-wallet", {
        headers: { "Authorization": token || "" }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.wallet) {
          setWallet(data.wallet);
        }
      })
      .catch(err => console.error("Error loading wallet details:", err));
    }
  }, [user.role, token]);

  // Handle Affiliate Link copy
  const handleCopyLink = () => {
    const affiliateCode = user.affiliateCode || "";
    const currentOrigin = window.location.origin;
    const affiliateLink = `${currentOrigin}/?ref=${affiliateCode}`;
    
    navigator.clipboard.writeText(affiliateLink).then(() => {
      setIsCopied(true);
      showToast("Lien d'affiliation copié !");
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // Switch role action
  const handleRoleUpgrade = async (newRole: "vendeur" | "affilie", extraPayload = {}) => {
    try {
      const payload: any = { role: newRole, ...extraPayload };
      if (newRole === "vendeur" && !payload.action) {
        payload.vendeurMode = vendeurMode;
        payload.businessName = businessName || user.name;
        payload.contactPhone = sellerPhone || user.phone || "";
        payload.vendeurSubscription = selectedSubscription;
        payload.vendeurPaymentMethod = paymentMethod;
        payload.vendeurPaymentTxId = paymentTxId;
      }

      setIsSubmittingReg(true);
      const res = await fetch("/api/auth/role-upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setIsSubmittingReg(false);
      if (data.success) {
        setUser(data.user);
        if (newRole === "vendeur") {
          if (payload.action === "confirm_payment") {
            showToast("✓ Espace vendeur activé !");
          } else {
            showToast("✓ Inscription enregistrée ! En attente d'activation.");
          }
        } else {
          showToast("✓ Espace affilié activé avec succès !");
        }
      } else {
        showToast(`Erreur : ${data.error}`);
      }
    } catch (err) {
      setIsSubmittingReg(false);
      showToast("Erreur de connexion.");
    }
  };

  // Submit product (Create or Edit)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      showToast("Veuillez remplir les champs obligatoires.");
      return;
    }

    const prix = Number(newProdPrice);
    const subscription = user?.vendeurSubscription;

    if (user?.role === "vendeur" && subscription) {
      if (subscription === "Offre 1") {
        if (prix > 1000) {
          showToast("Votre abonnement (Offre 1) limite le prix de vos produits à un maximum de 1 000 FCFA. Veuillez modifier le prix ou changer d'abonnement.");
          return;
        }
      } else if (subscription === "Offre 2") {
        if (prix > 5000) {
          showToast("Votre abonnement (Offre 2) limite le prix de vos produits à un maximum de 5 000 FCFA. Veuillez modifier le prix ou changer d'abonnement.");
          return;
        }
      }
      // Offre 3 is premium and has absolutely no price limits!
    }

    try {
      const productPayload = {
        auth: "asime2026",
        id: isEditingProduct ? isEditingProduct.id : "prod_" + Date.now().toString(),
        nom: newProdName,
        description: newProdDesc,
        prix: prix,
        prixBarre: newProdPriceBarre ? Number(newProdPriceBarre) : null,
        stock: Number(newProdStock || 0),
        categorie: newProdCategory,
        partenaire: user?.businessName || user?.name || "Artisan Miabé Asi",
        vendeurId: user?.id,
        images: newProdImages && newProdImages.length > 0 ? newProdImages : [newProdImageUrl || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80"],
        statut: "Disponible"
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify(productPayload)
      });

      const data = await res.json();
      if (data.success) {
        // Refresh local products list
        if (isEditingProduct) {
          setProducts(prev => prev.map(p => p.id === isEditingProduct.id ? data.product : p));
          showToast("Produit mis à jour avec succès !");
        } else {
          setProducts(prev => [data.product, ...prev]);
          showToast("Produit publié avec succès !");
        }
        setIsAddProductOpen(false);
        setIsEditingProduct(null);
        // Reset fields
        setNewProdName("");
        setNewProdDesc("");
        setNewProdPrice("");
        setNewProdPriceBarre("");
        setNewProdStock("");
        setNewProdImageUrl("");
      } else {
        showToast(`Erreur : ${data.error}`);
      }
    } catch (err) {
      showToast("Erreur lors de l'enregistrement du produit.");
    }
  };

  // Delete product
  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: "DELETE",
        headers: {
          "Authorization": "asime2026"
        }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== prodId));
        showToast("Produit supprimé !");
      } else {
        showToast(`Erreur : ${data.error}`);
      }
    } catch (err) {
      showToast("Erreur lors de la suppression.");
    }
  };

  // Handle Withdrawal Request
  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalAmount || !withdrawalPhone) {
      showToast("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const res = await fetch("/api/withdrawals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify({
          amount: Number(withdrawalAmount),
          method: withdrawalMethod,
          phone: withdrawalPhone
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`✓ Demande de retrait de ${Number(withdrawalAmount).toLocaleString()} FCFA soumise !`);
        setWithdrawalAmount("");
        setWithdrawalPhone("");
        
        // Reload withdrawal history
        setWithdrawalHistory(prev => [data.withdrawal, ...prev]);

        // Trigger wallet reload
        fetch("/api/wallets/my-wallet", {
          headers: { "Authorization": token || "" }
        })
        .then(res => res.json())
        .then(wData => {
          if (wData.success && wData.wallet) {
            setWallet(wData.wallet);
          }
        })
        .catch(err => console.error("Error updating wallet state:", err));

        // Update local user stats available balance
        if (user.role === "affilie") {
          setUser({
            ...user,
            affiliateStats: {
              ...user.affiliateStats,
              commissionDisponible: data.userBalance
            }
          });
        } else if (user.role === "vendeur") {
          setUser({
            ...user,
            vendeurStats: {
              ...user.vendeurStats,
              revenusGeneres: data.userBalance
            }
          });
        }
      } else {
        showToast(`Erreur : ${data.error}`);
      }
    } catch (err) {
      showToast("Erreur lors de la demande de retrait.");
    }
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = async () => {
    try {
      const res = await fetch("/api/auth/notifications/mark-read", {
        method: "POST",
        headers: { "Authorization": token || "" }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        showToast("Notifications marquées comme lues.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit product review/evaluation
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForReview) return;

    try {
      const res = await fetch(`/api/products/${selectedProductForReview.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          userName: user.name
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast("✓ Merci ! Votre avis a été enregistré.");
        setIsReviewOpen(false);
        setSelectedProductForReview(null);
        setReviewComment("");
        setReviewRating(5);
      } else {
        showToast(`Erreur : ${data.error}`);
      }
    } catch (err) {
      showToast("Erreur lors de la soumission de l'évaluation.");
    }
  };

  // Filter products matching this seller's brand
  const sellerProducts = products.filter(p => p.partenaire === (user.businessName || user.name));

  const unreadNotifs = notifications.filter(n => !n.read).length;

  // Render help / FAQ view
  const renderHelpView = () => {
    const helpArticles = [
      {
        id: "reg-buyer",
        category: "buyer",
        question: "Comment s'inscrire en tant que membre / client de Miabé Asi ?",
        answer: (
          <div className="space-y-2">
            <p>Tout visiteur de Miabé Asi peut s'inscrire ou s'identifier instantanément sur notre plateforme :</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Cliquez sur l'icône de profil ou sur le bouton <strong>"Mon Espace"</strong> situé en haut à droite de l'écran principal.</li>
              <li>Saisissez vos informations personnelles : votre nom complet, votre numéro de téléphone (Mix by Yas ou Flooz de préférence) et votre quartier/ville de résidence au Togo.</li>
              <li>Validez l'inscription. Votre compte client est immédiatement créé !</li>
            </ol>
            <p className="text-neutral-500 italic mt-1 text-[10px]">Note : Vos commandes passées, votre panier actif, vos codes promos et vos articles favoris sont ainsi sauvegardés en toute sécurité et synchronisés sur tous vos navigateurs et téléphones.</p>
          </div>
        )
      },
      {
        id: "buy-process",
        category: "buyer",
        question: "Comment passer une commande sur Miabé Asi ?",
        answer: (
          <div className="space-y-2">
            <p>Acheter sur Miabé Asi soutient directement l'économie locale et les artisans du terroir. Voici comment procéder :</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li><strong>Parcourez le catalogue :</strong> Utilisez nos catégories (Épices, Miel, Produits alimentaires, Jus naturels, etc.) ou la barre de recherche globale pour trouver des produits authentiques 100% Made in Togo.</li>
              <li><strong>Ajoutez au panier :</strong> Sur la fiche produit, sélectionnez la quantité de votre choix puis cliquez sur <strong>"Ajouter au panier"</strong>.</li>
              <li><strong>Appliquez un coupon :</strong> Dans votre panier, si vous disposez d'un code de réduction (comme <code className="bg-neutral-100 px-1 py-0.5 rounded text-[#0b4d26] font-mono">MIABEASI2026</code> ou <code className="bg-neutral-100 px-1 py-0.5 rounded text-[#0b4d26] font-mono">TOGO15</code>), saisissez-le pour appliquer la remise immédiate.</li>
              <li><strong>Coordonnées de livraison :</strong> Précisez votre adresse de livraison exacte (ville, quartier, rue ou indications géographiques).</li>
              <li><strong>Moyen de paiement :</strong> Choisissez entre le paiement par transfert mobile (Mix by Yas / Flooz) ou le règlement direct en espèces lors de la livraison à domicile ou en point relais.</li>
            </ol>
          </div>
        )
      },
      {
        id: "seller-creation",
        category: "seller",
        question: "Comment créer un compte Vendeur et lancer son Espace Vendeur ?",
        answer: (
          <div className="space-y-2">
            <p>Miabé Asi met à votre disposition un assistant d'inscription en 5 étapes simples pour ouvrir votre e-boutique en quelques minutes :</p>
            <div className="space-y-2 text-neutral-700 bg-neutral-50 p-2.5 border border-neutral-100 text-[10.5px]">
              <p><strong>Étape 1 : Définition des Préférences :</strong> Vous configurez la langue par défaut de l'interface d'administration (Français), le pays d'implantation (Togo) et la devise principale de reversement (FCFA).</p>
              <p><strong>Étape 2 : Nom de votre Boutique :</strong> Donnez un nom unique à votre marque. Choisissez également votre mode de fonctionnement : 
                <br />• <span className="font-bold text-[#0b4d26]">Mode Autonome :</span> Vous gérez vous-même vos articles, vos tarifs et vos mises à jour.
                <br />• <span className="font-bold text-[#b8901c]">Mode Assisté :</span> Vous profitez de l'accompagnement complet et des conseils de l'équipe logistique de Miabé Asi pour vous aider au quotidien.
              </p>
              <p><strong>Étape 3 : Fiche Produit Initiale :</strong> Publiez votre tout premier article. Remplissez son nom, son tarif en FCFA, sa catégorie et joignez une photo de présentation pour attirer vos premiers clients.</p>
              <p><strong>Étape 4 : Choix des Reversements :</strong> Configurez votre compte de facturation (Mix by Yas ou Flooz) et le numéro de téléphone associé pour recevoir vos reversements de ventes directement.</p>
              <p><strong>Étape 5 : Formule d'Abonnement & Activation :</strong> Sélectionnez votre offre mensuelle (Débutant, Croissance ou Pro), payez l'inscription par transfert mobile sur notre numéro d'activation officiel, renseignez l'ID de transaction (TxID) et validez.</p>
            </div>
          </div>
        )
      },
      {
        id: "seller-activation",
        category: "seller",
        question: "Comment se passe la validation et l'activation du compte vendeur ?",
        answer: (
          <div className="space-y-2">
            <p>Une fois votre inscription finalisée, votre compte apparaît avec le statut <span className="bg-[#b8901c]/10 text-[#b8901c] px-1.5 py-0.5 rounded font-black">En attente d'activation</span>.</p>
            <p><strong>Processus de validation de Miabé Asi (sous 24h ouvrées) :</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Vérification du TxID :</strong> Nos administrateurs vérifient que le paiement de votre abonnement a bien été reçu sur le réseau de paiement sélectionné (Mix by Yas ou Flooz).</li>
              <li><strong>Contrôle de conformité Made in Togo :</strong> Nous analysons votre première fiche produit pour s'assurer qu'elle respecte notre charte de qualité locale.</li>
            <li>Une fois approuvé, votre compte passe au statut <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-black">Actif</span>. Votre <strong>Tableau de Bord Vendeur complet</strong> s'affiche automatiquement en remplacement de l'assistant d'inscription.</li>
            </ul>
          </div>
        )
      },
      {
        id: "seller-billing",
        category: "seller",
        question: "Quelles sont les formules d'abonnement vendeur de Miabé Asi ?",
        answer: (
          <div className="space-y-2">
            <p>Miabé Asi propose trois offres adaptées aux artisans locaux, coopératives et entreprises togolaises :</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1">
              <div className="border border-neutral-200 p-2 bg-neutral-50 rounded">
                <p className="font-extrabold text-neutral-900 text-[11px]">Offre Débutant (Offre 1)</p>
                <p className="font-bold text-[#b8901c] text-xs font-mono">1 000 FCFA / mois</p>
                <p className="text-[10px] text-neutral-500 mt-1">Frais de commission de Miabé Asi limités à 10%. Convient aux petits créateurs indépendants.</p>
              </div>
              <div className="border border-neutral-200 p-2 bg-neutral-50 rounded">
                <p className="font-extrabold text-neutral-900 text-[11px]">Offre Croissance (Offre 2)</p>
                <p className="font-bold text-[#b8901c] text-xs font-mono">3 000 FCFA / mois</p>
                <p className="text-[10px] text-neutral-500 mt-1">Frais réduits à 8%. Mise en avant de vos produits phares et statistiques avancées.</p>
              </div>
              <div className="border border-neutral-200 p-2 bg-neutral-50 rounded">
                <p className="font-extrabold text-neutral-900 text-[11px]">Offre Pro (Offre 3)</p>
                <p className="font-bold text-[#b8901c] text-xs font-mono">5 000 FCFA / mois</p>
                <p className="text-[10px] text-neutral-500 mt-1">Seulement 5% de commission. Support prioritaire 7j/7, accès multi-utilisateurs et rapports.</p>
              </div>
            </div>
            <p className="text-neutral-500 text-[10px] italic mt-1">Les abonnements sont sans engagement et renouvelables mensuellement par Mix by Yas ou Flooz.</p>
          </div>
        )
      },
      {
        id: "inventory-guide",
        category: "seller",
        question: "Comment ajouter, éditer et gérer mes produits locaux ?",
        answer: (
          <div className="space-y-2">
            <p>Pour enrichir votre boutique de nouveaux articles :</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Rendez-vous dans votre Espace Vendeur, puis allez dans l'onglet <strong>"Produits"</strong>.</li>
              <li>Cliquez sur le bouton <strong>"+ Ajouter un produit"</strong>.</li>
              <li>Entrez les détails requis : nom de l'article, prix de vente en FCFA, quantité en stock, description (ingrédients, vertus, utilisation, etc.), catégorie et une photo.</li>
              <li>Cliquez sur <strong>"Publier"</strong>. Votre article est directement visible par tous les acheteurs de la plateforme.</li>
              <li>Pour modifier ou supprimer un produit existant, cliquez simplement sur les boutons d'action <strong>Modifier</strong> ou <strong>Supprimer</strong> sur la ligne correspondante de votre tableau de bord.</li>
            </ol>
          </div>
        )
      },
      {
        id: "orders-shipments",
        category: "seller",
        question: "Comment se déroule la gestion des commandes et de la logistique ?",
        answer: (
          <div className="space-y-2">
            <p>La logistique de Miabé Asi est conçue pour simplifier la vie de nos créateurs locaux :</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li><strong>Notification de commande :</strong> Dès qu'un client achète un produit de votre boutique, vous recevez une notification en temps réel.</li>
              <li><strong>Vérification :</strong> Allez dans l'onglet <strong>"Commandes"</strong> de votre Espace Vendeur pour voir les articles achetés, les informations du destinataire et son numéro.</li>
              <li><strong>Préparation :</strong> Conditionnez soigneusement vos articles dans un emballage adapté sous 24h ouvrées.</li>
              <li><strong>Prise en charge de Miabé Asi :</strong> Notre équipe logistique ou nos livreurs partenaires passent récupérer le colis à votre adresse ou point relais de collecte pour l'acheminer chez l'acheteur.</li>
            </ol>
          </div>
        )
      },
      {
        id: "charte-togo",
        category: "logistics",
        question: "Qu'est-ce que la Charte du Made in Togo de Miabé Asi ?",
        answer: (
          <div className="space-y-2">
            <p>La <strong>Charte d'Exclusivité du Terroir Togolais</strong> garantit l'authenticité de Miabé Asi :</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Tous les articles répertoriés sur la plateforme doivent être produits, cultivés, transformés, cousus ou récoltés de manière légitime sur le territoire togolais.</li>
              <li>Les articles importés de l'étranger, les produits de revente internationale ou les contrefaçons sont strictement interdits sous peine de suspension immédiate de la boutique.</li>
              <li>Nous valorisons le savoir-faire de nos producteurs (cosmétiques naturels, agroalimentaire local, miel sauvage, épices séchées, vêtements locaux).</li>
            </ul>
          </div>
        )
      },
      {
        id: "affiliate-guide",
        category: "affiliate",
        question: "Comment fonctionne l'Espace Affiliation & Partage de liens ?",
        answer: (
          <div className="space-y-2">
            <p>Le programme d'affiliation de Miabé Asi permet à tout ambassadeur du Made in Togo de monétiser son audience ou son réseau :</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Rendez-vous dans votre <strong>Espace Affilié</strong> (onglet "Recommander").</li>
              <li>Copiez votre <strong>Lien d'Affiliation Global</strong> ou générez un lien spécifique pour l'un de nos produits phares.</li>
              <li>Partagez ce lien sur vos réseaux sociaux (WhatsApp, TikTok, Facebook, Instagram) ou avec vos proches.</li>
              <li>Chaque fois qu'un utilisateur clique sur votre lien d'affiliation et valide un achat sous 30 jours, vous recevez automatiquement une **commission d'affiliation** créditée sur votre portefeuille.</li>
            </ol>
          </div>
        )
      },
      {
        id: "wallet-withdrawals",
        category: "affiliate",
        question: "Comment retirer ses fonds (gains de vente ou d'affiliation) ?",
        answer: (
          <div className="space-y-2">
            <p>Vos revenus cumulés sont conservés en toute sécurité dans votre <strong>Portefeuille Électronique Local</strong> de Miabé Asi. Pour effectuer un retrait :</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Allez dans l'onglet <strong>"Portefeuille"</strong> de votre Tableau de bord.</li>
              <li>Sélectionnez votre méthode de paiement préférée : <strong>Mix by Yas</strong> ou <strong>Flooz</strong>.</li>
              <li>Renseignez le montant que vous désirez retirer (minimum de <strong>5 000 FCFA</strong> requis pour la sécurité de la transaction).</li>
              <li>Saisissez votre numéro de téléphone mobile de paiement.</li>
              <li>Cliquez sur <strong>"Soumettre la demande de retrait"</strong>.</li>
            </ol>
            <p className="text-[#0b4d26] font-bold mt-1.5">✓ Les fonds sont envoyés directement sur votre mobile sous 12 à 24 heures ouvrées après validation par notre service financier.</p>
          </div>
        )
      }
    ];

    // Filter articles based on selected tab category and search query
    const filteredArticles = helpArticles.filter(art => {
      const matchCategory = helpCategory === "general" ? true : art.category === helpCategory;
      const matchSearch = helpSearchQuery.trim() === "" ? true : (
        art.question.toLowerCase().includes(helpSearchQuery.toLowerCase()) || 
        (typeof art.answer === "string" ? art.answer : art.id).toLowerCase().includes(helpSearchQuery.toLowerCase())
      );
      return matchCategory && matchSearch;
    });

    return (
      <div className="space-y-5 text-left animate-fade-in font-sans">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un guide, un processus, ou une étape..."
            value={helpSearchQuery}
            onChange={(e) => setHelpSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#0b4d26] focus:border-[#0b4d26]"
          />
          <div className="absolute left-3 top-2.5 text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {helpSearchQuery && (
            <button 
              onClick={() => setHelpSearchQuery("")} 
              className="absolute right-3 top-2.5 text-xs font-bold text-neutral-400 hover:text-neutral-600"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1 border-b border-neutral-200 pb-1.5">
          <button
            onClick={() => setHelpCategory("general")}
            className={`px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-tight transition-all border-b-2 ${helpCategory === "general" ? "border-[#0b4d26] text-[#0b4d26] bg-[#0b4d26]/5" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
          >
            📋 Tous les guides
          </button>
          <button
            onClick={() => setHelpCategory("buyer")}
            className={`px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-tight transition-all border-b-2 ${helpCategory === "buyer" ? "border-[#0b4d26] text-[#0b4d26] bg-[#0b4d26]/5" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
          >
            🛍️ Acheter
          </button>
          <button
            onClick={() => setHelpCategory("seller")}
            className={`px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-tight transition-all border-b-2 ${helpCategory === "seller" ? "border-[#0b4d26] text-[#0b4d26] bg-[#0b4d26]/5" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
          >
            🏪 Vendre & Boutique
          </button>
          <button
            onClick={() => setHelpCategory("affiliate")}
            className={`px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-tight transition-all border-b-2 ${helpCategory === "affiliate" ? "border-[#0b4d26] text-[#0b4d26] bg-[#0b4d26]/5" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
          >
            💸 Affiliation & Gains
          </button>
          <button
            onClick={() => setHelpCategory("logistics")}
            className={`px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-tight transition-all border-b-2 ${helpCategory === "logistics" ? "border-[#0b4d26] text-[#0b4d26] bg-[#0b4d26]/5" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
          >
            🚚 Logistique & Charte
          </button>
        </div>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 bg-neutral-50 border border-neutral-100">
            <p className="text-xs text-neutral-500">Aucun guide ne correspond à votre recherche ou catégorie.</p>
            <button 
              onClick={() => { setHelpCategory("general"); setHelpSearchQuery(""); }} 
              className="mt-3 text-xs font-black uppercase text-[#0b4d26] hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredArticles.map((art) => (
              <details 
                key={art.id} 
                className="group bg-white border border-neutral-200 transition-all duration-200 hover:border-neutral-300 rounded-none overflow-hidden"
              >
                <summary className="flex justify-between items-center p-3.5 font-bold text-xs text-neutral-900 cursor-pointer select-none bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                  <span className="pr-4 leading-snug">{art.question}</span>
                  <ChevronRight className="w-4 h-4 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <div className="p-4 border-t border-neutral-100 text-[11px] text-neutral-600 leading-relaxed space-y-2 bg-white">
                  {art.answer}
                </div>
              </details>
            ))}
          </div>
        )}

        {/* Quick Contact Form */}
        <div className="p-4 bg-[#0b4d26]/5 border border-[#0b4d26]/20 mt-6 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0b4d26] animate-pulse"></div>
            <p className="text-xs font-black text-neutral-950 uppercase tracking-wider">Besoin d'aide personnalisée ?</p>
          </div>
          <p className="text-[10.5px] text-neutral-600 leading-relaxed">Notre équipe d'assistance locale est disponible 7j/7 pour vous accompagner par téléphone, WhatsApp ou email dans le lancement de votre activité.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 font-mono text-[10px] text-neutral-700 font-bold">
            <p>📞 Service Client : <span className="text-[#0b4d26]">+228 90 00 00 00</span></p>
            <p>💬 WhatsApp Pro : <span className="text-[#0b4d26]">+228 99 11 22 33</span></p>
            <p>✉️ Email : <span className="text-[#0b4d26]">support@miabeasi.tg</span></p>
          </div>
        </div>
      </div>
    );
  };

  // Render profile editing view
  const renderProfileSettingsView = () => (
    <div className="space-y-4 text-left animate-fade-in">
      <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Nom complet</label>
          <input
            type="text"
            required
            placeholder="Ex: Hawkins Dan"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Numéro de téléphone</label>
          <input
            type="tel"
            placeholder="Ex: 90123456"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-mono"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Quartier / Ville (Togo)</label>
          <input
            type="text"
            placeholder="Ex: Adidogomé, Lomé"
            value={editQuartier}
            onChange={(e) => setEditQuartier(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
          />
        </div>

        <button
          type="submit"
          disabled={isUpdatingProfile}
          className="w-full bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-black uppercase tracking-widest py-3 text-xs transition-all cursor-pointer rounded-none disabled:opacity-50"
        >
          {isUpdatingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );

  // Render special offers promo view
  const renderPromosView = () => {
    const coupons = [
      { code: "MIABEASI2026", discount: "15% de réduction", desc: "Valable sur tout le catalogue local pour célébrer le savoir-faire togolais.", expiry: "31 Déc. 2026" },
      { code: "TOGO15", discount: "Livraison gratuite", desc: "Livraison 100% offerte à Lomé pour toute commande de plus de 10 000 FCFA.", expiry: "Toujours actif" },
      { code: "MIELETERROIR", discount: "500 FCFA offerts", desc: "Applicable exclusivement sur la catégorie 'Miel' et 'Épices'.", expiry: "En cours" }
    ];

    return (
      <div className="space-y-4 text-left animate-fade-in font-sans">
        <p className="text-[11px] text-neutral-500">Copiez un code promo et saisissez-le lors de votre commande pour bénéficier de réductions immédiates.</p>
        <div className="space-y-3">
          {coupons.map((coupon, idx) => (
            <div key={idx} className="bg-[#d4af37]/5 border border-dashed border-[#d4af37]/60 p-3.5 space-y-2 flex flex-col">
              <div className="flex justify-between items-center">
                <span className="font-mono font-black text-xs text-[#b8901c] bg-[#d4af37]/10 px-2 py-0.5 border border-[#d4af37]/30">{coupon.code}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(coupon.code);
                    showToast(`✓ Code ${coupon.code} copié !`);
                  }}
                  className="text-[9.5px] font-black uppercase text-neutral-950 hover:text-[#b8901c] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier</span>
                </button>
              </div>
              <div>
                <p className="font-extrabold text-neutral-950 text-xs">{coupon.discount}</p>
                <p className="text-[10.5px] text-neutral-600 mt-0.5 leading-relaxed">{coupon.desc}</p>
              </div>
              <div className="text-[9px] text-neutral-400 font-medium">Expire le : {coupon.expiry}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render favorites view
  const renderFavoritesView = () => {
    const favoriteItems = products.filter(p => p.phare).slice(0, 5);

    return (
      <div className="space-y-4 text-left animate-fade-in font-sans">
        <p className="text-[11px] text-neutral-500">Retrouvez ici vos articles locaux préférés de Miabé Asi pour les ajouter à votre panier à tout moment.</p>
        {favoriteItems.length === 0 ? (
          <div className="text-center py-10 bg-neutral-50 border border-neutral-200">
            <Gift className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs text-neutral-400">Aucun produit favori enregistré.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {favoriteItems.map((item) => (
              <div key={item.id} className="bg-neutral-50 border border-neutral-200 p-3 flex gap-3 items-center">
                <img src={item.images?.[0]} alt={item.nom} className="w-12 h-12 object-cover border border-neutral-100 shrink-0 animate-fade-in" referrerPolicy="no-referrer" />
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-xs text-neutral-900 truncate">{item.nom}</p>
                  <p className="font-mono text-[10.5px] text-[#b8901c] font-bold mt-0.5">{formatFCFA(item.prix)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectProduct(item);
                    closeDrawer();
                  }}
                  className="bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 text-[9px] font-black uppercase tracking-wider py-1.5 px-3 rounded-none cursor-pointer shrink-0 transition-colors"
                >
                  Voir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (currentView === "menu") {
    const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "A";
    
    return (
      <div className="flex flex-col h-full bg-white select-none animate-fade-in text-left">
        {/* Curved/Styled Profile Header (matching light-blue style) */}
        <div className="p-4 bg-[#e9f0fa] m-4 rounded-xl flex items-center gap-3.5 border border-[#d2dfef]">
          {/* Olive-green circle avatar like the mockup */}
          <div className="w-12 h-12 rounded-full bg-emerald-700/85 flex items-center justify-center text-white text-base font-black border-2 border-white shadow-sm shrink-0">
            {userInitial}
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-neutral-900 leading-tight">
              {user?.name || "Utilisateur local"}
            </h4>
            <button
              type="button"
              onClick={() => setCurrentView("profile_settings")}
              className="text-[11px] font-bold text-sky-800 hover:text-sky-950 underline mt-1 block cursor-pointer bg-transparent border-0 p-0 text-left"
            >
              Voir votre profil / Modifier
            </button>
          </div>
        </div>

        {/* Menu rows list - clean with borders and icons */}
        <div className="px-4 flex-grow space-y-0.5 overflow-y-auto">
          {/* Row 1: Achats et avis */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("client");
              setActiveTab("client");
            }}
            className="w-full py-3.5 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-100/75 cursor-pointer text-left bg-transparent rounded-none"
          >
            <Truck className="w-5 h-5 text-neutral-800 shrink-0" />
            <span className="text-xs font-bold text-neutral-800 tracking-wide font-sans">Achats et avis</span>
            <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
          </button>

          {/* Row 2: Messages */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("notifications");
              setActiveTab("notifications");
            }}
            className="w-full py-3.5 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-100/75 cursor-pointer text-left bg-transparent rounded-none"
          >
            <MessageSquare className="w-5 h-5 text-neutral-800 shrink-0" />
            <span className="text-xs font-bold text-neutral-800 tracking-wide font-sans">Messages</span>
            {unreadNotifs > 0 && (
              <span className="bg-[#b8901c] text-white text-[9px] font-black rounded-full px-2 py-0.5 ml-2">
                {unreadNotifs}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
          </button>

          {/* Row 3: Solde du crédit */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("affilie");
              setActiveTab("affilie");
            }}
            className="w-full py-3.5 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-100/75 cursor-pointer text-left bg-transparent rounded-none"
          >
            <Wallet className="w-5 h-5 text-neutral-800 shrink-0" />
            <div className="flex-grow">
              <span className="text-xs font-bold text-neutral-800 tracking-wide font-sans">Solde du crédit : </span>
              <span className="text-xs font-black text-emerald-700 ml-1 font-mono">
                {formatFCFA(user?.revenusGeneres || 0)}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>

          {/* Row 4: Offres spéciales */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("promos");
            }}
            className="w-full py-3.5 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-100/75 cursor-pointer text-left bg-transparent rounded-none"
          >
            <Tag className="w-5 h-5 text-neutral-800 shrink-0" />
            <span className="text-xs font-bold text-neutral-800 tracking-wide font-sans">Offres spéciales</span>
            <span className="text-[9px] font-extrabold uppercase bg-amber-100 text-[#b8901c] px-1.5 py-0.5 rounded-sm ml-2">
              Coupons
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
          </button>

          {/* Row 5: Liste de cadeaux */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("favorites");
            }}
            className="w-full py-3.5 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-100/75 cursor-pointer text-left bg-transparent rounded-none"
          >
            <Gift className="w-5 h-5 text-neutral-800 shrink-0" />
            <span className="text-xs font-bold text-neutral-800 tracking-wide font-sans">Liste de cadeaux & favoris</span>
            <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
          </button>

          {/* Row 6: Vendre sur Miabé Asi */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("vendeur");
              setActiveTab("vendeur");
            }}
            className="w-full py-3.5 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-100/75 cursor-pointer text-left bg-transparent rounded-none"
          >
            <ShoppingBag className="w-5 h-5 text-neutral-800 shrink-0" />
            <span className="text-xs font-bold text-neutral-800 tracking-wide font-sans">
              {user?.role === "vendeur" ? "Tableau de bord Vendeur" : "Vendre sur Miabé Asi"}
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
          </button>

          {/* Section Divider */}
          <div className="h-[1px] bg-neutral-200/80 my-3"></div>

          {/* Row 7: Centre d'aide */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("help");
            }}
            className="w-full py-3 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors cursor-pointer text-left bg-transparent rounded-none"
          >
            <HelpCircle className="w-4.5 h-4.5 text-neutral-600 shrink-0" />
            <span className="text-[11.5px] font-semibold text-neutral-700 font-sans">Centre d'aide</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 ml-auto" />
          </button>

          {/* Row 8: Paramètres du compte */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("profile_settings");
            }}
            className="w-full py-3 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors cursor-pointer text-left bg-transparent rounded-none"
          >
            <Settings className="w-4.5 h-4.5 text-neutral-600 shrink-0" />
            <span className="text-[11.5px] font-semibold text-neutral-700 font-sans">Paramètres du compte</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 ml-auto" />
          </button>

          {/* Row 9: Se déconnecter */}
          <button
            type="button"
            onClick={() => {
              if (onLogout) onLogout();
              closeDrawer();
            }}
            className="w-full py-3 px-3 flex items-center gap-3.5 hover:bg-red-50 text-neutral-700 hover:text-red-700 transition-colors cursor-pointer text-left bg-transparent rounded-none"
          >
            <LogOut className="w-4.5 h-4.5 text-neutral-600 shrink-0" />
            <span className="text-[11.5px] font-semibold font-sans">Se déconnecter</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 ml-auto" />
          </button>
        </div>

        {/* Footer info matching footer height styling */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 text-center select-none text-[10px] text-neutral-400 font-medium">
          Miabé Asi © {new Date().getFullYear()} – Le local, notre fierté
        </div>
      </div>
    );
  }

  const renderVendeurPendingScreen = () => {
    return (
      <div className="bg-neutral-50 border border-neutral-200 p-6 space-y-6 text-left">
        <div className="text-center pb-4 border-b border-neutral-200">
          <Clock className="w-14 h-14 text-amber-500 mx-auto mb-3 animate-pulse" />
          <h4 className="text-sm font-black text-neutral-950 uppercase tracking-wider">Inscription Reçue - En attente d'activation</h4>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-md mx-auto mt-2 font-sans">
            Votre compte vendeur pour la boutique <strong className="text-neutral-900">{user?.businessName || "votre boutique"}</strong> a été créé avec succès. Il est actuellement en attente d'activation par notre équipe.
          </p>
        </div>

        <div className="space-y-4 font-sans text-xs text-neutral-700">
          <div className="bg-white p-4 border border-neutral-200 space-y-3">
            <p className="font-bold text-neutral-900 uppercase text-[10px] tracking-wider text-[#b8901c]">Détails de l'abonnement</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-neutral-400">Offre choisie:</span>
                <p className="font-extrabold text-neutral-950">{user?.vendeurSubscription || "Offre 1"}</p>
              </div>
              <div>
                <span className="text-neutral-400">Montant dû:</span>
                <p className="font-extrabold text-neutral-950">
                  {user?.vendeurSubscription === "Offre 3" ? "5 000" : user?.vendeurSubscription === "Offre 2" ? "3 000" : "1 000"} FCFA / mois
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Moyen de paiement:</span>
                <p className="font-extrabold text-neutral-950">{user?.vendeurPaymentMethod || "Mix by Yas"}</p>
              </div>
              <div>
                <span className="text-neutral-400">ID Référence:</span>
                <p className="font-mono font-extrabold text-neutral-950">{user?.vendeurPaymentTxId || "Non spécifié"}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/60 p-4 space-y-2 text-[11px]">
            <p className="font-bold text-neutral-950 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Instruction de validation d'activation</span>
            </p>
            <p className="leading-relaxed">
              Veuillez transférer les frais d'abonnement mensuels au numéro administratif de Miabé Asi:
            </p>
            <p className="font-mono font-bold text-neutral-950 bg-white p-2 border border-amber-200 inline-block">
              {user?.vendeurPaymentMethod === "Flooz" ? "Flooz : +228 99 12 34 56" : "TMoney : +228 90 12 34 56"}
            </p>
            <p className="leading-relaxed text-neutral-600 font-medium mt-1">
              Dès réception du transfert, l'administrateur Miabé Asi validera manuellement votre transaction depuis son espace de gestion et activera votre boutique. Vous recevrez instantanément une notification SMS et un e-mail de confirmation.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderVendeurRegistrationWizard = () => {
    return (
      <div className="bg-neutral-50 border border-neutral-200 p-5 space-y-6 text-left animate-fade-in">
                {/* Steps Header Progress */}
                <div className="border-b border-neutral-200 pb-5 mb-5 select-none">
                  <div className="flex items-center justify-between text-center relative max-w-lg mx-auto">
                    {/* Progress Bar background line */}
                    <div className="absolute top-[14px] left-[5%] right-[5%] h-[2px] bg-neutral-200 z-0" />
                    
                    {/* Step item: Preferences */}
                    <button
                      type="button"
                      onClick={() => setVendeurStep("preferences")}
                      className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                    >
                      <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                        vendeurStep === "preferences"
                          ? "bg-[#f56a3f] text-white border-[#f56a3f] shadow-sm"
                          : ["name", "stock", "payout", "activation"].includes(vendeurStep)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-neutral-400 border-neutral-200 group-hover:border-neutral-400"
                      }`}>
                        {["name", "stock", "payout", "activation"].includes(vendeurStep) ? <Check className="w-3.5 h-3.5" /> : "1"}
                      </div>
                      <span className={`text-[9.5px] font-extrabold tracking-tight mt-1.5 transition-colors ${vendeurStep === "preferences" ? "text-neutral-900" : "text-neutral-400"}`}>Préférences</span>
                    </button>

                    {/* Step item: Name */}
                    <button
                      type="button"
                      onClick={() => { if (shopLanguage) setVendeurStep("name"); }}
                      disabled={!shopLanguage}
                      className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                    >
                      <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                        vendeurStep === "name"
                          ? "bg-[#f56a3f] text-white border-[#f56a3f] shadow-sm"
                          : ["stock", "payout", "activation"].includes(vendeurStep)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-neutral-400 border-neutral-200"
                      }`}>
                        {["stock", "payout", "activation"].includes(vendeurStep) ? <Check className="w-3.5 h-3.5" /> : "2"}
                      </div>
                      <span className={`text-[9.5px] font-extrabold tracking-tight mt-1.5 transition-colors ${vendeurStep === "name" ? "text-neutral-900" : "text-neutral-400"}`}>Nom de la boutique</span>
                    </button>

                    {/* Step item: Stock */}
                    <button
                      type="button"
                      onClick={() => { if (businessName && businessName.trim().length >= 4) setVendeurStep("stock"); }}
                      disabled={!businessName || businessName.trim().length < 4}
                      className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                    >
                      <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                        vendeurStep === "stock"
                          ? "bg-[#f56a3f] text-white border-[#f56a3f] shadow-sm"
                          : ["payout", "activation"].includes(vendeurStep)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-neutral-400 border-neutral-200"
                      }`}>
                        {["payout", "activation"].includes(vendeurStep) ? <Check className="w-3.5 h-3.5" /> : "3"}
                      </div>
                      <span className={`text-[9.5px] font-extrabold tracking-tight mt-1.5 transition-colors ${vendeurStep === "stock" ? "text-neutral-900" : "text-neutral-400"}`}>Fiche produit</span>
                    </button>

                    {/* Step item: Payout */}
                    <button
                      type="button"
                      onClick={() => { if (businessName && firstListingName) setVendeurStep("payout"); }}
                      disabled={!businessName || !firstListingName}
                      className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                    >
                      <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                        vendeurStep === "payout"
                          ? "bg-[#f56a3f] text-white border-[#f56a3f] shadow-sm"
                          : ["activation"].includes(vendeurStep)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-neutral-400 border-neutral-200"
                      }`}>
                        {["activation"].includes(vendeurStep) ? <Check className="w-3.5 h-3.5" /> : "4"}
                      </div>
                      <span className={`text-[9.5px] font-extrabold tracking-tight mt-1.5 transition-colors ${vendeurStep === "payout" ? "text-neutral-900" : "text-neutral-400"}`}>Facturation</span>
                    </button>

                    {/* Step item: Activation */}
                    <button
                      type="button"
                      disabled={!businessName || !firstListingName || !sellerPayoutNumber}
                      onClick={() => { if (businessName && firstListingName && sellerPayoutNumber) setVendeurStep("activation"); }}
                      className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                    >
                      <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                        vendeurStep === "activation"
                          ? "bg-[#f56a3f] text-white border-[#f56a3f] shadow-sm"
                          : "bg-white text-neutral-400 border-neutral-200"
                      }`}>
                        5
                      </div>
                      <span className={`text-[9.5px] font-extrabold tracking-tight mt-1.5 transition-colors ${vendeurStep === "activation" ? "text-neutral-900" : "text-neutral-400"}`}>Activation</span>
                    </button>
                  </div>
                </div>

                {/* STEP 1: SHOP PREFERENCES */}
                {vendeurStep === "preferences" && (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="text-center py-1">
                      <Globe className="w-10 h-10 text-[#f56a3f] mx-auto mb-2" />
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">Préférences de votre boutique</h4>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed max-w-sm mx-auto">
                        Commençons par configurer les paramètres généraux de votre vitrine locale sur notre place de marché.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Langue de la boutique</label>
                        <select
                          value={shopLanguage}
                          onChange={(e) => setShopLanguage(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                        >
                          <option value="Français (FR)">Français (FR)</option>
                          <option value="English (EN)">English (EN)</option>
                          <option value="Ewe (EE)">Ewe (Éwé)</option>
                          <option value="Kabyè (KB)">Kabyè</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Pays de la boutique</label>
                        <select
                          value={shopCountry}
                          onChange={(e) => setShopCountry(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                        >
                          <option value="Togo (TG)">Togo (TG)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Devise principale</label>
                        <select
                          value={shopCurrency}
                          onChange={(e) => setShopCurrency(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                        >
                          <option value="FCFA (XOF)">Franc CFA (XOF)</option>
                        </select>
                      </div>

                      <div className="bg-[#f56a3f]/5 border border-[#f56a3f]/25 p-3.5 text-[10.5px] leading-relaxed text-neutral-600">
                        <p className="font-extrabold text-[#d24c22] mb-0.5">Note importante :</p>
                        Miabé Asi promeut l'économie locale et le savoir-faire togolais. Le pays de votre boutique est configuré par défaut sur le <strong>Togo</strong> pour optimiser le routage de livraison et garantir l'authenticité de nos produits du terroir.
                      </div>

                      <button
                        type="button"
                        onClick={() => setVendeurStep("name")}
                        className="w-full bg-neutral-950 hover:bg-[#f56a3f] text-white font-black uppercase tracking-widest py-3 text-xs transition-colors cursor-pointer rounded-none"
                      >
                        Continuer vers le nom de la boutique
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: NAME YOUR SHOP */}
                {vendeurStep === "name" && (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="text-center py-1">
                      <Tag className="w-10 h-10 text-[#f56a3f] mx-auto mb-2" />
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">Trouvez un nom original</h4>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed max-w-sm mx-auto">
                        Saisissez un nom unique qui décrit parfaitement vos articles artisanaux. Pas d'espaces ni de caractères spéciaux.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Nom de votre boutique / Marque</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Savoir-Faire-Togo"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-bold"
                        />
                      </div>

                      {/* Dynamic Real-time Verification Box */}
                      <div className="p-3 border text-xs leading-relaxed transition-all">
                        {businessName.trim() === "" ? (
                          <div className="text-neutral-500 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                            <span>En attente de saisie... (4 à 20 caractères, lettres, chiffres et tirets uniquement)</span>
                          </div>
                        ) : businessName.trim().length < 4 ? (
                          <div className="text-red-600 font-bold flex items-center gap-1.5">
                            <X className="w-4 h-4 text-red-500 shrink-0" />
                            <span>Trop court ! Le nom doit contenir au moins 4 caractères.</span>
                          </div>
                        ) : businessName.trim().length > 20 ? (
                          <div className="text-red-600 font-bold flex items-center gap-1.5">
                            <X className="w-4 h-4 text-red-500 shrink-0" />
                            <span>Trop long ! Le nom ne doit pas dépasser 20 caractères.</span>
                          </div>
                        ) : !/^[a-zA-Z0-9\-]+$/.test(businessName) ? (
                          <div className="text-red-600 font-bold flex items-center gap-1.5">
                            <X className="w-4 h-4 text-red-500 shrink-0" />
                            <span>Invalide ! Pas d'espaces, d'accents ou de caractères spéciaux. Utilisez des tirets (-).</span>
                          </div>
                        ) : (
                          <div className="text-emerald-700 font-extrabold flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>✓ Disponible ! "{businessName}" est conforme aux critères de référencement.</span>
                          </div>
                        )}
                      </div>

                      {/* Suggestions list */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Suggestions de rechange :</span>
                        <div className="flex flex-wrap gap-2">
                          {[
                            businessName ? `${businessName}-Togo` : "Artisanat-Lome",
                            businessName ? `${businessName}-Nature` : "Terroir-Togolais",
                            "Savoir-Faire-228",
                            "Epi-Togo"
                          ].map((suggestion, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setBusinessName(suggestion)}
                              className="text-[10px] font-bold bg-neutral-100 hover:bg-[#f56a3f]/10 text-neutral-700 hover:text-[#d24c22] border border-neutral-200 hover:border-[#f56a3f]/30 px-2 py-1 transition-colors cursor-pointer"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mode de vente */}
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Mode de vente préféré</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setVendeurMode("autonome")}
                            className={`p-3 border text-left rounded-none cursor-pointer transition-all ${
                              vendeurMode === "autonome" 
                                ? "border-neutral-900 bg-white shadow-xs" 
                                : "border-neutral-200 bg-neutral-100 hover:bg-neutral-50"
                            }`}
                          >
                            <p className="text-xs font-bold text-neutral-950 uppercase tracking-wider">Mode Autonome</p>
                            <p className="text-[9.5px] text-neutral-500 leading-relaxed mt-1 font-sans">Vous gérez vous-même vos expéditions et fiches.</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setVendeurMode("assiste")}
                            className={`p-3 border text-left rounded-none cursor-pointer transition-all ${
                              vendeurMode === "assiste" 
                                ? "border-neutral-900 bg-white shadow-xs" 
                                : "border-neutral-200 bg-neutral-100 hover:bg-neutral-50"
                            }`}
                          >
                            <p className="text-xs font-bold text-neutral-950 uppercase tracking-wider">Mode Assisté</p>
                            <p className="text-[9.5px] text-neutral-500 leading-relaxed mt-1 font-sans">L'équipe logistique de Miabé Asi prend en charge la livraison.</p>
                          </button>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setVendeurStep("preferences")}
                          className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center"
                        >
                          Retour
                        </button>
                        <button
                          type="button"
                          disabled={!businessName || businessName.trim().length < 4 || !/^[a-zA-Z0-9\-]+$/.test(businessName)}
                          onClick={() => setVendeurStep("stock")}
                          className="bg-neutral-950 hover:bg-[#f56a3f] text-white font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center disabled:opacity-40"
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: STOCK YOUR SHOP / CREATE A LISTING */}
                {vendeurStep === "stock" && (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="text-center py-1">
                      <ShoppingBag className="w-10 h-10 text-[#f56a3f] mx-auto mb-2" />
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">Remplissez votre boutique</h4>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed max-w-sm mx-auto">
                        Vous devez ajouter au moins un premier produit à votre vitrine pour finaliser l'inscription.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Interactive Form */}
                      <div className="space-y-3.5 bg-white p-4 border border-neutral-200">
                        <p className="font-extrabold text-[10.5px] uppercase text-neutral-800 tracking-wider border-b border-neutral-100 pb-1.5">Détails de l'article</p>
                        
                        <div>
                          <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Nom de l'article</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Miel Sauvage d'Atakpamé"
                            value={firstListingName}
                            onChange={(e) => setFirstListingName(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Prix de vente (FCFA)</label>
                            <input
                              type="number"
                              required
                              placeholder="Ex: 3500"
                              value={firstListingPrice}
                              onChange={(e) => setFirstListingPrice(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Catégorie</label>
                            <select
                              value={firstListingCategory}
                              onChange={(e) => setFirstListingCategory(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                            >
                              <option value="Made in Togo Premium">Made in Togo Premium</option>
                              <option value="Paniers Frais & Épicerie">Paniers Frais & Épicerie</option>
                              <option value="Vêtements & Mode">Vêtements & Mode</option>
                              <option value="Chaussures Premium">Chaussures Premium</option>
                              <option value="Montres & Accessoires">Montres & Accessoires</option>
                              <option value="Plats & Gastronomie">Plats & Gastronomie</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Description du produit</label>
                          <textarea
                            rows={2}
                            placeholder="Décrivez les ingrédients locaux, le processus de fabrication, etc."
                            value={firstListingDesc}
                            onChange={(e) => setFirstListingDesc(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 resize-none"
                          />
                        </div>

                        {/* Pre-defined beautiful local images gallery picker */}
                        <div className="space-y-1.5">
                          <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest">Sélectionner une image locale d'illustration :</label>
                          <div className="grid grid-cols-5 gap-1.5">
                            {[
                              { label: "Miel", url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400" },
                              { label: "Chocolat", url: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=400" },
                              { label: "Épices", url: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=400" },
                              { label: "Kente", url: "https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&q=80&w=400" },
                              { label: "Savon", url: "https://images.unsplash.com/photo-1607006342411-91f11c888fae?auto=format&fit=crop&q=80&w=400" }
                            ].map((galleryItem, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setFirstListingImageUrl(galleryItem.url)}
                                className={`h-11 border transition-all relative overflow-hidden rounded-none cursor-pointer ${firstListingImageUrl === galleryItem.url ? "border-[#f56a3f] ring-1 ring-[#f56a3f]" : "border-neutral-200"}`}
                              >
                                <img src={galleryItem.url} alt={galleryItem.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </button>
                            ))}
                          </div>
                          <div className="pt-1.5">
                            <span className="text-[9px] text-neutral-400">Ou saisir l'adresse URL d'une image personnalisée :</span>
                            <input
                              type="text"
                              placeholder="Ex: https://image.com/mon-produit.jpg"
                              value={firstListingImageUrl}
                              onChange={(e) => setFirstListingImageUrl(e.target.value)}
                              className="w-full px-2 py-1 text-[10px] border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 mt-1 font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Real-time Listing Card Preview */}
                      <div className="flex flex-col justify-center items-center bg-[#fdfaf5] p-4 border border-dashed border-amber-200/80">
                        <span className="text-[9.5px] font-black uppercase tracking-widest text-[#b8901c] mb-2.5 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Aperçu de la fiche produit (Style Miabé Asi)</span>
                        </span>

                        <div className="w-[190px] bg-white border border-neutral-200/80 shadow-xs hover:shadow-md transition-all duration-300">
                          {/* Card image container */}
                          <div className="w-full h-[140px] bg-neutral-100 overflow-hidden relative">
                            <img
                              src={firstListingImageUrl || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400"}
                              alt="Preview item"
                              className="w-full h-full object-cover select-none transition-transform duration-500 hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-1.5 left-1.5 bg-[#f56a3f] text-white text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider">Nouveau</span>
                          </div>

                          {/* Card contents */}
                          <div className="p-3 text-left space-y-1">
                            <p className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-widest truncate">Boutique : {businessName || "Ma Boutique"}</p>
                            <h5 className="font-bold text-neutral-800 text-[11px] font-sans line-clamp-1 truncate h-[16px] leading-tight">
                              {firstListingName || "Titre de votre premier produit"}
                            </h5>
                            
                            {/* Review mock stars like our rating style */}
                            <div className="flex items-center gap-1">
                              <span className="text-amber-500 text-[10px] tracking-tight">★★★★★</span>
                              <span className="text-[9px] text-neutral-400">(4.9)</span>
                            </div>

                            <p className="font-mono text-xs text-[#b8901c] font-black mt-0.5">
                              {firstListingPrice ? formatFCFA(Number(firstListingPrice)) : "0 FCFA"}
                            </p>

                            <span className="inline-block bg-[#d4af37]/10 text-[#a07c10] border border-[#d4af37]/25 text-[8.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-xs mt-1.5">
                              {firstListingCategory}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setVendeurStep("name")}
                        className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center"
                      >
                        Retour
                      </button>
                      <button
                        type="button"
                        disabled={!firstListingName || !firstListingPrice}
                        onClick={() => setVendeurStep("payout")}
                        className="bg-neutral-950 hover:bg-[#f56a3f] text-white font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center disabled:opacity-40"
                      >
                        Suivant : Facturation & Reversements
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: PAYOUT SETTINGS (HOW YOU'LL GET PAID) */}
                {vendeurStep === "payout" && (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="text-center py-1">
                      <Wallet className="w-10 h-10 text-[#f56a3f] mx-auto mb-2" />
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">Facturation & Reversements</h4>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed max-w-sm mx-auto">
                        Pour que les clients de Miabé Asi puissent vous payer en toute sécurité, configurez votre moyen préféré de reversement automatique des fonds.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Operator selection */}
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Moyen de reversement préféré</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "PayDunya", label: "Mobile Money (T-Money, Flooz, Wave)" },
                            { value: "Virement", label: "Virement Bancaire" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setSellerPayoutType(opt.value as any);
                                setSellerPayoutNumber("");
                              }}
                              className={`p-2.5 border text-center text-[10.5px] rounded-none cursor-pointer transition-all ${
                                sellerPayoutType === opt.value
                                  ? "border-neutral-950 bg-white font-bold text-neutral-950 shadow-xs"
                                  : "border-neutral-200 bg-neutral-100 hover:bg-neutral-50 text-neutral-500"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mobile Money Details (represented by PayDunya under the hood) */}
                      {sellerPayoutType === "PayDunya" && (
                        <div className="space-y-3 bg-white p-3 border border-neutral-200">
                          <div>
                            <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                              Numéro de téléphone Mobile Money (T-Money, Flooz, Wave, etc.)
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="Ex: +22890123456"
                              value={sellerPayoutNumber}
                              onChange={(e) => setSellerPayoutNumber(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                              Nom complet du titulaire du compte
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Dan Hawkins"
                              className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                            />
                          </div>
                          <div className="bg-emerald-50 p-2.5 text-[9.5px] text-emerald-800 border border-emerald-200 leading-relaxed">
                            💡 <strong>Reversement Automatique :</strong> Vos revenus de ventes vous seront versés automatiquement et sans frais supplémentaires directement sur votre numéro Mobile Money sous 24h ouvrées.
                          </div>
                        </div>
                      )}

                      {/* Bank Account Details */}
                      {sellerPayoutType === "Virement" && (
                        <div className="space-y-3 bg-white p-3 border border-neutral-200">
                          <div>
                            <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Nom de la Banque</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: ECOBANK, ORABANK, UTB"
                              className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Titulaire du compte</label>
                              <input
                                type="text"
                                required
                                placeholder="Nom complet"
                                className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Numéro de compte / RIB</label>
                              <input
                                type="text"
                                required
                                placeholder="TG001-02030..."
                                value={sellerPayoutNumber}
                                onChange={(e) => setSellerPayoutNumber(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-neutral-100 p-3.5 border border-neutral-200/60 text-[10.5px] text-neutral-600 leading-relaxed flex items-center gap-2">
                        <Lock className="w-5 h-5 text-neutral-400 shrink-0" />
                        <span>Vos informations de reversement bancaire et de compte mobile money sont hautement sécurisées, cryptées, et uniquement utilisées pour transférer vos commissions de vente.</span>
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setVendeurStep("stock")}
                          className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center"
                        >
                          Retour
                        </button>
                        <button
                          type="button"
                          disabled={!sellerPayoutNumber}
                          onClick={() => setVendeurStep("activation")}
                          className="bg-neutral-950 hover:bg-[#f56a3f] text-white font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center disabled:opacity-40"
                        >
                          Suivant : Formules & Activation
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: PLAN, CGU & ACTIVATION */}
                {vendeurStep === "activation" && (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="text-center py-1">
                      <Coins className="w-10 h-10 text-[#f56a3f] mx-auto mb-2" />
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">Abonnement & Activation de Miabé Asi</h4>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed max-w-sm mx-auto">
                        Sélectionnez votre formule mensuelle pour finaliser votre ouverture de boutique.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Subscription List */}
                      {[
                        { key: "Offre 1", title: "Offre 1 (Basique)", price: "1 000 FCFA", desc: "Idéal pour les petits artisans locaux.", limits: "Articles entre 500 et 1 000 FCFA" },
                        { key: "Offre 2", title: "Offre 2 (Standard)", price: "3 000 FCFA", desc: "Pour les boutiques d'alimentation et vêtements.", limits: "Articles entre 1 001 et 5 000 FCFA" },
                        { key: "Offre 3", title: "Offre 3 (Premium)", price: "5 000 FCFA", desc: "Formule illimitée pour les grandes vitrines locales.", limits: "Articles au-delà de 5 000 FCFA" }
                      ].map((plan) => (
                        <button
                          key={plan.key}
                          type="button"
                          onClick={() => setSelectedSubscription(plan.key as any)}
                          className={`w-full p-3 border text-left cursor-pointer transition-all flex justify-between items-center ${
                            selectedSubscription === plan.key
                              ? "border-[#f56a3f] bg-[#f56a3f]/5 ring-1 ring-[#f56a3f]"
                              : "border-neutral-200 bg-white hover:bg-neutral-50"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-black text-neutral-950 uppercase tracking-wide">{plan.title}</p>
                            <p className="text-[9.5px] text-neutral-500 mt-0.5">{plan.desc}</p>
                            <p className="text-[10px] font-extrabold text-[#d24c22] mt-1">{plan.limits}</p>
                          </div>
                          <span className="font-mono text-xs font-black text-[#d24c22] shrink-0">{plan.price} / mois</span>
                        </button>
                      ))}
                    </div>

                    {/* Automatic direct payment processing */}
                    <div className="bg-emerald-50 border border-emerald-200/60 p-4 space-y-2.5 text-neutral-800">
                      <p className="font-bold text-[10.5px] text-emerald-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
                        <span>Paiement Direct Automatisé via Miabé Asi Pay</span>
                      </p>
                      <p className="text-[11px] leading-relaxed">
                        Le paiement des frais de votre première mensualité de l'abonnement <strong>({selectedSubscription === "Offre 3" ? "5 000" : selectedSubscription === "Offre 2" ? "3 000" : "1 000"} FCFA)</strong> sera traité de manière entièrement sécurisée et automatique.
                      </p>
                      <div className="bg-white p-2.5 border border-emerald-100 font-sans text-xs text-stone-600 space-y-1">
                        <div><strong className="text-neutral-800">Mode de facturation :</strong> Reversement direct ({sellerPayoutType})</div>
                        <div><strong className="text-neutral-800">Compte associé :</strong> {sellerPayoutNumber}</div>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                        ✓ Aucune saisie manuelle de référence n'est requise. L'activation de votre espace de vente est immédiate et automatisée dès la création.
                      </p>
                    </div>

                    {/* CGU Terms of Sale checkbox */}
                    <div className="bg-white p-3 border border-neutral-200 max-h-36 overflow-y-auto text-[10.5px] text-neutral-600 space-y-2.5 leading-relaxed font-sans">
                      <p className="font-extrabold text-neutral-950 text-[10px] uppercase tracking-wide mb-1 border-b border-neutral-100 pb-1">Conditions de Vente de la Marketplace Miabé Asi</p>
                      <p><strong>Charte du Made in Togo :</strong> En vous inscrivant comme vendeur, vous certifiez sur l'honneur que tous vos articles sont confectionnés, transformés, récoltés ou fabriqués au Togo. Les produits importés de l'étranger ou contrefaits sont strictement interdits.</p>
                      <p><strong>Commission &amp; Paiement :</strong> Miabé Asi prélève une commission de 10% sur chaque commande pour assurer la coordination, le service client et la passerelle de paiement. Vos fonds de ventes vous sont reversés sous 24h ouvrées.</p>
                    </div>

                    <div className="flex items-start gap-2 pt-1 select-none">
                      <input
                        id="cgu_check"
                        type="checkbox"
                        checked={acceptedCGU}
                        onChange={(e) => setAcceptedCGU(e.target.checked)}
                        className="mt-0.5 cursor-pointer h-4 w-4 border-neutral-300 rounded"
                      />
                      <label htmlFor="cgu_check" className="text-[11px] font-sans text-neutral-800 leading-snug cursor-pointer select-none">
                        J’accepte la charte d'authenticité, les conditions générales de Miabé Asi et confirme l'autorisation de prélèvement.
                      </label>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setVendeurStep("payout")}
                        className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center"
                      >
                        Retour
                      </button>
                      <button
                        type="button"
                        disabled={!acceptedCGU || isSubmittingReg}
                        onClick={() => {
                          setSellerPhone(sellerPayoutNumber);
                          handleRoleUpgrade("vendeur");
                        }}
                        className="bg-neutral-950 hover:bg-[#f56a3f] text-white font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center disabled:opacity-40"
                      >
                        {isSubmittingReg ? "Création en cours..." : "Créer ma boutique Miabé Asi"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
    );
  };

  const renderEscapeHeader = (title: string, subTitle: string) => (
    <div className="flex items-center justify-between px-6 py-4 bg-neutral-950 text-white shrink-0 font-sans border-b border-neutral-800">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#0B4D26] flex items-center justify-center text-white">
          <Store className="w-4 h-4 text-[#d4af37]" />
        </div>
        <div className="text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            {title}
          </h3>
          <p className="text-[9px] text-[#d4af37] font-extrabold uppercase tracking-widest mt-0.5">
            {subTitle}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setCurrentView("menu");
          setActiveTab("client");
        }}
        className="text-stone-300 hover:text-[#d4af37] flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-stone-900 border border-stone-800 px-3 py-2 rounded-lg cursor-pointer hover:bg-stone-850 transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Retour au Site</span>
      </button>
    </div>
  );

  const isVendeurActive = currentView === "vendeur";

  if (isVendeurActive) {
    if (user?.role !== "vendeur") {
      return (
        <div className="flex flex-col h-full bg-[#FAF9F5] select-none w-full overflow-hidden">
          {renderEscapeHeader("Devenir Vendeur Premium", "Formulaire d'Inscription d'Artisan")}
          <div className="flex-grow overflow-y-auto p-4 md:p-10 max-w-4xl mx-auto w-full">
            {renderVendeurRegistrationWizard()}
          </div>
        </div>
      );
    }

    if (user?.vendeurStatus === "En attente d'activation") {
      return (
        <div className="flex flex-col h-full bg-[#FAF9F5] select-none w-full overflow-hidden">
          {renderEscapeHeader("Sécurité d'Activation de Boutique", "Statut : En Attente de Validation administrative")}
          <div className="flex-grow overflow-y-auto p-4 md:p-10 max-w-3xl mx-auto w-full">
            {renderVendeurPendingScreen()}
          </div>
        </div>
      );
    }

    if (!isVendeurUnlocked) {
      return (
        <div className="flex flex-col h-full bg-neutral-950 select-none w-full overflow-hidden">
          {renderEscapeHeader("Double Authentification PIN", "Espace Vendeur Sécurisé")}
          <div className="flex-grow flex items-center justify-center p-6 overflow-y-auto bg-stone-950/95">
            {renderVendeurSecurityGateway()}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-stone-50 select-none w-full">
        <SellerWorkspace
          user={user}
          setUser={setUser}
          token={token}
          products={products}
          setProducts={setProducts}
          showToast={showToast}
          formatFCFA={formatFCFA}
          wallet={wallet}
          withdrawalHistory={withdrawalHistory}
          onWithdrawalRequest={async (amount, method, phone) => {
            if (!amount || !phone) {
              showToast("Veuillez remplir tous les champs.");
              return;
            }
            try {
              const res = await fetch("/api/withdrawals/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": token || ""
                },
                body: JSON.stringify({
                  amount: Number(amount),
                  method,
                  phone
                })
              });
              if (!res.ok) throw new Error();
              const updatedWallet = await res.json();
              setWallet(updatedWallet);
              showToast("✓ Votre demande de retrait a été enregistrée avec succès !");
            } catch {
              showToast("Erreur lors de la demande de retrait.");
            }
          }}
          handleProductSubmit={handleProductSubmit}
          handleDeleteProduct={handleDeleteProduct}
          isAddProductOpen={isAddProductOpen}
          setIsAddProductOpen={setIsAddProductOpen}
          isEditingProduct={isEditingProduct}
          setIsEditingProduct={setIsEditingProduct}
          newProdName={newProdName}
          setNewProdName={setNewProdName}
          newProdDesc={newProdDesc}
          setNewProdDesc={setNewProdDesc}
          newProdPrice={newProdPrice}
          setNewProdPrice={setNewProdPrice}
          newProdPriceBarre={newProdPriceBarre}
          setNewProdPriceBarre={setNewProdPriceBarre}
          newProdStock={newProdStock}
          setNewProdStock={setNewProdStock}
          newProdCategory={newProdCategory}
          setNewProdCategory={setNewProdCategory}
          newProdImageUrl={newProdImageUrl}
          setNewProdImageUrl={setNewProdImageUrl}
          newProdImages={newProdImages}
          setNewProdImages={setNewProdImages}
          categories={categories}
          onBackToSite={() => {
            setCurrentView("menu");
            setActiveTab("client");
          }}
        />
      </div>
    );
  }

  const isAffilieActive = currentView === "affilie";

  if (isAffilieActive) {
    if (user?.role !== "affilie") {
      return (
        <div className="flex flex-col h-full bg-[#FAF9F5] select-none w-full overflow-hidden">
          {renderEscapeHeader("Devenir Affilié Local", "Programme de Recommandation Miabé Asi")}
          <div className="flex-grow overflow-y-auto p-4 md:p-10 max-w-xl mx-auto w-full flex items-center justify-center">
            <div className="bg-white border border-neutral-200 p-8 shadow-sm space-y-6 text-left rounded-2xl animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-base font-black text-neutral-950 uppercase tracking-wider">Programme d'Affiliation Local Miabé Asi</h4>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto mt-2 font-sans">
                  Recommandez les produits de nos artisans locaux, partagez votre lien d'affiliation unique et gagnez <strong className="text-neutral-950">3% de commission</strong> sur chaque vente validée !
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 p-4 text-amber-900 rounded-xl font-sans text-xs space-y-2">
                <strong className="text-amber-950 block text-[13px]">💡 Comment ça fonctionne ?</strong>
                <ol className="list-decimal pl-4 space-y-1.5 text-neutral-700">
                  <li>Activez votre espace affilié ci-dessous.</li>
                  <li>Copiez et partagez votre lien d'affiliation unique.</li>
                  <li>Un cookie est stocké sur l'ordinateur de l'acheteur pour 30 jours.</li>
                  <li>Retirez vos commissions via Mix by Yas ou Flooz dès 5 000 FCFA.</li>
                </ol>
              </div>

              <button
                onClick={() => handleRoleUpgrade("affilie")}
                className="w-full bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-black uppercase tracking-widest py-3 text-xs transition-all cursor-pointer rounded-xl shadow-xs"
              >
                Activer mon compte d'affilié
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!isAffilieUnlocked) {
      return (
        <div className="flex flex-col h-full bg-neutral-950 select-none w-full overflow-hidden">
          {renderEscapeHeader("Double Authentification PIN", "Espace Affilié Sécurisé")}
          <div className="flex-grow flex items-center justify-center p-6 overflow-y-auto bg-stone-950/95">
            {renderAffilieSecurityGateway()}
          </div>
        </div>
      );
    }

    // Unlocked Active Affiliate View - Takes over full screen!
    return (
      <div className="flex flex-col h-full bg-stone-50 select-none w-full overflow-hidden">
        {renderEscapeHeader("Espace Affilié Sécurisé", `Code de parrainage : ${user.affiliateCode || "Aucun"}`)}
        <div className="flex-grow overflow-y-auto p-4 md:p-10 w-full space-y-8">
          
          {/* Top Banner / Affiliate Link display */}
          <div className="bg-neutral-950 text-white p-6 rounded-2xl border border-neutral-800 space-y-4 shadow-md text-left">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-emerald-500" />
              <h5 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">Mon Lien de Promotion Unique</h5>
            </div>
            <p className="text-xs text-neutral-400 font-sans max-w-2xl leading-relaxed">
              Partagez ce lien à vos partenaires, sur vos réseaux sociaux ou à vos abonnés pour percevoir <strong className="text-emerald-500">3% de commission</strong> sur tous leurs achats pendant 30 jours :
            </p>
            
            <div className="flex bg-neutral-900 border border-neutral-800 p-2 items-center justify-between gap-3 rounded-xl">
              <span className="text-xs font-mono text-emerald-400 truncate flex-grow pl-2 select-all">
                {window.location.origin}/?ref={user.affiliateCode}
              </span>
              <button
                onClick={handleCopyLink}
                className="bg-white hover:bg-emerald-500 text-neutral-950 hover:text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer rounded-lg flex items-center gap-1.5"
                title="Copier le lien"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs text-left">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Nombre de Clics</span>
              <p className="text-2xl font-mono font-black text-neutral-950 mt-1">{user.affiliateStats?.clicks || 0}</p>
            </div>
            <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs text-left">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Ventes parrainées</span>
              <p className="text-2xl font-mono font-black text-neutral-950 mt-1">{user.affiliateStats?.ventes || 0}</p>
            </div>
            <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs text-left">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Gains cumulés</span>
              <p className="text-2xl font-mono font-black text-neutral-950 mt-1">{formatFCFA(user.affiliateStats?.commissionsGagnees || 0)}</p>
            </div>
            <div className="bg-white border border-emerald-200 p-5 rounded-2xl shadow-xs text-left bg-emerald-50/10">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Solde Disponible</span>
              <p className="text-2xl font-mono font-black text-emerald-600 mt-1">{formatFCFA(user.affiliateStats?.commissionDisponible || 0)}</p>
            </div>
          </div>

          {/* Real Wallet Ledger Component */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs text-left">
            <WalletSection wallet={wallet} formatFCFA={formatFCFA} />
          </div>

          {/* Affiliate Withdrawals Form */}
          <div className="bg-white border border-stone-200 p-6 rounded-2xl text-left space-y-4 shadow-xs">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-100 pb-3">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Demander un retrait de commission</span>
            </h4>

            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Montant (Min 5 000 F)</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 5000"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-xs font-sans text-neutral-950 focus:outline-none focus:border-neutral-950"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Méthode de retrait</label>
                  <select
                    value={withdrawalMethod}
                    onChange={(e) => setWithdrawalMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-xs font-sans text-neutral-950 bg-white focus:outline-none focus:border-neutral-950"
                  >
                    <option value="T-Money">T-Money (Togo)</option>
                    <option value="Flooz">Flooz (Moov Togo)</option>
                    <option value="Mix by Yas">Mix by Yas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Numéro de téléphone</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 90123456"
                    value={withdrawalPhone}
                    onChange={(e) => setWithdrawalPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-xs font-sans text-neutral-950 focus:outline-none focus:border-neutral-950"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-neutral-950 hover:bg-emerald-600 hover:text-white text-white font-black uppercase tracking-widest px-8 py-3.5 text-xs transition-all cursor-pointer rounded-xl shadow-xs"
                >
                  Confirmer la demande de retrait
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Dynamic Back Header */}
      <div className="flex items-center gap-2 p-3 bg-neutral-50 border-b border-neutral-200 text-left shrink-0 select-none">
        <button
          type="button"
          onClick={() => setCurrentView("menu")}
          className="px-2.5 py-1.5 hover:bg-neutral-200 text-neutral-800 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border border-neutral-200 bg-white shadow-xs rounded-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour</span>
        </button>
        <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest ml-2">
          {currentView === "client" && "Achats et avis"}
          {(currentView as any) === "vendeur" && "Espace Vendeur"}
          {(currentView as any) === "affilie" && "Espace Affilié"}
          {currentView === "notifications" && "Messages & Alertes"}
          {currentView === "help" && "Centre d'aide"}
          {currentView === "profile_settings" && "Paramètres du compte"}
          {currentView === "promos" && "Offres spéciales"}
          {currentView === "favorites" && "Ma Liste de cadeaux"}
        </span>
      </div>

      {/* Tab Panels */}
      <div className="flex-grow overflow-y-auto p-5 space-y-6">
        {/* Render Help, Settings, Promos, and Favorites */}
        {currentView === "help" && renderHelpView()}
        {currentView === "profile_settings" && renderProfileSettingsView()}
        {currentView === "promos" && renderPromosView()}
        {currentView === "favorites" && renderFavoritesView()}

        {/* TAB 1: CLIENT TAB */}
        {activeTab === "client" && currentView === "client" && (
          <div className="space-y-6 animate-fade-in">
            {/* Tracking / Orders List */}
            <div>
              <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#d4af37]" />
                <span>Suivi de mes commandes ({clientOrders.length})</span>
              </h4>

              {clientOrders.length === 0 ? (
                <div className="text-center py-8 bg-neutral-50 border border-neutral-200">
                  <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400 font-medium">Vous n'avez pas encore passé de commande.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {clientOrders.map((order) => (
                    <div key={order.id} className="bg-neutral-50 border border-neutral-200 p-4 space-y-3">
                      <div className="flex justify-between items-start border-b border-neutral-200 pb-2">
                        <div>
                          <p className="text-[10px] font-bold text-neutral-950 uppercase tracking-wider">COMMANDE #{order.id}</p>
                          <p className="text-[9px] text-neutral-400 font-mono">{new Date(order.createdAt).toLocaleDateString("fr-FR")} à {new Date(order.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-neutral-900">{formatFCFA(order.totalAmount)}</p>
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 inline-block mt-1 ${
                            order.paymentStatus === "Validé" 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            Paiement : {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs text-neutral-700">
                            <span className="line-clamp-1 flex-grow">
                              {item.product.nom} <strong className="text-neutral-400 font-medium">x{item.quantity}</strong>
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[11px] shrink-0">{formatFCFA(item.product.prix * item.quantity)}</span>
                              <button
                                onClick={() => {
                                  setSelectedProductForReview(item.product);
                                  setIsReviewOpen(true);
                                }}
                                className="text-[9.5px] font-extrabold text-[#b8901c] hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
                                Avis
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Status Tracker */}
                      <div className="bg-white p-2.5 border border-neutral-150 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-grow">
                          <Clock className="w-4 h-4 text-[#d4af37]" />
                          <div>
                            <p className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Statut de la livraison</p>
                            <p className="text-xs font-extrabold text-neutral-800 mt-1">{order.orderStatus || "En cours de préparation"}</p>
                          </div>
                        </div>
                        {onTrackOrder && (
                          <button
                            onClick={() => onTrackOrder(order.id)}
                            className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-[9px] uppercase tracking-wider px-3 py-1.5 cursor-pointer transition-all shrink-0"
                          >
                            Suivre en direct
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2 is handled via top-level early return isVendeurActive */}


        {/* TAB 3: AFFILIATE TAB */}
        {activeTab === "affilie" && (currentView as any) === "affilie" && (
          <div className="space-y-6 animate-fade-in text-left">
            {user.role !== "affilie" ? (
              <div className="bg-neutral-50 border border-neutral-200 p-5 space-y-4">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 text-[#d4af37] mx-auto mb-2" />
                  <h4 className="text-sm font-black text-neutral-950 uppercase tracking-wider">Programme d'Affiliation Local Miabé Asi</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto mt-2 font-sans">
                    Recommandez les produits de nos artisans locaux, partagez votre lien d'affiliation unique et gagnez <strong className="text-neutral-950">3% de commission</strong> sur chaque vente validée !
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 text-amber-900 rounded-sm font-sans text-xs">
                  <strong>💡 Comment ça fonctionne ?</strong>
                  <ol className="list-decimal pl-4 mt-1.5 space-y-1">
                    <li>Activez votre espace affilié ci-dessous.</li>
                    <li>Copiez et partagez votre lien d'affiliation.</li>
                    <li>Un cookie est stocké sur l'ordinateur de l'acheteur pour 30 jours.</li>
                    <li>Retirez vos commissions via Mix by Yas ou Flooz dès 5 000 FCFA.</li>
                  </ol>
                </div>

                <button
                  onClick={() => handleRoleUpgrade("affilie")}
                  className="w-full bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-black uppercase tracking-widest py-3 text-xs transition-all cursor-pointer rounded-none"
                >
                  Activer mon compte d'affilié
                </button>
              </div>
            ) : (
              /* ACTIVE AFFILIATE USER AREA */
              <div className="space-y-6">
                
                {/* Affiliate Link display */}
                <div className="bg-neutral-950 text-white p-4 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-[#d4af37]" />
                    <h5 className="font-display font-extrabold text-xs uppercase tracking-wider text-white">Mon Lien de Promotion Unique</h5>
                  </div>
                  <p className="text-[9px] text-neutral-400 font-sans">Partagez ce lien à vos partenaires ou abonnés pour percevoir 3% sur leurs paniers :</p>
                  
                  <div className="flex bg-neutral-900 border border-neutral-800 p-1.5 items-center justify-between gap-2.5">
                    <span className="text-[10px] font-mono text-[#d4af37] truncate flex-grow">
                      {window.location.origin}/?ref={user.affiliateCode}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="bg-white hover:bg-[#d4af37] text-neutral-950 hover:text-neutral-950 p-2 font-bold transition-all shrink-0 cursor-pointer rounded-sm"
                      title="Copier le lien"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-none">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Nombre de Clics / Visites</span>
                    <p className="text-lg font-mono font-black text-neutral-950 mt-1">{user.affiliateStats?.clicks || 0}</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-none">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Ventes parrainées</span>
                    <p className="text-lg font-mono font-black text-neutral-950 mt-1">{user.affiliateStats?.ventes || 0}</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-none">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Commissions acquises</span>
                    <p className="text-lg font-mono font-black text-neutral-950 mt-1">{formatFCFA(user.affiliateStats?.commissionsGagnees || 0)}</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-none">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Solde Disponible</span>
                    <p className="text-lg font-mono font-black text-[#b8901c] mt-1">{formatFCFA(user.affiliateStats?.commissionDisponible || 0)}</p>
                  </div>
                </div>

                {/* Real Wallet Ledger Component */}
                <WalletSection wallet={wallet} formatFCFA={formatFCFA} />

                {/* Affiliate Withdrawals Form */}
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-none text-left space-y-4">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-widest flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-[#b8901c]" />
                    <span>Retirer mes commissions d'affiliation</span>
                  </h4>

                  <form onSubmit={handleWithdrawalRequest} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1 text-left">Montant (Min 5 000 F)</label>
                        <input
                          type="number"
                          required
                          placeholder="Ex: 5000"
                          value={withdrawalAmount}
                          onChange={(e) => setWithdrawalAmount(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1 text-left">Réseau / Passerelle de reversement</label>
                        <select
                          value={withdrawalMethod}
                          onChange={(e) => setWithdrawalMethod(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-semibold"
                        >
                          <option value="Mix by Yas">Mix by Yas</option>
                          <option value="Flooz">Flooz (Moov)</option>
                          <option value="PayDunya">PayDunya (Sénégal/Togo)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1 text-left">Numéro de transfert (+228)</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 90123456"
                        value={withdrawalPhone}
                        onChange={(e) => setWithdrawalPhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-mono text-left"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-black uppercase tracking-widest py-2 px-4 rounded-none cursor-pointer text-[10px] transition-all"
                    >
                      Soumettre la demande de transfert
                    </button>
                  </form>
                </div>

                {/* Withdrawals history list */}
                <div className="text-left space-y-3">
                  <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Historique des demandes de retrait</span>
                  </h4>

                  {withdrawalHistory.length === 0 ? (
                    <p className="text-xs text-neutral-400 font-medium py-3 text-center bg-neutral-50 border border-neutral-200">Aucun retrait demandé.</p>
                  ) : (
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {withdrawalHistory.map((item, idx) => (
                        <div key={idx} className="bg-neutral-50 border border-neutral-200 p-2 text-xs flex justify-between items-center">
                          <div>
                            <p className="font-mono font-bold text-[#b8901c]">{formatFCFA(item.amount)}</p>
                            <p className="text-[9px] text-neutral-400">{item.method} ({item.phone})</p>
                          </div>
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm tracking-wider ${
                            item.status === "Payé" 
                              ? "bg-emerald-100 text-emerald-800" 
                              : item.status === "Rejeté" 
                              ? "bg-red-100 text-red-800" 
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS TAB */}
        {activeTab === "notifications" && currentView === "notifications" && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
              <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-widest">Mes alertes en temps réel</h4>
              {unreadNotifs > 0 && (
                <button
                  onClick={handleMarkNotificationsRead}
                  className="text-[9px] font-black uppercase text-[#b8901c] hover:underline cursor-pointer"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-10 bg-neutral-50 border border-neutral-200">
                <Bell className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs text-neutral-400 font-medium">Vous n'avez pas d'alertes.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {notifications.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-3 border text-xs flex gap-3 relative rounded-none ${
                      item.read ? "bg-white border-neutral-200" : "bg-[#d4af37]/5 border-[#d4af37]/35"
                    }`}
                  >
                    {!item.read && (
                      <span className="absolute top-3 left-3 w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                    )}
                    <div className="flex-grow pl-2.5">
                      <p className={`text-neutral-800 font-medium leading-relaxed font-sans ${!item.read ? "font-bold text-neutral-950" : ""}`}>{item.text}</p>
                      <p className="text-[8px] text-neutral-400 mt-1 font-mono">{new Date(item.date).toLocaleDateString("fr-FR")} à {new Date(item.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* RATINGS / REVIEWS MODAL CONTAINER */}
      {isReviewOpen && selectedProductForReview && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-neutral-950/75 backdrop-blur-xs p-4 select-none">
          <div className="bg-white max-w-sm w-full border border-neutral-200 p-5 space-y-4 shadow-2xl rounded-none text-left animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <h5 className="text-[10px] font-black text-neutral-950 uppercase tracking-widest">Donner mon avis sur le produit</h5>
              <button onClick={() => { setIsReviewOpen(false); setSelectedProductForReview(null); }} className="text-neutral-400 hover:text-neutral-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-3 items-center">
              <img src={selectedProductForReview.images?.[0]} alt={selectedProductForReview.nom} className="w-10 h-10 object-cover border border-neutral-200" />
              <h6 className="text-xs font-bold text-neutral-800 line-clamp-2 leading-tight">{selectedProductForReview.nom}</h6>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 text-left">Votre note globale</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? "text-[#d4af37] fill-[#d4af37]" : "text-neutral-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1 text-left">Votre commentaire</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Qu'avez-vous pensé de cet article de production locale ? (Qualité, livraison, emballage...)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-sans"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setIsReviewOpen(false); setSelectedProductForReview(null); }}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-none cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white text-[10px] font-black uppercase tracking-widest py-2 px-5 rounded-none cursor-pointer"
                >
                  Publier l'avis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
