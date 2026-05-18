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

const mapMarkers = [
  { id: "us", label: "USD United States", x: 164, y: 102, primary: true },
  { id: "ke", label: "KES Kenya", x: 434, y: 180, primary: true },
  { id: "ca", label: "Canada", x: 148, y: 68 },
  { id: "uk", label: "UK", x: 356, y: 72 },
  { id: "ng", label: "Nigeria", x: 376, y: 162 },
  { id: "ma", label: "Morocco", x: 346, y: 116 },
  { id: "eg", label: "Egypt", x: 420, y: 128 },
  { id: "ae", label: "UAE", x: 468, y: 132 },
  { id: "in", label: "India", x: 516, y: 136 },
  { id: "pk", label: "Pakistan", x: 500, y: 120 },
  { id: "jp", label: "Japan", x: 636, y: 108 },
  { id: "ph", label: "Philippines", x: 604, y: 154 },
  { id: "za", label: "South Africa", x: 408, y: 238 },
  { id: "br", label: "Brazil", x: 278, y: 218 }
];

const mapRoutes = [
  { from: [164, 102], to: [434, 180], curve: [265, 52], primary: true },
  { from: [148, 68], to: [376, 162], curve: [240, 52] },
  { from: [356, 72], to: [376, 162], curve: [362, 112] },
  { from: [356, 72], to: [346, 116], curve: [335, 88] },
  { from: [468, 132], to: [516, 136], curve: [492, 112] },
  { from: [500, 120], to: [516, 136], curve: [514, 116] },
  { from: [636, 108], to: [604, 154], curve: [648, 138] },
  { from: [604, 154], to: [516, 136], curve: [560, 128] },
  { from: [408, 238], to: [434, 180], curve: [402, 204] },
  { from: [278, 218], to: [356, 72], curve: [285, 118] },
  { from: [420, 128], to: [434, 180], curve: [448, 150] }
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
            <div className="home-hero-art" aria-label="Global transfer routes from United States to Kenya and other corridors">
              <div className="home-map-panel">
                <svg className="home-map-svg" viewBox="0 0 720 360" role="img" aria-label="World transfer routes map">
                  <defs>
                    <filter id="mapGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <radialGradient id="routeDot" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FDE68A" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </radialGradient>
                  </defs>
                  <g className="map-land">
                    <ellipse cx="142" cy="103" rx="92" ry="50" />
                    <ellipse cx="198" cy="201" rx="43" ry="78" />
                    <ellipse cx="360" cy="94" rx="52" ry="36" />
                    <ellipse cx="413" cy="159" rx="58" ry="82" />
                    <ellipse cx="508" cy="112" rx="117" ry="58" />
                    <ellipse cx="560" cy="179" rx="58" ry="48" />
                    <ellipse cx="598" cy="252" rx="43" ry="30" />
                    <ellipse cx="635" cy="108" rx="22" ry="34" />
                  </g>
                  <g className="map-grid">
                    {Array.from({ length: 11 }).map((_, index) => (
                      <path key={`lat-${index}`} d={`M55 ${58 + index * 24} H664`} />
                    ))}
                    {Array.from({ length: 13 }).map((_, index) => (
                      <path key={`lon-${index}`} d={`M${70 + index * 48} 45 V285`} />
                    ))}
                  </g>
                  <g className="map-routes">
                    {mapRoutes.map((route, index) => (
                      <path
                        key={`route-${index}`}
                        className={route.primary ? "is-primary" : ""}
                        d={`M${route.from[0]} ${route.from[1]} Q${route.curve[0]} ${route.curve[1]} ${route.to[0]} ${route.to[1]}`}
                      />
                    ))}
                  </g>
                  <g className="map-markers">
                    {mapMarkers.map((marker) => (
                      <g key={marker.id} className={marker.primary ? "map-marker is-primary" : "map-marker"} transform={`translate(${marker.x} ${marker.y})`}>
                        <circle r={marker.primary ? 8 : 5} />
                        <text x="10" y={marker.primary ? -8 : -6}>{marker.label}</text>
                      </g>
                    ))}
                  </g>
                </svg>
              </div>
              <div className="home-people-panel">
                <figure>
                  <img src="/assets/nexaremit-sender.png" alt="Sender using a phone to send money" />
                  <figcaption>Sending USD 250</figcaption>
                </figure>
                <figure>
                  <img src="/assets/nexaremit-receiver.png" alt="Receiver family smiling after receiving money" />
                  <figcaption>KES received</figcaption>
                </figure>
              </div>
            </div>
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
