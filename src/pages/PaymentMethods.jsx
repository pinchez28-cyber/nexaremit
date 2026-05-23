import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { AlertTriangle, CalendarClock, CheckCircle, CreditCard, Plus, ShieldCheck, Star, Trash2 } from "lucide-react";

const sandboxMethods = [
  {
    id: "sandbox_pm_visa_4242",
    brand: "Visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2028,
    funding: "debit",
    isDefault: true
  },
  {
    id: "sandbox_pm_mastercard_4444",
    brand: "Mastercard",
    last4: "4444",
    expMonth: 9,
    expYear: 2027,
    funding: "debit",
    isDefault: false
  },
  {
    id: "sandbox_pm_old_0341",
    brand: "Visa",
    last4: "0341",
    expMonth: 1,
    expYear: 2024,
    funding: "debit",
    isDefault: false
  }
];

function isExpired(method) {
  if (!method.expMonth || !method.expYear) return false;
  return new Date() >= new Date(method.expYear, method.expMonth, 1);
}

function formatExpiry(method) {
  return `${String(method.expMonth).padStart(2, "0")}/${String(method.expYear).slice(-2)}`;
}

function normalizeDefault(methods) {
  if (!methods.length) return methods;
  if (methods.some((method) => method.isDefault && !isExpired(method))) return methods;
  const firstActive = methods.find((method) => !isExpired(method));
  return methods.map((method) => ({ ...method, isDefault: method.id === firstActive?.id }));
}

export default function PaymentMethods() {
  const [methods, setMethods] = useState(sandboxMethods);
  const [message, setMessage] = useState("Sandbox card management is active. Real Stripe card deletion will be connected after user-to-Stripe-Customer storage is added.");
  const expiredCount = useMemo(() => methods.filter(isExpired).length, [methods]);
  const activeCount = methods.length - expiredCount;

  const makeDefault = (id) => {
    setMethods((current) => current.map((method) => ({ ...method, isDefault: method.id === id })));
    setMessage("Default payment method updated for this sandbox session.");
  };

  const removeMethod = (method) => {
    const shouldRemove = window.confirm(`Remove ${method.brand} ending in ${method.last4}?`);
    if (!shouldRemove) return;

    setMethods((current) => normalizeDefault(current.filter((item) => item.id !== method.id)));
    setMessage(`${method.brand} ending in ${method.last4} was removed from this sandbox page.`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Payment Methods</h1>
            <p className="text-neutral-600">Manage saved cards before sending money.</p>
          </div>
          <Link to={createPageUrl("SendMoney")}>
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Add Card During Payment
            </Button>
          </Link>
        </div>

        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Use test cards only while NexaRemit is in sandbox. Production card storage must use Stripe Customer records and tokenized payment methods only.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="shadow-premium border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <span className="recipient-icon"><CreditCard className="w-5 h-5" /></span>
              <div>
                <p className="text-sm text-neutral-600">Saved Cards</p>
                <strong className="text-2xl text-primary">{methods.length}</strong>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-premium border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <span className="recipient-icon"><CheckCircle className="w-5 h-5" /></span>
              <div>
                <p className="text-sm text-neutral-600">Ready To Use</p>
                <strong className="text-2xl text-primary">{activeCount}</strong>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-premium border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <span className="recipient-icon"><CalendarClock className="w-5 h-5" /></span>
              <div>
                <p className="text-sm text-neutral-600">Expired</p>
                <strong className="text-2xl text-primary">{expiredCount}</strong>
              </div>
            </CardContent>
          </Card>
        </div>

        {message && (
          <Alert className="border-blue-200 bg-blue-50">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <AlertDescription className="text-blue-700">{message}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-premium border-0">
          <CardHeader>
            <CardTitle>Cards On File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {methods.length === 0 && (
              <div className="payment-choice-empty">No saved cards yet. Add one during your next test payment.</div>
            )}

            {methods.map((method) => {
              const expired = isExpired(method);
              return (
                <div key={method.id} className="history-row">
                  <span className="history-icon"><CreditCard className="w-5 h-5" /></span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <strong className="text-primary">{method.brand} ending in {method.last4}</strong>
                      {method.isDefault && <Badge className="bg-green-100 text-green-800"><Star className="w-4 h-4 mr-2" />Default</Badge>}
                      {expired && <Badge className="bg-red-100 text-red-800">Expired</Badge>}
                      {!expired && !method.isDefault && <Badge className="bg-blue-50 text-blue-700">Ready</Badge>}
                    </div>
                    <p className="text-sm text-neutral-600">
                      Expires {formatExpiry(method)}. {method.funding ? `${method.funding.charAt(0).toUpperCase() + method.funding.slice(1)} card.` : "Card."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button variant="outline" disabled={expired || method.isDefault} onClick={() => makeDefault(method.id)}>
                      Make Default
                    </Button>
                    <Button variant="outline" onClick={() => removeMethod(method)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-0 shadow-premium">
          <CardContent className="p-6 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-green-700" />
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-primary">Card Safety Rule</h2>
              <p className="text-neutral-700">
                NexaRemit should never store full card numbers, CVC codes, or raw bank details. Only store Stripe IDs, card brand, last four digits, expiry, and default status.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
