import { Card, CardContent } from "@/components/ui/card"
import { Upload, Search, CheckCircle } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: <Upload className="h-6 w-6 text-white" />,
      title: "Upload Media",
      description: "Drag and drop your file into our secure platform.",
      step: "01",
    },
    {
      icon: <Search className="h-6 w-6 text-white" />,
      title: "AI Analysis",
      description: "Our AI scans for deepfake markers and manipulation traces.",
      step: "02",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-white" />,
      title: "Get Results",
      description: "Receive instant verification with detailed reports.",
      step: "03",
    },
  ]

  return (
    <section id="how-it-works" className="py-16 px-6 bg-zinc-900/20 rounded-3xl mx-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-data-stream"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-data-stream animate-delay-400"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight animate-slide-up-fade">
            How It Works
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto animate-slide-up-fade animate-delay-200">
            Three simple steps to verify your media and build trust.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Animated Connection Lines */}
          <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-px bg-gradient-to-r from-zinc-700 via-blue-500/50 to-zinc-700 transform -translate-y-1/2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-data-stream"></div>
          </div>

          {steps.map((step, index) => (
            <Card
              key={index}
              className={`bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 relative rounded-2xl hover-lift scan-effect animate-scale-in`}
              style={{ animationDelay: `${(index + 3) * 200}ms` }}
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse-glow`}
                >
                  {step.step}
                </div>
                <div className="mb-4 p-3 bg-zinc-800 rounded-xl w-fit mx-auto group-hover:bg-blue-600 transition-all duration-300 hover:animate-float">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed text-sm group-hover:text-zinc-300 transition-colors">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
