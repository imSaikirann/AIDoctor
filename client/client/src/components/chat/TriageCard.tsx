import { Card } from "@/components/ui/card";

interface Props {
  riskLevel: string;
  possibleConditions: string[];
  advice: string;
  seeDoctor: boolean;
}

export default function TriageCard({
  riskLevel,
  possibleConditions,
  advice,
  seeDoctor,
}: Props) {
  const color =
    riskLevel === "HIGH"
      ? "border-red-500"
      : riskLevel === "MEDIUM"
      ? "border-yellow-500"
      : "border-green-500";

  return (
    <Card className={`mt-2 border ${color} p-3 text-sm`}>
      <p className="font-semibold">
        Risk Level: {riskLevel}
      </p>

      <p className="mt-1">
        Possible: {possibleConditions.join(", ")}
      </p>

      <p className="mt-1">{advice}</p>

      {seeDoctor && (
        <p className="mt-1 font-medium text-red-600">
          Recommended to consult a doctor.
        </p>
      )}
    </Card>
  );
}