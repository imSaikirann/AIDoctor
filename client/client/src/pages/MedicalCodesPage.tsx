import { useEffect, useState } from "react";
import {
  getMedicalCodes,
  searchMedicalCodes
} from "@/services/medicalCodes.api";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Code {
  id: string;
  code: string;
  condition: string;
  description: string;
}

export default function MedicalCodesPage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMedicalCodes().then((res) => setCodes(res.data));
  }, []);

  const handleSearch = async (value: string) => {
    setSearch(value);

    if (!value) {
      const res = await getMedicalCodes();
      setCodes(res.data);
      return;
    }

    const res = await searchMedicalCodes(value);
    setCodes(res.data);
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">

      <h1 className="text-3xl font-bold">
        🧬 Medical Codes
      </h1>

      <Input
        placeholder="Search condition or code..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-2">

        {codes.map((c) => (
          <Card key={c.id} className="p-4 space-y-1">

            <div className="font-semibold">
              {c.condition}
            </div>

            <div className="text-sm">
              Code: <b>{c.code}</b>
            </div>

            <div className="text-xs text-muted-foreground">
              {c.description}
            </div>

          </Card>
        ))}

      </div>
    </div>
  );
}