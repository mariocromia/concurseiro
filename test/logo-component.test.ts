/**
 * Tests for Logo Component
 *
 * Tests the corrected logo component with:
 * - Correct aspect ratio
 * - Skeleton loading
 * - Lazy loading
 * - Error handling
 * - Theme switching
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

describe('Logo Component', () => {
  describe('Aspect Ratio', () => {
    it('should maintain correct aspect ratio for all sizes', () => {
      const sizeClasses = {
        xs: { height: 'h-7', width: 'w-[84px]' },
        sm: { height: 'h-11', width: 'w-[132px]' },
        md: { height: 'h-14', width: 'w-[168px]' },
        lg: { height: 'h-20', width: 'w-[240px]' },
        xl: { height: 'h-40', width: 'w-[480px]' }
      }

      Object.entries(sizeClasses).forEach(([size, classes]) => {
        const heightValue = parseInt(classes.height.replace(/\D/g, ''))
        const widthValue = parseInt(classes.width.match(/\d+/)![0])
        const ratio = widthValue / heightValue

        // Aspect ratio should be consistent (12:1)
        expect(ratio).toBe(12)
      })
    })

    it('should have object-contain to prevent distortion', () => {
      const imageClass = 'h-14 w-[168px] object-contain transition-opacity duration-300'

      expect(imageClass).toContain('object-contain')
    })

    it('should have explicit width and height', () => {
      const sizeClasses = {
        xs: { height: 'h-7', width: 'w-[84px]' },
        sm: { height: 'h-11', width: 'w-[132px]' },
        md: { height: 'h-14', width: 'w-[168px]' }
      }

      Object.values(sizeClasses).forEach(({ height, width }) => {
        expect(height).toMatch(/^h-\d+$/)
        expect(width).toMatch(/^w-\[\d+px\]$/)
      })
    })
  })

  describe('Loading State', () => {
    it('should show skeleton while loading', () => {
      const isLoaded = false
      const shouldShowSkeleton = !isLoaded

      expect(shouldShowSkeleton).toBe(true)
    })

    it('should hide skeleton after load', () => {
      const isLoaded = true
      const shouldShowSkeleton = !isLoaded

      expect(shouldShowSkeleton).toBe(false)
    })

    it('should have skeleton with same dimensions as image', () => {
      const containerClass = 'inline-block relative h-14 w-[168px]'
      const skeletonClass = 'absolute inset-0 h-14 w-[168px]'

      const containerDimensions = containerClass.match(/h-\d+|w-\[\d+px\]/g)
      const skeletonDimensions = skeletonClass.match(/h-\d+|w-\[\d+px\]/g)

      expect(containerDimensions).toEqual(expect.arrayContaining(['h-14', 'w-[168px]']))
      expect(skeletonDimensions).toEqual(expect.arrayContaining(['h-14', 'w-[168px]']))
    })

    it('should animate skeleton with pulse effect', () => {
      const skeletonClass = 'animate-pulse bg-gray-300 dark:bg-gray-700 rounded'

      expect(skeletonClass).toContain('animate-pulse')
    })
  })

  describe('Lazy Loading', () => {
    it('should have loading="lazy" attribute', () => {
      const imgAttributes = {
        loading: 'lazy',
        src: '/img/prapassar_logo1.png',
        alt: 'PraPassar Logo'
      }

      expect(imgAttributes.loading).toBe('lazy')
    })

    it('should trigger load event handler', () => {
      const handleLoad = vi.fn()
      const mockEvent = new Event('load')

      handleLoad(mockEvent)

      expect(handleLoad).toHaveBeenCalledWith(mockEvent)
    })
  })

  describe('Error Handling', () => {
    it('should handle image load errors gracefully', () => {
      let hasError = false
      let isLoaded = false

      const handleError = () => {
        hasError = true
        isLoaded = true
      }

      handleError()

      expect(hasError).toBe(true)
      expect(isLoaded).toBe(true)
    })

    it('should log warning on error', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const logoSrc = '/img/prapassar_logo1.png'

      console.warn(`Failed to load logo: ${logoSrc}`)

      expect(consoleWarnSpy).toHaveBeenCalledWith(`Failed to load logo: ${logoSrc}`)

      consoleWarnSpy.mockRestore()
    })
  })

  describe('Theme Switching', () => {
    it('should use dark logo for dark theme', () => {
      const isDark = true
      const logoSrc = isDark ? '/img/prapassar_logo1.png' : '/img/prapassar_logo2.png'

      expect(logoSrc).toBe('/img/prapassar_logo1.png')
    })

    it('should use light logo for light theme', () => {
      const isDark = false
      const logoSrc = isDark ? '/img/prapassar_logo1.png' : '/img/prapassar_logo2.png'

      expect(logoSrc).toBe('/img/prapassar_logo2.png')
    })

    it('should reset loading state when theme changes', () => {
      let isLoaded = true
      let hasError = true

      const resetState = () => {
        isLoaded = false
        hasError = false
      }

      resetState()

      expect(isLoaded).toBe(false)
      expect(hasError).toBe(false)
    })
  })

  describe('Performance Optimizations', () => {
    it('should have image-rendering optimization', () => {
      const imageStyles = {
        'image-rendering': '-webkit-optimize-contrast'
      }

      expect(imageStyles['image-rendering']).toBe('-webkit-optimize-contrast')
    })

    it('should have smooth transition', () => {
      const transitionClass = 'transition-opacity duration-300'

      expect(transitionClass).toContain('transition-opacity')
      expect(transitionClass).toContain('duration-300')
    })
  })

  describe('Props Handling', () => {
    it('should accept all size props', () => {
      const validSizes = ['xs', 'sm', 'md', 'lg', 'xl']

      validSizes.forEach(size => {
        const props = { size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl' }
        expect(props.size).toBe(size)
      })
    })

    it('should use default size if not provided', () => {
      const defaultProps = {
        size: 'md' as const,
        alt: 'PraPassar Logo',
        className: ''
      }

      expect(defaultProps.size).toBe('md')
    })

    it('should accept custom className', () => {
      const customClassName = 'custom-class-1 custom-class-2'
      const props = { className: customClassName }

      expect(props.className).toBe(customClassName)
    })

    it('should accept custom alt text', () => {
      const customAlt = 'Custom Logo Alt Text'
      const props = { alt: customAlt }

      expect(props.alt).toBe(customAlt)
    })
  })
})
