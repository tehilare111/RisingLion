import React from 'react'

type ErrorCardProps = { message: string; onClose?: () => void }

export default function ErrorCard({ message, onClose }: ErrorCardProps) {
  return (
    <div role="alert" className="bg-white/95 backdrop-blur rounded-lg border border-red-200 shadow-brand p-4 flex items-start gap-3">
      <div className="shrink-0 mt-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-red-600">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0v5a1 1 0 102 0V6zm-1 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-brand-black">Something went wrong</div>
        <div className="text-sm text-red-800 whitespace-pre-wrap mt-0.5">{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Dismiss error"
          className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md text-red-700 hover:text-red-900 hover:bg-red-100/70 focus:outline-none focus:ring-2 focus:ring-red-300"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  )
}


