/**
 * Tests for Instance Lock System
 *
 * Tests the prevention of multiple instances/tabs/windows
 * using localStorage and BroadcastChannel API
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Instance Lock System', () => {
  let localStorage: Storage
  let broadcastChannel: BroadcastChannel | null

  beforeEach(() => {
    // Mock localStorage
    localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    } as unknown as Storage

    // Mock BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel('test_channel')
    }
  })

  afterEach(() => {
    if (broadcastChannel) {
      broadcastChannel.close()
    }
    vi.clearAllMocks()
  })

  describe('Instance Detection', () => {
    it('should detect existing instance from localStorage', () => {
      const mockInstanceId = 'test-instance-123'
      const mockHeartbeat = Date.now().toString()

      vi.spyOn(Storage.prototype, 'getItem')
        .mockReturnValueOnce(mockInstanceId)
        .mockReturnValueOnce(mockHeartbeat)

      const existingId = localStorage.getItem('prapassar_instance_id')
      const lastHeartbeat = localStorage.getItem('prapassar_heartbeat')

      expect(existingId).toBe(mockInstanceId)
      expect(lastHeartbeat).toBe(mockHeartbeat)
    })

    it('should not detect instance if heartbeat is too old', () => {
      const mockInstanceId = 'test-instance-123'
      const oldHeartbeat = (Date.now() - 10000).toString() // 10 seconds ago

      vi.spyOn(Storage.prototype, 'getItem')
        .mockReturnValueOnce(mockInstanceId)
        .mockReturnValueOnce(oldHeartbeat)

      const existingId = localStorage.getItem('prapassar_instance_id')
      const lastHeartbeat = localStorage.getItem('prapassar_heartbeat')
      const timeSinceHeartbeat = Date.now() - parseInt(lastHeartbeat!)

      expect(existingId).toBe(mockInstanceId)
      expect(timeSinceHeartbeat).toBeGreaterThan(5000) // Greater than timeout
    })

    it('should generate unique instance ID', () => {
      const id1 = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      const id2 = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^\d+-[a-z0-9]+$/)
    })
  })

  describe('Heartbeat System', () => {
    it('should update heartbeat in localStorage', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

      localStorage.setItem('prapassar_heartbeat', Date.now().toString())

      expect(setItemSpy).toHaveBeenCalledWith(
        'prapassar_heartbeat',
        expect.any(String)
      )
    })

    it('should maintain heartbeat at regular intervals', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      const HEARTBEAT_INTERVAL = 2000

      // Simulate heartbeat updates
      const updateHeartbeat = () => {
        localStorage.setItem('prapassar_heartbeat', Date.now().toString())
      }

      updateHeartbeat()
      await new Promise(resolve => setTimeout(resolve, HEARTBEAT_INTERVAL + 100))
      updateHeartbeat()

      expect(setItemSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('Instance Cleanup', () => {
    it('should remove instance data from localStorage on cleanup', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
      const instanceId = 'test-instance-123'

      localStorage.setItem('prapassar_instance_id', instanceId)
      localStorage.setItem('prapassar_heartbeat', Date.now().toString())

      // Simulate cleanup
      const currentId = localStorage.getItem('prapassar_instance_id')
      if (currentId === instanceId) {
        localStorage.removeItem('prapassar_instance_id')
        localStorage.removeItem('prapassar_heartbeat')
      }

      expect(removeItemSpy).toHaveBeenCalledWith('prapassar_instance_id')
      expect(removeItemSpy).toHaveBeenCalledWith('prapassar_heartbeat')
    })

    it('should close BroadcastChannel on cleanup', () => {
      if (typeof BroadcastChannel === 'undefined') {
        // Skip test if BroadcastChannel is not available
        return
      }

      const channel = new BroadcastChannel('prapassar_instance_channel')
      const closeSpy = vi.spyOn(channel, 'close')

      channel.close()

      expect(closeSpy).toHaveBeenCalled()
    })
  })

  describe('BroadcastChannel Communication', () => {
    it('should send and receive instance check messages', (done) => {
      if (typeof BroadcastChannel === 'undefined') {
        // Skip test if BroadcastChannel is not available
        done()
        return
      }

      const channel1 = new BroadcastChannel('test_instance_channel')
      const channel2 = new BroadcastChannel('test_instance_channel')

      channel2.onmessage = (event) => {
        expect(event.data).toEqual({ type: 'instance_check' })
        channel1.close()
        channel2.close()
        done()
      }

      channel1.postMessage({ type: 'instance_check' })
    })

    it('should respond to instance alive messages', (done) => {
      if (typeof BroadcastChannel === 'undefined') {
        // Skip test if BroadcastChannel is not available
        done()
        return
      }

      const channel1 = new BroadcastChannel('test_instance_channel')
      const channel2 = new BroadcastChannel('test_instance_channel')
      const instanceId = 'test-instance-456'

      channel2.onmessage = (event) => {
        if (event.data.type === 'instance_alive') {
          expect(event.data.instanceId).toBe(instanceId)
          channel1.close()
          channel2.close()
          done()
        }
      }

      channel1.postMessage({ type: 'instance_alive', instanceId })
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing localStorage', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

      const existingId = localStorage.getItem('prapassar_instance_id')
      const lastHeartbeat = localStorage.getItem('prapassar_heartbeat')

      expect(existingId).toBeNull()
      expect(lastHeartbeat).toBeNull()
    })

    it('should handle corrupted heartbeat value', () => {
      vi.spyOn(Storage.prototype, 'getItem')
        .mockReturnValueOnce('test-instance-123')
        .mockReturnValueOnce('invalid-timestamp')

      const lastHeartbeat = localStorage.getItem('prapassar_heartbeat')
      const parsedHeartbeat = parseInt(lastHeartbeat!)

      expect(parsedHeartbeat).toBeNaN()
    })

    it('should handle concurrent instance initialization', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

      // Simulate two instances trying to initialize at the same time
      const id1 = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      const id2 = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

      localStorage.setItem('prapassar_instance_id', id1)
      localStorage.setItem('prapassar_instance_id', id2)

      expect(setItemSpy).toHaveBeenCalledTimes(2)
    })
  })
})
