import { useEffect, useState } from "react";
import { apiAddToCart } from "@/services/cart";
import { apiGetMedicines } from "@/services/medicine";
import type { Medicine } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/http";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const loadMedicines = async (search?: string) => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGetMedicines(
        search?.trim() ? { search: search.trim() } : undefined
      );

      setMedicines(data);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMedicines();
  }, []);

  const handleSearch = async () => {
    await loadMedicines(searchInput);
  };

  const handleAddToCart = async (medicineId: string) => {
    try {
      setAddingId(medicineId);
      setError("");
      setMessage("");

      const res = await apiAddToCart({ medicineId, quantity: 1 });
      setMessage(res.message);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return <div className="p-6">Loading medicines...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Medicines</h1>

      <div className="mb-6 flex gap-3">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search medicines..."
        />
        <Button onClick={() => void handleSearch()}>Search</Button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

      {medicines.length === 0 ? (
        <p className="text-sm text-zinc-600">No medicines found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {medicines.map((medicine) => (
            <Card key={medicine.id} className="p-4">
              {medicine.imageUrl ? (
                <img
                  src={medicine.imageUrl}
                  alt={medicine.name}
                  className="mb-3 h-40 w-full rounded object-cover"
                />
              ) : (
                <div className="mb-3 flex h-40 items-center justify-center rounded bg-zinc-100 text-sm text-zinc-500">
                  No image
                </div>
              )}

              <h2 className="text-lg font-semibold">{medicine.name}</h2>

              <p className="mt-1 text-sm text-zinc-600">
                {medicine.description || "No description"}
              </p>

              <p className="mt-2 text-sm text-zinc-700">
                Category: {medicine.category || "General"}
              </p>

              <p className="mt-1 text-sm font-medium">₹ {medicine.price}</p>

              <p className="mt-1 text-sm text-zinc-700">
                Stock: {medicine.stock}
              </p>

              <Button
                className="mt-4 w-full"
                disabled={medicine.stock <= 0 || addingId === medicine.id}
                onClick={() => void handleAddToCart(medicine.id)}
              >
                {addingId === medicine.id ? "Adding..." : "Add to Cart"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}