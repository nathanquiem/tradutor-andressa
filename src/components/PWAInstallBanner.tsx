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
        <div 
          className="relative rounded-2xl bg-white shadow-2xl overflow-hidden pointer-events-auto"
          style={{ border: '1px solid rgba(0,0,0,0.1)' }}
        >
          {/* Accent line */}
          <div className="w-full bg-gradient-to-r from-[#222222] via-[#4a9c71] to-[#222222]" style={{ height: '4px' }} />

          <div style={{ padding: '1.25rem' }}>
            <div className="flex items-start justify-between mb-4" style={{ gap: '0.75rem' }}>
              <div className="flex items-center" style={{ gap: '0.75rem' }}>
                <div 
                  className="relative flex-shrink-0 bg-[#222222] rounded-xl shadow-lg flex items-center justify-center"
                  style={{ width: '3rem', height: '3rem', padding: '0.5rem' }}
                >
                  <img
                    src="/globe.svg"
                    alt="Tradutor"
                    className="filter invert"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <div>
                  <p className="font-bold text-[#222222] text-sm leading-tight">Tradutor de Voz</p>
                  <p className="text-gray-500" style={{ fontSize: '11px', marginTop: '2px' }}>Ferramenta Rápida</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors font-bold leading-none flex items-center justify-center"
                aria-label="Fechar"
                style={{ padding: '0.5rem', width: '2rem', height: '2rem', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Instale o app para ter acesso rápido às suas traduções em qualquer lugar!
            </p>

            {isIOSDevice ? (
              <div 
                className="rounded-xl bg-gray-50 border border-gray-100 mb-4"
                style={{ padding: '0.75rem' }}
              >
                <p className="text-xs text-gray-700 font-medium mb-2">Como instalar no iPhone:</p>
                <ol style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li className="flex items-center text-xs text-gray-600" style={{ gap: '0.5rem' }}>
                    <span 
                      className="flex-shrink-0 rounded-full font-bold flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(34,34,34,0.1)', color: '#222222', width: '1.25rem', height: '1.25rem', fontSize: '10px' }}
                    >1</span>
                    Toque no botão de <strong>Compartilhar</strong>
                  </li>
                  <li className="flex items-center text-xs text-gray-600" style={{ gap: '0.5rem' }}>
                    <span 
                      className="flex-shrink-0 rounded-full font-bold flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(34,34,34,0.1)', color: '#222222', width: '1.25rem', height: '1.25rem', fontSize: '10px' }}
                    >2</span>
                    Selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong>
                  </li>
                </ol>
              </div>
            ) : null}

            <div className="flex" style={{ gap: '0.5rem' }}>
              {!isIOSDevice && (
                <button
                  onClick={handleInstall}
                  className="flex-1 flex items-center justify-center bg-[#222222] hover:bg-[#111111] text-white text-sm font-semibold rounded-xl transition-colors shadow-lg"
                  style={{ height: '2.75rem' }}
                >
                  Instalar Agora
                </button>
              )}
              <button
                onClick={handleDismiss}
                className={`flex items-center justify-center text-gray-600 hover:text-[#222222] text-sm font-medium rounded-xl transition-colors border border-gray-200 hover:bg-gray-50 ${isIOSDevice ? 'flex-1' : ''}`}
                style={{ height: '2.75rem', padding: isIOSDevice ? '0' : '0 1rem' }}
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
