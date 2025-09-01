"use client"

import { Quote, ArrowRight } from "lucide-react"

export function Mission() {
  return (
    <section className="py-32 px-6 relative">
      <blockquote className="text-3xl md:text-5xl font-thin text-white leading-relaxed mb-12 text-center max-w-5xl mx-auto">
        "The last decade we paid to <span className="text-white/40 line-through">remove watermarks</span>
        <br />
        The next one, we're going to pay to <span className="text-green-500">have them</span>"
      </blockquote>

      {/* Minimal section divider */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />

      <div className="max-w-5xl mx-auto">
        {/* Mission statement */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-12">
            <Quote className="w-4 h-4 text-white/40" />
            <span className="text-white/60 text-sm font-mono tracking-wider">OUR MISSION</span>
            <Quote className="w-4 h-4 text-white/40 rotate-180" />
          </div>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-12" />

          <p className="text-xl text-white/60 font-light max-w-3xl mx-auto leading-relaxed">
            We're building the infrastructure for digital authenticity in an age where synthetic media is
            indistinguishable from reality. Every creator deserves the tools to prove their work is genuine.
          </p>
        </div>

        {/* Vision points */}
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              title: "AUTHENTICITY",
              description: "Establishing digital provenance as a fundamental right",
            },
            {
              title: "TRANSPARENCY",
              description: "Making AI detection accessible to every creator",
            },
            {
              title: "TRUST",
              description: "Rebuilding confidence in digital media",
            },
          ].map((point, index) => (
            <div key={index} className="text-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-6" />
              <h3 className="text-white font-mono text-sm tracking-wider mb-4">{point.title}</h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-4 px-8 py-4 border border-white/10 hover:border-white/20 transition-colors cursor-pointer group">
            <span className="text-white/80 font-mono text-sm tracking-wider">JOIN THE MOVEMENT</span>
            <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </section>
  )
}
