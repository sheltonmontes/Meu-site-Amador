"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Send } from "lucide-react"

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    setIsSubmitting(true)

    const formData = new FormData(form)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string

    // Criar mailto link com os dados do formulário
    const mailtoLink = `mailto:sheltonmontes0@montestech.online?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(`Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`)}`

    // Abrir cliente de email
    window.location.href = mailtoLink

    setIsSubmitting(false)

    // Dar feedback ao utilizador
    setTimeout(() => {
      alert("O seu cliente de email foi aberto. Por favor, envie a mensagem a partir do seu email.")
      form.reset()
    }, 500)
  }

  const handleInvalid = (e: React.InvalidEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.preventDefault()
    const target = e.target as HTMLInputElement | HTMLTextAreaElement

    if (target.validity.valueMissing) {
      target.setCustomValidity("Por favor, preencha este campo.")
    } else if (target.validity.typeMismatch && target.type === "email") {
      target.setCustomValidity("Por favor, introduza um endereço de email válido.")
    } else {
      target.setCustomValidity("")
    }

    target.reportValidity()
  }

  const handleInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement
    target.setCustomValidity("")
  }

  return (
    <section id="contacto" className="py-20 md:py-32 bg-foreground dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Contacto</p>
          <h2 className="text-3xl md:text-4xl font-bold text-background dark:text-white mb-6 text-balance">
            Vamos conversar sobre o seu projecto
          </h2>
          <p className="text-lg text-background/70 dark:text-gray-300 text-pretty">
            Entre em contacto connosco para saber como podemos ajudar a transformar o seu negócio.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info + Map */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-background dark:text-white mb-1">Email</h3>
                <a
                  href="mailto:sheltonmontes0@montestech.online"
                  className="text-background/70 dark:text-gray-300 hover:text-background dark:hover:text-white transition-colors"
                >
                  sheltonmontes0@montestech.online
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-background dark:text-white mb-1">Telefone</h3>
                <a
                  href="tel:+258840537659"
                  className="text-background/70 dark:text-gray-300 hover:text-background dark:hover:text-white transition-colors"
                >
                  +258 84 053 7659
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-background dark:text-white mb-1">Localização</h3>
                <p className="text-background/70 dark:text-gray-300">Maputo, Cidade de Maputo, Moçambique</p>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden border-2 border-background/20 shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115149.45099869823!2d32.51686567910156!3d-25.965269999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee69b2f4e0ff32d%3A0x5b1e8db45516f4d5!2sMaputo%2C%20Mo%C3%A7ambique!5e0!3m2!1spt-PT!2spt!4v1234567890123!5m2!1spt-PT!2spt"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Montes Tech em Maputo"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-background dark:text-white">
                  Nome
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="O seu nome"
                  required
                  onInvalid={handleInvalid}
                  onInput={handleInput}
                  className="bg-background/10 dark:bg-white/10 border-background/20 dark:border-white/20 text-background dark:text-white placeholder:text-background/50 dark:placeholder:text-white/50 min-h-[44px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-background dark:text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@exemplo.pt"
                  required
                  onInvalid={handleInvalid}
                  onInput={handleInput}
                  className="bg-background/10 dark:bg-white/10 border-background/20 dark:border-white/20 text-background dark:text-white placeholder:text-background/50 dark:placeholder:text-white/50 min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-background dark:text-white">
                Assunto
              </Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Como podemos ajudar?"
                required
                onInvalid={handleInvalid}
                onInput={handleInput}
                className="bg-background/10 dark:bg-white/10 border-background/20 dark:border-white/20 text-background dark:text-white placeholder:text-background/50 dark:placeholder:text-white/50 min-h-[44px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-background dark:text-white">
                Mensagem
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Descreva o seu projecto ou questão..."
                rows={5}
                required
                onInvalid={handleInvalid}
                onInput={handleInput}
                className="bg-background/10 dark:bg-white/10 border-background/20 dark:border-white/20 text-background dark:text-white placeholder:text-background/50 dark:placeholder:text-white/50 resize-none"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-background dark:bg-white text-foreground dark:text-slate-900 hover:bg-background/90 dark:hover:bg-white/90 min-h-[44px]"
            >
              {isSubmitting ? (
                "A enviar..."
              ) : (
                <>
                  Enviar mensagem
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
