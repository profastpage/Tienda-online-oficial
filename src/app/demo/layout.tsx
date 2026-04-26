// ═══════════════════════════════════════════════════════════════════
// PARALLEL ROUTE LAYOUT — Demo Store
// ═══════════════════════════════════════════════════════════════════
//
// Este layout define DOS slots paralelos:
//
//   children →渲染 la tienda principal (/demo/page.tsx)
//   modal    →renderiza el modal interceptado (@modal/(.)[slug])
//
// Cómo funciona:
// ─ Navegación desde /demo → /demo/[slug]:
//   Next.js intercepta la ruta → @modal renderiza el modal
//   children permanece montado → SIN recarga de la tienda
//
// ─ Acceso directo a /demo/[slug]:
//   @modal no está activo → default.tsx retorna null
//   children renderiza [slug]/page.tsx → tienda + modal automático
//
// El orden importa: modal ANTES de children para que el overlay
// se posicione correctamente sobre el contenido.
//

export default function DemoLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {modal}
      {children}
    </>
  )
}
