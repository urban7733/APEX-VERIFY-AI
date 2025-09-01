import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export function TrustBadge() {
  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left side - Badge preview */}
            <div className="p-8 flex flex-col justify-center items-center border-r border-zinc-800">
              <div className="bg-black/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4 flex items-center space-x-3 mb-6">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-white font-medium">Verified by Apex Verify AI</span>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Trust Badge</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  Embed verification certificates directly into your content to build audience trust.
                </p>
                <Button className="bg-white hover:bg-zinc-200 text-black rounded-md">Learn More</Button>
              </div>
            </div>

            {/* Right side - Badge stats */}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Badge Impact</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-400">Audience Trust</span>
                    <span className="text-emerald-500 font-medium">+347%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1 rounded-full">
                    <div className="bg-emerald-500 h-1 rounded-full w-[90%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-400">Content Engagement</span>
                    <span className="text-blue-500 font-medium">+124%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1 rounded-full">
                    <div className="bg-blue-500 h-1 rounded-full w-[80%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-400">False Claims Reduction</span>
                    <span className="text-purple-500 font-medium">-98%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1 rounded-full">
                    <div className="bg-purple-500 h-1 rounded-full w-[95%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
