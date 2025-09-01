"use client"

import { Upload, Cpu, Shield, Zap, Globe, Lock, Check, Users, FileText, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useState } from "react"

export function CompactFeatures() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup")

  const features = [
    {
      icon: <Upload className="h-4 w-4 text-white" />,
      title: "Easy Upload",
      description: "Drag and drop any media file for instant analysis.",
    },
    {
      icon: <Cpu className="h-4 w-4 text-white" />,
      title: "AI Analysis",
      description: "Advanced neural networks detect manipulation with precision.",
    },
    {
      icon: <Shield className="h-4 w-4 text-white" />,
      title: "Trust Verification",
      description: "Get verification badges to prove authenticity.",
    },
    {
      icon: <Zap className="h-4 w-4 text-white" />,
      title: "Real-time Results",
      description: "Get instant verification results in seconds.",
    },
    {
      icon: <Globe className="h-4 w-4 text-white" />,
      title: "Public Links",
      description: "Share verification results with public links.",
    },
    {
      icon: <Lock className="h-4 w-4 text-white" />,
      title: "Secure Processing",
      description: "Enterprise-grade security for your content.",
    },
  ]

  const audiences = [
    {
      icon: <Users className="h-4 w-4 text-gray-500" />,
      title: "Content Creators",
      description: "YouTube, TikTok, and Instagram creators building trust with their audience.",
    },
    {
      icon: <FileText className="h-4 w-4 text-gray-500" />,
      title: "Journalists",
      description: "News organizations verifying media authenticity in real-time.",
    },
    {
      icon: <Building2 className="h-4 w-4 text-gray-500" />,
      title: "Agencies",
      description: "Providing proof-of-authenticity for client deliverables.",
    },
  ]

  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for trying out our service",
      features: ["3 verifications", "Public verification link", "Basic support"],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Creator",
      price: "$10",
      period: "/month",
      description: "For content creators and influencers",
      features: ["50 verifications/month", "Verification badges", "Email support", "API access"],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "For professionals and agencies",
      features: ["Unlimited verifications", "White-label solution", "Priority support", "Custom integrations"],
      cta: "Go Pro",
      popular: false,
    },
  ]

  const handleGetStarted = (planName: string) => {
    setAuthMode("signup")
    setAuthDialogOpen(true)
    console.log(`Selected plan: ${planName}`)
  }

  return (
    <>
      <div className="py-12 px-6 space-y-12">
        {/* Features Section - Compact Grid */}
        <section className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight animate-slide-up-fade">
              Powerful Features
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm animate-slide-up-fade animate-delay-100">
              Everything you need to detect deepfakes and verify media authenticity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-200 hover:shadow-lg group rounded-lg hover-lift scan-effect animate-slide-up-fade`}
                style={{ animationDelay: `${(index + 2) * 50}ms` }}
              >
                <CardHeader className="pb-2">
                  <div className="mb-2 p-2 bg-gray-800 rounded-lg w-fit group-hover:bg-gray-700 transition-all duration-200">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-base font-medium text-white group-hover:text-gray-200 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-400 leading-relaxed text-xs group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Combined Audience & Pricing Section */}
        <section className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Who Uses It - Left Side */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight animate-slide-up-fade">
                  Who Uses Truth Intelligence
                </h2>
                <p className="text-gray-400 text-sm animate-slide-up-fade animate-delay-100">
                  Trusted by professionals who value authenticity.
                </p>
              </div>

              <div className="space-y-3">
                {audiences.map((audience, index) => (
                  <Card
                    key={index}
                    className={`bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-200 rounded-lg hover-lift scan-effect animate-slide-up-fade`}
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-800/50 rounded-lg">{audience.icon}</div>
                        <div>
                          <CardTitle className="text-base font-medium text-white">{audience.title}</CardTitle>
                          <CardDescription className="text-gray-400 text-xs leading-relaxed mt-1">
                            {audience.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pricing - Right Side */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight animate-slide-up-fade">
                  Choose Your Plan
                </h2>
                <p className="text-gray-400 text-sm animate-slide-up-fade animate-delay-100">
                  Start free, upgrade when you need more power.
                </p>
              </div>

              <div className="space-y-4">
                {tiers.map((tier, index) => (
                  <Card
                    key={index}
                    className={`bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-lg rounded-lg relative hover-lift scan-effect animate-scale-in ${
                      tier.popular ? "border-gray-600 shadow-lg" : ""
                    }`}
                    style={{ animationDelay: `${(index + 3) * 100}ms` }}
                  >
                    {tier.popular && (
                      <Badge className="absolute -top-2 left-4 bg-white text-black border-0 rounded-md px-3 py-1 text-xs animate-float">
                        Most Popular
                      </Badge>
                    )}

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-medium text-white">{tier.name}</CardTitle>
                          <div className="flex items-baseline mt-1">
                            <span className="text-xl font-bold text-white">{tier.price}</span>
                            {tier.period && <span className="text-gray-400 ml-1 text-sm">{tier.period}</span>}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleGetStarted(tier.name)}
                          size="sm"
                          className={`transition-all duration-200 font-medium rounded-lg ${
                            tier.popular
                              ? "bg-white text-black hover:bg-gray-100 shadow-md hover:shadow-lg transform hover:scale-105"
                              : "bg-gray-800 text-white hover:bg-gray-700"
                          }`}
                        >
                          {tier.cta}
                        </Button>
                      </div>
                      <CardDescription className="text-gray-400 text-xs mt-2">{tier.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <ul className="space-y-1">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-center text-gray-300 text-xs">
                            <Check className="h-3 w-3 text-gray-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authMode} />
    </>
  )
}
