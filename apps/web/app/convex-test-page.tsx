"use client";

import { ConvexTest } from "@repo/ui/convex-test";

export default function ConvexTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Convex Database Connection Test</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">About This Test</h2>
          <p className="text-gray-700 dark:text-gray-300">
            This page tests the connection between the web app and the shared Convex database. 
            It verifies that all apps in the workspace are connected to the same database.
          </p>
        </div>

        <ConvexTest appName="web" showDetails={true} />
        
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">What This Tests</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Database connectivity</li>
            <li>Read and write operations</li>
            <li>Query functionality</li>
            <li>Data consistency across apps</li>
            <li>Environment configuration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
