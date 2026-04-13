'use client'

import { useState, useRef, useCallback } from 'react'
import { ShieldCheck, ShieldOff, QrCode, Copy, Check, Loader2, KeyRound } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/auth-store'

type Step = 'idle' | 'setup' | 'verify-enable' | 'verify-disable'

interface TwoFactorSettingsProps {
  twoFactorEnabled: boolean
  onStatusChange?: (enabled: boolean) => void
}

export default function TwoFactorSettings({ twoFactorEnabled: initialEnabled, onStatusChange }: TwoFactorSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [step, setStep] = useState<Step>('idle')
  const [loading, setLoading] = useState(false)
  const [secret, setSecret] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verifyCode, setVerifyCode] = useState('')
  const [copied, setCopied] = useState(false)
  const { token } = useAuthStore()
  const { toast } = useToast()

  const handleSetup = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSecret(data.secret)
      setQrCode(data.qrCode)
      setBackupCodes(data.backupCodes)
      setStep('setup')
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error al generar código QR', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleEnable = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast({ title: 'Error', description: 'Ingresa un código de 6 dígitos', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ secret, code: verifyCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setEnabled(true)
      setStep('idle')
      setVerifyCode('')
      setSecret('')
      setQrCode('')
      setBackupCodes([])
      onStatusChange?.(true)
      toast({ title: '2FA Habilitado', description: 'La autenticación en dos pasos está activa' })
    } catch (err: unknown) {
      toast({ title: 'Código inválido', description: err instanceof Error ? err.message : 'Verifica el código e intenta de nuevo', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast({ title: 'Error', description: 'Ingresa un código de 6 dígitos', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code: verifyCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setEnabled(false)
      setStep('idle')
      setVerifyCode('')
      onStatusChange?.(false)
      toast({ title: '2FA Deshabilitado', description: 'La autenticación en dos pasos ha sido desactivada' })
    } catch (err: unknown) {
      toast({ title: 'Código inválido', description: err instanceof Error ? err.message : 'Verifica el código e intenta de nuevo', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    toast({ title: 'Copiados', description: 'Códigos de respaldo copiados al portapapeles' })
  }

  const reset = () => {
    setStep('idle')
    setVerifyCode('')
    setSecret('')
    setQrCode('')
    setBackupCodes([])
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Autenticación en Dos Pasos
            </CardTitle>
            <CardDescription className="mt-1">
              Protege tu cuenta con un código adicional de tu aplicación de autenticación
            </CardDescription>
          </div>
          <Badge variant={enabled ? 'default' : 'secondary'} className={enabled ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}>
            {enabled ? 'Habilitado' : 'Deshabilitado'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {/* Idle state */}
          {step === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-sm text-neutral-600">
                {enabled
                  ? 'La autenticación en dos pasos está activa. Se te pedirá un código al iniciar sesión.'
                  : 'Agrega una capa extra de seguridad a tu cuenta. Necesitarás una aplicación como Google Authenticator o Authy.'}
              </p>
              <div className="flex gap-3">
                {enabled ? (
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setStep('verify-disable')}
                    disabled={loading}
                  >
                    <ShieldOff className="w-4 h-4 mr-2" />
                    Deshabilitar 2FA
                  </Button>
                ) : (
                  <Button
                    className="bg-neutral-900 hover:bg-neutral-800"
                    onClick={handleSetup}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                    Habilitar 2FA
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Setup step - show QR code */}
          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div className="bg-neutral-50 border rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-neutral-200 rounded-lg flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5 text-neutral-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900 text-sm">Escanea el código QR</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Abre Google Authenticator, Authy o cualquier app TOTP y escanea este código
                    </p>
                  </div>
                </div>

                {/* QR Code Image */}
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-xl border shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCode} alt="Código QR 2FA" className="w-48 h-48" />
                  </div>
                </div>

                {/* Manual entry secret */}
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-500">Clave manual (si no puedes escanear)</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white border rounded-lg px-3 py-2 text-sm font-mono text-neutral-900 break-all">
                      {secret}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopySecret}
                      className="shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Backup codes */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <h4 className="font-semibold text-amber-800 text-sm">Códigos de Respaldo</h4>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyBackupCodes}
                    className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copiar
                  </Button>
                </div>
                <p className="text-xs text-amber-600">
                  Guarda estos códigos en un lugar seguro. Cada uno solo puede usarse una vez.
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {backupCodes.map((code, i) => (
                    <code key={i} className="bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-900 text-center">
                      {code}
                    </code>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={reset} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800"
                  onClick={() => setStep('verify-enable')}
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Verify enable */}
          {step === 'verify-enable' && (
            <motion.div
              key="verify-enable"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-neutral-50 border rounded-xl p-4 text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-neutral-200 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-neutral-700" />
                </div>
                <p className="text-sm font-semibold text-neutral-900">Verifica que funciona</p>
                <p className="text-xs text-neutral-500">
                  Ingresa el código de 6 dígitos que muestra tu aplicación de autenticación
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="enableCode">Código de Verificación</Label>
                <Input
                  id="enableCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg font-mono tracking-[0.5em]"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('setup')} className="flex-1">
                  ← Atrás
                </Button>
                <Button
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800"
                  onClick={handleEnable}
                  disabled={loading || verifyCode.length !== 6}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                    Habilitar 2FA
                  </>}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Verify disable */}
          {step === 'verify-disable' && (
            <motion.div
              key="verify-disable"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <ShieldOff className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-sm font-semibold text-red-800">¿Desactivar 2FA?</p>
                <p className="text-xs text-red-600">
                  Tu cuenta será menos segura. Ingresa un código de tu aplicación para confirmar.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="disableCode">Código de Verificación</Label>
                <Input
                  id="disableCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg font-mono tracking-[0.5em]"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={reset} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleDisable}
                  disabled={loading || verifyCode.length !== 6}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                    Deshabilitar
                  </>}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
