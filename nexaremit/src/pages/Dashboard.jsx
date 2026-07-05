import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Building, Clock, Globe, Send, Shield, Users } from "lucide-react";
import StatsOverview from "../components/dashboard/StatsOverview";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import QuickActions from "../components/dashboard/QuickActions";
import TransactionChart from "../components/dashboard/TransactionChart";
import SecurityStatus from "../components/dashboard/SecurityStatus";
import BalancePanel from "../components/dashboard/BalancePanel";
import ComplianceReadiness from "../components/dashboard/ComplianceReadiness";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liveRates, setLiveRates] = useState({
    "USD-NGN": 1650,
    "GBP-KES": 165,
    "EUR-GHS": 13.2
  });

  useEffect(() => {
    loadTransactions();
    const rateInterval = setInterval(() => {
      setLiveRates((prev) => ({
        "USD-NGN": prev["USD-NGN"] + (Math.random() - 0.5) * 2,
        "GBP-KES": prev["GBP-KES"] + (Math.random() - 0.5) * 0.2,
        "EUR-GHS": prev["EUR-GHS"] + (Math.random() - 0.5) * 0.05
      }));
    }, 3000);
    return () => clearInterval(rateInterval);
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    const data = await base44.entities.Transaction.list("-created_date", 10);
    setTransactions(data);
    setIsLoading(false);
  };

  const stats = {
    totalSent: transactions.reduce((sum, transaction) => sum + (transaction.send_amount || 0), 0),
    totalTransactions: transactions.length,
    completedTransactions: transactions.filter((transaction) => transaction.status === "completed").length,
    activeRecipients: [...new Set(transactions.map((transaction) => transaction.recipient_name))].length
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="gradient-primary px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="text-white">
              <div className="hero-kicker">
                <Clock className="w-4 h-4" />
                Same-day transfers in supported corridors
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">Move money with confidence</h1>
              <p className="text-blue-100 text-lg lg:text-xl mb-6 max-w-2xl">
                A cleaner NexaRemit control center for quoting transfers, tracking payout health, and preparing the compliance layer required for real money movement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl("SendMoney")}>
                  <Button className="bg-white text-primary-navy hover:bg-neutral-100 font-semibold px-8 py-6 text-lg shadow-lg transition-premium">
                    <Send className="w-5 h-5 mr-2" />
                    Send Money Now
                  </Button>
                </Link>
                <Link to={createPageUrl("Recipients")}>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-navy font-semibold px-8 py-6 text-lg transition-premium">
                    <Users className="w-5 h-5 mr-2" />
                    Manage Recipients
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 min-w-72">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-white" />
                <span className="text-white font-semibold">Live Exchange Rates</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-blue-100">
                  <span>1 USD to NGN</span>
                  <span className="font-semibold">NGN {liveRates["USD-NGN"].toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-100">
                  <span>1 GBP to KES</span>
                  <span className="font-semibold">KSh {liveRates["GBP-KES"].toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-100">
                  <span>1 EUR to GHS</span>
                  <span className="font-semibold">GHS {liveRates["EUR-GHS"].toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <StatsOverview stats={stats} isLoading={isLoading} />
        <div className="dashboard-strip">
          <BalancePanel />
          <ComplianceReadiness />
        </div>
        <QuickActions />
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <TransactionChart transactions={transactions} isLoading={isLoading} />
            <RecentTransactions transactions={transactions} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-2">
            <SecurityStatus />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-premium">
          <h3 className="text-2xl font-bold text-primary mb-8 text-center">Why Choose NexaRemit?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              [Shield, "Bank-Level Security", "Your money and data are protected with enterprise-grade encryption"],
              [Globe, "Global Payouts", "Mobile Money, bank transfer, and more worldwide"],
              [Building, "Worldwide Banking Network", "Connected to major banks for reliable global transfers"]
            ].map(([Icon, title, description]) => (
              <div key={title} className="text-center">
                <div className="w-16 h-16 gradient-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-primary mb-2">{title}</h4>
                <p className="text-neutral-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
