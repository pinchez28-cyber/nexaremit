import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { integrationChecklist, providerConfig } from "@/integrations/provider-config";
import { AlertTriangle, BadgeCheck, CircleDashed, FileCheck, KeyRound, Network, PlugZap, ShieldCheck } from "lucide-react";

const serverEnvVars = [
  "TRANSFER_MODE",
  "KYC_PROVIDER",
  "PERSONA_API_KEY",
  "PERSONA_TEMPLATE_ID",
  "PERSONA_WEBHOOK_SECRET",
  "SANCTIONS_PROVIDER_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY"
];

const browserEnvVars = [
  "VITE_TRANSFER_MODE",
  "VITE_KYC_PROVIDER",
  "VITE_SANCTIONS_PROVIDER",
  "VITE_FUNDING_PROVIDER",
  "VITE_EXCHANGE_PROVIDER",
  "VITE_SETTLEMENT_PROVIDER",
  "VITE_PAYOUT_PROVIDER",
  "VITE_STRIPE_PUBLISHABLE_KEY"
];

const productionPartners = [
  "KYC provider such as Persona, Veriff, Onfido, Sumsub, or Alloy",
  "Sanctions/AML screening such as ComplyAdvantage, Alloy, Sardine, or Unit21",
  "Funding provider such as Stripe, Adyen, Checkout.com, Plaid/ACH, or local bank rails",
  "FX/exchange or liquidity provider for rate locks and spread management",
  "Settlement rail such as bank treasury, stablecoin rails, Ripple Payments, or XRPL integration",
  "Payout partner such as Thunes, Nium, TerraPay, Flutterwave, MFS Africa, or bank/mobile money aggregators"
];

const kycReadiness = [
  {
    title: "Business account",
    status: "In progress",
    detail: "Finish Persona onboarding with Financial Services, Fintech, Payments, or Money Transfer as the closest industry."
  },
  {
    title: "Sandbox credentials",
    status: "Needed next",
    detail: "Add Persona sandbox API key, template ID, and webhook secret in Vercel as server-only variables."
  },
  {
    title: "Server KYC gate",
    status: "Foundation exists",
    detail: "The transfer APIs already have a KYC slot. Next step is to replace mock status with Persona inquiry status from the database."
  },
  {
    title: "Webhook review trail",
    status: "Needed before launch",
    detail: "Persona webhook events must update user status and create an audit record before any real transfer is allowed."
  }
];

export default function Integrations() {
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <p className="home-kicker"><PlugZap className="w-5 h-5" /> Integration readiness</p>
          <h1 className="text-3xl font-bold text-primary mb-2">Provider rails for real money movement</h1>
          <p className="text-neutral-600">
            NexaRemit is structured to connect to money-transfer providers, exchanges, and settlement rails. The active implementation is sandbox-only until licensed partners and credentials are added.
          </p>
        </div>

        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Do not process real transactions until legal coverage, provider contracts, KYC, AML, fraud monitoring, and audit logging are active.
          </AlertDescription>
        </Alert>

        <Card className="shadow-premium border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileCheck className="w-5 h-5" /> KYC Onboarding Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-600">
              Persona can be the first real identity provider. Keep it in sandbox until the webhook, database status, and transfer blocking rules are verified end to end.
            </p>
            <div className="integration-grid">
              {kycReadiness.map((item) => (
                <div key={item.title} className="provider-mode-item">
                  <span>{item.status}</span>
                  <strong>{item.title}</strong>
                  <p className="text-sm text-neutral-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Network className="w-5 h-5" /> Current Provider Mode</CardTitle>
          </CardHeader>
          <CardContent className="provider-mode-grid">
            {Object.entries(providerConfig).map(([key, value]) => (
              <div key={key} className="provider-mode-item">
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="integration-grid">
          {integrationChecklist.map((item) => (
            <Card key={item.key} className="shadow-premium border-0">
              <CardHeader>
                <CardTitle className="integration-card-title">
                  <CircleDashed className="w-5 h-5 text-orange-500" />
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className="bg-orange-100 text-orange-800">{item.provider}</Badge>
                <p className="text-neutral-600">{item.required}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="setup-grid">
          <Card className="shadow-premium border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5" /> Server Environment Variables</CardTitle>
            </CardHeader>
            <CardContent className="env-list">
              {serverEnvVars.map((envVar) => <code key={envVar}>{envVar}</code>)}
            </CardContent>
          </Card>

          <Card className="shadow-premium border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Browser Environment Variables</CardTitle>
            </CardHeader>
            <CardContent className="env-list">
              {browserEnvVars.map((envVar) => <code key={envVar}>{envVar}</code>)}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-premium border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BadgeCheck className="w-5 h-5" /> Production Partner Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {productionPartners.map((partner) => (
              <div key={partner} className="partner-row">
                <BadgeCheck className="w-5 h-5 text-green-600" />
                <span>{partner}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
