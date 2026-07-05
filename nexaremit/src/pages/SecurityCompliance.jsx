import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Eye, Lock, Shield, XCircle } from "lucide-react";

const ComplianceItem = ({ title, description, status, requirement }) => {
  const statusConfig = {
    missing: { icon: XCircle, color: "text-red-600", badge: "bg-red-100 text-red-800" },
    required: { icon: AlertTriangle, color: "text-orange-500", badge: "bg-orange-100 text-orange-800" },
    implemented: { icon: CheckCircle, color: "text-green-600", badge: "bg-green-100 text-green-800" }
  };
  const currentStatus = statusConfig[status] || statusConfig.missing;
  const Icon = currentStatus.icon;

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-neutral-200">
      <Icon className={`w-6 h-6 mt-1 ${currentStatus.color}`} />
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
          <h4 className="font-semibold text-primary">{title}</h4>
          <div className="flex gap-2 flex-wrap">
            <Badge className={currentStatus.badge}>{status}</Badge>
            {requirement === "legal" && <Badge variant="outline" className="bg-purple-50 text-purple-800">Legal Requirement</Badge>}
            {requirement === "critical" && <Badge variant="outline" className="bg-red-50 text-red-800">Critical</Badge>}
          </div>
        </div>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
    </div>
  );
};

export default function SecurityCompliance() {
  const amlCompliance = [
    { title: "Know Your Customer (KYC)", description: "Identity verification including government ID, address, and biometric checks.", status: "missing", requirement: "legal" },
    { title: "Customer Due Diligence (CDD)", description: "Risk assessment, source of funds verification, and enhanced due diligence.", status: "missing", requirement: "legal" },
    { title: "Transaction Monitoring", description: "Real-time monitoring for suspicious patterns and unusual activity.", status: "missing", requirement: "critical" },
    { title: "Suspicious Activity Reports (SAR)", description: "Automated reporting to financial authorities such as FinCEN and the FCA.", status: "missing", requirement: "legal" },
    { title: "Sanctions Screening", description: "Real-time checking against OFAC, EU, and UN sanctions lists.", status: "missing", requirement: "legal" }
  ];
  const fraudPrevention = [
    { title: "Device Fingerprinting", description: "Detect fraudulent access attempts and account takeovers.", status: "missing", requirement: "critical" },
    { title: "Behavioral Analytics", description: "AI-powered anomaly detection for fraud indicators.", status: "missing", requirement: "critical" },
    { title: "Multi-Factor Authentication", description: "Enforced 2FA for all transactions and account access.", status: "missing", requirement: "critical" },
    { title: "Transaction Limits & Velocity Checks", description: "Daily/monthly limits, frequency checks, and progressive verification.", status: "missing", requirement: "critical" },
    { title: "Risk Scoring Engine", description: "Real-time risk assessment for every transaction.", status: "missing", requirement: "critical" }
  ];
  const dataProtection = [
    { title: "Data Encryption", description: "End-to-end encryption in transit and at rest. PCI DSS compliance.", status: "missing", requirement: "legal" },
    { title: "Audit Logging", description: "Comprehensive logging of all system and user activities.", status: "missing", requirement: "legal" },
    { title: "GDPR/Privacy Compliance", description: "Data protection for European users, including right to deletion.", status: "missing", requirement: "legal" }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Security & Compliance Status</h1>
          <p className="text-neutral-600">What's needed for regulatory compliance</p>
        </div>
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>CRITICAL:</strong> This is a UI prototype. It is <strong>NOT secure</strong> for real money. Do not process real transactions until all systems below are implemented.
          </AlertDescription>
        </Alert>
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-premium border-0">
            <CardHeader>
              <CardTitle className="text-xl text-red-600 flex items-center gap-2"><XCircle className="w-6 h-6" />Current Risk Level: HIGH</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Missing:</strong> All AML compliance systems</p>
              <p><strong>Missing:</strong> Fraud detection and prevention</p>
              <p><strong>Missing:</strong> Regulatory reporting capabilities</p>
              <p><strong>Missing:</strong> KYC verification</p>
              <p><strong>Missing:</strong> Transaction monitoring</p>
            </CardContent>
          </Card>
          <Card className="shadow-premium border-0">
            <CardHeader>
              <CardTitle className="text-xl text-green-600 flex items-center gap-2"><CheckCircle className="w-6 h-6" />What You Have</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>OK</strong> Professional user interface</p>
              <p><strong>OK</strong> Complete user workflow</p>
              <p><strong>OK</strong> Transaction data structure</p>
              <p><strong>OK</strong> Basic user management</p>
              <p className="text-neutral-500">Note: These are UI elements only, not security systems</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card className="shadow-premium border-0">
            <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" />Anti-Money Laundering (AML) Compliance</CardTitle></CardHeader>
            <CardContent className="space-y-4">{amlCompliance.map((item) => <ComplianceItem key={item.title} {...item} />)}</CardContent>
          </Card>
          <Card className="shadow-premium border-0">
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Fraud Prevention Systems</CardTitle></CardHeader>
            <CardContent className="space-y-4">{fraudPrevention.map((item) => <ComplianceItem key={item.title} {...item} />)}</CardContent>
          </Card>
          <Card className="shadow-premium border-0">
            <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" />Data Protection & Privacy</CardTitle></CardHeader>
            <CardContent className="space-y-4">{dataProtection.map((item) => <ComplianceItem key={item.title} {...item} />)}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
