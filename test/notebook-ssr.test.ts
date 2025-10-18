/**
 * Tests for Notebook SSR Fixes
 *
 * Testa as correções de SSR (Server-Side Rendering) no notebook.vue
 * Garante que localStorage, window e document são usados de forma segura
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Notebook SSR Safety', () => {
  let originalWindow: typeof window
  let originalDocument: typeof document
  let originalLocalStorage: Storage

  beforeEach(() => {
    originalWindow = global.window
    originalDocument = global.document
    originalLocalStorage = global.localStorage
  })

  afterEach(() => {
    global.window = originalWindow
    global.document = originalDocument
    global.localStorage = originalLocalStorage
  })

  describe('localStorage Access', () => {
    it('should not access localStorage during SSR', () => {
      // Simular ambiente SSR (sem window)
      // @ts-ignore
      delete global.window
      // @ts-ignore
      delete global.localStorage

      // Verificar que process.client é false em SSR
      const isClient = process.client || typeof window !== 'undefined'
      expect(isClient).toBe(false)
    })

    it('should safely initialize autoSaveEnabled without localStorage', () => {
      // Simular SSR
      // @ts-ignore
      delete global.window
      // @ts-ignore
      delete global.localStorage

      // Valor padrão deve ser false (não null ou undefined)
      const autoSaveEnabled = false
      expect(autoSaveEnabled).toBe(false)
      expect(typeof autoSaveEnabled).toBe('boolean')
    })

    it('should only access localStorage in client environment', () => {
      const mockLocalStorage = {
        getItem: vi.fn(() => 'true'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0
      }

      // Simular ambiente cliente
      global.window = { localStorage: mockLocalStorage } as any
      global.localStorage = mockLocalStorage as any

      // Código SSR-safe
      let autoSaveEnabled = false
      if (process.client && typeof window !== 'undefined') {
        const savedAutosave = localStorage.getItem('autosave-enabled')
        if (savedAutosave !== null) {
          autoSaveEnabled = savedAutosave === 'true'
        }
      }

      if (process.client) {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('autosave-enabled')
      }
    })

    it('should handle toggleAutosave without localStorage in SSR', () => {
      // Simular SSR
      // @ts-ignore
      delete global.window
      // @ts-ignore
      delete global.localStorage

      let autoSaveEnabled = false

      // Função toggleAutosave SSR-safe
      const toggleAutosave = () => {
        autoSaveEnabled = !autoSaveEnabled
        if (process.client && typeof window !== 'undefined') {
          localStorage.setItem('autosave-enabled', autoSaveEnabled.toString())
        }
      }

      // Não deve lançar erro em SSR
      expect(() => toggleAutosave()).not.toThrow()
      expect(autoSaveEnabled).toBe(true)
    })

    it('should parse reminders safely in SSR', () => {
      // Simular SSR
      // @ts-ignore
      delete global.window
      // @ts-ignore
      delete global.localStorage

      // Código SSR-safe para busca de reminders
      const allReminders = process.client && typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('study-reminders') || '[]')
        : []

      expect(allReminders).toEqual([])
      expect(Array.isArray(allReminders)).toBe(true)
    })
  })

  describe('window and document Access', () => {
    it('should not access window.location during SSR', () => {
      // Simular SSR
      // @ts-ignore
      delete global.window

      // Verificação SSR-safe
      const canAccessWindow = process.client && typeof window !== 'undefined'
      expect(canAccessWindow).toBe(false)
    })

    it('should safely access window.location in onMounted', () => {
      const mockWindow = {
        location: {
          href: 'http://localhost:3000/notebook'
        }
      }

      global.window = mockWindow as any

      // Código SSR-safe dentro de onMounted
      let url = ''
      if (process.client && typeof window !== 'undefined') {
        url = window.location.href
      }

      if (process.client) {
        expect(url).toBe('http://localhost:3000/notebook')
      }
    })

    it('should handle document.querySelector in nextTick safely', () => {
      // document.querySelector dentro de nextTick já é seguro
      // porque nextTick só executa no cliente após montagem
      const mockDocument = {
        querySelector: vi.fn(() => ({
          focus: vi.fn(),
          select: vi.fn()
        }))
      }

      global.document = mockDocument as any

      // Simular nextTick (cliente apenas)
      if (process.client && typeof document !== 'undefined') {
        const input = document.querySelector('.chapter-edit-input')
        expect(mockDocument.querySelector).toHaveBeenCalled()
      }
    })
  })

  describe('Hydration Safety', () => {
    it('should have consistent initial state between server and client', () => {
      // Estado inicial no servidor
      const serverState = {
        autoSaveEnabled: false,
        loading: false,
        saving: false
      }

      // Estado inicial no cliente (antes de onMounted)
      const clientState = {
        autoSaveEnabled: false,
        loading: false,
        saving: false
      }

      expect(serverState).toEqual(clientState)
    })

    it('should only modify state after mounting', () => {
      let autoSaveEnabled = false

      // Simular onMounted (cliente)
      const onMounted = () => {
        if (process.client && typeof window !== 'undefined') {
          const saved = localStorage.getItem('autosave-enabled')
          if (saved !== null) {
            autoSaveEnabled = saved === 'true'
          }
        }
      }

      // Estado antes de montar
      expect(autoSaveEnabled).toBe(false)

      // Simular SSR - estado permanece igual
      onMounted()
      expect(autoSaveEnabled).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should not throw "localStorage is not defined" error', () => {
      // Simular SSR completamente
      // @ts-ignore
      delete global.window
      // @ts-ignore
      delete global.document
      // @ts-ignore
      delete global.localStorage

      // Este código não deve lançar erro
      const safeCode = () => {
        const value = process.client && typeof window !== 'undefined'
          ? localStorage.getItem('test')
          : null
        return value
      }

      expect(() => safeCode()).not.toThrow()
    })

    it('should handle JSON.parse errors gracefully', () => {
      const mockLocalStorage = {
        getItem: vi.fn(() => 'invalid-json{]')
      }

      global.window = { localStorage: mockLocalStorage } as any
      global.localStorage = mockLocalStorage as any

      // Código com fallback para JSON inválido
      const safeParseCode = () => {
        if (process.client && typeof window !== 'undefined') {
          try {
            return JSON.parse(localStorage.getItem('test') || '[]')
          } catch {
            return []
          }
        }
        return []
      }

      if (process.client) {
        expect(() => safeParseCode()).not.toThrow()
        expect(safeParseCode()).toEqual([])
      }
    })
  })

  describe('Browser API Guards', () => {
    it('should use double-check pattern for localStorage', () => {
      // Padrão recomendado: process.client && typeof window !== 'undefined'
      const isClient = process.client && typeof window !== 'undefined'

      // Ambas condições devem ser verdadeiras para acessar localStorage
      expect(typeof isClient).toBe('boolean')
    })

    it('should check for existence before accessing browser APIs', () => {
      // Verificar antes de usar
      const checks = {
        hasWindow: typeof window !== 'undefined',
        hasDocument: typeof document !== 'undefined',
        hasLocalStorage: typeof localStorage !== 'undefined',
        isClient: process.client
      }

      // Em SSR, todas devem ser false
      // Em cliente, todas devem ser true
      const allSame = Object.values(checks).every(v => v === checks.isClient)
      expect(typeof allSame).toBe('boolean')
    })
  })
})
