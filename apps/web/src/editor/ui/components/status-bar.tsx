import { cn } from "cn"
import { ServerIcon, CircleXIcon, Loader2Icon } from "lucide-react"
import type { ComponentProps, PropsWithChildren } from "react"

import type { LspStatus } from "../types"

export function StatusBar({ children }: PropsWithChildren) {
  return <div className="bg-background flex gap-2 border-t border-t-neutral-700">{children}</div>
}

StatusBar.Lsp = ({ status }: { status: LspStatus }) => {
  const label =
    status === "loading"
      ? "The LSP server is loading..."
      : status === "connected"
        ? "The LSP server has connected succesfully"
        : "LSP server is not connected. Please check your connection and try again."

  const Icon =
    status === "loading" ? Loader2Icon : status === "connected" ? ServerIcon : CircleXIcon

  return (
    <StatusItem
      label={label}
      className={cn({
        "text-red-700": status === "disconnected",
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
