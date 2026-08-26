import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  Banknote,
  Building2,
  LogIn,
  Plus,
  Smartphone,
  Trash2,
  Wallet
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { fetchRecipients, removeRecipient } from "@/lib/recipients-api";
import RecipientForm from "@/components/recipients/RecipientForm";

const methodIcons = {
  bank: Building2,
  mobile_money: Smartphone,
  wallet: Wallet,
  upi: Smartphone,
  cash_pickup: Banknote
};

export default function Recipients() {
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

  const onRemove = async (recipient) => {
    try {
      await removeRecipient(recipient.id);
      setRecipients((previous) => previous.filter((item) => item.id !== recipient.id));
    } catch (removeError) {
      setError(removeError.message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Recipients</h1>
            <p className="text-neutral-600">
              The people you send money to, and how each one receives it.
            </p>
          </div>
          {isAuthenticated && !isAdding && (
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Recipient
            </Button>
          )}
        </div>

        {!isAuthConfigured && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Recipients are unavailable on this deployment until Supabase is configured.
            </AlertDescription>
          </Alert>
        )}

        {isAuthConfigured && !isAuthenticated && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <LogIn className="w-5 h-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Please{" "}
              <a href="/SignIn" style={{ fontWeight: 600, textDecoration: "underline" }}>
                sign in
              </a>{" "}
              to manage your recipients.
            </AlertDescription>
          </Alert>
        )}

        {/* Account details are checked on our side, but the payout provider
            validates the account itself. Saying so is more useful than a
            reassurance we cannot yet stand behind. */}
        {isAuthenticated && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              We check the details you enter, but we cannot confirm an account
              exists until a payout partner is connected. Please double-check the
              number before you send.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {isAdding && (
          <Card className="shadow-premium border-0">
            <CardHeader>
              <CardTitle>Add a recipient</CardTitle>
            </CardHeader>
            <CardContent>
              <RecipientForm
                onAdded={(recipient) => {
                  setIsAdding(false);
                  setRecipients((previous) => [recipient, ...previous]);
                }}
                onCancel={() => setIsAdding(false)}
              />
            </CardContent>
          </Card>
        )}

        {status === "loading" && <p className="text-neutral-600">Loading...</p>}

        {isAuthenticated && status !== "loading" && recipients.length === 0 && !isAdding && (
          <p className="text-neutral-700">
            You have not added anyone yet. Add a recipient to get started.
          </p>
        )}

        <div className="recipient-directory">
          {recipients.map((recipient) => {
            const Icon = methodIcons[recipient.payoutMethod] || Building2;
            return (
              <Card key={recipient.id} className="shadow-premium border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="recipient-icon">
                      <Icon className="w-5 h-5" />
                    </span>
                    {recipient.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Country</span>
                    <span className="font-semibold text-primary">{recipient.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Method</span>
                    <span className="font-semibold text-primary">{recipient.method}</span>
                  </div>
                  {recipient.accountMasked && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Account</span>
                      <span className="font-semibold text-primary">
                        {recipient.accountMasked}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Receives</span>
                    <span className="font-semibold text-primary">
                      {recipient.receiveCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Limit per transfer</span>
                    <span className="font-semibold text-primary">
                      {recipient.limit.toLocaleString()} USD
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant={recipient.risk === "Verified" ? "default" : "secondary"}>
                      {recipient.risk}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onRemove(recipient)}
                      aria-label={`Remove ${recipient.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
