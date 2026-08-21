"use client"

import { SignedUploadField } from "./SignedUploadField"

export function ImageUpload({ name, defaultValue, label, onChange }: { name: string; defaultValue?: string | null; label?: string; onChange?: (url: string) => void }) {
  return (
    <SignedUploadField
      name={name}
      defaultValue={defaultValue}
      label={label}
      onChange={onChange}
      accept="image/*"
      maxDim={1200}
      fileKind="image"
    />
  )
}
