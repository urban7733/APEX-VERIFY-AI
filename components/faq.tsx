import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
  const faqs = [
    {
      question: "How accurate is Truth Intelligence's deepfake detection?",
      answer:
        "Our AI achieves 99.9% accuracy in detecting deepfakes and manipulated media. We continuously update our models with the latest detection techniques to stay ahead of emerging threats.",
    },
    {
      question: "What file formats are supported?",
      answer:
        "We support all major image formats (JPEG, PNG, GIF), video formats (MP4, AVI, MOV), and audio formats (MP3, WAV, AAC). Files up to 500MB are supported across all plans.",
    },
    {
      question: "How long does the verification process take?",
      answer:
        "Most files are analyzed within 30 seconds. Complex videos may take up to 2-3 minutes depending on length and resolution. You'll receive real-time updates during processing.",
    },
    {
      question: "Can I integrate Truth Intelligence into my existing workflow?",
      answer:
        "Yes! Our Pro and Enterprise plans include API access, allowing you to integrate verification directly into your content management systems, social platforms, or custom applications.",
    },
    {
      question: "Is my content secure and private?",
      answer:
        "Absolutely. We use enterprise-grade encryption and never store your original files longer than necessary for analysis. All data is processed securely and deleted after verification.",
    },
    {
      question: "What happens if a file is flagged as potentially fake?",
      answer:
        "You'll receive a detailed report explaining what was detected, confidence levels, and specific areas of concern. This helps you make informed decisions about the content's authenticity.",
    },
  ]

  return (
    <section id="faq" className="py-24 px-6 bg-zinc-900/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <p className="text-lg md:text-xl font-light text-zinc-400">
            Everything you need to know about Truth Intelligence.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-6"
            >
              <AccordionTrigger className="text-white hover:text-zinc-300 text-left font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 leading-relaxed font-light">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
