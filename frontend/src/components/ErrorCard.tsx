import React from 'react'

type ErrorCardProps = {
  title?: string
  message: string
  onClose?: () => void
}

export default function ErrorCard({ title, message, onClose }: ErrorCardProps) {
  return (
    <div className="border border-red-300 bg-red-50 text-red-800 rounded p-3 flex items-start gap-3">
      <div className="flex-1">
        {title && <div className="font-semibold">{title}</div>}
        <div className="text-sm whitespace-pre-wrap">{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Dismiss error"
          className="text-red-700 hover:text-red-900"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  )
}


