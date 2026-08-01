'use client'

import React, { useRef } from 'react'

interface Props {
  children: React.ReactNode
}

export default function CarouselWrapper({ children }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth > 600 ? 600 : 300
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth > 600 ? 600 : 300
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div>
      <div 
        ref={scrollRef} 
        className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      <div className="mt-6 flex justify-end gap-1.5">
        <button 
          onClick={scrollLeft}
          className="flex h-6 w-6 items-center justify-center rounded bg-[#F4E9F1] text-xs font-bold text-[#D946EF] hover:bg-[#eacde4] transition-colors"
        >
          ‹
        </button>
        <button 
          onClick={scrollRight}
          className="flex h-6 w-6 items-center justify-center rounded bg-[#D946EF] text-xs font-bold text-white hover:opacity-90 transition-opacity"
        >
          ›
        </button>
      </div>
    </div>
  )
}
