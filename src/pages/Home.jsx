import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { ArrowRight, CheckCircle, Clock, HandCoins, ShieldCheck, Smartphone, UserRoundPlus } from "lucide-react";

const promises = [
  "See the full cost first",
  "Add a receiver step by step",
  "Know what happens next"
];

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="max-w-7xl mx-auto home-hero-inner">
          <div className="home-copy">
            <div className="home-kicker">
              <ShieldCheck className="w-5 h-5" />
              Simple money transfer practice app
            </div>
            <h1>Send money home with clear steps.</h1>
            <p>
              NexaRemit is designed for families, first-time users, and anyone who wants large buttons, plain words, and no surprises before sending.
            </p>
            <div className="home-actions">
              <Link to={createPageUrl("Setup")}>
                <Button className="home-primary-action">
                  Start Here
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("SendMoney")}>
                <Button variant="outline" className="home-secondary-action">
                  Send Money
                </Button>
              </Link>
            </div>
            <div className="home-promises">
              {promises.map((promise) => (
                <span key={promise}>
                  <CheckCircle className="w-5 h-5" />
                  {promise}
                </span>
              ))}
            </div>
          </div>
          <Card className="home-transfer-card">
            <CardContent className="p-8">
              <div className="home-card-label">
                <Smartphone className="w-5 h-5" />
                Example transfer
              </div>
              <div className="home-transfer-row">
                <span>You send</span>
                <strong>$250.00</strong>
              </div>
              <div className="home-transfer-row">
                <span>Fee</span>
                <strong>$3.00</strong>
              </div>
              <div className="home-transfer-row">
                <span>Receiver gets</span>
                <strong>NGN 412,500</strong>
              </div>
              <div className="home-delivery">
                <Clock className="w-5 h-5" />
                Clear message: same-day estimate
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="max-w-7xl mx-auto home-section">
        <div className="section-heading">
          <h2>Built for people who prefer simple guidance</h2>
          <p>No complicated dashboards required. Start with the sender, add the receiver, then review everything in plain words before the transfer continues.</p>
        </div>
        <div className="friendly-grid">
          <div className="friendly-card">
            <UserRoundPlus className="w-8 h-8 text-blue-700" />
            <h3>1. Set up the sender</h3>
            <p>Add your name, phone number, and how you want to pay. Keep the first setup short.</p>
          </div>
          <div className="friendly-card">
            <HandCoins className="w-8 h-8 text-blue-700" />
            <h3>2. Add the receiver</h3>
            <p>Choose bank, mobile money, or wallet. Show only the fields needed for that option.</p>
          </div>
          <div className="friendly-card">
            <ShieldCheck className="w-8 h-8 text-blue-700" />
            <h3>3. Review in plain words</h3>
            <p>Show the fee, exchange rate, delivery time, and total before the transfer continues.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
