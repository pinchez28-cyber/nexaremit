import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Building2, Smartphone, Wallet, Banknote, AlertTriangle, LogIn, UserRoundPlus } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { fetchRecipients } from "@/lib/recipients-api";
import RecipientForm from "@/components/recipients/RecipientForm";

// This component used to ship twelve invented people — Amara Okafor, Daniel
// Mwangi and the rest — hardcoded into the browser bundle and visible in
// production. They are gone: recipients are now the sender's own, stored
// against their account.
const methodIcons = {
  bank: Building2,
  mobile_money: Smartphone,
  wallet: Wallet,
  cash_pickup: Banknote
};

export default function RecipientSelection({ selectedRecipient, onSelectRecipient }) {
  const { isAuthenticated, isAuthConfigured } = useAuth();

  const [recipients, setRecipients] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;

    setStatus("loading");
    setError("");

    try {
      setRecipients(await fetchRecipients());
      setStatus("idle");
    } catch (loadError) {
      setError(loadError.message);
      setStatus("error");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  if (!isAuthConfigured) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Recipients are unavailable on this deployment until Supabase is configured.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isAuthenticated) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <LogIn className="w-5 h-5 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Please{" "}
          <a href="/SignIn" style={{ fontWeight: 600, textDecoration: "underline" }}>
            sign in
          </a>{" "}
          to see the people you send to.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle>Choose Recipient</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {status === "loading" && (
          <p className="text-neutral-600">Loading your recipients...</p>
        )}

        {status === "error" && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {status !== "loading" && recipients.length === 0 && !isAdding && (
          <div className="space-y-3">
            <p className="text-neutral-700">
              You have not added anyone yet. Add the person you want to send money
              to, and we will keep their details for next time.
            </p>
            <Button type="button" onClick={() => setIsAdding(true)}>
              <UserRoundPlus className="w-4 h-4 mr-2" />
              Add a recipient
            </Button>
          </div>
        )}

        {recipients.map((recipient) => {
          const Icon = methodIcons[recipient.payoutMethod] || Building2;
          return (
            <button
              key={recipient.id}
              type="button"
              onClick={() => onSelectRecipient(recipient)}
              className={`recipient-tile ${
                selectedRecipient?.id === recipient.id
                  ? "border-blue-700 bg-blue-50"
                  : "border-neutral-200 hover:border-blue-300"
              }`}
            >
              <div className="recipient-icon">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">{recipient.name}</span>
                  <Badge variant={recipient.risk === "Verified" ? "default" : "secondary"}>
                    {recipient.risk}
                  </Badge>
                </div>
                <div className="text-sm text-neutral-600">
                  {recipient.country} - {recipient.method}
                  {recipient.accountMasked ? ` (${recipient.accountMasked})` : ""}
                </div>
                <div className="text-sm text-neutral-600">
                  Receives {recipient.receiveCurrency} - limit{" "}
                  {recipient.limit.toLocaleString()} per transfer
                </div>
              </div>
            </button>
          );
        })}

        {isAdding ? (
          <div className="pt-2">
            <RecipientForm
              onAdded={(recipient) => {
                setIsAdding(false);
                setRecipients((previous) => [recipient, ...previous]);
                onSelectRecipient(recipient);
              }}
              onCancel={() => setIsAdding(false)}
            />
          </div>
        ) : (
          recipients.length > 0 && (
            <Button type="button" variant="outline" onClick={() => setIsAdding(true)}>
              <UserRoundPlus className="w-4 h-4 mr-2" />
              Add someone else
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}
