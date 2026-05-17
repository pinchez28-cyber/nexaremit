import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { ArrowRight, CheckCircle, Clock, HandCoins, Landmark, Phone, ShieldCheck, Smartphone, UserRoundPlus } from "lucide-react";

const promises = [
  "See the full cost first",
  "Add a receiver step by step",
  "Know what happens next"
];

const quickStarts = [
  { icon: UserRoundPlus, title: "Set up family", copy: "Add sender and receiver details in plain steps.", to: createPageUrl("Setup") },
  { icon: HandCoins, title: "Send money", copy: "Choose amount, payment method, and receiver.", to: createPageUrl("SendMoney") },
  { icon: Phone, title: "Track receipt", copy: "See sandbox receipts and transfer updates.", to: createPageUrl("History") }
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
            <h1>Money transfer made clear for every family.</h1>
            <p>
              NexaRemit uses large steps, familiar words, and clear receipts so first-time users and older family members can understand what is happening before they continue.
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
          <div className="home-visual">
            <img src="/assets/nexaremit-world-family-hero.png" alt="World map connections with a sender and receiver family using phones" />
            <div className="home-transfer-card">
              <div className="home-card-label">
                <Smartphone className="w-5 h-5" />
                Sender to receiver
              </div>
              <div className="home-transfer-row">
                <span>Fee shown first</span>
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
            </div>
          </div>
        </div>
      </section>

      <section className="home-quickstart">
        <div className="max-w-7xl mx-auto home-quickstart-inner">
          {quickStarts.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} to={item.to} className="home-action-card">
                <Icon className="w-7 h-7" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
                <ArrowRight className="w-5 h-5 home-action-arrow" />
              </Link>
            );
          })}
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

      <section className="home-trust-band">
        <div className="max-w-7xl mx-auto home-trust-inner">
          <div>
            <p className="home-kicker"><Landmark className="w-5 h-5" /> Built for regulated partners</p>
            <h2>Friendly for users, serious about safety.</h2>
          </div>
          <div className="home-trust-points">
            <span><ShieldCheck className="w-5 h-5" /> KYC before real transfers</span>
            <span><CheckCircle className="w-5 h-5" /> Clear fees and rates</span>
            <span><Clock className="w-5 h-5" /> Receipts after every test</span>
          </div>
        </div>
      </section>
    </div>
  );
}
