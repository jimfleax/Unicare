import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStockLevel: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  location?: string;
  price?: number;
}

const inventorySchema = new Schema<IInventory>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    minStockLevel: { type: Number, default: 0 },
    unit: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock'
    },
    location: { type: String },
    price: { type: Number },
  },
  { timestamps: true }
);

// Pre-save hook to compute status based on stock and minStockLevel
inventorySchema.pre('save', function () {
  if (this.stock <= 0) {
    this.status = 'Out of Stock';
  } else if (this.stock <= this.minStockLevel) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
});

export default mongoose.model<IInventory>('Inventory', inventorySchema);
