import { Upload, Cpu, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function InfoCards() {
  const features = [
    {
      icon: <Upload className="h-10 w-10 text-blue-500" />,
      title: "Upload",
      description:
        "Simply upload any media file through our secure platform. Support for images, videos, and audio files with drag-and-drop functionality and batch processing capabilities.",
    },
    {
      icon: <Cpu className="h-10 w-10 text-blue-500" />,
      title: "AI Analysis",
      description:
        "Our advanced neural networks scan for manipulation markers, analyzing pixel-level inconsistencies, audio waveform anomalies, and metadata discrepancies invisible to the human eye.",
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-blue-500" />,
      title: "Verification",
      description:
        "Receive a comprehensive verification report with our trust badge system. Embed verification certificates directly into your content to build audience confidence.",
    },
  ]

  return (
    <section className="py-24 bg-black relative">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          How <span className="text-blue-500">Truth Intelligence</span> Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:border-blue-900/50 transition-all duration-300"
            >
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-2xl font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400 text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-900/50 to-transparent" />
    </section>
  )
}
