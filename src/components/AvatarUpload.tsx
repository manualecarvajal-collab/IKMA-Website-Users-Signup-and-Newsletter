"use client"

import { SignedUploadField } from "./SignedUploadField"

export function AvatarUpload({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
  return (
    <SignedUploadField
      name={name}
      defaultValue={defaultValue}
      variant="avatar"
      folder="avatars"
      accept="image/*"
      maxDim={600}
      fileKind="image"
    />
  )
}
