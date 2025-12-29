"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "#inicio", label: "Início" },
  { href: "#sobre", label: "Sobre" },
  { href: "#servicos", label: "Serviços" },
  { href: "#portfolio", label: "Portefólio" },
  { href: "#contacto", label: "Contacto" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-blue-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-24">
          <Link href="/" className="flex items-center gap-2 group relative top-1">
            <Image
              src="/montes-tech-logo.png"
              alt="Montes Tech"
              width={400}
              height={150}
              className="h-24 md:h-28 w-auto group-hover:scale-105 transition-transform drop-shadow-md"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
            >
              <Link href="#contacto">Contactar</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-blue-100">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-3 px-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                asChild
                className="mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Link href="#contacto" onClick={() => setIsMenuOpen(false)}>
                  Contactar
                </Link>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
