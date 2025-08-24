"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface ConvexTestProps {
  appName: string;
  showDetails?: boolean;
}

export function ConvexTest({ appName, showDetails = false }: ConvexTestProps) {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = useMutation(api.functions.testDatabaseConnection.runComprehensiveTest);
  const getStatus = useQuery(api.functions.testDatabaseConnection.getConnectionStatus);
  const getDbInfo = useQuery(api.functions.testDatabaseConnection.getDatabaseInfo);

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const result = await runTest({ appName });
      setTestResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4">
        🧪 Convex Connection Test - {appName}
      </h3>

      {/* Database Info */}
      {getDbInfo && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="text-sm">
            <strong>Deployment:</strong> {getDbInfo.deploymentId}
          </p>
          <p className="text-sm">
            <strong>Status:</strong> {getDbInfo.message}
          </p>
        </div>
      )}

      {/* Connection Status */}
      {getStatus && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded">
          <p className="text-sm">
            <strong>Connected Apps:</strong> {getStatus.connectedApps.join(", ")}
          </p>
          <p className="text-sm">
            <strong>Total Tests:</strong> {getStatus.totalTests}
          </p>
          {getStatus.lastTest && (
            <p className="text-sm">
              <strong>Last Test:</strong> {getStatus.lastTest.appName} at{" "}
              {new Date(getStatus.lastTest.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Test Button */}
      <button
        onClick={handleTest}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Testing..." : "Run Connection Test"}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
          <p className="text-red-600 dark:text-red-400 text-sm">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Test Results */}
      {testResult && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <h4 className="font-semibold mb-2">Test Results:</h4>
          
          <div className={`text-sm ${getStatusColor(testResult.success)}`}>
            <p>
              <strong>Status:</strong> {testResult.success ? "✅ Success" : "❌ Failed"}
            </p>
            
            {testResult.success && (
              <>
                <p>
                  <strong>Deployment:</strong> {testResult.databaseInfo.deploymentId}
                </p>
                <p>
                  <strong>Timestamp:</strong> {new Date(testResult.databaseInfo.timestamp).toLocaleString()}
                </p>
                
                {showDetails && testResult.tests && (
                  <div className="mt-2">
                    <p className="font-semibold">Test Details:</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      <li>Write: {testResult.tests.write.success ? "✅" : "❌"}</li>
                      <li>Read: {testResult.tests.read.success ? "✅" : "❌"}</li>
                      <li>Query: {testResult.tests.query.success ? "✅" : "❌"}</li>
                      <li>Count: {testResult.tests.count.success ? "✅" : "❌"}</li>
                    </ul>
                  </div>
                )}
              </>
            )}
            
            {!testResult.success && (
              <p>
                <strong>Error:</strong> {testResult.error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConvexTest;
