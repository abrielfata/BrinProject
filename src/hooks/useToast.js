import { useState, useCallback } from 'react'

// Simple toast implementation
let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = ++toastId
    const newToast = {
      id,
      title,
      description,
      variant,
      timestamp: Date.now()
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)

    // For console logging in development
    console.log(`Toast [${variant}]: ${title} - ${description}`)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return {
    toast,
    toasts,
    dismissToast
  }
}