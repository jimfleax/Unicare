import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkHealthApi } from './api';

describe('checkHealthApi', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true when the API responds with success: true', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'System healthy' }),
    });

    const result = await checkHealthApi();
    expect(result).toBe(true);
  });

  it('should return false when the API responds with success: false', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, message: 'System error' }),
    });

    const result = await checkHealthApi();
    expect(result).toBe(false);
  });

  it('should return false when the API response is not ok', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    const result = await checkHealthApi();
    expect(result).toBe(false);
  });

  it('should return false on network error', async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const result = await checkHealthApi();
    expect(result).toBe(false);
  });
});

import { createRequisitionApi } from './api';

describe('createRequisitionApi', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
    // Mock getAuthHeaders internals or let it run (it uses localStorage)
    // Actually getStoredToken reads localStorage. Mocking fetch is usually enough.
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true when requisition is created successfully', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const payload = {
      inventoryId: 'inv-123',
      technicianId: 'tech-123',
      quantityRequested: 2,
      reason: 'Need parts'
    };
    
    const result = await createRequisitionApi(payload);
    expect(result).toBe(true);
    
    // Check if fetch was called correctly
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/requisitions'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload)
      })
    );
  });

  it('should return false when API responds with an error', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    const result = await createRequisitionApi({
      inventoryId: 'inv-123',
      technicianId: 'tech-123',
      quantityRequested: 2,
    });
    expect(result).toBe(false);
  });

  it('should return false on network error', async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const result = await createRequisitionApi({
      inventoryId: 'inv-123',
      technicianId: 'tech-123',
      quantityRequested: 2,
    });
    expect(result).toBe(false);
  });
});

import { createAssetApi, updateAssetApi, deleteAssetApi, createInventoryApi, updateInventoryApi, deleteInventoryApi } from './api';

describe('Asset & Inventory CRUD API wrappers', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Assets
  it('createAssetApi should return true on ok response', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
    const result = await createAssetApi({ name: 'Asset' });
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/assets'), expect.objectContaining({ method: 'POST' }));
  });

  it('updateAssetApi should return true on ok response', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
    const result = await updateAssetApi('TAG-123', { name: 'Updated' });
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/assets/TAG-123'), expect.objectContaining({ method: 'PUT' }));
  });

  it('deleteAssetApi should return true on ok response', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
    const result = await deleteAssetApi('TAG-123');
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/assets/TAG-123'), expect.objectContaining({ method: 'DELETE' }));
  });

  // Inventory
  it('createInventoryApi should return true on ok response', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
    const result = await createInventoryApi({ name: 'Part' });
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/inventory'), expect.objectContaining({ method: 'POST' }));
  });

  it('updateInventoryApi should return true on ok response', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
    const result = await updateInventoryApi('id-123', { name: 'Updated' });
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/inventory/id-123'), expect.objectContaining({ method: 'PUT' }));
  });

  it('deleteInventoryApi should return true on ok response', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
    const result = await deleteInventoryApi('id-123');
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/inventory/id-123'), expect.objectContaining({ method: 'DELETE' }));
  });
});

import { fetchPrioritiesApi, fetchLocationsApi } from './api';

describe('fetchPrioritiesApi', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return array of {value, label, color} objects for priorities', async () => {
    const mockPriorities = [
      { value: 'Critical', label: 'Critical', color: 'var(--red)' },
      { value: 'High', label: 'High', color: 'var(--amber-border)' },
    ];
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockPriorities }),
    });

    const result = await fetchPrioritiesApi();
    expect(result).toEqual(mockPriorities);
    expect(result[0]).toHaveProperty('value');
    expect(result[0]).toHaveProperty('label');
    expect(result[0]).toHaveProperty('color');
  });

  it('should throw when the API call fails', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchPrioritiesApi()).rejects.toThrow();
  });
});

describe('fetchLocationsApi', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return array of {value, label, color} objects for locations', async () => {
    const mockLocations = [
      { value: 'Main Library', label: 'Main Library', color: 'var(--red)' },
      { value: 'Science Block', label: 'Science Block', color: '#3b82f6' },
    ];
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockLocations }),
    });

    const result = await fetchLocationsApi();
    expect(result).toEqual(mockLocations);
    expect(result[0]).toHaveProperty('value');
    expect(result[0]).toHaveProperty('label');
    expect(result[0]).toHaveProperty('color');
  });

  it('should throw when the API call fails', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchLocationsApi()).rejects.toThrow();
  });
});

import { subscribeToPushNotificationsApi } from './api';

describe('subscribeToPushNotificationsApi', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true when push subscription is successful', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
    
    const fakeSubscription = { endpoint: 'https://fcm.googleapis.com/fcm/send/fake-endpoint' } as unknown as PushSubscription;
    const result = await subscribeToPushNotificationsApi(fakeSubscription);
    
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/notifications/subscribe'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(fakeSubscription)
      })
    );
  });

  it('should return false when API responds with an error', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: false });
    
    const fakeSubscription = { endpoint: 'fake' } as unknown as PushSubscription;
    const result = await subscribeToPushNotificationsApi(fakeSubscription);
    
    expect(result).toBe(false);
  });

  it('should return false on network error', async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));
    
    const fakeSubscription = { endpoint: 'fake' } as unknown as PushSubscription;
    const result = await subscribeToPushNotificationsApi(fakeSubscription);
    
    expect(result).toBe(false);
  });
});
