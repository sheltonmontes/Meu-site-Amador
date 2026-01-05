import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center pt-16 md:pt-20 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gray-900 dark:bg-slate-950" />
      <div
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage: `url('/modern-futuristic-technology-datacenter-with-blue-.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/70 dark:from-slate-950/70 dark:via-slate-950/50 dark:to-slate-950/70" />

      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance mb-6">
            Soluções modernas para um futuro digital
          </h1>
          <p className="text-lg md:text-xl text-gray-300 dark:text-gray-400 mb-8 max-w-2xl mx-auto text-pretty">
            Transformamos a tecnologia em vantagem competitiva para o seu negócio. Consultoria, segurança e suporte
            técnico de excelência.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]"
            >
              <Link href="#contacto">
                Contactar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 min-h-[44px] bg-transparent transition-all duration-300"
            >
              <Link href="#sobre">Saber mais</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white rounded-full" />
        </div>
      </div>
    </section>
  )
}
