# Reporte: Redirect de Confirmación de Email a /membresia

## Problema

Cuando un usuario nuevo se registra y hace clic en el link de confirmación del email, llega al **homepage** (`https://www.ikmaglobal.com/`) en lugar de la página de membresía (`/membresia`).

## Intención

El flujo correcto debería ser:

1. Usuario se registra en `/registro`
2. Recibe email de confirmación de Supabase
3. Hace clic en el link de confirmación
4. **Llega a `/membresia`** para completar su membresía (free o paid)

## URL del Link de Confirmación

El link que llega en el email es:

```
https://ugdrmmukrckvpdagfecg.supabase.co/auth/v1/verify?token=pkce_20a38a3a73236d04924e3269baeffe27cabbd8b076c95a70cef81c75&type=signup&redirect_to=https://www.ikmaglobal.com/
```

El parámetro `redirect_to` tiene el valor `https://www.ikmaglobal.com/` — apunta al homepage, no a `/membresia`.

## Causa Raíz

Supabase construye la URL de confirmación usando la **Site URL** configurada en el dashboard (Authentication → URL Configuration):

```
Site URL: https://www.ikmaglobal.com
```

El parámetro `emailRedirectTo` en el código (`src/lib/supabase/actions.ts`) **no está sobreescribiendo** este valor. Supabase v2 con PKCE flow usa su propia configuración del dashboard para generar el link.

## Por Qué No Podemos Cambiar la Site URL

Cambiar la Site URL a `https://www.ikmaglobal.com/membresia` rompería:

- Links de unsubscribe del newsletter
- Links de reset de contraseña
- Cualquier otro flujo de auth que use la Site URL

## Intentos Realizados

### 1. `emailRedirectTo` en el código (No funcionó)

**Archivo:** `src/lib/supabase/actions.ts`

```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${siteUrl}/membresia`,
  },
})
```

**Resultado:** Supabase ignora este parámetro y usa la Site URL del dashboard.

### 2. Auth Callback (No aplica)

**Archivo:** `src/app/auth/callback/route.ts`

```typescript
const next = searchParams.get("next") ?? "/membresia"
```

El callback redirige a `/membresia`, pero Supabase no está pasando por este callback. El link va directamente al homepage.

### 3. Proxy/Middleware (No funcionó)

**Archivo:** `src/proxy.ts`

```typescript
if (user && request.nextUrl.pathname === "/") {
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("suscripcion_activa")
    .eq("id", user.id)
    .single()

  if (perfil && !perfil.suscripcion_activa) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/membresia"
    return NextResponse.redirect(redirectUrl)
  }
}
```

**Resultado:** El redirect no se está ejecutando. Posibles causas:

1. **El redirect de Supabase es server-side** — Supabase redirige el browser antes de que llegue a nuestro dominio. El proxy nunca intercepta la request inicial.
2. **Las cookies de auth no están seteadas** en el momento que el proxy ejecuta `getUser()`.
3. **El usuario ya tiene `suscripcion_activa=true`** — el proxy lo deja pasar al homepage.
4. **Cache de Vercel/CDN** — la respuesta del proxy está siendo cacheada.

## Posibles Soluciones

### Opción A: Supabase Dashboard — Redirect URLs (Recomendada)

En Supabase Dashboard → Authentication → URL Configuration:

1. **Site URL:** `https://www.ikmaglobal.com` (sin cambios)
2. **Redirect URLs:** Agregar `https://www.ikmaglobal.com/membresia`

Verificar que `emailRedirectTo` en el código funcione cuando la URL está en la lista de Redirect URLs. Puede que Supabase requiera la URL en la lista para que el parámetro sea respetado.

### Opción B: Supabase Email Template

En Supabase Dashboard → Authentication → Emails → Confirm signup:

Modificar el template del email para que el link apunte a `/membresia` en lugar de usar `{{ .ConfirmationURL }}`. Usar un link hardcoded:

```
https://www.ikmaglobal.com/membresia
```

**Riesgo:** Pierdes el token de confirmación. El usuario tendría que confirmar y luego hacer login por separado.

### Opción C: Frontend Landing Page

Crear una página en `/` que:
1. Detecte si hay parámetros de auth en la URL (`code`, `token`, etc.)
2. Si hay auth params → redirija a `/membresia`
3. Si no → muestre el homepage normal

**Riesgo:** No resuelve el caso donde Supabase redirige sin parámetros visibles.

### Opción D: Supabase Edge Function

Crear una Edge Function que:
1. Reciba el redirect de Supabase
2. Intercambie el código por sesión
3. Redirija a `/membresia`

**Riesgo:** Complejidad innecesaria, requeriría configurar un nuevo endpoint.

## Diagnóstico Actual

| Componente | Estado |
|---|---|
| `emailRedirectTo` en código | Configurado, pero ignorado por Supabase |
| Auth Callback (`/auth/callback`) | Configurado, pero no se ejecuta |
| Proxy (middleware) | Implementado, pero no intercepta el redirect |
| Supabase Site URL | `https://www.ikmaglobal.com` (no se puede cambiar) |
| Supabase Redirect URLs | Necesita verificar si `/membresia` está listado |

## Siguiente Paso Recomendado

1. Verificar en Supabase Dashboard → Authentication → URL Configuration si `https://www.ikmaglobal.com/membresia` está en la lista de **Redirect URLs**
2. Si no está, agregarlo y probar con un nuevo registro
3. Si ya está, probar la **Opción B** (modificar el email template)
