"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type FormState = { name: string; phone: string; email: string; address: string };

export default function Page() {
  const sp = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    address: ""
  });
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay script once
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) return;
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const pricePaise = useMemo(() => Number(sp.get("price") || 0), [sp]);
  const priceDisplay = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
      }).format(pricePaise / 100),
    [pricePaise]
  );

  const from = sp.get("from");
  const to = sp.get("to");
  const startAt = sp.get("startAt");
  const endAt = sp.get("endAt");
  const cabTypeId = sp.get("cabTypeId");

  const disabled =
    loading ||
    !pricePaise ||
    !form.name.trim() ||
    !/^\d{10}$/.test(form.phone) ||
    !form.address.trim();

  async function handlePay() {
    setError(null);
    if (!window.Razorpay) {
      setError("Payment SDK not loaded. Please try again in a moment.");
      return;
    }
    if (disabled) return;

    try {
      setLoading(true);

      // Create order on server
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: pricePaise,
          meta: { from, to, startAt, endAt, cabTypeId }
        })
      });
      if (!res.ok) throw new Error("Failed to create order");
      const data = await res.json();

      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "CabPrime",
        description: "Cab booking",
        order_id: data.orderId,
        prefill: {
          name: form.name,
          email: form.email || undefined,
          contact: form.phone
        },
        notes: {
          address: form.address,
          from,
          to,
          startAt,
          endAt,
          cabTypeId
        },
        theme: { color: "#0ea5e9" },
        handler: async (response: any) => {
          try {
            const verify = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response)
            });
            const v = await verify.json();
            if (v.success) {
              alert("Payment successful and verified. Thank you!");
            } else {
              setError("Payment captured but verification failed. Support will contact shortly.");
            }
          } catch {
            setError("Could not verify payment. Please note your order id and contact support.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false)
        }
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (e: any) {
      setError(e?.message || "Unable to initiate payment. Please try again.");
    } finally {
      // If the Razorpay modal opens, loading will be reset on close via ondismiss
      // If it fails before opening, reset here.
      setLoading(false);
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Passenger details</h1>
        <p className="text-slate-500">Enter details as they should appear on the invoice.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="input"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="input"
              placeholder="Phone (10 digits)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              inputMode="numeric"
              maxLength={10}
            />
            <input
              className="input md:col-span-2"
              placeholder="Email (optional)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              type="email"
            />
            <input
              className="input md:col-span-2"
              placeholder="Pickup address / landmark"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end">
            <button
              disabled={disabled}
              onClick={handlePay}
              className={`btn btn-primary ${disabled ? "opacity-60" : ""}`}
            >
              {loading ? "Processing…" : `Pay ${priceDisplay}`}
            </button>
          </div>
        </div>

        {/* Summary */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="mb-3 text-lg font-semibold">Fare summary</div>
          <div className="flex items-center justify-between text-sm">
            <span>Estimated total</span>
            <span className="font-medium">{priceDisplay}</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Final amount may vary slightly after tolls and extras, if applicable.
          </div>

          <div className="hr"></div>

          <div className="mb-2 text-lg font-semibold">Trip</div>
          <div className="space-y-1 text-sm text-slate-600">
            <div>
              <span className="text-slate-500">From:</span> {from}
            </div>
            <div>
              <span className="text-slate-500">To:</span> {to}
            </div>
            <div>
              <span className="text-slate-500">Start:</span>{" "}
              {startAt ? new Date(String(startAt)).toLocaleString() : "-"}
            </div>
            <div>
              <span className="text-slate-500">End:</span>{" "}
              {endAt ? new Date(String(endAt)).toLocaleString() : "-"}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
