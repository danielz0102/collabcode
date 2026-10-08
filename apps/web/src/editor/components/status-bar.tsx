import { cn } from "cn"
import { ServerIcon, CircleXIcon, Loader2Icon, type LucideIcon, ServerOffIcon } from "lucide-react"
import type { ComponentProps, PropsWithChildren } from "react"

import type { LspStatus } from "../types"

export function StatusBar({ children }: PropsWithChildren) {
  return <div className="bg-background flex gap-2 border-t border-t-neutral-700">{children}</div>
}

const StatusIcon: Record<LspStatus, LucideIcon> = {
  connected: ServerIcon,
  disconnected: ServerOffIcon,
  loading: Loader2Icon,
  error: CircleXIcon,
}

const StatusLabel: Record<LspStatus, string> = {
  connected: "LSP server connected",
  disconnected: "No LSP server connected",
  loading: "LSP server is loading...",
  error: "An error occurred while connecting to the LSP server",
}

StatusBar.Lsp = ({ status }: { status: LspStatus }) => {
  const label = StatusLabel[status]
  const Icon = StatusIcon[status]

  return (
    <StatusItem
      label={label}
      className={cn({
        "text-red-700": status === "error",
      })}
    >
      <Icon className={cn("size-4", { "animate-spin": status === "loading" })} />
      LSP Server
    </StatusItem>
  )
}

/**
 *
 * @param label - Text that will be displayed when the user hovers over the item.
 * @returns
 */
function StatusItem({
  label,
  className,
  children,
  ...props
}: PropsWithChildren<{
  label?: string
}> &
  ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "text-foreground-muted flex cursor-pointer gap-1 p-1 text-xs hover:bg-neutral-700",
        className
      )}
      title={label}
      {...props}
    >
      {children}
    </button>
  )
}
