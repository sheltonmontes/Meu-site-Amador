import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/montes-tech-logo.png"
              alt="Montes Tech"
              width={400}
              height={150}
              className="h-28 md:h-32 w-auto drop-shadow-md mb-2"
            />
            <p className="text-sm text-muted-foreground">Soluções modernas para um futuro digital</p>
            <p className="text-xs text-muted-foreground">Maputo, Moçambique</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Montes Tech. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
