"use client"

import * as React from "react"
import { Upload } from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type UploadFieldProps = {
  id?: string
  name: string
  label: string
  description?: string
  accept?: string
  required?: boolean
  className?: string
}

export function UploadField({
  id = "upload",
  name,
  label,
  description,
  accept = "image/*",
  required,
  className,
}: UploadFieldProps) {
  const [fileName, setFileName] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 transition-colors hover:border-primary/40 hover:bg-muted/50",
          fileName && "border-primary/30 bg-primary/[0.03]"
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          accept={accept}
          required={required}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            setFileName(f?.name ?? null)
          }}
        />
        <Upload className="size-5 text-muted-foreground" aria-hidden />
        <span className="text-center text-sm text-muted-foreground">
          {fileName ? (
            <span className="font-medium text-foreground">{fileName}</span>
          ) : (
            <>Tap to upload a screenshot</>
          )}
        </span>
      </div>
    </div>
  )
}
