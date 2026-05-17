import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPageUrl } from "@/utils";
import { ArrowRight, CheckCircle, CreditCard, Home, Landmark, Phone, ShieldCheck, Smartphone, UserRound } from "lucide-react";

const payoutOptions = [
  { id: "bank", label: "Bank account", icon: Landmark, helper: "Best for receivers who use a bank." },
  { id: "mobile", label: "Mobile money", icon: Smartphone, helper: "Good for quick phone-based payouts." },
  { id: "cash", label: "Cash pickup", icon: Home, helper: "Useful when the receiver does not use banking apps." }
];

export default function Setup() {
  const [payoutMethod, setPayoutMethod] = useState("mobile");

  return (
    <div className="setup-page">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="setup-heading">
          <p className="home-kicker"><ShieldCheck className="w-5 h-5" /> Easy setup</p>
          <h1>Set up sending and receiving in a few calm steps.</h1>
          <p>Use this guided form when you want fewer choices on each screen and larger, clearer controls.</p>
        </div>

        <Alert className="border-yellow-200 bg-yellow-50">
          <ShieldCheck className="w-5 h-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            This is a prototype setup flow. A live money-transfer service must verify identity, validate accounts, and check sanctions lists.
          </AlertDescription>
        </Alert>

        <div className="setup-grid">
          <Card className="shadow-premium border-0">
            <CardHeader>
              <CardTitle className="setup-title"><UserRound className="w-6 h-6" /> Sender setup</CardTitle>
            </CardHeader>
            <CardContent className="easy-form">
              <label>
                <span>Your full name</span>
                <input placeholder="Example: Maria Johnson" />
              </label>
              <label>
                <span>Mobile number</span>
                <input placeholder="Example: +1 555 123 4567" />
              </label>
              <label>
                <span>How will you pay?</span>
                <select>
                  <option>Debit card</option>
                  <option>Bank transfer</option>
                  <option>Digital wallet</option>
                </select>
              </label>
              <div className="simple-tip">
                <CreditCard className="w-5 h-5" />
                Payment details can be added later. Start with basic contact information.
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-0">
            <CardHeader>
              <CardTitle className="setup-title"><Phone className="w-6 h-6" /> Receiver setup</CardTitle>
            </CardHeader>
            <CardContent className="easy-form">
              <label>
                <span>Receiver name</span>
                <input placeholder="Example: Daniel Mwangi" />
              </label>
              <label>
                <span>Receiver country</span>
                <select>
                  <option>Kenya</option>
                  <option>Nigeria</option>
                  <option>Ghana</option>
                  <option>India</option>
                  <option>Philippines</option>
                  <option>Mexico</option>
                  <option>Brazil</option>
                  <option>Pakistan</option>
                  <option>Bangladesh</option>
                  <option>South Africa</option>
                  <option>Egypt</option>
                  <option>Morocco</option>
                  <option>Other supported country</option>
                </select>
              </label>
              <div>
                <span className="field-label">How should they receive the money?</span>
                <div className="payout-choice-grid">
                  {payoutOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPayoutMethod(option.id)}
                        className={`payout-choice ${payoutMethod === option.id ? "is-selected" : ""}`}
                      >
                        <Icon className="w-6 h-6" />
                        <strong>{option.label}</strong>
                        <span>{option.helper}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="setup-review-card shadow-premium border-0">
          <CardContent className="p-6">
            <div className="setup-review-copy">
              <CheckCircle className="w-7 h-7 text-green-600" />
              <div>
                <h2>Ready for the next step</h2>
                <p>After setup, the sender can choose an amount and see the fee, rate, delivery time, and receiver amount before confirming.</p>
              </div>
            </div>
            <Link to={createPageUrl("SendMoney")}>
              <Button className="setup-next-button">
                Continue to Transfer
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
