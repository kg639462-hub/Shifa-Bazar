import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const whatsappUrl = 'https://wa.me/919140403004?text=Hello%20Shifa%20Bazar,%20I%20would%20like%20to%20order%20medicines';

  return (
    <aside aria-label="Customer Support and Direct Orders" className="fixed bottom-5 right-5 z-40 group">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white"
        title="Chat or Order on WhatsApp"
        aria-label="Order or Chat on WhatsApp with Shifa Bazar"
      >
        <span className="relative flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
          <MessageCircle className="w-5 h-5 fill-white stroke-[#25D366]" />
        </span>
        <div className="flex flex-col text-left leading-tight pr-1">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-950/80">Direct Order</span>
          <span className="text-xs font-bold tracking-tight">WhatsApp Us</span>
        </div>
      </a>
    </aside>
  );
}
