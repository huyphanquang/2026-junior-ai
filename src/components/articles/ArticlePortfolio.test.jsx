import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { matchesSearch, PortfolioSearchInput } from './ArticlePortfolio.jsx'

// Helper: tạo mock item wrapper với các field cần thiết cho matchesSearch
const mockItem = (title = '', text = '', tags = []) => ({
    locales: { title, text, tags }
})

// ─────────────────────────────────────────────
// matchesSearch — pure function tests
// ─────────────────────────────────────────────

describe('matchesSearch', () => {
    it('returns true when query is empty string', () => {
        const item = mockItem('React Portfolio', 'Some description', ['react'])
        expect(matchesSearch(item, '')).toBe(true)
    })

    it('returns true when query is only whitespace', () => {
        const item = mockItem('React Portfolio', 'Some description', ['react'])
        expect(matchesSearch(item, '   ')).toBe(true)
    })

    it('matches title case-insensitively', () => {
        const item = mockItem('BrainPulse', '', [])
        expect(matchesSearch(item, 'brainpulse')).toBe(true)
        expect(matchesSearch(item, 'BRAIN')).toBe(true)
        expect(matchesSearch(item, 'pulse')).toBe(true)
    })

    it('matches tags case-insensitively', () => {
        const item = mockItem('', '', ['Node.js', 'Backend', 'API'])
        expect(matchesSearch(item, 'node')).toBe(true)
        expect(matchesSearch(item, 'BACKEND')).toBe(true)
        expect(matchesSearch(item, 'api')).toBe(true)
    })

    it('matches text content after stripping HTML tags', () => {
        const item = mockItem('', '<b>Node.js</b> built <strong>RESTful API</strong>', [])
        expect(matchesSearch(item, 'node')).toBe(true)
        expect(matchesSearch(item, 'restful')).toBe(true)
        // HTML tag names themselves should not be matched
        expect(matchesSearch(item, 'strong')).toBe(false)
    })

    it('returns false when no field matches the query', () => {
        const item = mockItem('React Portfolio', 'Frontend project', ['react', 'frontend'])
        expect(matchesSearch(item, 'python')).toBe(false)
        expect(matchesSearch(item, 'xyzxyzxyz')).toBe(false)
    })
})

// ─────────────────────────────────────────────
// PortfolioSearchInput — component tests
// ─────────────────────────────────────────────

describe('PortfolioSearchInput', () => {
    it('renders the search input with correct placeholder', () => {
        render(<PortfolioSearchInput query="" setQuery={() => {}} />)
        expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument()
    })

    it('does not render clear button when query is empty', () => {
        render(<PortfolioSearchInput query="" setQuery={() => {}} />)
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('renders clear button when query has a value', () => {
        render(<PortfolioSearchInput query="react" setQuery={() => {}} />)
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('calls setQuery with new value when user types', async () => {
        const user = userEvent.setup()
        const setQuery = vi.fn()
        render(<PortfolioSearchInput query="" setQuery={setQuery} />)

        await user.type(screen.getByPlaceholderText('Search projects...'), 'a')
        expect(setQuery).toHaveBeenCalledWith('a')
    })

    it('calls setQuery with empty string when clear button is clicked', async () => {
        const user = userEvent.setup()
        const setQuery = vi.fn()
        render(<PortfolioSearchInput query="react" setQuery={setQuery} />)

        await user.click(screen.getByRole('button'))
        expect(setQuery).toHaveBeenCalledWith('')
    })
})
