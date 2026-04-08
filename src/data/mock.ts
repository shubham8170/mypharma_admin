import type {
  AnalyticsPoint,
  Customer,
  DashboardStat,
  Medicine,
  Order,
  Supplier,
} from "../types";

export const dashboardStats: DashboardStat[] = [
  { label: "Total Revenue", value: "Rs 12,48,300", delta: "+12.6%", positive: true },
  { label: "Total Orders", value: "2,184", delta: "+7.2%", positive: true },
  { label: "Low Stock Alerts", value: "19", delta: "-3.1%", positive: true },
  { label: "Pending Deliveries", value: "84", delta: "+4.8%", positive: false },
];

export const medicines: Medicine[] = [
  { id: "MED-001", name: "Paracetamol 650", sku: "PCM-650", category: "Pain Relief", stock: 1200, price: 32, status: "Active" },
  { id: "MED-018", name: "Amoxicillin 500", sku: "AMX-500", category: "Antibiotic", stock: 140, price: 115, status: "Low Stock" },
  { id: "MED-054", name: "Vitamin D3", sku: "VTD-300", category: "Supplements", stock: 0, price: 210, status: "Out of Stock" },
  { id: "MED-071", name: "Omeprazole 20", sku: "OME-20", category: "Gastro", stock: 890, price: 55, status: "Active" },
  { id: "MED-088", name: "Metformin 500", sku: "MET-500", category: "Diabetes", stock: 45, price: 28, status: "Low Stock" },
];

export const orders: Order[] = [
  { id: "ORD-12018", customerName: "City Care Hospital", amount: 24700, paymentStatus: "Paid", fulfillmentStatus: "Shipped", createdAt: "2026-04-08" },
  { id: "ORD-12019", customerName: "MedPlus Retail", amount: 5830, paymentStatus: "Pending", fulfillmentStatus: "Packed", createdAt: "2026-04-07" },
  { id: "ORD-12020", customerName: "GreenLeaf Pharmacy", amount: 13440, paymentStatus: "Paid", fulfillmentStatus: "Processing", createdAt: "2026-04-07" },
  { id: "ORD-12021", customerName: "Apollo Clinic", amount: 9120, paymentStatus: "Failed", fulfillmentStatus: "Processing", createdAt: "2026-04-06" },
];

export const suppliers: Supplier[] = [
  { id: "SUP-002", name: "LifeCare Distributors", contactName: "Ravi Gupta", phone: "+91 98765 43210", email: "sales@lifecare.com", city: "Mumbai", activeOrders: 12 },
  { id: "SUP-005", name: "PharmaLink Wholesale", contactName: "Neha Sharma", phone: "+91 91234 56780", email: "ops@pharmalink.in", city: "Delhi", activeOrders: 7 },
  { id: "SUP-009", name: "SouthMed Supply", contactName: "Arun Thomas", phone: "+91 99887 77665", email: "desk@southmed.com", city: "Chennai", activeOrders: 4 },
];

export const customers: Customer[] = [
  { id: "CUS-009", name: "City Care Hospital", type: "B2B", phone: "+91 98111 11111", email: "procurement@citycare.com", creditLimit: 500000, lastOrderAt: "2026-04-08" },
  { id: "CUS-014", name: "MedPlus Retail — Indiranagar", type: "Retail", phone: "+91 98800 44221", email: "store.in@medplus.com", creditLimit: 75000, lastOrderAt: "2026-04-07" },
  { id: "CUS-021", name: "GreenLeaf Pharmacy", type: "Retail", phone: "+91 77990 11223", email: "orders@greenleaf.in", creditLimit: 120000, lastOrderAt: "2026-04-05" },
];

export const analyticsSeries: AnalyticsPoint[] = [
  { label: "Mon", revenue: 48200, orders: 61 },
  { label: "Tue", revenue: 50100, orders: 67 },
  { label: "Wed", revenue: 46800, orders: 58 },
  { label: "Thu", revenue: 55200, orders: 72 },
  { label: "Fri", revenue: 61900, orders: 81 },
  { label: "Sat", revenue: 39500, orders: 49 },
  { label: "Sun", revenue: 32100, orders: 38 },
];
