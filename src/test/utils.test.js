/**
 * Week 4 Capstone - Level 6 Harness
 * Tests for core utility functions
 */
import { describe, it, expect } from 'vitest'
import { _stringUtils } from '../hooks/utils/_string-utils.js'
import { _validationUtils } from '../hooks/utils/_validation-utils.js'

// ─────────────────────────────────────────────
// _stringUtils
// ─────────────────────────────────────────────
describe('_stringUtils.abbreviateName', () => {
  it('giữ nguyên tên chỉ có 2 từ', () => {
    expect(_stringUtils.abbreviateName('John Doe')).toBe('John Doe')
  })

  it('viết tắt tên đệm', () => {
    expect(_stringUtils.abbreviateName('John Michael Doe')).toBe('John M. Doe')
  })

  it('không viết tắt từ ngoại lệ (de, van...)', () => {
    expect(_stringUtils.abbreviateName('Leonardo da Vinci')).toBe('Leonardo da Vinci')
  })
})

describe('_stringUtils.stripHTMLTags', () => {
  it('xóa thẻ HTML', () => {
    expect(_stringUtils.stripHTMLTags('<b>Hello</b>')).toBe('Hello')
  })

  it('chuyển &nbsp; thành dấu cách', () => {
    expect(_stringUtils.stripHTMLTags('Hello&nbsp;World')).toBe('Hello World')
  })

  it('trả về chuỗi rỗng nếu input null', () => {
    expect(_stringUtils.stripHTMLTags(null)).toBe('')
  })
})

describe('_stringUtils.limitTextSize', () => {
  it('không cắt nếu chuỗi đủ ngắn', () => {
    expect(_stringUtils.limitTextSize('Hello', 10)).toBe('Hello')
  })

  it('cắt và thêm (...) nếu quá dài', () => {
    const result = _stringUtils.limitTextSize('Hello World This Is Long', 10)
    expect(result).toContain('(...)')
  })

  it('trả về null nếu input rỗng', () => {
    expect(_stringUtils.limitTextSize('', 10)).toBeNull()
  })
})

// ─────────────────────────────────────────────
// _validationUtils
// ─────────────────────────────────────────────
describe('_validationUtils.validateEmail', () => {
  it('email hợp lệ trả về true', () => {
    expect(_validationUtils.validateEmail('huy@example.com')).toBe(true)
  })

  it('email thiếu @ trả về false', () => {
    expect(_validationUtils.validateEmail('huyexample.com')).toBe(false)
  })

  it('email thiếu domain trả về false', () => {
    expect(_validationUtils.validateEmail('huy@')).toBe(false)
  })
})

describe('_validationUtils.isSpam', () => {
  it('tin nhắn bình thường không phải spam', () => {
    expect(_validationUtils.isSpam('Hello, I would like to get in touch with you.')).toBe(false)
  })

  it('chuỗi quá ngắn là spam', () => {
    expect(_validationUtils.isSpam('hi')).toBe(true)
  })

  it('chuỗi toàn ký tự lạ là spam', () => {
    expect(_validationUtils.isSpam('xkzptqvbxkzp mmmm')).toBe(true)
  })
})

