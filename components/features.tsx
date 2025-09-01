"use client"

import { Shield, Zap, Brain } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Brain,
      title: "NEURAL ARCHITECTURE",
      description: "2,847-layer networks trained on 50M+ samples",
      metric: "99.9%",
      unit: "ACCURACY",
    },
    {
      icon: Zap,
      title: "REAL-TIME PROCESSING",
      description: "Lightning-fast verification in seconds",
      metric: "2.3",
      unit: "SECONDS",
    },
    {
      icon: Shield,
      title: "CREATOR PROTECTION",
      description: "Built specifically for the creator economy",
      metric: "10M+",
      unit: "VERIFIED",
    },
  ]

  return (
    <section id="features" className="py-32 px-6 relative">
      {/* Minimal section divider */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Minimal header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-2 h-2 bg-white/20 rounded-full" />
            <span className="text-white/60 text-sm font-mono tracking-wider">TECHNOLOGY</span>
            <div className="w-2 h-2 bg-white/20 rounded-full" />
          </div>

          <h2 className="text-4xl md:text-6xl font-thin text-white mb-6">
            Hyper-Complex AI
            <br />
            <span className="text-white/40">Simple Interface</span>
          </h2>
        </div>

        {/* Features grid - ultra minimal */}
        <div className="grid lg:grid-cols-3 gap-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              {/* Icon */}
              <div className="w-16 h-16 border border-white/10 flex items-center justify-center mx-auto mb-8 group-hover:border-white/20 transition-colors">
                <feature.icon className="h-6 w-6 text-white/60" />
              </div>

              {/* Metric */}
              <div className="mb-6">
                <div className="text-4xl font-thin text-white mb-2">{feature.metric}</div>
                <div className="text-xs text-white/40 font-mono tracking-wider">{feature.unit}</div>
              </div>

              {/* Content */}
              <h3 className="text-white font-mono text-sm tracking-wider mb-4">{feature.title}</h3>
              <p className="text-white/60 text-sm font-light leading-relaxed max-w-xs mx-auto">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
