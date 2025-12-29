import { ArrowUpRight } from "lucide-react"

const projects = [
  {
    title: "Infraestrutura Cloud",
    category: "Consultoria",
    description: "Migração completa para cloud de uma empresa de logística.",
    image: "/cloud-infrastructure-server-room-modern.jpg",
  },
  {
    title: "Sistema de Segurança",
    category: "Segurança",
    description: "Implementação de firewall e monitorização para PME.",
    image: "/cybersecurity-network-protection-digital.jpg",
  },
  {
    title: "Gestão de Rede",
    category: "Administração",
    description: "Reestruturação de rede empresarial com 200+ dispositivos.",
    image: "/network-cables-server-management-technology.jpg",
  },
]

export function PortfolioSection() {
  return (
    <section id="portfolio" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Portfólio</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
            Projetos que fazem a diferença
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Conheça alguns dos trabalhos que realizámos e o impacto que tiveram nos negócios dos nossos clientes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">{project.category}</span>
                <h3 className="text-lg font-semibold text-foreground mt-2 mb-2 flex items-center gap-2">
                  {project.title}
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
