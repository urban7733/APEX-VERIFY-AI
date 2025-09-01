export function AboutSection() {
  return (
    <section className="px-6 py-24 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-8">
          <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
            What is Apex Verify AI?
          </span>
        </h2>
      </div>

      <div className="space-y-8 text-zinc-300 leading-relaxed font-light">
        <p className="text-lg font-light">
          Apex Verify AI is an AI-powered platform that verifies the authenticity of digital media — images, videos, and
          audio — in an age where deepfakes and manipulated content spread faster than truth.
        </p>

        <p className="text-lg font-light">
          Whether you're a content creator, journalist, or brand, the internet demands trust. And in a world flooded
          with synthetic media, proving what's real is more important than ever.
        </p>

        <p className="text-lg font-light">
          We built Apex Verify AI to give you the tools to fight disinformation, protect your content, and build
          credibility with your audience. Our system analyzes each file for traces of AI manipulation, reverse-search
          origins, metadata integrity, and more — then returns a result: real or manipulated.
        </p>

        <div className="pt-8 border-t border-zinc-800">
          <h3 className="text-xl sm:text-2xl font-medium mb-6 tracking-wide">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              🔍 What problem are we solving?
            </span>
          </h3>

          <p className="text-lg font-light mb-6">We are living in a time where:</p>

          <ul className="space-y-3 text-lg ml-6">
            <li>• AI-generated content is indistinguishable from real footage</li>
            <li>• Videos are going viral before being verified</li>
            <li>• Fake news spreads faster than facts</li>
            <li>• Creators are accused of fabricating truth — or worse, their real work is labeled "fake"</li>
          </ul>

          <p className="text-lg font-light mt-6">
            Apex Verify AI solves this by giving every verified file a digital signature, a public trust badge, and
            optional metadata you can embed into your content — proving it's real, where it came from, and when it was
            created.
          </p>
        </div>

        <div className="pt-8 border-t border-zinc-800">
          <h3 className="text-xl sm:text-2xl font-medium mb-6 tracking-wide">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              ✅ Why it matters
            </span>
          </h3>

          <p className="text-lg font-light mb-6">
            In 2025, authenticity isn't just a value — it's a signal. A verified badge from Apex Verify AI tells your
            viewers:
          </p>

          <blockquote className="border-l-2 border-zinc-600 pl-6 italic text-xl text-zinc-200">
            "This is real. This is mine. This can be trusted."
          </blockquote>
        </div>
      </div>
    </section>
  )
}
