import { apiRequest } from "./client";

export type DashboardSummary = {
  totalRevenue: number;
  totalOrders: number;
  lowStockAlerts: number;
  pendingDeliveries: number;
  revenueDeltaPct: number;
  ordersDeltaPct: number;
  stockDeltaPct: number;
  deliveryDeltaPct: number;
};

export type MedicineApi = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  status: "ACTIVE" | "LOW_STOCK" | "OUT_OF_STOCK";
};

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type OrderApi = {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentStatus: "PAID" | "PENDING" | "FAILED";
  fulfillmentStatus: "PROCESSING" | "PACKED" | "SHIPPED" | "DELIVERED";
  createdAt: string;
};

export type SupplierApi = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export type CustomerApi = {
  id: string;
  name: string;
  type: "B2B" | "B2C";
  phone: string | null;
  email: string | null;
  creditLimit: number;
};

export type SalesTrendPoint = {
  label: string;
  revenue: number;
  orders: number;
};

export function getDashboardSummary(token: string, signal?: AbortSignal) {
  return apiRequest<DashboardSummary>("/dashboard/summary", { token, signal });
}

export function getMedicines(
  token: string,
  params: { page?: number; limit?: number; search?: string; category?: string; status?: string },
  signal?: AbortSignal
) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  if (params.category) q.set("category", params.category);
  if (params.status) q.set("status", params.status);
  return apiRequest<Paginated<MedicineApi>>(`/medicines?${q.toString()}`, { token, signal });
}

export function createMedicine(token: string, payload: Record<string, unknown>) {
  return apiRequest<{ id: string; message: string }>("/medicines", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateMedicine(token: string, id: string, payload: Record<string, unknown>) {
  return apiRequest<MedicineApi>(`/medicines/${id}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function getOrders(
  token: string,
  params: { page?: number; limit?: number; paymentStatus?: string; fulfillmentStatus?: string },
  signal?: AbortSignal
) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.paymentStatus) q.set("paymentStatus", params.paymentStatus);
  if (params.fulfillmentStatus) q.set("fulfillmentStatus", params.fulfillmentStatus);
  return apiRequest<Paginated<OrderApi>>(`/orders?${q.toString()}`, { token, signal });
}

export function updateOrderStatus(token: string, id: string, payload: Record<string, unknown>) {
  return apiRequest<OrderApi>(`/orders/${id}/status`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function getSuppliers(token: string, signal?: AbortSignal) {
  return apiRequest<{ items: SupplierApi[] }>("/suppliers", { token, signal });
}

export function getCustomers(token: string, signal?: AbortSignal) {
  return apiRequest<{ items: CustomerApi[] }>("/customers", { token, signal });
}

export function getSalesTrend(
  token: string,
  params: { from: string; to: string; groupBy?: "day" | "week" | "month" },
  signal?: AbortSignal
) {
  const q = new URLSearchParams({
    from: params.from,
    to: params.to,
  });
  if (params.groupBy) q.set("groupBy", params.groupBy);
  return apiRequest<{ series: SalesTrendPoint[] }>(`/analytics/sales-trend?${q.toString()}`, {
    token,
    signal,
  });
}
