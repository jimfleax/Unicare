import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { StudentDashboard } from './StudentDashboardRedesigned'
import type { IssueRecord } from '../../services/api'

vi.mock('swr', () => ({ default: () => ({ data: [] }) }))
vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ user: { name: 'Test Student' } }) }))
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
})
