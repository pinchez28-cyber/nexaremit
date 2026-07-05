import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Page not found</h1>
        <p className="text-neutral-600 mb-6">That route is not part of the NexaRemit prototype.</p>
        <Link to={createPageUrl("Dashboard")}>
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
