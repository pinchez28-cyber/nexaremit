import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { fetchTransferRecords, formatTransferDate, getTransferRecords, transferStatuses } from "@/lib/transfer-records";
import { ReceiptText, Send } from "lucide-react";

export default function TransferHistory() {
  const [records, setRecords] = useState(() => getTransferRecords());

  useEffect(() => {
    let isMounted = true;
    fetchTransferRecords().then((nextRecords) => {
      if (isMounted) setRecords(nextRecords);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Transfer History</h1>
            <p className="text-neutral-600">Track sandbox payments, receipts, and transfer status events.</p>
          </div>
          <Link to={createPageUrl("SendMoney")}>
            <Button><Send className="w-5 h-5 mr-2" />New Transfer</Button>
          </Link>
        </div>

        <Card className="shadow-premium border-0">
          <CardHeader>
            <CardTitle>Recent Sandbox Transfers</CardTitle>
          </CardHeader>
          <CardContent className="history-list">
            {records.map((record) => (
              <Link key={record.id} to={`/Receipt/${record.id}`} className="history-row">
                <div className="history-icon"><ReceiptText className="w-5 h-5" /></div>
                <div className="flex-1">
                  <p className="font-semibold text-primary">{record.recipientName}</p>
                  <p className="text-sm text-neutral-500">{record.destination} - {formatTransferDate(record.createdAt)}</p>
                </div>
                <div className="history-amount">
                  <strong>{record.sendCurrency} {record.sendAmount.toFixed(2)}</strong>
                  <Badge className="bg-blue-50 text-blue-800">{transferStatuses[record.status] || record.status}</Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
