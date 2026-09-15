import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, EyeOff } from 'lucide-react';
import { collection, onSnapshot, addDoc, db, auth, onAuthStateChanged } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

export const GlobalChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [widgetVisible, setWidgetVisible] = useState(localStorage.getItem('chatWidgetVisible') !== 'false');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: any) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isOpen) {
      const unsub = onSnapshot(collection(db, 'messages'), (snap: any) => {
        const msgs = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
      return () => unsub();
    }
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    try {
      await addDoc(collection(db, 'messages'), {
        userId: user.id || user.uid,
        username: user.username || user.displayName || user.email.split('@')[0],
        text: newMessage.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const hideWidget = () => {
    setIsOpen(false);
    setWidgetVisible(false);
    localStorage.setItem('chatWidgetVisible', 'false');
    // Note: User can re-enable this in profile settings in a full app, but for now we'll just hide it as requested.
  };

  if (!widgetVisible) return null;

  return (
    <>
      {/* Backdrop for mobile closing */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-[1000] sm:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[1002] p-4 bg-[#00e5ff] text-[#0a0a1f] rounded-full shadow-[0_0_15px_rgba(0,229,255,0.5)] flex items-center justify-center hover:shadow-[0_0_25px_rgba(0,229,255,0.8)] transition-shadow"
      >
        <MessageSquare size={28} />
      </motion.button>

      {/* Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-[100dvh] w-full sm:w-[380px] bg-[#0d0d2b] border-l border-[#00e5ff]/30 z-[1001] flex flex-col shadow-2xl pt-safe"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#00e5ff]/30 bg-[#0a0a1f] pt-safe-top">
              <h3 className="font-['Orbitron'] font-bold text-[#00e5ff] uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={20} />
                Global Chat
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={hideWidget}
                  title="Turn off chat widget completely"
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <EyeOff size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-[#00e5ff] transition-colors bg-white/10 p-1.5 rounded-md"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 font-mono text-sm text-center">
                  No messages yet.<br />Be the first to say something!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = user && (msg.userId === (user.id || user.uid));
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {msg.username}
                        </span>
                        {msg.createdAt && (
                          <span className="text-[9px] text-gray-600 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-[85%] break-words ${
                          isMe
                            ? 'bg-[#00e5ff] text-[#0a0a1f] rounded-tr-sm'
                            : 'bg-white/10 text-white rounded-tl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#00e5ff]/30 bg-[#0a0a1f] pb-safe">
              {user ? (
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00e5ff] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-[#00e5ff] text-[#0a0a1f] px-4 py-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                  >
                    <Send size={20} />
                  </button>
                </form>
              ) : (
                <div className="text-center text-gray-400 text-sm font-mono py-2">
                  Please log in to chat.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
