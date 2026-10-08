import { PlayIcon } from "lucide-react"

export function RunButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="text-foreground absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded border border-neutral-600 bg-neutral-800 font-mono text-lg hover:bg-neutral-700"
      aria-label="Run"
      onClick={onClick}
    >
      <PlayIcon strokeWidth={1} />
    </button>
  )
}
