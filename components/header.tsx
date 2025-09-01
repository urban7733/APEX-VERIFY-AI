import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="w-full p-6 flex justify-center items-center border-b border-zinc-800/30">
      <div className="flex items-center justify-between w-full max-w-6xl">
        <div className="flex-1"></div>
        <h1 className="text-white text-2xl font-bold tracking-wide">Apex Verify AI</h1>
        <div className="flex-1 flex justify-end">
          <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-900">
            Login
          </Button>
        </div>
      </div>
    </header>
  )
}
