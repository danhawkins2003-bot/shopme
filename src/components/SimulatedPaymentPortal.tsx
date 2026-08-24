import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Check, AlertCircle, CreditCard, Shield, ArrowLeft, RefreshCw, Smartphone, Globe, Sparkles } from "lucide-react";

interface SimulatedPaymentPortalProps {
  tx: string;
  provider: string;
  onClose: () => void;
}

export default function SimulatedPaymentPortal({ tx, provider, onClose }: SimulatedPaymentPortalProps) {
  const merchantNumber = typeof window !== "undefined" ? (localStorage.getItem("asime_whatsapp_merchant_number") || "22890000000") : "22890000000";
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [step, setStep] = useState<"form" | "processing" | "success" | "error">("form");
  const [statusIndex, setStatusIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Form inputs
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedAggregatorMethod, setSelectedAggregatorMethod] = useState<"mobile" | "card">("mobile");

  // Load Order Details
  useEffect(() => {
    // 1. Try emulated localStorage database
    try {
      const emulatedOrders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
      const found = emulatedOrders.find((o: any) => o.paymentGatewayTxId === tx || o.id === tx);
      if (found) {
        setOrderDetails(found);
        setPhone(found.shippingDetails?.telephone || "");
        setCardName(found.shippingDetails?.nomComplet || "");
        return;
      }
    } catch (e) {
      console.warn("Emulated storage lookup skipped:", e);
    }

    // 2. Fallback: Fetch from API
    fetch("/api/orders/my-orders")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find((o: any) => o.paymentGatewayTxId === tx || o.id === tx);
          if (found) {
            setOrderDetails(found);
            setPhone(found.shippingDetails?.telephone || "");
            setCardName(found.shippingDetails?.nomComplet || "");
          }
        }
      })
      .catch(err => console.error("Error fetching order in gateway:", err));
  }, [tx]);

  // Terminal steps text simulation
  const processingSteps = [
    `[SSL] Initialisation de la connexion sécurisée TLS 1.3 256-bit...`,
    `[AUTH] Liaison cryptée avec la passerelle d'authentification ${provider.toUpperCase()}...`,
    `[GATEWAY] Validation de la transaction ID: ${tx}...`,
    `[GATEWAY] Envoi de la demande de prélèvement de ${(orderDetails?.totalAmount || 15000).toLocaleString()} FCFA...`,
    `[OPERATOR] Approbation du débit par l'opérateur réseau en cours...`,
    `[LEDGER] Écriture comptable sur les portefeuilles vendeurs (90%) et affiliés (3%)...`,
    `[OK] Signature électronique de la transaction confirmée. statut: TRANSACTION_SUCCESS.`
  ];

  useEffect(() => {
    if (step === "processing") {
      const interval = setInterval(() => {
        setStatusIndex(prev => {
          if (prev < processingSteps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 700);
      return () => clearInterval(interval);
    }
  }, [step, processingSteps.length]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    setStatusIndex(0);

    try {
      // Call live confirmation API
      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transactionId: tx, 
          providerId: provider,
          orderId: orderDetails?.id 
        })
      });
      const data = await res.json();
      
      if (data.success) {
        // Wait a bit to complete the simulated logs view
        setTimeout(() => {
          setStep("success");
        }, 5500);
      } else {
        setTimeout(() => {
          setErrorMsg(data.error || "La transaction a été rejetée par l'opérateur de paiement.");
          setStep("error");
        }, 4000);
      }
    } catch (err) {
      setTimeout(() => {
        setErrorMsg("Impossible d'établir la connexion avec les serveurs de Miabé Asi Gateway.");
        setStep("error");
      }, 4000);
    }
  };

  // Determine provider configuration for look & feel
  const getProviderConfig = () => {
    const id = provider.toLowerCase();
    switch (id) {
      case "tmoney":
        return {
          title: "Mix by Yas Checkout",
          logoText: "Mix by Yas",
          primaryColor: "bg-[#0b4d26]",
          textColor: "text-[#0b4d26]",
          borderColor: "border-[#d4af37]",
          accentColor: "#d4af37",
          gradient: "from-[#0F5132] to-[#0b4d26]"
        };
      case "flooz":
        return {
          title: "Moov Flooz Checkout",
          logoText: "Flooz",
          primaryColor: "bg-blue-800",
          textColor: "text-blue-800",
          borderColor: "border-orange-500",
          accentColor: "#ea580c",
          gradient: "from-[#1e40af] to-[#1e3a8a]"
        };
      case "mix_by_yas":
        return {
          title: "Mix by Yas Portal",
          logoText: "Mix by Yas",
          primaryColor: "bg-amber-600",
          textColor: "text-amber-800",
          borderColor: "border-amber-500",
          accentColor: "#d97706",
          gradient: "from-[#d97706] to-[#b45309]"
        };
      case "cinetpay":
        return {
          title: "Portail Régional CinetPay",
          logoText: "CinetPay",
          primaryColor: "bg-[#27272a]",
          textColor: "text-zinc-800",
          borderColor: "border-[#f97316]",
          accentColor: "#f97316",
          gradient: "from-[#3f3f46] to-[#18181b]"
        };
      case "paydunya":
        return {
          title: "Guichet de Paiement Sécurisé",
          logoText: "Miabé Asi Pay",
          primaryColor: "bg-emerald-950",
          textColor: "text-emerald-800",
          borderColor: "border-emerald-500",
          accentColor: "#10b981",
          gradient: "from-[#064e3b] to-[#022c22]"
        };
      case "flutterwave":
        return {
          title: "Flutterwave Checkout",
          logoText: "Flutterwave",
          primaryColor: "bg-[#fbbf24]",
          textColor: "text-amber-800",
          borderColor: "border-orange-600",
          accentColor: "#ea580c",
          gradient: "from-[#ea580c] to-[#b45309]"
        };
      case "stripe":
        return {
          title: "Guichet Sécurisé Stripe",
          logoText: "Stripe",
          primaryColor: "bg-[#6366f1]",
          textColor: "text-indigo-800",
          borderColor: "border-indigo-500",
          accentColor: "#6366f1",
          gradient: "from-[#4f46e5] to-[#3730a3]"
        };
      default:
        return {
          title: "Portail de Paiement Sécurisé",
          logoText: "Miabé Asi Gateway",
          primaryColor: "bg-neutral-900",
          textColor: "text-neutral-900",
          borderColor: "border-gold-500",
          accentColor: "#d4af37",
          gradient: "from-neutral-800 to-neutral-950"
        };
    }
  };

  const config = getProviderConfig();
  const amount = orderDetails?.totalAmount || 15000;
  const orderId = orderDetails?.id || "N/A";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900 flex items-center justify-center p-4 font-sans select-none">
      
      {/* Background visual graphics */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      
      <div className="w-full max-w-lg bg-[#FAF9F6] rounded-lg shadow-2xl overflow-hidden border border-stone-800 relative">
        
        {/* Secure Top Bar */}
        <div className="bg-neutral-950 text-[10px] text-stone-400 font-mono py-2 px-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-1.5 text-emerald-500">
            <Lock className="w-3.5 h-3.5 animate-pulse" />
            <span className="uppercase tracking-wider font-extrabold">Cryptage SSL 256-Bit Activé</span>
          </div>
          <span className="text-stone-500">MIABÉ ASI GATEWAY v4.2</span>
        </div>

        {/* Portal Header with dynamic theme */}
        <div className={`p-6 text-white bg-gradient-to-br ${config.gradient} flex items-center justify-between relative`}>
          <div>
            <div className="text-[9px] uppercase tracking-widest text-stone-300 font-bold">Guichet Émetteur</div>
            <h1 className="text-xl font-black uppercase tracking-tight mt-0.5">{config.title}</h1>
          </div>
          
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-stone-300 font-bold">Montant Commande</p>
            <p className="text-2xl font-black tracking-tight mt-0.5 text-[#d4af37]">{amount.toLocaleString()} <span className="text-xs">FCFA</span></p>
          </div>
        </div>

        {/* Dynamic step rendering */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: INPUT FORM */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 space-y-6"
            >
              {/* Order quick metadata */}
              <div className="bg-stone-100/80 p-3 rounded-sm text-[10px] font-mono flex justify-between border border-stone-200">
                <div>
                  <span className="text-stone-500 font-bold">COMMANDE :</span> <span className="text-neutral-900 font-black">#{orderId}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-bold">TRANSACTION REF :</span> <span className="text-neutral-900 font-black">{tx.slice(0, 16)}...</span>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                
                {/* Instructions speciales pour Mix by Yas */}
                {provider === "mix_by_yas" && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-sm text-[10px] text-amber-950 space-y-2 leading-relaxed">
                    <p className="font-extrabold uppercase text-[8px] text-amber-800 tracking-wider">Instructions de Transfert Mix by Yas</p>
                    <p>
                      Veuillez envoyer le montant de <strong>{(orderDetails?.totalAmount || 15000).toLocaleString()} FCFA</strong> vers le numéro marchand de l'administrateur :
                    </p>
                    <div className="bg-white border border-amber-300 p-2 text-center font-mono text-xs text-neutral-900 select-all font-bold tracking-wider rounded-sm">
                      +{merchantNumber}
                    </div>
                    <p className="text-[9px] text-amber-800">
                      Après avoir effectué le transfert via l'opérateur ou service Mix, renseignez votre numéro de téléphone et un code ou référence de validation ci-dessous pour confirmer l'enregistrement.
                    </p>
                  </div>
                )}

                {/* 1. Mobile Money Interfaces (Flooz, Mix by Yas, TMoney) */}
                {(provider === "flooz" || provider === "mix_by_yas" || provider === "tmoney") && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                        Numéro de Téléphone {provider === "mix_by_yas" ? "Émetteur" : "Mobile Money (" + provider.toUpperCase() + ")"}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-mono text-stone-400 font-bold">
                          +228
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="90 12 34 56"
                          value={phone.replace("+228", "").trim()}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-14 pr-3 py-2 border border-stone-300 rounded-sm font-mono text-sm focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 bg-white"
                        />
                      </div>
                      <p className="text-[8px] text-stone-400 mt-1 leading-tight">
                        {provider === "mix_by_yas" 
                          ? "Saisissez le numéro depuis lequel vous avez effectué le transfert."
                          : `Un push d'autorisation USSD sera envoyé sur ce numéro de téléphone pour validation de la transaction.`}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                        {provider === "mix_by_yas" ? "Code de Transaction / PIN de validation" : "Code PIN de Validation Simulé (4 chiffres)"}
                      </label>
                      <input
                        type="password"
                        maxLength={provider === "mix_by_yas" ? 8 : 4}
                        required
                        placeholder={provider === "mix_by_yas" ? "Ex: 123456" : "••••"}
                        value={pin}
                        onChange={(e) => setPin(provider === "mix_by_yas" ? e.target.value : e.target.value.replace(/\D/g, ""))}
                        className="w-full px-3 py-2 border border-stone-300 rounded-sm font-mono text-center tracking-widest text-lg focus:outline-none focus:border-stone-800 bg-white"
                      />
                      <p className="text-[8px] text-stone-400 mt-1">
                        Saisissez un code fictif ou référence pour autoriser la validation instantanée dans notre bac à sable sécurisé.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Stripe Credit Card Interface */}
                {provider === "stripe" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                        Nom sur la Carte
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Jean Koffi"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-sm text-xs uppercase tracking-wide focus:outline-none focus:border-stone-800 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                        Numéro de Carte Bancaire (Visa / MasterCard)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={19}
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                            setCardNumber(val);
                          }}
                          className="w-full pl-10 pr-3 py-2 border border-[#6366f1] rounded-sm font-mono text-xs tracking-wider focus:outline-none bg-white"
                        />
                        <CreditCard className="w-4 h-4 text-indigo-500 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                          Expiration (MM/AA)
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                            setCardExpiry(val);
                          }}
                          className="w-full px-3 py-2 border border-stone-300 rounded-sm font-mono text-center text-xs focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                          Code CVV / CVC
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-3 py-2 border border-stone-300 rounded-sm font-mono text-center text-xs focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Aggregators (CinetPay, PayDunya, Flutterwave) */}
                {["cinetpay", "paydunya", "flutterwave"].includes(provider) && (
                  <div className="space-y-4">
                    {/* Method Selector */}
                    <div className="grid grid-cols-2 gap-2 border-b border-stone-200 pb-3">
                      <button
                        type="button"
                        onClick={() => setSelectedAggregatorMethod("mobile")}
                        className={`py-2 px-3 border text-center font-bold text-[9px] uppercase tracking-wider rounded-sm flex items-center justify-center gap-1 cursor-pointer ${selectedAggregatorMethod === "mobile" ? "bg-neutral-950 text-[#d4af37] border-neutral-950" : "bg-white text-stone-500 border-stone-200"}`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Mobile Money</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedAggregatorMethod("card")}
                        className={`py-2 px-3 border text-center font-bold text-[9px] uppercase tracking-wider rounded-sm flex items-center justify-center gap-1 cursor-pointer ${selectedAggregatorMethod === "card" ? "bg-neutral-950 text-[#d4af37] border-neutral-950" : "bg-white text-stone-500 border-stone-200"}`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Carte Bancaire</span>
                      </button>
                    </div>

                    {selectedAggregatorMethod === "mobile" ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                            Sélectionner votre Réseau Mobile Money
                          </label>
                          <select className="w-full p-2 border border-stone-300 rounded-sm text-xs bg-white">
                            <option value="tmoney">Mix by Yas (ex-TMoney Togocom)</option>
                            <option value="flooz">Flooz (Moov Africa Togo)</option>
                            <option value="orange">Orange Money (Côte d'Ivoire / Sénégal)</option>
                            <option value="mtn">MTN Mobile Money (Bénin / CI)</option>
                            <option value="wave">Wave Mobile Money</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                            Numéro de téléphone mobile
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="Ex: 90123456"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-sm font-mono text-xs focus:outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                            Simuler le Code PIN à 4 chiffres
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            required
                            placeholder="••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-3 py-2 border border-stone-300 rounded-sm font-mono text-center tracking-widest text-lg focus:outline-none bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                            Nom du porteur
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Koffi Mensah"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-sm text-xs uppercase focus:outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                            Numéro de carte Visa / MasterCard
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={19}
                            placeholder="4000 1234 5678 9000"
                            value={cardNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                              setCardNumber(val);
                            }}
                            className="w-full px-3 py-2 border border-stone-300 rounded-sm font-mono text-xs tracking-wider focus:outline-none bg-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                              Expiration (MM/AA)
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={5}
                              placeholder="08/29"
                              value={cardExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, "");
                                if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                                setCardExpiry(val);
                              }}
                              className="w-full px-3 py-2 border border-stone-300 rounded-sm font-mono text-center text-xs focus:outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                              CVV
                            </label>
                            <input
                              type="password"
                              required
                              maxLength={3}
                              placeholder="•••"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                              className="w-full px-3 py-2 border border-stone-300 rounded-sm font-mono text-center text-xs focus:outline-none bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Secure Trust Badge */}
                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-sm flex items-start gap-2 text-emerald-800 text-[10px] leading-snug">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[8px]">Protection Sandbox de Développement</span>
                    Ceci est une simulation de paiement sécurisé connectée à la base de données locale. Aucun frais réel ne sera facturé.
                  </div>
                </div>

                {/* Submits and Controls */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/3 py-2.5 border border-stone-300 text-stone-600 hover:bg-stone-50 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Annuler</span>
                  </button>
                  <button
                    type="submit"
                    className={`w-2/3 py-2.5 text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${config.primaryColor} hover:opacity-90`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Valider {amount.toLocaleString()} FCFA</span>
                  </button>
                </div>

              </form>
            </motion.div>
          )}

          {/* STEP 2: PROCESSING SIMULATOR */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 text-center space-y-6"
            >
              <div className="flex justify-center py-2">
                <RefreshCw className="w-12 h-12 text-[#d4af37] animate-spin" />
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-black uppercase text-neutral-900 tracking-wide">Traitement Sécurisé en cours...</h2>
                <p className="text-[10px] text-stone-500">Veuillez ne pas fermer cette page ni recharger l'application.</p>
              </div>

              {/* Server terminal log viewer emulation */}
              <div className="bg-neutral-900 rounded-sm p-4 text-left font-mono text-[9px] text-emerald-400 border border-neutral-800 shadow-inner h-40 overflow-y-auto space-y-1.5 leading-normal">
                {processingSteps.slice(0, statusIndex + 1).map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {log}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-emerald-500 shadow-md">
                  <Check className="w-8 h-8 text-emerald-600 stroke-[3px]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[#d4af37] text-[10px] uppercase tracking-widest font-black flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Autorisation Confirmée !</span>
                </div>
                <h2 className="text-xl font-black text-emerald-800 uppercase tracking-tight">Paiement Réussi !</h2>
                <p className="text-[10px] text-stone-600 max-w-sm mx-auto">
                  Votre transaction de <strong>{amount.toLocaleString()} FCFA</strong> a été validée avec succès par les serveurs de <strong>{config.title}</strong>.
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 text-[10px] space-y-1.5 max-w-sm mx-auto font-mono text-left">
                <div className="flex justify-between">
                  <span className="text-stone-400">Numéro de Commande :</span>
                  <span className="font-extrabold text-neutral-800">#{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">ID de Transaction :</span>
                  <span className="font-extrabold text-neutral-800">{tx.slice(0, 18)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Mode Utilisé :</span>
                  <span className="font-extrabold text-neutral-800 uppercase">{provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Reversement Split (90%) :</span>
                  <span className="font-extrabold text-[#0b4d26]">{Math.floor(amount * 0.90).toLocaleString()} FCFA</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-neutral-950 hover:bg-neutral-900 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-sm transition-all cursor-pointer shadow flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Retourner sur Miabé Asi</span>
              </button>
            </motion.div>
          )}

          {/* STEP 4: ERROR PANEL */}
          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-500">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-black text-red-800 uppercase tracking-tight">Échec de la transaction</h2>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  {errorMsg || "L'opérateur de paiement n'a pas pu valider le débit de vos fonds."}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="w-1/2 py-2.5 border border-stone-300 text-stone-600 hover:bg-stone-50 text-[10px] font-black uppercase tracking-widest rounded-sm cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  onClick={() => setStep("form")}
                  className="w-1/2 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm cursor-pointer flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Réessayer</span>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Secure lock footer design */}
        <div className="bg-stone-100 text-[8px] text-stone-500 font-mono py-3 px-4 text-center border-t border-stone-200">
          🔒 Passerelle de test sécurisée par jetons asymétriques AES-GCM. Aucun montant réel n'est débité des réseaux mobiles.
        </div>

      </div>
    </div>
  );
}
