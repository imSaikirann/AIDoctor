import  { useEffect, useMemo, useRef } from "react";
import { Button } from "./ui/button";

type BookingSuccessfulV2 = {
  uid?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  videoCallUrl?: string;
  paymentRequired: boolean;
  isRecurring: boolean;
};

type CalEventDetail = {
  type: string;
  namespace?: string;
  data?: unknown;
};

type CalOnEvent = {
  action: string;
  callback: (e: CustomEvent<CalEventDetail>) => void;
};

type CalFn = {
  (cmd: "init", args: { origin: string }): void;
  (cmd: "on", args: CalOnEvent): void;
  (cmd: "modal", args: { calLink: string }): void;
};

declare global {
  interface Window {
    Cal?: CalFn;
  }
}

function isBookingSuccessfulV2(x: unknown): x is BookingSuccessfulV2 {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  // paymentRequired + isRecurring are always present per docs
  return typeof o["paymentRequired"] === "boolean" && typeof o["isRecurring"] === "boolean";
}

type Props = {
  open: boolean;
  onClose: () => void;
  calLink: string;
  onBooked: (data: { startTime: string; endTime?: string; videoCallUrl?: string; uid?: string }) => void;
};

export function CalModal({ open, onClose, calLink, onBooked }: Props) {
  const initialized = useRef(false);

  const origin = useMemo(() => "https://cal.com", []);

  useEffect(() => {
    if (!open) return;

    // inject embed script once
    if (!document.getElementById("cal-embed-script")) {
      const s = document.createElement("script");
      s.id = "cal-embed-script";
      s.type = "text/javascript";
      s.async = true;
      s.src = "https://cal.com/embed/embed.js";
      document.body.appendChild(s);
    }

    const t = window.setInterval(() => {
      if (!window.Cal) return;

      if (!initialized.current) {
        window.Cal("init", { origin });
        initialized.current = true;

        // listen booking successful
        window.Cal("on", {
          action: "bookingSuccessfulV2",
          callback: (e) => {
            const dataUnknown = e.detail.data;
            if (!isBookingSuccessfulV2(dataUnknown)) return;

            const startTime = dataUnknown.startTime;
            if (typeof startTime !== "string" || startTime.length === 0) return;

            const endTime = typeof dataUnknown.endTime === "string" ? dataUnknown.endTime : undefined;
            const videoCallUrl =
              typeof dataUnknown.videoCallUrl === "string" ? dataUnknown.videoCallUrl : undefined;
            const uid = typeof dataUnknown.uid === "string" ? dataUnknown.uid : undefined;

            onBooked({ startTime, endTime, videoCallUrl, uid });
          }
        });
      }

      // open cal modal
      window.Cal?.("modal", { calLink });
      window.clearInterval(t);
    }, 50);

    return () => window.clearInterval(t);
  }, [open, calLink, origin, onBooked]);

  if (!open) return null;

  // We let Cal render its own modal UI.
  // This overlay is just a "close" button for your app.
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute right-4 top-4 pointer-events-auto">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}