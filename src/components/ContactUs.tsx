import React, { useState } from 'react';
import { Mail, MessageSquare, Send, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="pt-[100px] w-full">
      <section className="bg-[#08081a] w-full px-4 py-16 min-h-[calc(100vh-100px)] flex flex-col items-center">
        <div className="w-full max-w-[1100px]">
          <div className="text-center mb-16">
            <h1 className="hero-heading text-[clamp(32px,5vw,56px)] mb-4 text-center">CONTACT US</h1>
            <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto text-center">Have a question, feedback, or business inquiry? We'd love to hear from you.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 w-full justify-center items-stretch">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-[#0a0a1f] p-8 rounded-2xl border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">Get in Touch</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#00e5ff]/10 rounded-full flex items-center justify-center shrink-0">
                      <Mail size={24} className="text-[#00e5ff]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Email Support</h4>
                      <p className="text-[#94a3b8] text-sm mb-1">For general inquiries and support.</p>
                      <a href="mailto:support@striqo.com" className="text-[#00e5ff] font-bold">support@striqo.com</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#00e5ff]/10 rounded-full flex items-center justify-center shrink-0">
                      <MessageSquare size={24} className="text-[#00e5ff]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Discord Community</h4>
                      <p className="text-[#94a3b8] text-sm mb-1">Join our official Discord server.</p>
                      <a href="https://discord.gg/striqo" target="_blank" rel="noreferrer" className="text-[#00e5ff] font-bold">discord.gg/striqo</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#00e5ff]/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin size={24} className="text-[#00e5ff]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">HQ</h4>
                      <p className="text-[#94a3b8] text-sm">STRIQO Esports<br />Global Remote Team</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-[#0a0a1f] p-8 rounded-2xl border border-white/10">
              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                >
                  <div className="w-20 h-20 bg-[#00e5ff]/20 rounded-full flex items-center justify-center mb-6">
                    <Send size={40} className="text-[#00e5ff]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Message Sent!</h3>
                  <p className="text-[#94a3b8] mb-8">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="btn-igx-outline">SEND ANOTHER MESSAGE</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[#94a3b8] text-sm font-semibold mb-2 uppercase tracking-wide">Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-[#030308] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#00e5ff]/50 transition-colors"
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="block text-[#94a3b8] text-sm font-semibold mb-2 uppercase tracking-wide">Email</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-[#030308] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#00e5ff]/50 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#94a3b8] text-sm font-semibold mb-2 uppercase tracking-wide">Subject</label>
                    <select 
                      required
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-[#030308] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#00e5ff]/50 transition-colors appearance-none"
                    >
                      <option value="" disabled>Select a subject</option>
                      <option value="support">General Support</option>
                      <option value="report">Report a Player/Bug</option>
                      <option value="business">Business Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#94a3b8] text-sm font-semibold mb-2 uppercase tracking-wide">Message</label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-[#030308] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#00e5ff]/50 transition-colors resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-igx w-full flex items-center justify-center gap-2">
                    {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'} <Send size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
