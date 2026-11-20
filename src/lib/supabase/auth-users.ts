import type { User } from "@supabase/supabase-js"
import type { createAdminClient } from "./server"

type AdminClient = Awaited<ReturnType<typeof createAdminClient>>

const POR_PAGINA = 1000
const MAX_PAGINAS = 1000

/**
 * Todos los usuarios de Auth.
 *
 * `admin.auth.admin.listUsers()` devuelve **50** por defecto y nada avisa: quien
 * llame sin `page`/`perPage` se queda con los 50 primeros. Aquí se recorre hasta
 * que una página llega vacía, sin fiarse de que el servidor respete `perPage`
 * (si lo recorta, el bucle sigue igual, solo hace más peticiones).
 *
 * Un fallo devuelve lo leído hasta ese momento en vez de lanzar: estas listas
 * alimentan pantallas y envíos ya en marcha, y perder la página 3 no debe tumbar
 * la petición entera.
 */
export async function listAllAuthUsers(admin: AdminClient): Promise<User[]> {
  const todos: User[] = []
  for (let page = 1; page <= MAX_PAGINAS; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: POR_PAGINA })
    if (error) {
      console.error("[auth-users] listUsers falló en la página", page, error.message)
      return todos
    }
    const lote = data?.users ?? []
    if (lote.length === 0) return todos
    todos.push(...lote)
  }
  console.error("[auth-users] se alcanzó MAX_PAGINAS; la lista puede estar incompleta")
  return todos
}
