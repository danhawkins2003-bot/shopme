import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, User, RefreshCw, Move, Sparkles } from "lucide-react";
import ayaAvatarImg from "../assets/images/aya_avatar_1786179458119.jpg";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

interface AIAssistantWidgetProps {
  onNavigateToTab?: (tab: "accueil" | "catalogue" | "blog" | "contact") => void;
  onSearchProduct?: (query: string) => void;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "Miawoezon ! 🇹🇬 Je suis **Aya**, l'Assistante IA de Miabé Asi (Le local, notre fierté). Comment puis-je vous aider aujourd'hui ?\n\n- Vous cherchez un **produit Made in Togo** (Miel, Karité, Café...) ?\n- Vous souhaitez connaître nos **frais et délais de livraison** ?\n- Vous souhaitez savoir **comment régler vos achats** ?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragConstraintsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Automatically fade out the tooltip bubble after 12 seconds so it doesn't persistently obstruct content
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: "msg_" + Date.now().toString(),
      sender: "user",
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query.trim(),
          history: historyPayload
        })
      });

      const data = await res.json();

      const botReply = data.response || "Désolé, je n'ai pas pu comprendre votre demande. N'hésitez pas à reformuler !";

      const botMsg: Message = {
        id: "msg_bot_" + Date.now().toString(),
        sender: "bot",
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("AI Assistant Chat Error:", err);
      const errorMsg: Message = {
        id: "msg_err_" + Date.now().toString(),
        sender: "bot",
        text: "Oups, une petite erreur réseau s'est produite. Veuillez réessayer dans quelques instants !",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "🌱 Produits Made in Togo",
    "🚚 Délais de livraison à Lomé",
    "💳 Payer par T-Money / Flooz",
    "🎁 Idées cadeaux artisanat"
  ];

  return (
    <>
      {/* Fullscreen Invisible Drag Boundary */}
      <div 
        ref={dragConstraintsRef} 
        className="fixed inset-4 sm:inset-6 pointer-events-none z-50"
      />

      {/* Floating Draggable Aya Widget */}
      <motion.div
        drag
        dragConstraints={dragConstraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => {
          setIsDragging(true);
          setShowTooltip(false);
        }}
        onDragEnd={() => {
          setTimeout(() => setIsDragging(false), 150);
        }}
        whileDrag={{ scale: 1.06, cursor: "grabbing" }}
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-1.5 select-none touch-none"
        style={{ touchAction: "none" }}
      >
        {/* Closeable Speech Bubble / Tooltip */}
        <AnimatePresence>
          {!isOpen && showTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 5 }}
              transition={{ duration: 0.25 }}
              className="bg-neutral-950/95 text-amber-300 text-[10px] sm:text-[11px] font-bold pl-2.5 pr-1.5 py-1 rounded-full shadow-xl border border-amber-500/40 flex items-center gap-1.5 backdrop-blur-xs max-w-[240px]"
            >
              <Sparkles className="w-3 h-3 text-[#d4af37] animate-pulse shrink-0" />
              <span className="truncate">Besoin d'aide ? Parlons à Aya IA !</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="w-4 h-4 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors ml-0.5 cursor-pointer"
                title="Masquer le message"
                aria-label="Fermer le message d'Aya"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar Bubble Button with Drag Hint */}
        <div className="relative group flex items-center">
          {/* Subtle drag hint indicator on hover */}
          <div className="hidden group-hover:flex items-center gap-0.5 absolute -left-12 bg-neutral-900/90 text-neutral-300 border border-neutral-700 text-[8px] font-semibold px-1.5 py-0.5 rounded-full pointer-events-none shadow-md backdrop-blur-xs">
            <Move className="w-2.5 h-2.5 text-[#d4af37]" />
            <span>Glisser</span>
          </div>

          <button
            onClick={() => {
              if (isDragging) return;
              setIsOpen(!isOpen);
            }}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-neutral-950 text-[#d4af37] border-2 border-[#d4af37] shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-grab active:cursor-grabbing flex items-center justify-center relative overflow-hidden"
            title="Cliquez pour discuter avec Aya ou glissez pour déplacer"
            aria-label="Ouvrir l'assistant IA Aya ou déplacer"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <div className="relative w-full h-full p-0.5 rounded-full overflow-hidden">
                <img
                  src={ayaAvatarImg}
                  alt="Aya"
                  className="w-full h-full object-cover rounded-full pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-neutral-950"></span>
                </span>
              </div>
            )}
          </button>
        </div>
      </motion.div>

      {/* Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 md:bottom-22 right-3 sm:right-6 z-50 w-[92vw] sm:w-[400px] max-h-[80vh] h-[540px] bg-white border border-stone-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="bg-neutral-950 text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full border-2 border-[#d4af37] shrink-0 overflow-hidden shadow-sm">
                  <img
                    src={ayaAvatarImg}
                    alt="Aya"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-neutral-950 rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm tracking-wide text-white">Aya — Assistant IA</h3>
                    <span className="bg-amber-500/20 text-[#d4af37] text-[9px] uppercase font-black px-1.5 py-0.5 rounded-xs border border-amber-500/30">
                      Miabé Asi 🇹🇬
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">En ligne • Déplaçable</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Fermer la conversation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 bg-neutral-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  {msg.sender === "user" ? (
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-[#d4af37] overflow-hidden shrink-0 shadow-xs">
                      <img
                        src={ayaAvatarImg}
                        alt="Aya"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                      msg.sender === "user"
                        ? "bg-neutral-900 text-white rounded-tr-xs"
                        : "bg-white text-neutral-800 border border-stone-200 rounded-tl-xs"
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">{msg.text}</div>
                    <span
                      className={`block text-[9px] mt-1.5 ${
                        msg.sender === "user" ? "text-neutral-400 text-right" : "text-neutral-400"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 items-center">
                  <div className="w-8 h-8 rounded-full border border-[#d4af37] overflow-hidden shrink-0 shadow-xs">
                    <img
                      src={ayaAvatarImg}
                      alt="Aya"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-xs p-3 text-xs text-neutral-500 flex items-center gap-2 shadow-2xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#d4af37]" />
                    <span>Aya prépare votre réponse...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="p-2 bg-stone-100/80 border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="text-[10px] font-semibold bg-white hover:bg-neutral-900 hover:text-white text-neutral-700 px-2.5 py-1 rounded-full border border-stone-300 transition-colors cursor-pointer shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Posez votre question à Aya..."
                disabled={isLoading}
                className="flex-1 bg-neutral-100 border border-stone-200 rounded-xl px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-colors"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 p-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
