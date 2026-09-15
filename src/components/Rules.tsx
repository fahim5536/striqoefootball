import React from 'react';
import { ShieldCheck, AlertTriangle, Scale, Trophy } from 'lucide-react';

export default function Rules() {
  return (
    <div className="pt-[100px] w-full">
      <section className="bg-[#08081a] w-full px-4 py-16 min-h-[calc(100vh-100px)] flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <ShieldCheck size={48} className="text-[#00e5ff]" />
            </div>
            <h1 className="hero-heading text-[clamp(32px,5vw,56px)] mb-4">OFFICIAL RULES</h1>
            <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">Please review the official rules of conduct and fair play on the STRIQO platform.</p>
          </div>

          <div className="space-y-12">
            
            <div className="bg-[#0a0a1f] p-8 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                <Trophy size={32} className="text-[#00e5ff]" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">1. Match Rules</h2>
              </div>
              <ul className="space-y-4 text-[#94a3b8] list-disc list-inside">
                <li>All matches must be played in standard 1v1 mode unless otherwise specified in tournament rules.</li>
                <li>Match duration must be set to 10 minutes.</li>
                <li>Injuries must be turned OFF.</li>
                <li>Condition must be set to Normal (→) for all players to ensure fair competition.</li>
                <li>If a disconnection occurs before the 15th minute and the score is tied, the match must be restarted.</li>
              </ul>
            </div>

            <div className="bg-[#0a0a1f] p-8 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                <Scale size={32} className="text-[#00e5ff]" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">2. Result Reporting</h2>
              </div>
              <ul className="space-y-4 text-[#94a3b8] list-disc list-inside">
                <li>Both players are required to take a clear screenshot of the final score screen immediately after the match ends.</li>
                <li>Results must be submitted within 15 minutes of the match concluding.</li>
                <li>Screenshots must be uncropped and clearly show the usernames and the final score.</li>
                <li>If there is a dispute, an admin will review the submitted evidence. The admin's decision is final.</li>
              </ul>
            </div>

            <div className="bg-[#0a0a1f] p-8 border border-red-500/30 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                <AlertTriangle size={32} className="text-red-500" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">3. Zero Tolerance Policy</h2>
              </div>
              <p className="text-[#94a3b8] mb-4">
                STRIQO maintains a zero-tolerance policy for cheating, toxicity, and result manipulation. 
                Any of the following will result in an immediate and permanent account ban:
              </p>
              <ul className="space-y-4 text-[#94a3b8] list-disc list-inside">
                <li>Using lag switches or network manipulation software.</li>
                <li>Falsifying or photoshopping match result screenshots.</li>
                <li>Harassing, threatening, or abusing other players via chat or discord.</li>
                <li>Match-fixing or intentionally losing to boost another player's rating.</li>
              </ul>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
