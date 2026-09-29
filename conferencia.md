# Conferencia IKMA — Fundamentos para IA

## Contexto del Proyecto

Landing page temporal para una conferencia de IKMA. El proyecto se
desarrolla dentro del mismo repo Next.js existente, pero con base de
datos completamente aislada using PostgreSQL schemas.

**Rama de trabajo:** `feat/conferencia-landing`
**Base de datos:** Mismo Supabase, schema separado `conferencia`
**Objetivo temporal:** Se puede borrar completo sin afectar nada

## Arquitectura

```
Base de datos IKMA_website
├── public/          ← TODO lo existente (NO TOCAR)
│   ├── perfiles
│   ├── articulos
│   ├── solicitudes_membresia
│   └── ...
│
└── conferencia/     ← NUEVO (se borra al final)
    ├── registros
    └── ...
```

**Regla de oro:** Las tablas del schema `conferencia` NUNCA se
consultan sin `.schema('conferencia')`. Si ves una query a una tabla
que no existe en `public`, probablemente falta el prefijo.

## Qué SÍ se puede hacer

1. **Crear tablas en `conferencia`** — cualquier tabla nueva para el
   evento va en este schema.
2. **Modificar `supabase/config.toml`** — agregar `"conferencia"` a
   `schemas` y `extra_search_path` para exponer las tablas vía API.
3. **Crear rutas en `src/app/conferencia/`** — toda la estructura de
   la landing va aquí.
4. **Usar el mismo `createClient()` de Supabase** — con
   `.schema('conferencia')` en las queries.
5. **Agregar keys i18n** en `messages/*.json` bajo el namespace
   `Conferencia`.
6. **Modificar `.env.local`** — solo si se necesitan variables nuevas
   (ej: `NEXT_PUBLIC_CONF_*`).

## Qué NO se puede hacer (What Not to Do's)

1. **NO tocar tablas en `public/`** — ni crear, ni modificar, ni
   eliminar. Las tablas del sitio actual son intocables.
2. **NO agregar foreign keys de `conferencia` a `public`** — los
   schemas no deben depender el uno del otro.
3. **NO usar el schema `public` por defecto para queries de la
   conferencia** — siempre `.schema('conferencia')`.
4. **NO modificar migraciones existentes** (`00001` a `00040`). Solo
   se agregan migraciones nuevas.
5. **NO commitear a `main`** — todos los cambios van en
   `feat/conferencia-landing`.
6. **NO instalar dependencias nuevas** a menos que sea estrictamente
   necesaria. La landing debe ser lo más liviana posible.
7. **NO crear componentes reutilizables** para el sitio general. Todo
   el código de la conferencia vive en `src/app/conferencia/` o
   `src/components/conferencia/`.
8. **NO usar auth del sitio actual** — la conferencia maneja su propio
   registro. No crear usuarios en `auth.users` del proyecto IKMA.
9. **NO tocar `src/middleware.ts`** sin antes verificar que los
   cambios no afecten rutas existentes.
10. **NO eliminar archivos de la conferencia de la rama `main`** — si
    se hace merge, los archivos se eliminan de la rama, no del repo.

## Checklist de Eliminación (post-evento)

Cuando la conferencia termine, borrar en este orden:

1. Quitar `conferencia` de la lista de **Exposed schemas** (Project Settings → API)
2. `DROP SCHEMA conferencia CASCADE;` (Supabase SQL Editor)
3. Quitar `"conferencia"` de `supabase/config.toml` (2 líneas)
4. `rm -rf src/app/conferencia src/components/conferencia supabase/checks`
5. Eliminar keys `Conferencia` de `messages/en.json` y `messages/es.json`
6. Eliminar variables `CONF_*` de `.env.local` (si existen)
7. `git branch -d feat/conferencia-landing`

El paso 1 va primero: si se borra el schema con `conferencia` aún
expuesto, PostgREST se queda con un schema fantasma en la lista y hay
que limpiarlo igualmente desde el panel.

Ninguna de estas acciones afecta la funcionalidad del sitio principal.

## Estado actual (2026-09-25)

### Migraciones — aplicadas y verificadas contra el proyecto real

`00050`–`00053` aplicadas por el usuario; comprobadas con
`supabase/checks/conferencia_estado.sql` e idénticas a la referencia
local. `00054` (permisos) aplicada por el usuario; pendiente de
confirmar por SQL.

Verificado en un Postgres 17 limpio replicando los roles de Supabase:
las cinco migraciones aplican en orden, son idempotentes (se pueden
re-ejecutar sin fallo) y el schema final es el diseñado.

**Hallazgo importante (00054):** en Supabase los privilegios por
defecto son *por schema* y solo cubren `public`. Un schema nuevo no
hereda nada, así que sin `grant usage on schema conferencia to
service_role` la API responde `42501 permission denied for schema
conferencia` **aunque la tabla exista**. Es un fallo silencioso que no
se detecta hasta el primer insert real.

Se concede **solo a `service_role`**, desviándose a propósito del
[doc oficial](https://supabase.com/docs/guides/api/using-custom-schemas),
que concede también a `anon`/`authenticated` y confía en RLS. Aquí la
landing solo escribe desde el servidor, así que negar a nivel de schema
es más estricto: `anon` no llega ni a entrar.

### Bloqueante — resuelto

- [x] **Exponer `conferencia` en la Data API.** Hecho el 2026-09-28.
      Está en **Integrations → Data API → Settings → "Exposed schemas"**
      (no en Project Settings → API, como dice el doc oficial: Supabase
      lo movió). El enlace directo es
      `/dashboard/project/<ref>/integrations/data_api/settings`.
      Sin esto `supabase-js` responde `PGRST106 Invalid schema:
      conferencia`, porque PostgREST solo conoce `public` y
      `graphql_public`.

      Verificado después de guardar:
        - `service_role` → 200, el formulario guarda.
        - `anon` → 401 `42501 permission denied for schema conferencia`,
          sigue bloqueado a nivel de schema **aunque el toggle
          "Automatically expose new tables" esté activado** (ese toggle
          concede permisos de tabla, pero sin `USAGE` sobre el schema
          `anon` no llega ni a entrar). El aislamiento aguanta.

      Ojo: **no se puede hacer por SQL**. Comprobado en el proyecto
      real, ningún rol tiene `pgrst.db_schemas` en `pg_roles.rolconfig`,
      así que Supabase configura PostgREST por su cuenta y no con la
      configuración in-database.

### Pendiente, no bloqueante

- [x] Insert real de prueba: formulario → fila en `conferencia.registros`
      → borrada. Verificado `estado='nuevo'`, `origen='web'`, `pais='VE'`,
      `perfil_profesional='resident'` (clave del enum, no la etiqueta),
      `consentimiento=true` con `consentimiento_at` sellado, opcionales
      `null`. El formulario se vacía solo tras enviar.
- [ ] **Email duplicado: el mensaje confunde.** El índice único hace bien
      su trabajo (no se crea la fila), pero quien ya está inscrito ve
      *"We couldn't complete your registration. Please try again."*, es
      decir se le invita a reintentar algo que nunca va a funcionar.
      PostgREST devuelve `code: "23505"`; hay que distinguirlo en
      `crearRegistro()` y mostrar un mensaje propio ("ya estás
      inscrito con este correo"). Requiere clave nueva en
      `messages/{en,es}.json`.
- [x] Server action del formulario — `src/app/conferencia/actions.ts`.
      Guarda `consentimiento_at` solo si hay consentimiento.
- [ ] Rellenar las 3 cards del abanico (`GalleryCard` está en blanco).
- [x] Panel del directo (panel 5 del riel) — muestra el contador de la
      conferencia. Comparte la **misma fecha límite** que el hero a través
      de `src/components/conferencia/event.ts`, que es el único sitio donde
      vive `EVENT_DATE`: así no hay dos valores que puedan
      desincronizarse. Antes ese panel reutilizaba el vídeo del formulario.
- [ ] Sustituir ese contador por el vídeo de la transmisión por Zoom
      cuando exista. El punto exacto está marcado en
      `src/app/conferencia/page.tsx` (panel 5 del `HorizontalRail`).

### Proceso de trabajo

El trabajo se llevó primero en `feat/conferencia-landing` **sin commitear**,
guardando el avance con `git stash` para no tocar `main`. Esa regla **ya no
aplica**: el trabajo se mergeó a `main`, que es donde vive ahora.

De aquella etapa salieron dos problemas que conviene no repetir, porque la rama
se creó desde `fe12cd4`, **seis commits por detrás de main**, y al mergear hubo
conflictos en `proxy.ts`, `layout.tsx`, `email-template.ts`, `messages/*.json`
y este documento:

- **Colisión de numeración de migraciones.** Main tenía sus propias `00041`–
  `00049` (`visitas_por_dia_security_invoker`, `videos_contenido`,
  `cerrar_escrituras_abiertas`…) y nosotros otras `00041`–`00049`
  (`conferencia_*`). Las de la conferencia se renumeraron a `00050`–`00058`.
  **Antes de crear una migración, comprobar el último número en `main`.**
- **`proxy.ts` tiene dos salidas y las dos necesitan el header.** Main añadió
  una salida temprana para tráfico anónimo; si esa salida devuelve un
  `next()` pelado, los visitantes sin sesión —casi todos los de la landing—
  llegan al layout sin `x-pathname` y ven la Navbar y el Footer del sitio
  sobre la conferencia. Con sesión iniciada no se nota, porque ese camino sí
  lo lleva.

## Inscripción en dos pasos y puerta de acceso

**Condición de negocio: sin inscripción confirmada no hay acceso a la
transmisión.** `estado` no es cosmético, es la puerta.

```
nuevo       → rellenó el formulario, NO verificó  → SIN acceso
confirmado  → verificó el código                  → CON acceso
cancelado   → baja                                → sin acceso
```

Cualquier comprobación de acceso al directo (el enlace de Zoom, un token, lo
que sea) **debe filtrar por `estado = 'confirmado'`**. Nada más.

### La cookie `conf_registro` NO es una credencial

Al verificar se guarda una cookie `conf_registro` con el email, y
`emailConfirmado()` la valida contra la base antes de dar el estado por bueno.
Gracias a ella, al recargar el servidor ya sabe que este navegador está
inscrito y **no pinta el formulario**.

**Pero eso solo demuestra que el email está confirmado, NO que quien tiene el
navegador sea esa persona.** Cualquiera puede escribir esa cookie a mano. Por
eso:

- Sirve **únicamente** para decidir si se renderiza el panel del formulario.
  Es cosmética.
- **Jamás debe usarse como permiso de acceso al directo.** Si algún día se
  protege el streaming, hace falta algo que demuestre posesión de verdad —
  por ejemplo un token firmado enviado tras confirmar, o sesión real —, no
  esta cookie.

La cookie va `httpOnly` (no la puede leer el JS de la página).

**Volver desde otro navegador.** Como la cookie es la única forma de entrar en
el estado sin formulario, y solo se escribe al verificar un código, un email ya
confirmado sin cookie se quedaba sin salida: el formulario le aparecía, lo
rechazaba con "ya estás inscrito" y nunca podía llegar a la cookie. Le pasa a
cualquiera que cambie de móvil, de navegador o borre las cookies.

Arreglado así: **un email ya confirmado tampoco se rechaza; se le manda código
otra vez.** Vuelve a demostrar que el buzón es suyo y entra. El paso 2 le
muestra otro texto (`codeDescriptionReturning`) porque no se está inscribiendo,
está volviendo.

**Caso abierto — equipo compartido.** El botón "Register with another email"
que borraba la cookie vivía en la tarjeta de confirmación, y esa tarjeta ya no
existe porque el panel entero desaparece al inscribirse. Hoy, en un navegador
compartido, el segundo usuario vería la página sin formulario y sin manera de
inscribirse: la cookie dura 180 días. La acción `olvidarRegistro()` sigue en
`src/app/conferencia/actions.ts`, sin usar, lista para colgar de donde se
decida (un enlace discreto en el hero, el footer, la nav...).

### El flujo

`src/app/conferencia/actions.ts`:

| acción | qué hace |
|---|---|
| `solicitarCodigo(input)` | guarda con `nuevo` + manda código de 6 dígitos |
| `verificarCodigo(email, code)` | comprueba y pasa a `confirmado` |
| `reenviarCodigo(email)` | otro código, sin tocar los datos |

Y `conferencia.codigos` (migración `00055`) guarda cada emisión: hash, caducidad,
intentos y si se consumió.

Parámetros: **6 dígitos · 15 min · 5 intentos · reenvío con 60 s de espera ·
máximo 5 códigos por hora**. Los dos últimos límites existen porque el
formulario es público: sin ellos se puede usar la landing para inundar de
correos la bandeja de un tercero.

### Verificado con datos reales (2026-09-28)

El flujo se probó contra el proyecto de verdad, con un correo real:

```
14:27:39  registro creado (nuevo)
15:12:52  reenvío del formulario → SE REUTILIZA la fila, consentimiento_at se actualiza
15:12:53  código 1 emitido → nunca se usó (intentos 0, consumido_at null)
15:30:19  código 2 emitido (reenvío)
15:30:53  VERIFICADO al primer intento → estado confirmado, verificado_at sellado
```

Que el código 2 se validara con `intentos: 0` confirma que el hash y la
comparación funcionan con un código generado de verdad, no inyectado.

Y demuestra que **reutilizar la fila de un email en `nuevo` era necesario**: esa
fila venía de las 14:27, así que un insert habría chocado con el índice único y
el usuario habría visto el error genérico.

### Dos cosas abiertas sobre el correo

1. **El código 1 no llegó y el 2 sí.** Sin explicación todavía. La API key de
   Resend está restringida a solo enviar (`401 restricted_api_key`), así que
   desde el código no se puede consultar ni el estado de entrega ni los
   dominios verificados: eso solo se ve en el dashboard de Resend → Emails.
2. **Cuota de Resend.** Ver `conferencia-resend-quota.md` para el análisis
   completo. Resumen: la cuenta está en el **plan Free** (100 correos/día,
   3.000/mes) y **el techo diario es el riesgo real**, porque el Free **no
   admite excesos**: al llegar a 100 en un día UTC, Resend devuelve `429` y el
   envío se para hasta las 00:00 UTC. Como `confirmado` solo se alcanza
   metiendo el código, **quien no reciba el correo no puede inscribirse ni
   entrar al directo**. Recomendación: pasar a Pro (20 $/mes) el mes del
   evento.

   CORRECCIÓN: antes escribí aquí que las cabeceras `x-resend-*-quota` eran el
   límite del plan y que eran ~50 correos al mes. **Estaba mal.** Son el
   consumo **usado**, no el restante (verificado: cada envío las incrementa), y
   el plan Free da 100/día y 3.000/mes. Las mediciones de aquel momento eran
   11 usados hoy y 66 usados este mes, con margen de sobra.

Mejora pendiente que ayudaría con lo primero: guardar el **id de Resend** en
`conferencia.codigos` al enviar, para poder cruzar cualquier código con su
estado de entrega sin ir al dashboard a ciegas.

### Decisiones que no son obvias

- **Al confirmar no hay pantalla de "ya estás dentro": se refresca.** Acertado
  el código, `SignupCard` llama a `router.refresh()` (suave, no
  `location.reload()`, para no reiniciar el vídeo del hero ni volver a bajar
  los ~6 MB) y el servidor re-renderiza. Como ya está confirmado, deja de
  pintar el formulario. Así el estado de la página y el de la base no pueden
  contradecirse: es el servidor quien decide, no la memoria del componente.
- **Sin formulario, el panel del formulario DESAPARECE.** El riel pasa de
  `[form, card, card, card, directo]` a `[card, card, card, directo]`, y desde
  el hero se entra directo en la animación de las tarjetas.
- **Por eso el riel necesita saber si hay formulario.** `place()` daba por
  hecho que el panel 0 era el formulario (`isForm = i === 0`), que la primera
  tarjeta iba en el índice 1 (`cardIndex = i - 1`) y que el abanico tenía
  `count - 2` tarjetas. Sin el flag `hasForm` todo eso se descoloca: la primera
  tarjeta se iría hacia la izquierda en vez de entrar al abanico y, en el
  arranque del riel, estaría todavía fuera de pantalla.
  Verificado sin formulario: en el arranque la tarjeta 0 está centrada
  (x=0, opacidad 1) y el abanico abre simétrico — 0,33 → ±75 px; 0,67 →
  −150, 0, +150; rotaciones −11°, 0°, +11°.
- **El CTA del hero cambia de texto.** Ya inscrito, "Inscríbete ahora" pasa a
  ser "Scroll down and enjoy the conference": ofrecer una inscripción que
  existe no tiene sentido. Sigue apuntando a `#registro`, que ahora es el
  arranque del riel, así que el comportamiento del botón no cambia.
- **`count` es dependencia del efecto del riel.** Al confirmarse la
  inscripción el número de paneles cambia (5 → 4) y con él la altura de la
  sección, así que el progreso hay que recalcularlo sin esperar a que el
  usuario haga scroll.
- **OTP propio, NO Supabase Auth.** El flujo nativo (`signInWithOtp`) crea una
  fila en `auth.users` por cada inscrito, y eso vive en el sitio principal:
  borrar el schema `conferencia` no lo limpiaría, y compartiría la plantilla de
  OTP con los flujos de registro y recuperación del sitio. Aquí todo el código
  vive en el schema aislado.
- **Verificar SIEMPRE compara el código, aunque el registro ya esté
  confirmado.** `verificarCodigo` tenía un atajo que devolvía éxito sin mirar
  el código cuando `estado = 'confirmado'`, pensado para no castigar un
  reintento. No concedía nada porque la cookie se escribe más abajo, pero
  declaraba una verificación exitosa sin ninguna prueba: una puerta abierta en
  cuanto alguien moviera esa línea. Eliminado y verificado — con un email
  confirmado y un código incorrecto, ahora falla y **no** se pone la cookie.
- **`verificado_at` no se reescribe.** Es la PRIMERA verificación. Si alguien
  vuelve desde otro navegador y confirma otra vez, se conserva el dato
  original; si no, dejaría de servir para auditar cuándo se verificó de verdad.
- **Un email con `nuevo` se reutiliza, no falla.** Con OTP, que a alguien se le
  caduque el código y vuelva a empezar es el camino normal; el índice único
  sobre `lower(email)` lo rechazaría con `23505`. Solo un `confirmado` corta el
  paso, con un mensaje propio.
- **La búsqueda por email compara exacto en JS, no solo en SQL.** `_` y `%` son
  comodines en SQL, así que `ilike` a secas haría que `ana_lopez@x.com`
  coincidiera con `anaXlopez@x.com` y podríamos modificar la inscripción de
  otra persona. El filtro de la base es un superconjunto; la comparación que
  decide es la de JS.
- **Un código caducado no gasta intento.** Si gastara, se podría agotar el
  límite probando contra un código ya muerto.
- **Los errores se devuelven como datos, no con `throw`.** Antes cualquier
  fallo se convertía en "vuelve a intentarlo", y a quien ya estaba inscrito se
  le invitaba a reintentar algo imposible.
- **El paso de confirmación invita a seguir.** Ya inscrito, la tarjeta muestra
  "Scroll down and enjoy the conference" con una flecha animada. Es un botón de
  verdad: avanza el riel un panel, usando `SCROLL_PER_STEP` importado de
  `HorizontalRail` para no duplicar el número. Respeta `prefers-reduced-motion`
  tanto en el desplazamiento como en la animación de la flecha.
- **"Ya inscrito" se recuerda en el navegador.** Sin eso, recargar devolvía al
  formulario a quien ya estaba confirmado, y al enviarlo otra vez veía "ya
  estás registrado": incoherente. La decisión se toma en el **servidor**
  (`page.tsx` → `emailConfirmado()`), así que no hay parpadeo con el
  formulario. Verificado: email confirmado → confirmación; email inexistente en
  la cookie → formulario; sin cookie → formulario. Ojo con el aviso de arriba:
  **es comodidad, no permiso.**

## Panel de administración

`/admin/conferencia` (nav: *Conference*). No comprueba el rol: estar bajo
`src/app/admin/` ya pasa por el `layout.tsx` del admin, que exige
`rol === 'administrador'`. Lleva `force-dynamic` porque los números de
presencia y el listado cambian constantemente.

**Todo el texto va por i18n**, en el namespace `Admin.conferencia` (64 claves
en `es` y `en`). Verificado por código que cada clave usada en el componente
existe en los dos idiomas y que no sobra ninguna. Un panel con los textos a
mano se queda en un idioma mientras el resto del sitio cambia, y eso fue
exactamente lo que pasó: la primera versión se escribió en español fijo y
desentonaba con el resto del admin, que sí está traducido.

Lo mismo con la **fecha de la tabla**: se formatea con `useLocale()`, no con
`toLocaleString("es")`, o el formato se quedaría clavado en español.

Y el `metadata` de la landing (`title` y `description`) también sale de i18n
mediante `generateMetadata`: se ve en la pestaña del navegador, en los
resultados de búsqueda y al compartir el enlace, así que tiene que cambiar con
el idioma igual que el contenido.

Qué hay:

- **KPIs:** inscritos · confirmados (con acceso) · sin verificar · conectados.
- Desglose por país y por perfil.
- **Tabla** con filtro por estado y selección múltiple.
- **Correo editable** con `{{nombre}}` y `{{email}}`, vista previa en vivo y
  guardado de plantilla.
- **Configuración del directo**, con los dos modos.

Migración `00056`: `ajustes` (clave/valor), `envios` (rastro de correos) y
`presencia` (latidos). Las cinco tablas del schema quedan con RLS activado,
0 políticas y `anon` bloqueado.

### Decisiones del panel

- **Solo se escribe a los confirmados.** Un email en `nuevo` no está
  verificado: pudo escribirlo cualquiera, incluso con la dirección de otra
  persona. El panel avisa de cuántos se omitirán y **el servidor lo aplica
  igual**, porque no se fía de la lista que mande el cliente.
- **Botón de "enviarme una prueba".** La cuota de Resend es corta y un envío a
  30 personas no se deshace: mejor verlo antes en la propia bandeja.
- **Tope de 50 por tanda** y, si Resend devuelve `429`, el lote **se corta** y
  lo dice, en vez de acumular fallos idénticos.
- **Nada se envía a ciegas:** hay que seleccionar, el botón dice a cuántos va,
  y queda registrado en `envios` quién recibió qué.

### Lo que mide "conectados ahora"

Gente **con la página abierta**, no gente viendo: el directo todavía no existe.
El latido sale cada 20 s, solo con la pestaña visible, con un id anónimo por
pestaña en `sessionStorage`. Cuando haya reproductor habrá que atarlo a que
esté reproduciendo de verdad.

El endpoint es público y hace **autolimpieza**: borra los latidos de más de
10 minutos en cada llamada, para que no se pueda llenar la tabla sin montar un
cron aparte.

### Directo: el link de Zoom NO se incrusta

Comprobado, con iframe de control para descartar fallos del montaje:
`example.com` renderiza bien dentro de un iframe, y `us06web.zoom.us/j/…`
queda **en blanco**. No es `X-Frame-Options` (no hay tal cabecera): la página
de Zoom es un lanzador de la aplicación, no un reproductor, así que aunque
renderizara no mostraría la reunión.

Por eso `ajustes` admite **dos modos**, y `directo_embed` tiene prioridad:

- `directo_url` → enlace de Zoom, se muestra como **botón** que lo abre.
- `directo_embed` → URL incrustable (YouTube Live, Vimeo, HLS) → se incrusta.

**Pendiente:** conectar estos ajustes al panel 5 de la landing. Hoy sigue
mostrando el contador.

### Las dos plantillas de correo

| plantilla | cuándo | botón |
|---|---|---|
| `invitacion` | después del evento | **/membresia** — invita a hacerse miembro |
| `recordatorio` | antes del evento | **/conferencia** — manda a la landing |

El recordatorio apunta a **la landing, no al link de Zoom**, y eso es
deliberado: así el enlace de la reunión nunca circula por correo y no se puede
reenviar a terceros. Quien quiera entrar pasa por la página.

Comparten el mismo shell (`LOGO_IKMA`, cuerpo, llamada y pie) y solo cambian el
cuerpo editable y el bloque de llamada. La composición sigue en
`src/lib/conferencia-plantilla.ts`, sin dependencias de servidor, para que la
vista previa del panel y el envío real usen **la misma función**.

En el panel son dos pestañas, y **cada una guarda y envía por separado**:

- Los ajustes se guardan con su propio par de claves
  (`plantilla_invitacion_*` y `plantilla_recordatorio_*`), y `guardarAjustes`
  recibe `plantillaId` para no escribir en la equivocada.
- Los dos borradores viven en el estado a la vez, así que cambiar de pestaña no
  pierde lo escrito en la otra.

**Aviso pendiente de decidir.** Si el panel 5 de la landing acaba mostrando el
botón de Zoom **a cualquiera que abra la página**, el registro deja de proteger
nada: bastaría con tener la URL de la landing. Para que "sin registro no hay
acceso" sea real, la barrera tiene que estar del lado de Zoom (sala de espera o
registro propio). El correo a la landing evita que el link se reenvíe, pero no
convierte la página en privada.

### El correo de invitación

`buildConferenciaInvitacionHtml` (`src/lib/email-template.ts`) usa el shell del
newsletter —cabecera, bloque de llamada y pie— **con el logo delante**, que el
newsletter no lleva: allí la marca es un texto. Todo el correo va **en inglés**,
incluidos los textos fijos y la plantilla sembrada.

El botón apunta a `/membresia`. La composición vive en
`src/lib/conferencia-plantilla.ts`, un módulo **sin dependencias de servidor**
que usan **los dos lados**: el panel para la vista previa y la acción de envío
para el correo real. Al ser la misma función, la vista previa es literalmente
lo que se manda; con dos caminos separados se habrían desviado al primer
retoque.

El cuerpo se edita con **`TiptapEditor`**, el mismo editor del newsletter, con
subida de imágenes. Admite los marcadores `{{nombre}}` y `{{email}}`.

**Migrar una plantilla ya sembrada sin pisar ediciones.** La `00057` traduce la
plantilla al inglés con `update ... where valor = <valor de fábrica>`. Así, si
el usuario ya la había editado, la migración no toca nada, y re-ejecutarla es
inofensiva. Es el patrón a repetir: **nunca sobrescribir contenido que puede
haber cambiado**.

### Un fallo que dejó lección: callar el error

`getRegistros` devolvía una lista vacía al fallar, así que el panel mostraba
**"no hay inscritos"** cuando en realidad **no había podido leerlos**. Pasó de
verdad con la `00056` sin aplicar. Ahora las funciones devuelven
`{ data, error }`, el panel pinta un aviso rojo avisando de que los números
pueden estar incompletos, y `PGRST205`/`PGRST200` se traducen a *"¿está
aplicada la migración 00056?"* en vez del mensaje críptico de la API.

Silenciar el error parecía defensivo y era lo contrario: llevaba a decidir
sobre datos que no existían.

## Figma — cerrado

La réplica del prototipo ya está implementada, así que **el material de
Figma se ha eliminado** y no forma parte del proyecto:

- Token de la API: borrado (se había pegado en el chat, así que además
  conviene revocarlo en Figma por si acaso).
- `figma-plugin/`: eliminado. Nunca fue usable aquí — el plugin
  requiere la app de escritorio y en Linux no existe; el
  `implementacion.svg` que generaba ya estaba desactualizado.
- JSON extraídos de la API (`tmp/figma-*.json`): eliminados.

Por qué no sirve Figma para este flujo: sin app de escritorio no se
puede usar el MCP ni importar plugins, y la API REST es de solo
lectura. El prototipo se replicó midiendo el diseño a mano.

Si en el futuro hace falta volver a consultarlo: hace falta un token
nuevo, y el file key del proyecto es `ko93SBxP7WCksQ94gtBdIg`.

## Decisiones Pendientes

- [ ] Plataforma de streaming (Zoom, YouTube Live, otra)
- [x] Diseño visual de la landing — réplica del prototipo de Figma
- [x] Contenido del hero (título, fecha, hora, descripción) — fecha
      `2026-11-14T09:00:00-04:00`; el resto en `messages/{en,es}.json`
- [x] Campos exactos del formulario: `nombre`, `email`, `pais`,
      `perfil_profesional`, `consentimiento`
