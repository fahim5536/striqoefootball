import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, MessageCircle, ShieldAlert } from 'lucide-react';

const faqs = [
  {
    category: "General",
    questions: [
      { q: "What is STRIQO?", a: "STRIQO is a premier competitive eFootball platform where players can compete in tournaments, climb global leaderboards, and build their legacy." },
      { q: "Is it free to play?", a: "Yes, joining STRIQO and participating in standard tournaments is completely free. We also offer premium features for advanced players." }
    ]
  },
  {
    category: "Matchmaking & Results",
    questions: [
      { q: "How do I play a Friendly Match?", a: "Navigate to the Match Hub, select 'Play with Friend', and enter your friend's 4-digit UI ID. Both players must confirm the match." },
      { q: "How are results verified?", a: "After a match, both players must upload a clear screenshot of the final score. Our AI system verifies the results. If there's a conflict, an admin will review it." }
    ]
  },
  {
    category: "Account & Safety",
    questions: [
      { q: "What happens if I submit a false result?", a: "Submitting false results or manipulated screenshots is a violation of our rules and will result in an immediate account ban." },
      { q: "How do I change my username?", a: "You can change your username in your Profile settings once every 30 days." }
    ]
  }
];

export default function FAQ() {
  const [openQ, setOpenQ] = useState<string | null>(null);

  const toggleQ = (q: string) => {
    setOpenQ(openQ === q ? null : q);
  };

  return (
    <div className="pt-[100px] w-full">
      <section className="bg-[#08081a] w-full px-4 py-16 min-h-[calc(100vh-100px)] flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <HelpCircle size={48} className="text-[#00e5ff]" />
            </div>
            <h1 className="hero-heading text-[clamp(32px,5vw,56px)] mb-4">HELP CENTER</h1>
            <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">Find answers to the most common questions about the STRIQO platform.</p>
          </div>

          <div className="space-y-16">
            {faqs.map((section, idx) => (
              <div key={idx} className="bg-[#0a0a1f] border border-white/5 rounded-2xl p-8 md:p-10">
                <h2 className="text-2xl font-bold text-white mb-8 uppercase tracking-wider">{section.category}</h2>
                <div className="space-y-8">
                  {section.questions.map((item, i) => (
                    <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                      <button 
                        className="w-full flex items-center justify-between p-6 text-left bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => toggleQ(item.q)}
                      >
                        <span className="font-semibold text-white text-lg">{item.q}</span>
                        <ChevronDown 
                          size={24} 
                          className={`text-[#00e5ff] transition-transform duration-300 ${openQ === item.q ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      <AnimatePresence>
                        {openQ === item.q && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 text-[#94a3b8] bg-[#0a0a1f] border-t border-white/5 text-lg leading-relaxed">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center p-8 border border-white/10 rounded-2xl bg-[#0a0a1f] flex flex-col items-center">
            <MessageCircle size={32} className="text-[#00e5ff] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Still need help?</h3>
            <p className="text-[#94a3b8] mb-6">Our support team is available 24/7 to assist you.</p>
            <a href="/contact" className="btn-igx inline-block">CONTACT SUPPORT</a>
          </div>
        </div>
      </section>
    </div>
  );
}
