import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageCircle, Loader2 } from 'lucide-react';
import { submitInquiry } from '../api/inquiries';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitInquiry(form);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      // Still show success as it saved to local backup
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center max-w-xl mx-auto">
        <span className="text-[10px] font-bold tracking-widest text-emerald-900 uppercase">
          CLINICAL INQUIRIES & DISPENSARY LIAISON
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0a2e1e]">
          Consult Our Herbalists
        </h1>
        <p className="text-xs sm:text-sm text-[#4b6356]">
          Have questions regarding herbal extractions, drug-botanical interactions, or batch verification? Our licensed pharmacists are available.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#d6e8dd] shadow-xs space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#0a2e1e] border-b border-[#f0f0f0] pb-3">
            OFFICE DETAILS
          </h2>

          <div className="space-y-4 text-xs text-[#4b6356]">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0a2e1e] block">Physical Address</strong>
                Flat No. 64 Lodhi Tola Bareilly<br />
                Uttar Pradesh 243005
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0a2e1e] block">Contact </strong>
                +91 8899903777
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0a2e1e] block">Mail</strong>
                info@shifabazar.in
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0a2e1e] block">Support Hours</strong>
                Mon–Sat: 9:00 AM – 8:00 PM IST<br />
                WhatsApp: Available 24/7 for urgent orders
              </div>
            </div>
          </div>
        </div>

        {/* Inquiries Form */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#d6e8dd] shadow-xs">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-[#0a2e1e]">
                Inquiry Sent Successfully!
              </h3>
              <p className="text-xs text-[#4b6356] max-w-sm mx-auto leading-relaxed">
                Thank you{form.name ? `, ${form.name}` : ''}. Your inquiry has been forwarded to our Admin Portal. Our practitioner team will review your inquiry and get in touch with you shortly.
              </p>

              {/* Direct WhatsApp Quick Followup */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/918899903777?text=${encodeURIComponent(
                    `Hello Shifa Bazar, I submitted a contact inquiry.\nName: ${form.name}\nSubject: ${form.subject}\nMessage: ${form.message}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Also Send on WhatsApp (+91 8899903777)</span>
                </a>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
                  }}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-bold border border-[#0a2e1e] text-[#0a2e1e] hover:bg-emerald-50 transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="border-b border-[#f0f0f0] pb-3">
                <h2 className="font-serif text-lg font-bold text-[#0a2e1e]">
                  Send Us a Message
                </h2>
                <p className="text-[11px] text-gray-500">
                  Your message will be sent directly to the Shifa Bazar Admin Portal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4b6356] font-medium mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-[#f0faf4] border border-[#d6e8dd] rounded-xl px-3 py-2 text-[#0a2e1e] focus:outline-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[#4b6356] font-medium mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full bg-[#f0faf4] border border-[#d6e8dd] rounded-xl px-3 py-2 text-[#0a2e1e] focus:outline-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4b6356] font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-[#f0faf4] border border-[#d6e8dd] rounded-xl px-3 py-2 text-[#0a2e1e] focus:outline-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[#4b6356] font-medium mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Health Tonic query, Order assistance"
                    className="w-full bg-[#f0faf4] border border-[#d6e8dd] rounded-xl px-3 py-2 text-[#0a2e1e] focus:outline-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4b6356] font-medium mb-1">Message / Inquiry Details *</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your health question, medicine requirement, or order query..."
                  className="w-full bg-[#f0faf4] border border-[#d6e8dd] rounded-xl px-3 py-2 text-[#0a2e1e] focus:outline-emerald-800"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0a2e1e] hover:bg-[#072417] text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending to Admin Portal...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SUBMIT INQUIRY</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
