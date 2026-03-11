import { useEffect, useMemo, useState } from "react";
import {
  apiClearCart,
  apiGetCart,
  apiRemoveCartItem,
  apiUpdateCartItem,
} from "@/services/cart";
import { apiPlaceOrder } from "@/services/order";
import type { CartResponse, PlaceOrderPayload } from "@/types";
import { getErrorMessage } from "@/lib/http";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialDeliveryForm: PlaceOrderPayload = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export default function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [placing, setPlacing] = useState(false);
  const [deliveryForm, setDeliveryForm] =
    useState<PlaceOrderPayload>(initialDeliveryForm);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiGetCart();
      setCart(data);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCart();
  }, []);

  const updateQty = async (itemId: string, quantity: number) => {
    try {
      setError("");
      setMessage("");
      await apiUpdateCartItem(itemId, { quantity });
      await loadCart();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setError("");
      setMessage("");
      const res = await apiRemoveCartItem(itemId);
      setMessage(res.message);
      await loadCart();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    }
  };

  const clearCart = async () => {
    try {
      setError("");
      setMessage("");
      const res = await apiClearCart();
      setMessage(res.message);
      await loadCart();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    }
  };

  const placeOrder = async () => {
    try {
      setPlacing(true);
      setError("");
      setMessage("");

      const payload: PlaceOrderPayload = {
        fullName: deliveryForm.fullName.trim(),
        phone: deliveryForm.phone.trim(),
        addressLine1: deliveryForm.addressLine1.trim(),
        addressLine2: deliveryForm.addressLine2?.trim() || "",
        city: deliveryForm.city.trim(),
        state: deliveryForm.state.trim(),
        postalCode: deliveryForm.postalCode.trim(),
        country: deliveryForm.country.trim(),
      };

      const res = await apiPlaceOrder(payload);
      setMessage(res.message);
      setDeliveryForm(initialDeliveryForm);
      await loadCart();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setPlacing(false);
    }
  };

  const isDeliveryFormValid = useMemo(() => {
    return (
      deliveryForm.fullName.trim() &&
      deliveryForm.phone.trim() &&
      deliveryForm.addressLine1.trim() &&
      deliveryForm.city.trim() &&
      deliveryForm.state.trim() &&
      deliveryForm.postalCode.trim() &&
      deliveryForm.country.trim()
    );
  }, [deliveryForm]);

  if (loading) {
    return <div className="p-6">Loading cart...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">My Cart</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

      {!cart || cart.items.length === 0 ? (
        <p className="text-zinc-600">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h2 className="font-semibold">{item.medicine.name}</h2>
                  <p className="text-sm text-zinc-600">
                    ₹ {item.medicine.price} × {item.quantity}
                  </p>
                  <p className="text-sm font-medium">
                    Total: ₹ {item.medicine.price * item.quantity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={item.quantity <= 1}
                    onClick={() => void updateQty(item.id, item.quantity - 1)}
                  >
                    -
                  </Button>

                  <span>{item.quantity}</span>

                  <Button
                    variant="outline"
                    disabled={item.quantity >= item.medicine.stock}
                    onClick={() => void updateQty(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => void removeItem(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-6 p-4">
            <h2 className="mb-4 text-lg font-semibold">Delivery Details</h2>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                placeholder="Full Name"
                value={deliveryForm.fullName}
                onChange={(e) =>
                  setDeliveryForm((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
              />

              <Input
                placeholder="Phone"
                value={deliveryForm.phone}
                onChange={(e) =>
                  setDeliveryForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />

              <Input
                placeholder="Address Line 1"
                value={deliveryForm.addressLine1}
                onChange={(e) =>
                  setDeliveryForm((prev) => ({
                    ...prev,
                    addressLine1: e.target.value,
                  }))
                }
              />

              <Input
                placeholder="Address Line 2"
                value={deliveryForm.addressLine2 || ""}
                onChange={(e) =>
                  setDeliveryForm((prev) => ({
                    ...prev,
                    addressLine2: e.target.value,
                  }))
                }
              />

              <Input
                placeholder="City"
                value={deliveryForm.city}
                onChange={(e) =>
                  setDeliveryForm((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
              />

              <Input
                placeholder="State"
                value={deliveryForm.state}
                onChange={(e) =>
                  setDeliveryForm((prev) => ({
                    ...prev,
                    state: e.target.value,
                  }))
                }
              />

              <Input
                placeholder="Postal Code"
                value={deliveryForm.postalCode}
                onChange={(e) =>
                  setDeliveryForm((prev) => ({
                    ...prev,
                    postalCode: e.target.value,
                  }))
                }
              />

              <Input
                placeholder="Country"
                value={deliveryForm.country}
                onChange={(e) =>
                  setDeliveryForm((prev) => ({
                    ...prev,
                    country: e.target.value,
                  }))
                }
              />
            </div>
          </Card>

          <div className="mt-6 rounded border p-4">
            <p className="text-lg font-semibold">Subtotal: ₹ {cart.subtotal}</p>

            <div className="mt-4 flex gap-3">
              <Button variant="outline" onClick={() => void clearCart()}>
                Clear Cart
              </Button>

              <Button
                onClick={() => void placeOrder()}
                disabled={placing || !isDeliveryFormValid}
              >
                {placing ? "Placing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}