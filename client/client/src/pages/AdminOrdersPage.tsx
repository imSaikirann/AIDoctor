import { useEffect, useState } from "react";
import {
  apiAdminGetOrders,
  apiAdminUpdateOrderStatus,
} from "@/services/medicine";
import type { AdminOrder, OrderStatus } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/http";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiAdminGetOrders();
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

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      setError("");
      setMessage("");

      const res = await apiAdminUpdateOrderStatus(orderId, { status });
      setMessage(res.message);

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? res.order : order))
      );
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="p-6">Loading orders...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Admin Orders</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

      {orders.length === 0 ? (
        <p className="text-sm text-zinc-600">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                  <p className="text-sm text-zinc-700">
                    Patient: {order.user.email}
                  </p>
                  <p className="text-sm text-zinc-700">
                    Status: <span className="font-medium">{order.status}</span>
                  </p>
                  <p className="text-sm text-zinc-700">
                    Total: ₹ {order.total}
                  </p>
                  <p className="text-sm text-zinc-700">
                    Date: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-zinc-700">
                  <p className="font-medium">Delivery Address</p>
                  <p>{order.fullName}</p>
                  <p>{order.phone}</p>
                  <p>{order.addressLine1}</p>
                  {order.addressLine2 && <p>{order.addressLine2}</p>}
                  <p>
                    {order.city}, {order.state} - {order.postalCode}
                  </p>
                  <p>{order.country}</p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="mb-2 font-medium">Items</h3>
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
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={
                    updatingId === order.id || order.status === "CONFIRMED"
                  }
                  onClick={() => void updateStatus(order.id, "CONFIRMED")}
                >
                  {updatingId === order.id ? "Updating..." : "Confirm"}
                </Button>

                <Button
                  variant="outline"
                  disabled={
                    updatingId === order.id || order.status === "CANCELLED"
                  }
                  onClick={() => void updateStatus(order.id, "CANCELLED")}
                >
                  {updatingId === order.id ? "Updating..." : "Cancel"}
                </Button>

                <Button
                  variant="outline"
                  disabled={
                    updatingId === order.id || order.status === "PENDING"
                  }
                  onClick={() => void updateStatus(order.id, "PENDING")}
                >
                  {updatingId === order.id ? "Updating..." : "Mark Pending"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}