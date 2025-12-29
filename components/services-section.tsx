import { Server, Shield, Headphones, Monitor } from "lucide-react"

const services = [
  {
    icon: Monitor,
    title: "Consultoria em TI",
    description:
      "Análise estratégica e planeamento tecnológico para otimizar os processos e infraestruturas da sua empresa.",
  },
  {
    icon: Server,
    title: "Administração de Sistemas",
    description: "Gestão completa de sistemas e redes, garantindo disponibilidade, desempenho e escalabilidade.",
  },
  {
    icon: Shield,
    title: "Segurança Informática",
    description:
      "Proteção avançada contra ameaças cibernéticas, auditorias de segurança e implementação de políticas robustas.",
  },
  {
    icon: Headphones,
    title: "Suporte Técnico",
    description:
      "Assistência técnica especializada e rápida resolução de problemas para manter a sua operação sempre ativa.",
  },
]

export function ServicesSection() {
  return (
    <section id="servicos" className="py-20 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">O que fazemos</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
            Serviços especializados para o seu negócio
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Oferecemos uma gama completa de serviços tecnológicos para apoiar a transformação digital da sua empresa.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <service.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
