import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { fetchTransferRecord, formatTransferDate, getTransferRecord, transferStatuses } from "@/lib/transfer-records";
import { ArrowLeft, CheckCircle, ReceiptText } from "lucide-react";

export default function Receipt() {
  const { id } = useParams();
  const [record, setRecord] = useState(() => getTransferRecord(id));

  useEffect(() => {
    let isMounted = true;
    fetchTransferRecord(id).then((nextRecord) => {
      if (isMounted) setRecord(nextRecord);
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!record) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-premium border-0">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-primary mb-2">Receipt not found</h1>
              <p className="text-neutral-600 mb-6">This receipt may be on another device or browser.</p>
              <Link to={createPageUrl("History")}><Button>Back to History</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to={createPageUrl("History")} className="inline-flex items-center gap-2 text-primary font-semibold">
          <ArrowLeft className="w-5 h-5" />
          Back to history
        </Link>
        <Card className="shadow-premium border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ReceiptText className="w-6 h-6" />
              Transfer Receipt {record.id}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="receipt-status">
              <CheckCircle className="w-7 h-7 text-green-600" />
              <div>
                <p className="font-bold text-primary">{transferStatuses[record.status]}</p>
                <p className="text-sm text-neutral-600">
                  No payout provider is connected yet, so no money was delivered to the
                  recipient. The card was authorized in Stripe test mode only.
                </p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Not delivered</Badge>
            </div>

            <div className="receipt-grid">
              <div><span>Receiver</span><strong>{record.recipientName}</strong></div>
              <div><span>Destination</span><strong>{record.destination}</strong></div>
              <div><span>Sent</span><strong>{record.sendCurrency} {record.sendAmount.toFixed(2)}</strong></div>
              <div><span>Receiver amount</span><strong>{record.receiveCurrency} {record.receiveAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div>
              <div><span>Payment method</span><strong>{record.paymentMethod}</strong></div>
              <div><span>Created</span><strong>{formatTransferDate(record.createdAt)}</strong></div>
            </div>

            {record.paymentIntentId && (
              <div className="receipt-reference">
                <span>Stripe test PaymentIntent</span>
                <strong>{record.paymentIntentId}</strong>
              </div>
            )}

            <div className="timeline">
              {record.events.map((event) => (
                <div key={`${event.label}-${event.at}`} className="timeline-row">
                  <span />
                  <div>
                    <strong>{event.label}</strong>
                    <p>{formatTransferDate(event.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
