import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      company: "YouTube",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "Truth Intelligence has been a game-changer for my content. My audience now trusts that everything I share is authentic.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Investigative Journalist",
      company: "News Corp",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "In today's world of misinformation, this platform is essential. It's helped us verify countless pieces of media.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Digital Artist",
      company: "Freelance",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "Protecting my original work has never been easier. The verification badges give my clients complete confidence.",
      rating: 5,
    },
  ]

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Trusted by Creators Worldwide
            </span>
          </h2>
          <p className="text-lg md:text-xl font-light text-zinc-400 max-w-3xl mx-auto">
            See what content creators, journalists, and digital professionals are saying about Truth Intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-zinc-300 mb-6 leading-relaxed font-light">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-medium">{testimonial.name}</div>
                    <div className="text-zinc-400 text-sm">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
