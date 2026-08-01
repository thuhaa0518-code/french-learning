'use client'

import React, { useState } from 'react'
import { ToastProvider, useToast } from '@/components/ui/ToastProvider'
import { Modal } from '@/components/ui/Modal'
import Link from 'next/link'

function DemoPopups() {
  const { toast } = useToast()
  
  // States for Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showUnansweredModal, setShowUnansweredModal] = useState(false)
  const [showTimeoutModal, setShowTimeoutModal] = useState(false)

  const handleFlashcardError = () => {
    toast('Nội dung không khả dụng', 'warning')
  }

  const handleNetworkError = () => {
    toast('Mất kết nối, đang thử lại...', 'loading', 5000)
  }

  const handleTimeoutToast = () => {
    toast('Hết thời gian — Tự động nộp bài', 'error')
    setShowTimeoutModal(true)
  }

  const handleVideoError = () => {
    toast('Video hiện không khả dụng', 'error')
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            &larr; Quay lại trang chủ
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">Demo Giao Diện Thông Báo</h1>
          <p className="mt-2 text-gray-500">
            Các popup và toast được thiết kế theo đúng yêu cầu cho bên học viên.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Flashcard Scenarios */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-[#C930E0] border-b border-gray-100 pb-2">1. Flashcard</h2>
            <div className="flex flex-col gap-3">
              <button onClick={handleFlashcardError} className="rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100 text-left">
                Trigger: Nội dung không khả dụng
              </button>
            </div>
          </section>

          {/* Exam Result Scenarios */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-[#C930E0] border-b border-gray-100 pb-2">3. Kết quả thi</h2>
            <div className="flex flex-col gap-3">
              <button onClick={handleVideoError} className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 text-left">
                Trigger: Video hiện không khả dụng
              </button>
            </div>
          </section>

          {/* Exam Scenarios */}
          <section className="md:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-[#C930E0] border-b border-gray-100 pb-2">2. Làm bài thi</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <button onClick={() => setShowSubmitModal(true)} className="rounded-xl bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-100 text-left">
                Modal: Xác nhận nộp bài (Đã làm xong)
              </button>
              
              <button onClick={() => setShowUnansweredModal(true)} className="rounded-xl bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-100 text-left">
                Modal: Xác nhận nộp bài (Còn câu trống)
              </button>

              <button onClick={handleTimeoutToast} className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 text-left">
                Toast & Modal: Hết thời gian
              </button>

              <button onClick={handleNetworkError} className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 text-left">
                Toast: Lỗi mạng (Đang thử lại)
              </button>
            </div>
          </section>
        </div>

      </div>

      {/* MODALS */}

      {/* 1. Modal xác nhận nộp bài bình thường */}
      <Modal 
        isOpen={showSubmitModal} 
        onClose={() => setShowSubmitModal(false)}
        title="Xác nhận nộp bài"
        footer={
          <>
            <button onClick={() => setShowSubmitModal(false)} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">
              Quay lại làm bài
            </button>
            <button onClick={() => setShowSubmitModal(false)} className="rounded-xl bg-[#C930E0] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90">
              Nộp bài
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <p className="mb-2 text-lg font-bold text-gray-900">40 / 40 câu</p>
          <p className="text-gray-500">Bạn đã hoàn thành tất cả các câu hỏi trong đề thi này. Bạn có chắc chắn muốn nộp bài ngay?</p>
        </div>
      </Modal>

      {/* 2. Modal xác nhận nộp bài khi còn câu trống */}
      <Modal 
        isOpen={showUnansweredModal} 
        onClose={() => setShowUnansweredModal(false)}
        title="Chưa hoàn thành"
        type="danger"
        footer={
          <>
            <button onClick={() => setShowUnansweredModal(false)} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">
              Quay lại làm bài
            </button>
            <button onClick={() => setShowUnansweredModal(false)} className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-red-600">
              Vẫn nộp bài
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <p className="text-[15px] text-gray-700 font-medium">Bạn còn <span className="text-red-500 font-bold">5</span> câu chưa trả lời. Xác nhận nộp bài?</p>
        </div>
      </Modal>

      {/* 3. Modal hết thời gian */}
      <Modal 
        isOpen={showTimeoutModal} 
        onClose={() => setShowTimeoutModal(false)}
        title="Hết thời gian"
        type="danger"
        footer={
          <button onClick={() => setShowTimeoutModal(false)} className="w-full rounded-xl bg-[#C930E0] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90">
            Xem kết quả
          </button>
        }
      >
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <p className="mb-2 text-lg font-bold text-gray-900">Thời gian làm bài đã kết thúc</p>
          <p className="text-gray-500">Hệ thống đã tự động lưu và nộp bài thi của bạn.</p>
        </div>
      </Modal>
    </div>
  )
}

export default function DemoPopupsPage() {
  return (
    <ToastProvider>
      <DemoPopups />
    </ToastProvider>
  )
}
