import { NextResponse } from 'next/server'

// ─── Response Types ────────────────────────────────────────────────────────────

export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiError = {
  success: false
  error: {
    code: string
    message: string
  }
}

// ─── HTTP Status Code Map ──────────────────────────────────────────────────────

const ERROR_STATUS: Record<string, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
}

// ─── Response Helpers ──────────────────────────────────────────────────────────

/**
 * Returns a successful JSON response with status 200 (or a custom status).
 *
 * Shape: `{ success: true, data: T }`
 */
export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status })
}

/**
 * Returns an error JSON response.
 *
 * The `status` defaults to the mapped value for known error codes
 * (UNAUTHORIZED → 401, FORBIDDEN → 403, NOT_FOUND → 404,
 *  CONFLICT → 409, VALIDATION_ERROR → 422).
 * If the code is unrecognised and no explicit status is supplied, falls back to 500.
 *
 * Shape: `{ success: false, error: { code, message } }`
 */
export function err(
  code: string,
  message: string,
  status?: number,
): NextResponse<ApiError> {
  const httpStatus = status ?? ERROR_STATUS[code] ?? 500
  return NextResponse.json<ApiError>(
    { success: false, error: { code, message } },
    { status: httpStatus },
  )
}
