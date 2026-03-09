import { api } from "@/lib/axios";
import type { Order, PlaceOrderPayload } from "@/types";

export async function apiPlaceOrder(
  payload: PlaceOrderPayload
): Promise<{
  message: string;
  order: Order;
}> {
  const res = await api.post<{ message: string; order: Order }>(
    "/orders/place",
    payload
  );
  return res.data;
}

export async function apiGetMyOrders(): Promise<Order[]> {
  const res = await api.get<Order[]>("/orders/my");
  return res.data;
}

export async function apiGetOrderById(orderId: string): Promise<Order> {
  const res = await api.get<Order>(`/orders/${orderId}`);
  return res.data;
}

export async function apiCancelOrder(orderId: string): Promise<{
  message: string;
  order: Order;
}> {
  const res = await api.patch<{ message: string; order: Order }>(
    `/orders/cancel/${orderId}`
  );
  return res.data;
}