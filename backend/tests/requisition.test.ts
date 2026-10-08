import request from 'supertest';
import app from '../src/app';
import RequisitionRequest from '../src/models/RequisitionRequest';
import Inventory from '../src/models/Inventory';
import User from '../src/models/User';
import mongoose from 'mongoose';

describe('Requisition Endpoints', () => {
  let inventoryId: string;
  let technicianId: string;

  beforeEach(async () => {
    await RequisitionRequest.deleteMany({});
    await Inventory.deleteMany({});
    await User.deleteMany({});

    const part = await Inventory.create({ name: 'Sensor X', sku: 'SN-001', category: 'Sensors', stock: 50, minStockLevel: 10, unit: 'pcs' });
    inventoryId = (part._id as mongoose.Types.ObjectId).toString();

    const tech = await User.create({ name: 'Tech One', email: 'tech1@example.com', role: 'technician', password: 'password123' });
    technicianId = (tech._id as mongoose.Types.ObjectId).toString();
  });

  describe('POST /api/requisitions', () => {
    it('should create a new requisition request', async () => {
      const res = await request(app).post('/api/requisitions').send({
        inventoryId,
        technicianId,
        quantityRequested: 5,
        reason: 'Need for issue #123'
      });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Pending');
    });
  });

  describe('GET /api/requisitions', () => {
    it('should fetch all requisitions', async () => {
      await RequisitionRequest.create({
        inventoryId,
        technicianId,
        quantityRequested: 2,
        reason: 'Test'
      });

      const res = await request(app).get('/api/requisitions');
      
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('PUT /api/requisitions/:id/status', () => {
    it('should approve requisition and decrement stock', async () => {
      const reqDoc = await RequisitionRequest.create({
        inventoryId,
        technicianId,
        quantityRequested: 10,
        reason: 'Test'
      });

      const res = await request(app).put(`/api/requisitions/${reqDoc._id}/status`).send({
        status: 'Approved'
      });
      
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Approved');

      // Check stock
      const updatedPart = await Inventory.findById(inventoryId);
      expect(updatedPart?.stock).toBe(40); // 50 - 10
    });

    it('should reject requisition and not change stock', async () => {
      const reqDoc = await RequisitionRequest.create({
        inventoryId,
        technicianId,
        quantityRequested: 10,
        reason: 'Test'
      });

      const res = await request(app).put(`/api/requisitions/${reqDoc._id}/status`).send({
        status: 'Rejected'
      });
      
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Rejected');

      // Check stock
      const updatedPart = await Inventory.findById(inventoryId);
      expect(updatedPart?.stock).toBe(50);
    });
  });
});
