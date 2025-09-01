"use client"

import { Crown, Zap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for trying out our service",
      features: ["1 video or 3 image verifications", "Metadata-only results", "Public verification link"],
      cta: "Start Free",
      popular: false,
      icon: Sparkles,
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "For content creators and professionals",
      features: [
        "25 verifications/month",
        "Full analysis: deepfake detection, metadata, reverse search",
        "Downloadable glass badge (PNG)",
        "Optional auto-overlay badge in video or image",
        "Access to Creator Dashboard",
      ],
      cta: "Get Pro",
      popular: true,
      icon: Crown,
    },
    {
      name: "Enterprise",
      price: "$250+",
      period: "/month",
      description: "For organizations and agencies",
      features: [
        "100+ verifications",
        "Full API access",
        "Auto-embed glass badge into content",
        "White-labeling",
        "Priority support & webhook integration",
        "Multi-user team access",
      ],
      cta: "Contact Sales",
      popular: false,
      icon: Zap,
    },
  ]

  return (
    <section id="pricing" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-8">
            <span className="text-sm text-white/80 uppercase tracking-wider font-medium">Pricing</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Simple,
            </span>
            <br />
            <span className="bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>

          <p className="text-lg md:text-xl font-light text-white/70 max-w-2xl mx-auto">
            Start free, upgrade when you need more power. No hidden fees, no surprises.
          </p>
        </div>

        {/* Enterprise CTA */}
        <div className="text-center mt-16">
          <p className="text-white/70 mb-4">Need a custom solution?</p>
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-xl bg-transparent"
          >
            Contact Enterprise Sales
          </Button>
        </div>
      </div>
    </section>
  )
}
