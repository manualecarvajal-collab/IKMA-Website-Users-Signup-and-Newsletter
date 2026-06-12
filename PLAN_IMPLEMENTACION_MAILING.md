# Plan de Implementación: Sistema de Mailing y Gestión de Revistas IKMA

Este documento detalla la estrategia paso a paso para implementar el sistema de acceso multinivel y la herramienta de envío masivo de revistas.

## 1. Lógica de Acceso y Comportamiento del Botón (Frontend)
El botón "Descargar PDF" en la vista de detalle de la revista actuará como el controlador principal según el tipo de usuario.

### Niveles de Usuario y Acción:
- **Usuario No Registrado:** 
  - El botón redirige a la página de `/registro`.
- **Usuario Registrado (No Suscrito):** 
  - El botón activa el Pop-up de invitación a suscribirse (ya diseñado).
- **Usuario Registrado y Suscrito:** 
  - El botón llama a la acción de servidor para enviar la revista al correo.
  - Se muestra un **Toast de éxito** ("La revista ha sido enviada con éxito").
  - El formato del envío es un Newsletter con botón de descarga.

---

## 2. Herramienta de Envío Masivo (Panel Admin)
Implementación de una ventana emergente (Modal) para que el administrador gestione el lanzamiento de cada revista.

### Componentes del Modal:
- **Barra de Búsqueda:** Filtrado dinámico por nombre o correo electrónico.
- **Lista de Suscriptores:** Visualización de todos los usuarios con `suscripcion_activa: true`.
- **Exclusión Temporal (Trash Icon):** 
  - Cada fila tendrá un icono de papelera.
  - Al pulsar, el usuario se elimina de la **lista de envío actual** (estado local).
  - **Importante:** Esta acción no afecta a la base de datos; la lista se reinicia al cerrar y abrir el modal.
- **Botón de Envío:** Muestra el conteo final de destinatarios y dispara la acción masiva.

---

## 3. Motor de Envío y Plantilla Newsletter (Backend)
Refinamiento de la integración con **Resend** para asegurar una entrega profesional.

### Especificaciones Técnicas:
- **Server Action:** Modificar la función actual para aceptar una lista de exclusión.
- **Plantilla HTML:** Diseño de un Newsletter limpio (compatible con clientes de correo) que incluya:
  - Portada de la revista.
  - Título y descripción.
  - Botón de acción principal: "Descargar PDF".
- **Configuración:** Uso de las variables de entorno para `RESEND_API_KEY` y parámetros de remitente configurables.

---

## 4. Interfaz de Usuario y Feedback (Tailwind CSS)
Asegurar que el administrador y el usuario tengan claridad sobre los procesos en curso.

- **Sistema de Toasts:** Implementación de notificaciones flotantes con Tailwind para confirmaciones de éxito y errores.
- **Estados de Carga:** Deshabilitar botones y mostrar indicadores de "Enviando..." durante las peticiones a la API para evitar duplicados.

---

## Próximos Pasos:
1.  **Fase 1:** Implementar la lógica del botón condicional en el frontend.
2.  **Fase 2:** Construir el Modal de gestión de suscriptores en el panel de administración.
3.  **Fase 3:** Ajustar la plantilla de Resend y las acciones de envío.
