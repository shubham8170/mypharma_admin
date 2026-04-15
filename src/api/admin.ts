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

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  amountInr: number;
  razorpayPlanId: string;
  billingInterval: "monthly" | "yearly";
  trialDays: number;
  isActive?: boolean;
};

export type SubscriptionConfig = {
  id?: string;
  amountInr: number;
  currency?: string;
  razorpayPlanId: string;
  billingInterval: "monthly" | "yearly";
  trialDays: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUser = {
  id: string;
  phoneNumber: string;
  name: string | null;
  role: string;
  subscriptionStatus: "ACTIVE" | "EXPIRED" | string;
  trialStartsAt: string | null;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PharmacyAccessResponse = {
  message: string;
  pharmacy: {
    id: string;
    phoneNumber: string;
    subscriptionStatus: "ACTIVE" | "EXPIRED" | string;
    subscriptionEndsAt: string | null;
    updatedAt: string;
  };
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

export function getSubscriptionPlans(token: string, signal?: AbortSignal) {
  return apiRequest<{ items?: SubscriptionPlan[]; data?: SubscriptionPlan[] } | SubscriptionPlan[]>(
    "/subscription-plans",
    { token, signal }
  );
}

export function createSubscriptionPlan(
  token: string,
  payload: {
    name: string;
    description: string;
    amountInr: number;
    razorpayPlanId: string;
    billingInterval: "monthly" | "yearly";
    trialDays: number;
  }
) {
  return apiRequest<SubscriptionPlan>("/subscription-plans", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateSubscriptionPlan(
  token: string,
  planId: string,
  payload: Partial<{
    name: string;
    description: string;
    amountInr: number;
    billingInterval: "monthly" | "yearly";
    isActive: boolean;
  }>
) {
  return apiRequest<SubscriptionPlan>(`/subscription-plans/${planId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function getSubscriptionConfig(token: string, signal?: AbortSignal) {
  return apiRequest<SubscriptionConfig>("/subscription-config", { token, signal });
}

export function updateSubscriptionConfig(
  token: string,
  payload: Partial<{
    amountInr: number;
    razorpayPlanId: string;
    billingInterval: "monthly" | "yearly";
    trialDays: number;
  }>
) {
  return apiRequest<SubscriptionConfig>("/subscription-config", {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function getUsers(token: string, signal?: AbortSignal) {
  return apiRequest<{ items: AdminUser[]; total: number }>("/users", { token, signal });
}

export function updatePharmacyAccess(
  token: string,
  pharmacyId: string,
  payload: {
    isActive: boolean;
  }
) {
  return apiRequest<PharmacyAccessResponse>(`/pharmacies/${pharmacyId}/access`, {
    method: "PATCH",
    token,
    body: payload,
  });
}
