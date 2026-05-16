import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <Card className="max-w-md border-0 shadow-premium">
        <CardContent className="p-6">
          <h1 className="text-xl font-bold text-primary mb-2">Account Not Registered</h1>
          <p className="text-neutral-600">Your account needs to be invited before you can access NexaRemit.</p>
        </CardContent>
      </Card>
    </div>
  );
}
