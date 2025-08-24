"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

// Create a Convex client
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ConvexProviderWrapperProps {
  children: React.ReactNode;
}

export function ConvexProviderWrapper({ children }: ConvexProviderWrapperProps) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}

export default ConvexProviderWrapper;
