"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppButton() {
  const phoneNumber = "258840537659"
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Olá%20Montes%20Tech%2C%20gostaria%20de%20saber%20mais%20sobre%20os%20vossos%20serviços.`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-40 bg-[#25D366] hover:bg-[#20BA5C] text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
      aria-label="Contacte-nos pelo WhatsApp"
    >
      <MessageCircle size={28} />
      <span className="absolute right-16 bg-[#25D366] dark:bg-[#20BA5C] text-white px-4 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Mensagem WhatsApp
      </span>
    </a>
  )
}
