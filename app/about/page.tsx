const AboutPage = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-8">
          <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
            What is Apex Verify AI?
          </span>
        </h2>

        <p className="text-lg font-light mb-6">
          Apex Verify AI is a cutting-edge platform designed to revolutionize the way businesses approach AI model
          validation and monitoring. In today's rapidly evolving AI landscape, ensuring the reliability, accuracy, and
          fairness of AI models is paramount. Our platform provides a comprehensive suite of tools and services to help
          organizations build trustworthy and responsible AI systems.
        </p>

        <h3 className="text-xl sm:text-2xl font-medium text-white mb-6 tracking-wide">
          <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
            🔍 What problem are we solving?
          </span>
        </h3>

        <p className="text-lg font-light mb-6">
          Many organizations struggle with the complexities of AI model validation. Traditional methods are often
          time-consuming, resource-intensive, and lack the scalability needed to keep pace with the growing number of AI
          deployments. Apex Verify AI addresses these challenges by providing an automated, end-to-end solution that
          streamlines the validation process and empowers businesses to confidently deploy AI models at scale.
        </p>

        <h3 className="text-xl sm:text-2xl font-medium text-white mb-6 tracking-wide">
          <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
            ✨ Why it matters
          </span>
        </h3>

        <p className="text-lg font-light mb-6">
          Trustworthy AI is essential for building confidence with customers, partners, and regulators. By ensuring the
          reliability and fairness of AI models, organizations can mitigate risks, avoid costly errors, and unlock the
          full potential of AI to drive innovation and growth. Apex Verify AI helps businesses build a strong foundation
          of trust in their AI systems, enabling them to achieve their strategic objectives with confidence.
        </p>
      </div>
    </div>
  )
}

export default AboutPage
