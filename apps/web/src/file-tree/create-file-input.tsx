"use client"

import { FileIcon } from "lucide-react"
import { useState, type ChangeEvent, type KeyboardEvent } from "react"

type CreateFileInputProps = {
  /** Total left padding for the row, so it lines up with tree items at its level. */
  paddingLeft: number
  /** Returns an error message for a non-empty trimmed name, or null if valid. */
  validate: (name: string) => string | null
  onSubmit: (name: string) => void
  onCancel: () => void
}

export function CreateFileInput({
  paddingLeft,
  validate,
  onSubmit,
  onCancel,
}: CreateFileInputProps) {
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    setValue(raw)

    const trimmed = raw.trim()
    setError(trimmed ? validate(trimmed) : null)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      onCancel()
      return
    }

    if (event.key !== "Enter") return

    const name = value.trim()
    if (!name) {
      setError("File name cannot be empty")
      return
    }

    const err = validate(name)
    if (err) {
      setError(err)
      return
    }

    onSubmit(name)
  }

  return (
    <div
      role="presentation"
      className="relative flex w-full items-center gap-1 border-t border-b border-transparent p-1"
      style={{ paddingLeft }}
    >
      <FileIcon size={16} />
      <input
        // Autofocus so the user can type immediately (spec requirement).
        // oxlint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
        className="w-full min-w-0 bg-transparent outline-none"
      />
      {error && (
        <span
          className="absolute top-full z-10 mt-0.5 max-w-max rounded border border-red-800 bg-neutral-900 px-1.5 py-0.5 text-xs whitespace-nowrap text-red-500"
          style={{ left: paddingLeft }}
        >
          {error}
        </span>
      )}
    </div>
  )
}
