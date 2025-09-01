"use client"

import { Camera, Newspaper, Briefcase, Users, Play, Mic, Video, ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function UseCases() {
  const useCases = [
    {
      icon: <Camera className="h-8 w-8 text-pink-400" />,
      title: "Content Creators",
      subtitle: "YouTube, Instagram, TikTok",
      challenge: "Proving authenticity in an AI-saturated world",
      solution: "Instant verification badges for all content",
      results: ["347% increase in audience trust", "89% more brand partnerships", "124% higher engagement rates"],
      testimonial: "Apex Verify AI saved my career. Now my audience knows everything I share is real.",
      author: "Sarah Chen, 2.3M subscribers",
    },
    {
      icon: <Newspaper className="h-8 w-8 text-blue-400" />,
      title: "Journalists & News",
      subtitle: "Breaking news verification",
      challenge: "Verifying user-generated content in real-time",
      solution: "Instant deepfake detection for breaking news",
      results: [
        "99.9% accuracy in crisis situations",
        "2.3 second verification time",
        "Zero false positives in 6 months",
      ],
      testimonial: "In war reporting, Apex Verify AI helps us verify footage instantly and safely.",
      author: "Marcus Rodriguez, Reuters",
    },
    {
      icon: <Briefcase className="h-8 w-8 text-green-400" />,
      title: "Marketing Agencies",
      subtitle: "Brand protection & compliance",
      challenge: "Ensuring client content authenticity",
      solution: "White-label verification for client campaigns",
      results: ["$2.4M+ in protected revenue", "100% client satisfaction", "Zero authenticity disputes"],
      testimonial: "Our clients trust us because we can prove everything we deliver is authentic.",
      author: "Emily Watson, Creative Director",
    },
    {
      icon: <Users className="h-8 w-8 text-purple-400" />,
      title: "Enterprise & Legal",
      subtitle: "Evidence verification",
      challenge: "Authenticating digital evidence for legal proceedings",
      solution: "Forensic-grade verification with detailed reports",
      results: ["Court-admissible reports", "Blockchain-verified results", "Expert witness support"],
      testimonial: "Apex Verify AI provides the technical foundation our legal team needs.",
      author: "David Kim, Legal Tech Firm",
    },
  ]

  const mediaTypes = [
    {
      icon: <ImageIcon className="h-6 w-6 text-blue-400" />,
      title: "Images",
      formats: ["JPEG", "PNG", "GIF", "WebP"],
      capabilities: ["Face swap detection", "Object manipulation", "Background replacement", "Style transfer"],
    },
    {
      icon: <Video className="h-6 w-6 text-green-400" />,
      title: "Videos",
      formats: ["MP4", "AVI", "MOV", "WebM"],
      capabilities: ["Deepfake detection", "Temporal consistency", "Lip-sync analysis", "Frame manipulation"],
    },
    {
      icon: <Mic className="h-6 w-6 text-purple-400" />,
      title: "Audio",
      formats: ["MP3", "WAV", "AAC", "FLAC"],
      capabilities: ["Voice cloning detection", "Audio splicing", "Frequency analysis", "Speaker verification"],
    },
    {
      icon: <Play className="h-6 w-6 text-amber-400" />,
      title: "Live Streams",
      formats: ["RTMP", "WebRTC", "HLS"],
      capabilities: ["Real-time verification", "Stream integrity", "Live deepfake detection", "Instant alerts"],
    },
  ]

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/5 to-green-900/5"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-500 rounded-full animate-float opacity-40"></div>
        <div className="absolute bottom-32 right-24 w-1.5 h-1.5 bg-green-500 rounded-full animate-float animate-delay-300 opacity-35"></div>
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-float animate-delay-500 opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 rounded-full px-4 py-2 mb-6">
            <Users className="w-4 h-4 mr-2" />
            Real-World Applications
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Trusted Across
            <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
              Industries
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            From individual creators to enterprise organizations, Apex Verify AI provides the verification
            infrastructure that powers trust in the digital economy.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {useCases.map((useCase, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br from-gray-900/80 to-purple-900/10 border-purple-500/20 rounded-2xl hover:border-purple-500/40 transition-all duration-500 group hover:shadow-2xl hover:shadow-purple-500/10 animate-slide-up-fade`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gray-800/50 rounded-xl group-hover:bg-purple-500/20 transition-all duration-300">
                    {useCase.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {useCase.title}
                    </CardTitle>
                    <p className="text-gray-400 text-sm">{useCase.subtitle}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-2">Challenge</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{useCase.challenge}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-blue-400 mb-2">Solution</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{useCase.solution}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-green-400 mb-3">Results</h4>
                  <ul className="space-y-2">
                    {useCase.results.map((result, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <blockquote className="text-gray-300 text-sm italic mb-2">"{useCase.testimonial}"</blockquote>
                  <cite className="text-gray-400 text-xs">— {useCase.author}</cite>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Media Types Support */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Universal Media Support</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our AI technology works across all media formats, providing comprehensive protection for every type of
              digital content.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaTypes.map((media, index) => (
              <Card
                key={index}
                className={`bg-gradient-to-br from-gray-900/80 to-blue-900/10 border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition-all duration-500 group hover:shadow-2xl hover:shadow-blue-500/10 animate-slide-up-fade`}
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-blue-500/20 transition-all duration-300">
                      {media.icon}
                    </div>
                    <CardTitle className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {media.title}
                    </CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {media.formats.map((format, i) => (
                      <Badge key={i} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {media.capabilities.map((capability, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-300 text-xs">{capability}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-br from-gray-900/80 to-green-900/20 border-green-500/30 rounded-2xl p-8 backdrop-blur-xl text-center">
          <CardContent className="p-0">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Protect Your Content?</h3>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto mb-8">
              Join thousands of creators, journalists, and organizations who trust Apex Verify AI to verify their
              content and build audience confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105">
                Start Verifying Free
              </button>
              <button className="border-2 border-white/20 hover:border-white/40 text-white hover:bg-white/10 rounded-xl px-8 py-3 font-semibold backdrop-blur-sm transition-all duration-300">
                Schedule Demo
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
