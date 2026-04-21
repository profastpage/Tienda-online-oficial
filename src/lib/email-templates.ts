/**
 * HTML email templates for Tienda Online
 */

const baseStyles = `
  body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
  .header { background: #171717; color: #ffffff; padding: 24px 32px; text-align: center; }
  .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
  .body { padding: 32px; color: #404040; line-height: 1.6; }
  .body h2 { margin: 0 0 12px; font-size: 22px; color: #171717; }
  .body p { margin: 0 0 16px; font-size: 15px; }
  .button { display: inline-block; background: #171717; color: #ffffff !important; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0; }
  .footer { padding: 20px 32px; background: #fafafa; border-top: 1px solid #e5e5e5; text-align: center; font-size: 12px; color: #a3a3a3; }
  .order-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .order-table th, .order-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e5e5; font-size: 14px; }
  .order-table th { background: #fafafa; font-weight: 600; color: #525252; }
  .total-row td { font-weight: 700; font-size: 16px; color: #171717; border-top: 2px solid #171717; border-bottom: none; }
`

function wrapHtml(bodyContent: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${baseStyles}</head><body>
<div class="container">
  <div class="header"><h1>🛍️ Tienda Online</h1></div>
  <div class="body">${bodyContent}</div>
  <div class="footer">© ${new Date().getFullYear()} Tienda Online Oficial. Todos los derechos reservados.</div>
</div></body></html>`
}

export function welcomeEmail(name: string, storeName: string): { subject: string; html: string } {
  const subject = `¡Bienvenido a ${storeName}! 🎉`
  const html = wrapHtml(`
    <h2>¡Hola, ${name}!</h2>
    <p>Gracias por registrarte en <strong>${storeName}</strong>. Tu cuenta ha sido creada exitosamente.</p>
    <p>Ya puedes explorar nuestros productos, realizar compras y gestionar tus pedidos desde tu panel personal.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}" class="button">Ir a mi cuenta</a>
    <p>Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!</p>
    <p>Saludos,<br>El equipo de ${storeName}</p>
  `)
  return { subject, html }
}

export interface OrderConfirmationData {
  orderNumber: string
  customerName: string
  storeName: string
  total: number
  items: { productName: string; quantity: number; price: number }[]
  status?: string
}

export function orderConfirmationEmail(orderData: OrderConfirmationData): { subject: string; html: string } {
  const { orderNumber, customerName, storeName, total, items, status } = orderData
  const subject = `Confirmación de pedido #${orderNumber}`
  const rows = items
    .map(
      (item) =>
        `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>S/ ${item.price.toFixed(2)}</td><td>S/ ${(item.price * item.quantity).toFixed(2)}</td></tr>`
    )
    .join('')

  const html = wrapHtml(`
    <h2>¡Pedido confirmado, ${customerName}!</h2>
    <p>Tu pedido <strong>#${orderNumber}</strong> en <strong>${storeName}</strong> ha sido recibido correctamente.</p>
    <table class="order-table">
      <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
      <tbody>
        ${rows}
        <tr class="total-row"><td colspan="3">Total</td><td>S/ ${total.toFixed(2)}</td></tr>
      </tbody>
    </table>
    <p>Estado actual: <strong>${status || 'Pendiente'}</strong></p>
    <p>Te notificaremos cuando tu pedido sea procesado. ¡Gracias por tu compra!</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}" class="button">Ver mis pedidos</a>
  `)
  return { subject, html }
}

export function passwordResetEmail(resetLink: string, name: string): { subject: string; html: string } {
  const subject = 'Recuperación de contraseña'
  const html = wrapHtml(`
    <h2>¡Hola, ${name}!</h2>
    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
    <p>Haz clic en el botón de abajo para crear una nueva contraseña. Este enlace expirará en <strong>15 minutos</strong>.</p>
    <a href="${resetLink}" class="button">Restablecer contraseña</a>
    <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual no será modificada.</p>
    <p>Por seguridad, no compartas este enlace con nadie.</p>
    <p>Si el botón no funciona, copia y pega este enlace en tu navegador:<br><small>${resetLink}</small></p>
  `)
  return { subject, html }
}
