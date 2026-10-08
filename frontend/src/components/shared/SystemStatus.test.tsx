/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SystemStatus } from './SystemStatus';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  checkHealthApi: vi.fn(),
}));

describe('SystemStatus Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('displays "System Operational" when health check is true', async () => {
    vi.mocked(api.checkHealthApi).mockResolvedValue(true);

    await act(async () => {
      render(<SystemStatus />);
    });

    expect(screen.getByText('System Operational')).toBeDefined();
  });

  it('displays "System Offline" when health check is false', async () => {
    vi.mocked(api.checkHealthApi).mockResolvedValue(false);

    await act(async () => {
      render(<SystemStatus />);
    });

    expect(screen.getByText('System Offline')).toBeDefined();
  });

  it('polls the health API every 60 seconds', async () => {
    vi.mocked(api.checkHealthApi).mockResolvedValue(true);

    await act(async () => {
      render(<SystemStatus />);
    });

    expect(api.checkHealthApi).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(60000);
    });

    expect(api.checkHealthApi).toHaveBeenCalledTimes(2);

    await act(async () => {
      vi.advanceTimersByTime(60000);
    });

    expect(api.checkHealthApi).toHaveBeenCalledTimes(3);
  });
});
