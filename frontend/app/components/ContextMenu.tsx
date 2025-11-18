'use client'

import { useEffect, useRef } from 'react'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  options: {
    label: string
    icon: React.ReactNode
    onClick: () => void
    className?: string
    divider?: boolean
  }[]
}

export default function ContextMenu({ x, y, onClose, options }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    // Add listeners after a brief delay to avoid closing immediately
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }, 100)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Adjust position if menu would go off-screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const menuWidth = rect.width
      const menuHeight = rect.height
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      let adjustedX = x
      let adjustedY = y

      if (x + menuWidth > windowWidth) {
        adjustedX = windowWidth - menuWidth - 10
      }

      if (y + menuHeight > windowHeight) {
        adjustedY = windowHeight - menuHeight - 10
      }

      menuRef.current.style.left = `${adjustedX}px`
      menuRef.current.style.top = `${adjustedY}px`
    }
  }, [x, y])

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[200px] backdrop-blur-xl bg-gray-900/95 border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{ left: x, top: y }}
    >
      <div className="py-2">
        {options.map((option, index) => (
          <div key={index}>
            {option.divider && (
              <div className="my-1 border-t border-gray-700/50" />
            )}
            <button
              onClick={() => {
                option.onClick()
                onClose()
              }}
              className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                option.className || 'text-gray-300 hover:bg-purple-600/20 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                {option.icon}
              </span>
              <span className="flex-1 text-left">{option.label}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
