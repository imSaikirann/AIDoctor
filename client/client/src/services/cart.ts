import { api } from "@/lib/axios";
import type {
  AddToCartPayload,
  CartItem,
  CartResponse,
  UpdateCartItemPayload,
} from "@/types";

export async function apiGetCart(): Promise<CartResponse> {
  const res = await api.get<CartResponse>("/cart");
  return res.data;
}

export async function apiAddToCart(payload: AddToCartPayload): Promise<{
  message: string;
  item: CartItem;
}> {
  const res = await api.post<{ message: string; item: CartItem }>(
    "/cart/add",
    payload
  );
  return res.data;
}

export async function apiUpdateCartItem(
  itemId: string,
  payload: UpdateCartItemPayload
): Promise<{ message: string; item: CartItem }> {
  const res = await api.patch<{ message: string; item: CartItem }>(
    `/cart/item/${itemId}`,
    payload
  );
  return res.data;
}

export async function apiRemoveCartItem(
  itemId: string
): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/cart/item/${itemId}`);
  return res.data;
}

export async function apiClearCart(): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>("/cart/clear");
  return res.data;
}