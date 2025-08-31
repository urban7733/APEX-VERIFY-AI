const AboutPage = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-8">
          <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
            The Ultimate Truth Layer for Visual Media
          </span>
        </h2>

        <p className="text-lg font-light mb-6">
          Apex Verify AI exists to be the ultimate truth layer for visual media.
        </p>

        <p className="text-lg font-light mb-6">
          In a world where AI can fabricate images and videos indistinguishably from reality, our mission is to give
          creators, professionals, and investigators an unambiguous, trustworthy verdict: real or fake.
        </p>

        <p className="text-lg font-light mb-6">
          We empower users to instantly validate authenticity, trace origins, and gain deep insights into any media file
          — all through a hyper-minimal, black-and-white interface that communicates authority, precision, and clarity.
        </p>

        <h3 className="text-xl sm:text-2xl font-medium text-white mb-6 tracking-wide">
          <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
            🔍 Our Vision
          </span>
        </h3>

        <div className="relative my-12 p-8 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-white/20 backdrop-blur-sm shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>
          <p className="relative text-xl sm:text-2xl font-medium text-center leading-relaxed">
            <span className="bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent">
              "For the past decade, the industry paid to remove watermarks. The next ten years, we will pay to have them
              on —
            </span>
            <br />
            <span className="text-gray-300 text-lg font-light mt-2 block">
              protecting creators, enforcing authenticity, and reclaiming trust in digital content."
            </span>
          </p>
        </div>

        <p className="text-lg font-light mb-6">
          Our goal is simple: To protect reality, enhance digital trust, and provide the most reliable AI-powered
          verification tools available.
        </p>

        <h3 className="text-xl sm:text-2xl font-medium text-white mb-6 tracking-wide">
          <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
            ✨ How It Works
          </span>
        </h3>

        <p className="text-lg font-light mb-6">
          Every upload is analyzed with cutting-edge AI, returning a forensic-grade summary that combines:
        </p>

        <ul className="text-lg font-light mb-6 ml-6 space-y-2">
          <li>• An authenticity score</li>
          <li>• A clear assessment</li>
          <li>• A concise narrative about the content</li>
          <li>• Provenance and source evidence</li>
        </ul>

        <p className="text-lg font-light mb-6">
          The experience is designed to feel powerful yet effortless, like stepping into a command center for truth —
          stripped of distraction, stripped of noise, but brimming with authority.
        </p>

        <p className="text-lg font-light mb-6">
          Apex Verify AI doesn't just analyze media — it ensures confidence in every digital interaction, restores
          respect to creators, and turns authenticity into a visible asset.
        </p>
      </div>
    </div>
  )
}

export default AboutPage
