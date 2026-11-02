import { fireEvent, render, screen, within, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { StudentDashboard } from './StudentDashboardRedesigned'
import type { IssueRecord } from '../../services/api'
import * as api from '../../services/api'

vi.mock('swr', () => ({ default: () => ({ data: [] }) }))
vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ user: { name: 'Test Student' } }) }))
vi.mock('../../services/api', async () => {
  const actual = await vi.importActual<typeof import('../../services/api')>('../../services/api')
  return {
    ...actual,
    uploadImageApi: vi.fn(),
    updateMyAvatarApi: vi.fn(),
  }
})
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    BarChart: ({ data }: { data: unknown }) => <div data-testid="monthly-data">{JSON.stringify(data)}</div>,
  }
})

const tickets: IssueRecord[] = [
  { id: 'older', title: 'Older complaint', reporter: 'Test Student', date: '31/12/2025', createdAt: '2025-12-31T12:00:00.000Z', resolvedAt: '2026-01-02T12:00:00.000Z', status: 'Resolved', location: 'Lab', priority: 'Low', assignee: 'Tech' },
  { id: 'newer', title: 'Newer complaint', reporter: 'Test Student', date: '13/01/2026', createdAt: '2026-01-13T12:00:00.000Z', status: 'Open', location: 'Lab', priority: 'Low', assignee: 'Tech' },
]

describe('StudentDashboard ticket interactions and dates', () => {
  it('uses raw timestamps for month counts, resolution time, display, and history ordering', () => {
    render(<StudentDashboard records={tickets} onAddRecord={vi.fn()} onSelectIssue={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /history/i }))
    expect(screen.getByTestId('monthly-data')).toHaveTextContent('[{"month":"Dec","count":1},{"month":"Jan","count":1}]')
    expect(screen.getByText('2 days')).toBeInTheDocument()
    const cards = screen.getAllByRole('button').filter(card => card.classList.contains('ticket-card-premium'))
    expect(cards[0]).toHaveTextContent('Newer complaint')
    expect(cards[1]).toHaveTextContent('Older complaint')
    expect(within(cards[0]).getByText(new Date(tickets[1].createdAt!).toLocaleDateString())).toBeInTheDocument()
    expect(screen.queryByText('Invalid Date')).not.toBeInTheDocument()
  })

  it('activates metric filters and tickets with Enter and Space in both views', () => {
    const onSelectIssue = vi.fn()
    render(<StudentDashboard records={tickets} onAddRecord={vi.fn()} onSelectIssue={onSelectIssue} />)
    const resolvedMetric = screen.getAllByRole('button').find(card => card.classList.contains('metric-card-premium') && card.textContent?.includes('Resolved'))!
    expect(resolvedMetric).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(resolvedMetric, { key: ' ' })
    expect(resolvedMetric).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('Newer complaint')).not.toBeInTheDocument()
    let ticket = screen.getByRole('button', { name: /Older complaint/ })
    expect(ticket).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(ticket, { key: 'Enter' })
    expect(onSelectIssue).toHaveBeenLastCalledWith(tickets[0])
    fireEvent.click(screen.getByRole('tab', { name: /history/i }))
    ticket = screen.getByRole('button', { name: /Newer complaint/ })
    fireEvent.keyDown(ticket, { key: ' ' })
    expect(onSelectIssue).toHaveBeenLastCalledWith(tickets[1])
  })

  describe('Photo FileReader and removal behavior', () => {
    it('cancels pending read on removal/clear and ignores onload results after removal', () => {
      let createdReaders: any[] = []
      const originalFileReader = window.FileReader

      class MockFileReader {
        onload: ((ev: any) => void) | null = null
        abort = vi.fn()
        readAsDataURL = vi.fn()
        constructor() {
          createdReaders.push(this)
        }
      }
      window.FileReader = MockFileReader as any

      try {
        const { container } = render(<StudentDashboard records={tickets} onAddRecord={vi.fn()} onSelectIssue={vi.fn()} />)
        fireEvent.click(screen.getByRole('tab', { name: /Log Incident/i }))

        const fileInput = container.querySelector('input[type="file"][accept*="jpeg"]') as HTMLInputElement
        expect(fileInput).toBeTruthy()

        const file = new File(['dummy'], 'photo.png', { type: 'image/png' })
        fireEvent.change(fileInput, { target: { files: [file] } })

        expect(createdReaders.length).toBe(1)
        const reader = createdReaders[0]
        expect(reader.readAsDataURL).toHaveBeenCalledWith(file)

        // Clear form while read is still pending
        fireEvent.click(screen.getByRole('button', { name: /Clear Form/i }))
        expect(reader.abort).toHaveBeenCalled()

        // When the pending reader completes after removal, preview must not be restored
        act(() => {
          reader.onload?.({ target: { result: 'data:image/png;base64,abc' } })
        })
        expect(screen.queryByAltText('Issue preview')).not.toBeInTheDocument()
      } finally {
        window.FileReader = originalFileReader
      }
    })

    it('cancels pending read when a new photo is selected before the first finishes', () => {
      let createdReaders: any[] = []
      const originalFileReader = window.FileReader

      class MockFileReader {
        onload: ((ev: any) => void) | null = null
        abort = vi.fn()
        readAsDataURL = vi.fn()
        constructor() {
          createdReaders.push(this)
        }
      }
      window.FileReader = MockFileReader as any

      try {
        const { container } = render(<StudentDashboard records={tickets} onAddRecord={vi.fn()} onSelectIssue={vi.fn()} />)
        fireEvent.click(screen.getByRole('tab', { name: /Log Incident/i }))

        const fileInput = container.querySelector('input[type="file"][accept*="jpeg"]') as HTMLInputElement
        const file1 = new File(['photo1'], 'photo1.png', { type: 'image/png' })
        const file2 = new File(['photo2'], 'photo2.png', { type: 'image/png' })

        fireEvent.change(fileInput, { target: { files: [file1] } })
        expect(createdReaders.length).toBe(1)
        const reader1 = createdReaders[0]

        // Select second file before reader1 completes
        fireEvent.change(fileInput, { target: { files: [file2] } })
        expect(reader1.abort).toHaveBeenCalled()
        expect(createdReaders.length).toBe(2)
        const reader2 = createdReaders[1]

        // If reader1 completes now, it should be ignored
        act(() => {
          reader1.onload?.({ target: { result: 'data:image/png;base64,photo1' } })
        })
        expect(screen.queryByAltText('Issue preview')).not.toBeInTheDocument()

        // When reader2 completes, it should show photo2
        act(() => {
          reader2.onload?.({ target: { result: 'data:image/png;base64,photo2' } })
        })
        const preview = screen.getByAltText('Issue preview') as HTMLImageElement
        expect(preview.src).toContain('photo2')
      } finally {
        window.FileReader = originalFileReader
      }
    })
  })

  describe('Avatar upload flow and caching', () => {
    beforeEach(() => {
      localStorage.clear()
      vi.spyOn(window, 'alert').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('persists uploaded avatar in localStorage only after updateMyAvatarApi succeeds', async () => {
      vi.mocked(api.uploadImageApi).mockResolvedValue('https://storage.example.com/avatar.png')
      vi.mocked(api.updateMyAvatarApi).mockResolvedValue(true)

      const { container } = render(<StudentDashboard records={tickets} onAddRecord={vi.fn()} onSelectIssue={vi.fn()} />)
      const avatarInput = container.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement
      expect(avatarInput).toBeTruthy()

      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
      await act(async () => {
        fireEvent.change(avatarInput, { target: { files: [file] } })
      })

      await waitFor(() => {
        expect(api.uploadImageApi).toHaveBeenCalledWith(file, 'avatars')
        expect(api.updateMyAvatarApi).toHaveBeenCalledWith('https://storage.example.com/avatar.png')
      })

      expect(localStorage.getItem('ucare-student-avatar')).toBe('https://storage.example.com/avatar.png')
      const avatarImg = screen.getByAltText('Test Student') as HTMLImageElement
      expect(avatarImg.src).toBe('https://storage.example.com/avatar.png')
    })

    it('does not cache in localStorage, restores previous avatar, and alerts if updateMyAvatarApi fails', async () => {
      localStorage.setItem('ucare-student-avatar', 'https://storage.example.com/original-avatar.png')
      vi.mocked(api.uploadImageApi).mockResolvedValue('https://storage.example.com/failed-upload.png')
      vi.mocked(api.updateMyAvatarApi).mockResolvedValue(false)

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      const { container } = render(<StudentDashboard records={tickets} onAddRecord={vi.fn()} onSelectIssue={vi.fn()} />)
      const avatarInput = container.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement

      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
      await act(async () => {
        fireEvent.change(avatarInput, { target: { files: [file] } })
      })

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to update avatar. Please try again.')
      })

      // localStorage should NOT have the new failed URL
      expect(localStorage.getItem('ucare-student-avatar')).toBe('https://storage.example.com/original-avatar.png')
      const avatarImg = screen.getByAltText('Test Student') as HTMLImageElement
      expect(avatarImg.src).toBe('https://storage.example.com/original-avatar.png')
    })

    it('does not cache in localStorage, restores previous avatar, and alerts if uploadImageApi fails', async () => {
      vi.mocked(api.uploadImageApi).mockResolvedValue(null)
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      const { container } = render(<StudentDashboard records={tickets} onAddRecord={vi.fn()} onSelectIssue={vi.fn()} />)
      const avatarInput = container.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement

      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
      await act(async () => {
        fireEvent.change(avatarInput, { target: { files: [file] } })
      })

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to update avatar. Please try again.')
      })

      expect(localStorage.getItem('ucare-student-avatar')).toBeNull()
      expect(screen.queryByAltText('Test Student')).not.toBeInTheDocument()
    })
  })
})
