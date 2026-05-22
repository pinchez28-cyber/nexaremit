import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, ClipboardCheck, Database, ShieldAlert } from "lucide-react";

const statusClass = {
  required: "bg-orange-100 text-orange-800",
  pending: "bg-orange-100 text-orange-800",
  needs_review: "bg-orange-100 text-orange-800",
  manual_review: "bg-orange-100 text-orange-800",
  blocked: "bg-red-100 text-red-800",
  declined: "bg-red-100 text-red-800"
};

export default function ReviewQueue() {
  const [queue, setQueue] = useState({ configured: false, schemaReady: false, items: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/review-queue")
      .then((response) => response.json())
      .then((data) => {
        if (isMounted) setQueue(data);
      })
      .catch(() => {
        if (isMounted) setQueue({ configured: false, schemaReady: false, items: [] });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <p className="home-kicker"><ClipboardCheck className="w-5 h-5" /> Operations review</p>
          <h1 className="text-3xl font-bold text-primary mb-2">Compliance Review Queue</h1>
          <p className="text-neutral-600">
            Review KYC, sanctions, and fraud-risk items before any transfer is released to payout partners.
          </p>
        </div>

        {!queue.schemaReady && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Database className="w-5 h-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Run the latest Supabase schema to enable the live review queue. Until then, NexaRemit keeps sandbox checks usable without storing review items.
            </AlertDescription>
          </Alert>
        )}

        <div className="review-summary-grid">
          <Card className="shadow-premium border-0">
            <CardContent className="p-6 review-summary-card">
              <ShieldAlert className="w-8 h-8 text-orange-500" />
              <div>
                <span>Open Reviews</span>
                <strong>{isLoading ? "..." : queue.items.length}</strong>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-premium border-0">
            <CardContent className="p-6 review-summary-card">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <span>Storage</span>
                <strong>{queue.schemaReady ? "Ready" : "Setup needed"}</strong>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-premium border-0">
          <CardHeader>
            <CardTitle>Items Requiring Attention</CardTitle>
          </CardHeader>
          <CardContent className="review-list">
            {isLoading && <p className="text-neutral-600">Loading review queue...</p>}
            {!isLoading && queue.items.length === 0 && (
              <div className="review-empty">
                <CheckCircle className="w-8 h-8" />
                <span>No open review items right now.</span>
              </div>
            )}
            {queue.items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="review-row">
                <div className="review-icon">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="review-row-title">
                    <strong>{item.title}</strong>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-blue-50 text-blue-800">{item.type}</Badge>
                      <Badge className={statusClass[item.status] || "bg-orange-100 text-orange-800"}>{item.status}</Badge>
                    </div>
                  </div>
                  <p>{item.description}</p>
                  <span>User: {item.userId}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
