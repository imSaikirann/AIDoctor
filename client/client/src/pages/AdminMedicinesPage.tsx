import { useEffect, useState } from "react";
import {
  apiAdminAddMedicine,
  apiAdminDeleteMedicine,
  apiAdminGetMedicines,
  apiAdminUpdateMedicine,
} from "@/services/medicine";
import type { AddMedicinePayload, Medicine } from "@/types";
import { getErrorMessage } from "@/lib/http";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialForm: AddMedicinePayload = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  imageUrl: "",
  category: "",
  isActive: true,
};

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [form, setForm] = useState<AddMedicinePayload>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiAdminGetMedicines();
      setMedicines(data);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines().catch(() => undefined);
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const submit = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        await apiAdminUpdateMedicine(editingId, form);
        setMessage("Medicine updated successfully");
      } else {
        await apiAdminAddMedicine(form);
        setMessage("Medicine added successfully");
      }

      resetForm();
      await loadMedicines();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingId(medicine.id);
    setForm({
      name: medicine.name,
      description: medicine.description || "",
      price: medicine.price,
      stock: medicine.stock,
      imageUrl: medicine.imageUrl || "",
      category: medicine.category || "",
      isActive: medicine.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setError("");
      setMessage("");
      const res = await apiAdminDeleteMedicine(id);
      setMessage(res.message);
      if (editingId === id) {
        resetForm();
      }
      await loadMedicines();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    }
  };

  if (loading) {
    return <div className="p-6">Loading medicines...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Admin Medicines</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

      <Card className="mb-6 p-4">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? "Edit Medicine" : "Add Medicine"}
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            placeholder="Medicine name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            placeholder="Category"
            value={form.category || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, category: e.target.value }))
            }
          />
          <Input
            placeholder="Description"
            value={form.description || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <Input
            placeholder="Image URL"
            value={form.imageUrl || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, imageUrl: e.target.value }))
            }
          />
          <Input
            type="number"
            placeholder="Price"
            value={form.price === 0 ? "" : String(form.price)}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, price: Number(e.target.value) }))
            }
          />
          <Input
            type="number"
            placeholder="Stock"
            value={form.stock === 0 ? "" : String(form.stock)}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))
            }
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            checked={Boolean(form.isActive)}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isActive: e.target.checked }))
            }
          />
          <label htmlFor="isActive" className="text-sm">
            Active
          </label>
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={() => void submit()} disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update Medicine" : "Add Medicine"}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        {medicines.map((medicine) => (
          <Card key={medicine.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{medicine.name}</h3>
                <p className="text-sm text-zinc-600">
                  {medicine.description || "No description"}
                </p>
                <p className="text-sm text-zinc-700">
                  Category: {medicine.category || "General"}
                </p>
                <p className="text-sm text-zinc-700">Price: ₹ {medicine.price}</p>
                <p className="text-sm text-zinc-700">Stock: {medicine.stock}</p>
                <p className="text-sm text-zinc-700">
                  Status: {medicine.isActive ? "Active" : "Inactive"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleEdit(medicine)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void handleDelete(medicine.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}