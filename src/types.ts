export type DashboardStat = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
};

export type Medicine = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  status: "Active" | "Low Stock" | "Out of Stock";
};

export type Order = {
  id: string;
  customerName: string;
  amount: number;
  paymentStatus: "Paid" | "Pending" | "Failed";
  fulfillmentStatus: "Processing" | "Packed" | "Shipped" | "Delivered";
  createdAt: string;
};

export type Supplier = {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  activeOrders: number;
};

export type Customer = {
  id: string;
  name: string;
  type: "B2B" | "Retail";
  phone: string;
  email: string;
  creditLimit: number;
  lastOrderAt: string;
};

export type AnalyticsPoint = {
  label: string;
  revenue: number;
  orders: number;
};
