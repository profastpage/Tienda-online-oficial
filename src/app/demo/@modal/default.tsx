// ═══════════════════════════════════════════════════════════════════
// MODAL DEFAULT — Retorna null cuando no hay modal activo
// ═══════════════════════════════════════════════════════════════════
//
// Cuando el usuario está en /demo (sin slug), el slot @modal
// no intercepta ninguna ruta, así que renderiza este default.
//
// Cuando el usuario navega a /demo/[slug] desde /demo,
// el slot @modal intercepta y renderiza (.)[slug]/page.tsx.
//

export default function ModalDefault() {
  return null
}
