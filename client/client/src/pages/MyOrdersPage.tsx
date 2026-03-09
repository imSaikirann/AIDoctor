import { useEffect, useState } from "react";
import { apiCancelOrder, apiGetMyOrders } from "@/services/order";
import type { Order } from "@/types";
import { getErrorMessage } from "@/lib/http";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiGetMyOrders();
      setOrders(data);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const cancelOrder = async (orderId: string) => {
    try {
      setCancellingId(orderId);
      setError("");
      setMessage("");
      const res = await apiCancelOrder(orderId);
      setMessage(res.message);
      await loadOrders();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <div className="p-6">Loading orders...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">My Orders</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

      {orders.length === 0 ? (
        <p className="text-zinc-600">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-semibold">Order #{order.id}</h2>
                  <p className="text-sm text-zinc-600">
                    Status: {order.status}
                  </p>
                  <p className="text-sm text-zinc-600">
                    Date: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                {order.status !== "CANCELLED" && (
                  <Button
                    variant="outline"
                    disabled={cancellingId === order.id}
                    onClick={() => void cancelOrder(order.id)}
                  >
                    {cancellingId === order.id
                      ? "Cancelling..."
                      : "Cancel Order"}
                  </Button>
                )}
              </div>

              <div className="mb-4 rounded border p-3">
                <h3 className="mb-2 font-medium">Delivery Address</h3>
                <p className="text-sm text-zinc-700">{order.fullName}</p>
                <p className="text-sm text-zinc-700">{order.phone}</p>
                <p className="text-sm text-zinc-700">{order.addressLine1}</p>
                {order.addressLine2 && (
                  <p className="text-sm text-zinc-700">{order.addressLine2}</p>
                )}
                <p className="text-sm text-zinc-700">
                  {order.city}, {order.state} - {order.postalCode}
                </p>
                <p className="text-sm text-zinc-700">{order.country}</p>
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded border p-3"
                  >
                    <div>
                      <p className="font-medium">{item.medicineName}</p>
                      <p className="text-sm text-zinc-600">
                        ₹ {item.unitPrice} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ₹ {item.unitPrice * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-right text-lg font-semibold">
                Total: ₹ {order.total}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}