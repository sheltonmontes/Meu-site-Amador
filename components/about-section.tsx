import { Target, Eye, Heart } from "lucide-react"

const values = [
  {
    icon: Target,
    title: "Missão",
    description:
      "Fornecer soluções tecnológicas inovadoras que impulsionem o sucesso dos nossos clientes, através de serviços de excelência e compromisso com a qualidade.",
  },
  {
    icon: Eye,
    title: "Visão",
    description:
      "Ser reconhecidos como parceiros de referência na transformação digital, liderando através da inovação e da confiança que construímos com cada cliente.",
  },
  {
    icon: Heart,
    title: "Valores",
    description:
      "Profissionalismo, inovação e confiança são os pilares que orientam todas as nossas ações e relações com clientes e parceiros.",
  },
]

export function AboutSection() {
  return (
    <section id="sobre" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Sobre nós</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
            Excelência em soluções tecnológicas
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            A Montes Tech é uma empresa especializada em tecnologias de informação, dedicada a transformar desafios
            tecnológicos em oportunidades de crescimento. Com uma equipa experiente e apaixonada pela inovação,
            oferecemos soluções personalizadas que respondem às necessidades específicas de cada cliente.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <value.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
