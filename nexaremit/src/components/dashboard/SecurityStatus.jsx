import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Shield } from "lucide-react";

export default function SecurityStatus() {
  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">UI workflow ready</p>
            <p className="text-sm text-green-700">Prototype screens are connected.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-900">Compliance required</p>
            <p className="text-sm text-orange-700">KYC, AML, fraud controls, and licensing are not implemented.</p>
          </div>
        </div>
        <Badge className="bg-red-100 text-red-800">Prototype only</Badge>
      </CardContent>
    </Card>
  );
}
