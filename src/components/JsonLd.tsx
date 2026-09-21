/**
 * Renderiza JSON-LD en el `<head>` del documento.
 *
 * `JSON.stringify` no escapa `<`, así que una cadena que contenga `</script>`
 * (por ejemplo el título de un artículo) podría cerrar la etiqueta y permitir
 * inyección de HTML. Se sustituyen los caracteres peligrosos por sus escapes
 * unicode, que siguen siendo JSON válido.
 */
export default function JsonLd({ data }: { data: string }) {
  const safe = data
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
