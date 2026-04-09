import * as otplib from 'otplib'
import QRCode from 'qrcode'

const ISSUER = 'Tienda Online Oficial'

export function generateTwoFactorSecret(_email: string): string {
  return otplib.generateSecret()
}

export async function generateQRCodeDataURL(secret: string, email: string): Promise<string> {
  const otpauth = otplib.generateURI({
    label: email,
    issuer: ISSUER,
    secret,
  })
  return QRCode.toDataURL(otpauth)
}

export function verifyTwoFactorCode(secret: string, code: string): boolean {
  try {
    const result = otplib.verifySync({ token: code, secret })
    return result.valid === true
  } catch {
    return false
  }
}

export function generateBackupCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    codes.push(code)
  }
  return codes
}
