'use client'

import React, { useEffect, useState } from 'react'

interface PreviewModalProps {
  url: string
  title?: string
}

export default function PreviewModal({ url, title = 'Preview' }: PreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const previewUrl = url.includes('?') ? `${url}&preview=1` : `${url}?preview=1`

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      <button 
        type="button" 
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        Preview
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="flex w-full max-w-6xl h-full max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
              <h3 className="text-[17px] font-bold text-gray-900">
                {title}
              </h3>
              <div className="flex items-center gap-4">
                <a 
                  href={url} 
                  target="_blank" 
                  className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5"
                  rel="noreferrer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V48h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z"></path>
                  </svg>
                  Mở tab mới
                </a>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 bg-white border border-gray-300 shadow-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-gray-100 relative">
              <iframe 
                src={previewUrl} 
                className="absolute inset-0 w-full h-full border-0" 
                title={title}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
