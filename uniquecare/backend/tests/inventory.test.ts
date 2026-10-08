import request from 'supertest';
import app from '../src/app';
import Inventory from '../src/models/Inventory';
import mongoose from 'mongoose';

describe('Inventory Endpoints', () => {
  beforeEach(async () => {
    await Inventory.deleteMany({});
  });

  describe('POST /api/inventory', () => {
    it('should create a new spare part', async () => {
      const res = await request(app).post('/api/inventory').send({
        name: 'Sensor X',
        sku: 'SN-001',
        category: 'Sensors',
        stock: 50,
        minStockLevel: 10,
        unit: 'pcs',
        price: 15.5
      });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toBe('SN-001');
      expect(res.body.data.status).toBe('In Stock');
    });
  });

  describe('GET /api/inventory', () => {
    it('should fetch all spare parts', async () => {
      await Inventory.create([
        { name: 'Sensor X', sku: 'SN-001', category: 'Sensors', stock: 50, unit: 'pcs' },
        { name: 'Valve Y', sku: 'VL-002', category: 'Valves', stock: 5, minStockLevel: 10, unit: 'pcs' } // should be Low Stock
      ]);

      const res = await request(app).get('/api/inventory');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      
      const valve = res.body.data.find((i: any) => i.sku === 'VL-002');
      expect(valve.status).toBe('Low Stock');
    });
  });

  describe('GET /api/inventory/:id', () => {
    it('should fetch a single spare part by ID', async () => {
      const part = await Inventory.create({ name: 'Cable Z', sku: 'CB-003', category: 'Cables', stock: 100, unit: 'm' });

      const res = await request(app).get(`/api/inventory/${part._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toBe('CB-003');
    });
  });

  describe('PUT /api/inventory/:id', () => {
    it('should update a spare part', async () => {
      const part = await Inventory.create({ name: 'Cable Z', sku: 'CB-003', category: 'Cables', stock: 100, unit: 'm' });

      const res = await request(app).put(`/api/inventory/${part._id}`).send({ stock: 0 });
      
      expect(res.status).toBe(200);
      expect(res.body.data.stock).toBe(0);
      expect(res.body.data.status).toBe('Out of Stock');
    });
  });

  describe('DELETE /api/inventory/:id', () => {
    it('should delete a spare part', async () => {
      const part = await Inventory.create({ name: 'Cable Z', sku: 'CB-003', category: 'Cables', stock: 100, unit: 'm' });

      const res = await request(app).delete(`/api/inventory/${part._id}`);
      expect(res.status).toBe(200);
      
      const check = await Inventory.findById(part._id);
      expect(check).toBeNull();
    });
  });
});
