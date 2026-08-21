import { createAdminClient } from "@/lib/supabase/server"

export function randomStoragePath(folder: string, fileName: string): string {
  const ext = fileName.split(".").pop()
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  return folder ? `${folder}/${name}` : name
}

export async function createSignedUpload(bucket: string, storagePath: string) {
  const admin = await createAdminClient()
  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(storagePath)
  if (error) return { error }
  const {
    data: { publicUrl },
  } = admin.storage.from(bucket).getPublicUrl(storagePath)
  return { data, publicUrl }
}
