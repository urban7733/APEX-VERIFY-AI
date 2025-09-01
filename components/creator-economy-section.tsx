"use client"

import { TrendingUp, DollarSign, Users, Shield, Play, Camera, Mic, Video } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function CreatorEconomySection() {
  const creatorStats = [
    {
      icon: <DollarSign className="h-6 w-6 text-green-400" />,
      title: "Creator Economy Value",
      value: "$104B",
      growth: "+22% YoY",
      description: "Total market value in 2024",
    },
    {
      icon: <Users className="h-6 w-6 text-blue-400" />,
      title: "Active Creators",
      value: "50M+",
      growth: "+15% YoY",
      description: "Worldwide content creators",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-400" />,
      title: "Trust Crisis Impact",
      value: "73%",
      growth: "-12% trust",
      description: "Audience skepticism rate",
    },
    {
      icon: <Shield className="h-6 w-6 text-amber-400" />,
      title: "Revenue at Risk",
      value: "$78B",
      growth: "Growing",
      description: "Due to authenticity concerns",
    },
  ]

  const creatorTypes = [
    {
      icon: <Camera className="h-8 w-8 text-pink-400" />,
      title: "Content Creators",
      platforms: ["YouTube", "Instagram", "TikTok"],
      challenge: "Proving original content authenticity",
      solution: "Instant verification badges",
      impact: "+347% trust score increase",
    },
    {
      icon: <Video className="h-8 w-8 text-blue-400" />,
      title: "Video Producers",
      platforms: ["YouTube", "Vimeo", "Twitch"],
      challenge: "Deepfake accusations and false claims",
      solution: "Frame-by-frame verification",
      impact: "99.9% accuracy protection",
    },
    {
      icon: <Mic className="h-8 w-8 text-green-400" />,
      title: "Podcasters",
      platforms: ["Spotify", "Apple", "Google"],
      challenge: "Voice cloning and audio manipulation",
      solution: "Audio fingerprint verification",
      impact: "Real-time authenticity proof",
    },
    {
      icon: <Play className="h-8 w-8 text-purple-400" />,
      title: "Live Streamers",
      platforms: ["Twitch", "YouTube", "TikTok"],
      challenge: "Real-time deepfake technology",
      solution: "Live verification streaming",
      impact: "Instant trust building",
    },
  ]

  const economicImpact = [
    {
      metric: "Revenue Protection",
      value: "$2.4M+",
      description: "Protected for verified creators",
      trend: "↗️ +156%",
    },
    {
      metric: "Brand Partnerships",
      value: "+89%",
      description: "Increase for verified creators",
      trend: "↗️ +23%",
    },
    {
      metric: "Audience Trust",
      value: "+347%",
      description: "Trust score improvement",
      trend: "↗️ +67%",
    },
    {
      metric: "Engagement Rate",
      value: "+124%",
      description: "Higher verified content engagement",
      trend: "↗️ +45%",
    },
  ]

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900/5 to-purple-900/5"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-green-500 rounded-full animate-float opacity-40"></div>
        <div className="absolute bottom-32 right-24 w-1.5 h-1.5 bg-purple-500 rounded-full animate-float animate-delay-300 opacity-35"></div>
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-float animate-delay-500 opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-green-500/10 text-green-400 border-green-500/30 rounded-full px-4 py-2 mb-6">
            <TrendingUp className="w-4 h-4 mr-2" />
            Creator Economy Focus
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Built for the
            <span className="block bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Creator Economy
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            In a $104 billion creator economy, authenticity isn't just important—it's everything. Apex Verify AI
            protects creators' livelihoods and rebuilds audience trust.
          </p>
        </div>

        {/* Creator Economy Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {creatorStats.map((stat, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br from-gray-900/80 to-green-900/10 border-green-500/20 rounded-2xl hover:border-green-500/40 transition-all duration-500 group hover:shadow-2xl hover:shadow-green-500/10 animate-slide-up-fade`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gray-800/50 rounded-xl group-hover:bg-green-500/20 transition-all duration-300">
                    {stat.icon}
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">{stat.growth}</Badge>
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-green-300 transition-colors">
                  {stat.value}
                </div>
                <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-400 text-xs">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Creator Types Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {creatorTypes.map((creator, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br from-gray-900/80 to-purple-900/10 border-purple-500/20 rounded-2xl hover:border-purple-500/40 transition-all duration-500 group hover:shadow-2xl hover:shadow-purple-500/10 animate-slide-up-fade`}
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-gray-800/50 rounded-2xl group-hover:bg-purple-500/20 transition-all duration-300">
                    {creator.icon}
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-white text-center group-hover:text-purple-300 transition-colors">
                  {creator.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div>
                  <div className="text-xs text-gray-400 mb-2">Platforms</div>
                  <div className="flex flex-wrap gap-1">
                    {creator.platforms.map((platform, i) => (
                      <Badge key={i} className="bg-white/5 text-gray-300 border-white/10 text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Challenge</div>
                  <div className="text-xs text-gray-300">{creator.challenge}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Our Solution</div>
                  <div className="text-xs text-blue-400">{creator.solution}</div>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="text-xs text-green-400 font-medium">{creator.impact}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Economic Impact */}
        <Card className="bg-gradient-to-br from-gray-900/80 to-green-900/20 border-green-500/30 rounded-2xl p-8 backdrop-blur-xl">
          <CardContent className="p-0">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Measurable Economic Impact</h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Apex Verify AI doesn't just protect authenticity—it drives real economic value for creators.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {economicImpact.map((impact, index) => (
                <div
                  key={index}
                  className={`text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-green-500/30 transition-all duration-300 animate-slide-up-fade`}
                  style={{ animationDelay: `${(index + 8) * 100}ms` }}
                >
                  <div className="text-2xl font-bold text-white mb-2">{impact.value}</div>
                  <div className="text-sm font-medium text-gray-300 mb-2">{impact.metric}</div>
                  <div className="text-xs text-gray-400 mb-3">{impact.description}</div>
                  <div className="text-xs text-green-400 font-medium">{impact.trend}</div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105">
                Join 50K+ Verified Creators
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
