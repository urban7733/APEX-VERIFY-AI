"use client"

import { AlertTriangle, TrendingDown, DollarSign, Users, Shield, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ProblemStatement() {
  const problems = [
    {
      icon: <AlertTriangle className="h-6 w-6 text-red-400" />,
      title: "Deepfake Epidemic",
      stat: "900% increase",
      description: "AI-generated content has exploded, making it impossible to distinguish real from fake content.",
      impact: "Creator credibility at risk",
    },
    {
      icon: <TrendingDown className="h-6 w-6 text-orange-400" />,
      title: "Trust Erosion",
      stat: "73% distrust",
      description: "Audiences increasingly doubt the authenticity of digital content they consume daily.",
      impact: "Engagement rates dropping",
    },
    {
      icon: <DollarSign className="h-6 w-6 text-yellow-400" />,
      title: "Revenue Loss",
      stat: "$78B lost",
      description: "Creator economy loses billions annually due to misinformation and authenticity concerns.",
      impact: "Brand partnerships declining",
    },
    {
      icon: <Users className="h-6 w-6 text-blue-400" />,
      title: "Creator Vulnerability",
      stat: "89% affected",
      description: "Content creators face false accusations and struggle to prove their work is authentic.",
      impact: "Career damage potential",
    },
  ]

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-red-900/5 to-black"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-10 w-1 h-1 bg-red-500 rounded-full animate-float opacity-30"></div>
        <div className="absolute bottom-1/4 right-10 w-1 h-1 bg-orange-400 rounded-full animate-float animate-delay-300 opacity-40"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-red-500/10 text-red-400 border-red-500/30 rounded-full px-4 py-2 mb-6">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Critical Industry Challenge
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            The Creator Economy is Under
            <span className="block bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Attack
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            In 2024, the digital content landscape faces an unprecedented crisis. Deepfakes and AI-generated content
            threaten the foundation of trust that the $104 billion creator economy is built upon.
          </p>
        </div>

        {/* Problem Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {problems.map((problem, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br from-gray-900/80 to-red-900/10 border-red-500/20 rounded-2xl hover:border-red-500/40 transition-all duration-500 group hover:shadow-2xl hover:shadow-red-500/10 animate-slide-up-fade`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gray-800/50 rounded-xl group-hover:bg-red-500/20 transition-all duration-300">
                    {problem.icon}
                  </div>
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">{problem.stat}</Badge>
                </div>
                <CardTitle className="text-lg font-semibold text-white group-hover:text-red-300 transition-colors">
                  {problem.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-400 text-sm leading-relaxed mb-3 group-hover:text-gray-300 transition-colors">
                  {problem.description}
                </p>
                <div className="text-xs text-red-400 font-medium bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                  {problem.impact}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Solution Teaser */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 border-purple-500/30 rounded-2xl p-8 max-w-4xl mx-auto backdrop-blur-xl">
            <CardContent className="p-0">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-purple-500/20 rounded-2xl">
                  <Shield className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">But there's a solution.</h3>
              <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
                Apex Verify AI's proprietary AI technology provides instant, accurate verification that protects
                creators and rebuilds trust in the digital economy.
              </p>
              <div className="flex items-center justify-center space-x-6 mt-8">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-300 text-sm">Instant Verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300 text-sm">99.9% Accuracy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300 text-sm">Creator Focused</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
