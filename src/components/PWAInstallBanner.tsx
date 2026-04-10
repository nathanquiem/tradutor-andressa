'use client'

import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'pwa_banner_dismissed_at'
const DISMISS_DURATION_DAYS = 1

function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    if (!raw) return false
    const dismissedAt = parseInt(raw, 10)
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
    return daysSince < DISMISS_DURATION_DAYS
  } catch {
    return false
  }
}

function saveDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
  } catch {
    // ignore
  }
}

export function PWAInstallBanner() {
  const [show, setShow] = useState(false)
  const [isIOSDevice, setIsIOSDevice] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (isInStandaloneMode()) return
    if (wasDismissedRecently()) return

    const ios = isIOS()
    setIsIOSDevice(ios)

    if (ios) {
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setShow(false)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setDeferredPrompt(null)
    setShow(false)
  }

  const handleDismiss = () => {
    saveDismissed()
    setShow(false)
  }

  if (!show || installed) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[998] bg-black/10 backdrop-blur-[2px] sm:hidden"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Instalar aplicativo"
        className="fixed bottom-0 left-0 right-0 z-[999] px-4 pb-6 pt-1 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm"
        style={{ animation: 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
      >
        <div className="relative rounded-2xl bg-white border border-[#222222]/10 shadow-2xl overflow-hidden">
          {/* Accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-[#222222] via-[#4a9c71] to-[#222222]" />

          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0 bg-[#222222] p-2 rounded-xl shadow-lg">
                  <img
                    src="/globe.svg"
                    alt="Tradutor"
                    className="w-8 h-8 filter invert"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#222222] text-sm leading-tight">Tradutor de Voz</p>
                  <p className="text-xs text-gray-500 mt-0.5">Ferramenta Rápida</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors font-bold text-lg leading-none"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Instale o app para ter acesso rápido às suas traduções em qualquer lugar!
            </p>

            {isIOSDevice ? (
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 mb-4">
                <p className="text-xs text-gray-700 font-medium mb-2">Como instalar no iPhone:</p>
                <ol className="space-y-1.5">
                  <li className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#222222]/10 text-[#222222] flex items-center justify-center text-[10px] font-bold">1</span>
                    Toque no botão de <strong>Compartilhar</strong>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#222222]/10 text-[#222222] flex items-center justify-center text-[10px] font-bold">2</span>
                    Selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong>
                  </li>
                </ol>
              </div>
            ) : null}

            <div className="flex gap-2">
              {!isIOSDevice && (
                <button
                  onClick={handleInstall}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#222222] hover:bg-[#111111] text-white text-sm font-semibold rounded-xl h-11 transition-colors shadow-lg"
                >
                  Instalar Agora
                </button>
              )}
              <button
                onClick={handleDismiss}
                className={`flex items-center justify-center text-gray-600 hover:text-[#222222] text-sm font-medium rounded-xl h-11 transition-colors border border-gray-200 hover:bg-gray-50 ${isIOSDevice ? 'flex-1' : 'px-4'}`}
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
