import { Users, FileText, Palette, Building2 } from "lucide-react"

export default function Audience() {
  const audiences = [
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Content Creators",
      description:
        "YouTube, X, TikTok, and Instagram creators who want to prove their content is authentic and build trust with their audience.",
    },
    {
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      title: "Journalists",
      description:
        "War reporters and news organizations who need to verify the authenticity of media in an era of misinformation.",
    },
    {
      icon: <Palette className="h-8 w-8 text-blue-500" />,
      title: "Digital Artists & Influencers",
      description:
        "Protect your original work and brand by verifying your content hasn't been manipulated or misrepresented.",
    },
    {
      icon: <Building2 className="h-8 w-8 text-blue-500" />,
      title: "Agencies",
      description:
        "Provide proof-of-authenticity for client deliverables and build trust in your brand with verified content.",
    },
  ]

  return (
    <section id="audience" className="py-24 bg-zinc-900/50 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Who Uses Truth Intelligence</h2>
        <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-16">
          In a time where AI-generated fakes flood the internet, Truth Intelligence is the trust layer for digital
          professionals.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {audiences.map((item, index) => (
            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-blue-900/50 transition-all duration-300"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-zinc-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-900/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-900/50 to-transparent" />
    </section>
  )
}
