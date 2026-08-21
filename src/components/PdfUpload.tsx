"use client"

import { SignedUploadField } from "./SignedUploadField"

export function PdfUpload({ name, defaultValue, label }: { name: string; defaultValue?: string | null; label?: string }) {
  return (
    <SignedUploadField
      name={name}
      defaultValue={defaultValue}
      label={label}
      endpoint="/api/upload-pdf"
      accept=".pdf"
      fileKind="pdf"
    />
  )
}
