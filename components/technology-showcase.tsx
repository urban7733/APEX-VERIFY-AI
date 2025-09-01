"use client"

import { useState } from "react"
import { Cpu, Brain, Zap, Shield, Eye, Database, Network, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function TechnologyShowcase() {
  const [activeTab, setActiveTab] = useState(0)

  const technologies = [
    {
      icon: <Brain className="h-6 w-6 text-purple-400" />,
      title: "Neural Architecture",
      description: "Custom-built transformer networks with 2,847 layers",
      details:
        "Our proprietary neural architecture combines multiple transformer models with specialized attention mechanisms for deepfake detection.",
      stats: { layers: "2,847", parameters: "175B+", accuracy: "99.94%" },
    },
    {
      icon: <Eye className="h-6 w-6 text-blue-400" />,
      title: "Computer Vision",
      description: "Advanced pixel-level analysis and temporal consistency",
      details:
        "Multi-scale feature extraction analyzes micro-expressions, lighting inconsistencies, and temporal artifacts invisible to human perception.",
      stats: { resolution: "8K+", frames: "120fps", detection: "0.001%" },
    },
    {
      icon: <Database className="h-6 w-6 text-green-400" />,
      title: "Training Dataset",
      description: "50M+ verified samples across all media types",
      details:
        "Continuously updated dataset includes real and synthetic media from every major platform, ensuring comprehensive detection capabilities.",
      stats: { samples: "50M+", platforms: "47", updates: "Daily" },
    },
    {
      icon: <Network className="h-6 w-6 text-amber-400" />,
      title: "Ensemble Methods",
      description: "127 specialized algorithms working in harmony",
      details:
        "Multiple detection algorithms cross-validate results, from frequency domain analysis to semantic consistency checks.",
      stats: { algorithms: "127", methods: "23", consensus: "99.9%" },
    },
  ]

  const aiCapabilities = [
    {
      icon: <Zap className="h-5 w-5 text-yellow-400" />,
      title: "Real-time Processing",
      value: "< 2.3 seconds",
      description: "Lightning-fast analysis without compromising accuracy",
    },
    {
      icon: <Shield className="h-5 w-5 text-green-400" />,
      title: "Accuracy Rate",
      value: "99.94%",
      description: "Industry-leading precision in deepfake detection",
    },
    {
      icon: <Layers className="h-5 w-5 text-blue-400" />,
      title: "Model Complexity",
      value: "175B+ params",
      description: "Massive scale enables nuanced understanding",
    },
    {
      icon: <Cpu className="h-5 w-5 text-purple-400" />,
      title: "Processing Power",
      value: "2.4 PetaFLOPS",
      description: "Dedicated infrastructure for instant verification",
    },
  ]

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/10 to-blue-900/10"></div>
      <div className="absolute inset-0">
        {/* Neural Network Visualization */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-500 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-32 left-32 w-1 h-1 bg-blue-400 rounded-full animate-pulse animate-delay-200 opacity-30"></div>
        <div className="absolute bottom-40 right-24 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse animate-delay-400 opacity-35"></div>

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <path
            d="M100,100 Q200,50 300,100 T500,100"
            stroke="url(#connectionGradient)"
            strokeWidth="1"
            fill="none"
            className="animate-pulse"
          />
          <path
            d="M150,200 Q250,150 350,200 T550,200"
            stroke="url(#connectionGradient)"
            strokeWidth="1"
            fill="none"
            className="animate-pulse animate-delay-300"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 rounded-full px-4 py-2 mb-6">
            <Brain className="w-4 h-4 mr-2" />
            Proprietary AI Technology
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Hyper-Complex AI
            <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
              Built for Truth
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our proprietary neural networks represent years of research and development, specifically designed to detect
            the most sophisticated deepfakes and AI-generated content.
          </p>
        </div>

        {/* AI Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {aiCapabilities.map((capability, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br from-gray-900/80 to-purple-900/20 border-purple-500/20 rounded-2xl hover:border-purple-500/40 transition-all duration-500 group hover:shadow-2xl hover:shadow-purple-500/10 animate-slide-up-fade`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-gray-800/50 rounded-xl group-hover:bg-purple-500/20 transition-all duration-300">
                    {capability.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {capability.value}
                </div>
                <div className="text-sm font-medium text-gray-300 mb-2">{capability.title}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{capability.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technology Deep Dive */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Technology Tabs */}
          <div className="lg:col-span-1 space-y-3">
            {technologies.map((tech, index) => (
              <Button
                key={index}
                variant={activeTab === index ? "default" : "ghost"}
                className={`w-full justify-start p-4 h-auto rounded-xl transition-all duration-300 ${
                  activeTab === index
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setActiveTab(index)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${activeTab === index ? "bg-white/20" : "bg-gray-800/50"}`}>
                    {tech.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{tech.title}</div>
                    <div className="text-xs opacity-80">{tech.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Technology Details */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 border-purple-500/20 rounded-2xl h-full backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-500/20 rounded-xl">{technologies[activeTab].icon}</div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">{technologies[activeTab].title}</CardTitle>
                    <p className="text-gray-400 text-sm">{technologies[activeTab].description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed mb-6">{technologies[activeTab].details}</p>

                {/* Technical Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(technologies[activeTab].stats).map(([key, value], index) => (
                    <div key={index} className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-lg font-bold text-white mb-1">{value}</div>
                      <div className="text-gray-400 text-xs capitalize">{key}</div>
                    </div>
                  ))}
                </div>

                {/* Visual Representation */}
                <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Processing Pipeline</span>
                    <span className="text-green-400 text-xs">Active</span>
                  </div>
                  <div className="flex space-x-2">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${
                          i <= activeTab * 2 + 1 ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-gray-700"
                        } transition-all duration-500`}
                        style={{ animationDelay: `${i * 100}ms` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
