import { api } from "@/lib/axios";
import type {
  AddMedicinePayload,
  AdminOrder,
  Medicine,
  UpdateMedicinePayload,
  UpdateOrderStatusBody,
} from "@/types";

export async function apiGetMedicines(params?: {
  search?: string;
  category?: string;
}): Promise<Medicine[]> {
  const res = await api.get<Medicine[]>("/medicines", { params });
  return res.data;
}

export async function apiGetMedicineById(id: string): Promise<Medicine> {
  const res = await api.get<Medicine>(`/medicines/${id}`);
  return res.data;
}

export async function apiAdminGetMedicines(): Promise<Medicine[]> {
  const res = await api.get<Medicine[]>("/admin/medicines");
  return res.data;
}

export async function apiAdminGetMedicineById(id: string): Promise<Medicine> {
  const res = await api.get<Medicine>(`/admin/medicines/${id}`);
  return res.data;
}

export async function apiAdminAddMedicine(
  payload: AddMedicinePayload
): Promise<Medicine> {
  const res = await api.post<Medicine>("/admin/medicines", payload);
  return res.data;
}

export async function apiAdminUpdateMedicine(
  id: string,
  payload: UpdateMedicinePayload
): Promise<Medicine> {
  const res = await api.put<Medicine>(`/admin/medicines/${id}`, payload);
  return res.data;
}

export async function apiAdminDeleteMedicine(
  id: string
): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/admin/medicines/${id}`);
  return res.data;
}

export async function apiAdminGetOrders(): Promise<AdminOrder[]> {
  const res = await api.get<AdminOrder[]>("/admin/orders");
  return res.data;
}

export async function apiAdminGetOrderById(id: string): Promise<AdminOrder> {
  const res = await api.get<AdminOrder>(`/admin/orders/${id}`);
  return res.data;
}


export async function apiAdminUpdateOrderStatus(
  id: string,
  payload: UpdateOrderStatusBody
): Promise<{ message: string; order: AdminOrder }> {
  const res = await api.patch<{ message: string; order: AdminOrder }>(
    `/admin/orders/${id}/status`,
    payload
  );
  return res.data;
}