"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface ConvexStatusProps {
  appName: string;
}

export function ConvexStatus({ appName }: ConvexStatusProps) {
  const dbInfo = useQuery(api.functions.testDatabaseConnection.getDatabaseInfo);
  const status = useQuery(api.functions.testDatabaseConnection.getConnectionStatus);

  if (!dbInfo || !status) {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></div>
        Loading...
      </div>
    );
  }

  const isConnected = status.connectedApps.includes(appName);
  const totalApps = status.connectedApps.length;

  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
      {isConnected ? (
        <div className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Connected ({totalApps} apps)
        </div>
      ) : (
        <div className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          Not Connected
        </div>
      )}
    </div>
  );
}

export default ConvexStatus;
