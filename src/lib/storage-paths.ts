// Rutas de almacenamiento: funciones puras, sin cliente de Supabase, para poder
// probarlas sin tocar red ni base de datos.

/**
 * Extensión segura derivada del nombre que envía el cliente.
 *
 * Antes se usaba `fileName.split(".").pop()` tal cual: un nombre como `x.a/b`
 * colaba una barra dentro de la ruta y uno sin punto arrastraba el nombre
 * completo. Solo se acepta una extensión alfanumérica y corta.
 */
export function extensionSegura(fileName: string): string {
  const bruta = fileName.includes(".") ? fileName.split(".").pop() ?? "" : ""
  return /^[a-zA-Z0-9]{1,8}$/.test(bruta) ? bruta.toLowerCase() : "bin"
}

export function randomStoragePath(folder: string, fileName: string): string {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extensionSegura(fileName)}`
  return folder ? `${folder}/${name}` : name
}

/**
 * Ruta aleatoria dentro de la carpeta del propio usuario.
 *
 * Se usa para documentos de identidad (licencias): prefijar con el id del
 * solicitante permite verificar después que el archivo es suyo, y evita que
 * alguien pueda referenciar —y hacer firmar al panel— el expediente de otro.
 */
export function randomStoragePathForUser(userId: string, fileName: string): string {
  return `${userId}/${randomStoragePath("", fileName)}`
}

/** ¿La ruta enviada pertenece realmente a la carpeta de este usuario? */
export function rutaLicenciaValida(path: string | null | undefined, userId: string): boolean {
  if (!path) return false
  if (!path.startsWith(`${userId}/`)) return false
  const resto = path.slice(userId.length + 1)
  // Sin retrocesos y sin subcarpetas: la ruta queda dentro de su carpeta.
  return !path.includes("..") && !resto.includes("/")
}
