import { createAdminClient } from "@/lib/supabase/server"

// Las rutas viven en un módulo puro (src/lib/storage-paths.ts) para poder
// probarlas sin arrastrar el cliente de Supabase; se reexportan aquí para que
// los endpoints que ya las usaban sigan importando de un solo sitio.
export { extensionSegura, randomStoragePath, randomStoragePathForUser, rutaLicenciaValida } from "@/lib/storage-paths"

export async function createSignedUpload(bucket: string, storagePath: string) {
  const admin = await createAdminClient()
  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(storagePath)
  if (error) return { error }
  const {
    data: { publicUrl },
  } = admin.storage.from(bucket).getPublicUrl(storagePath)
  return { data, publicUrl }
}
