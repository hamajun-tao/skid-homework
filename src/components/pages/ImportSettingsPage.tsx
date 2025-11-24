"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";

// UI Components (Adjust import paths based on your project structure)
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAiStore } from "@/store/ai-store";

// Type Definition
type ImportAIModelModel = {
  name: string;
  model: string;
  provider: "gemini" | "openai";
  baseUrl?: string;
  key: string;
};

export default function ImportSettingsPage() {
  const router = useRouter();

  // State
  const [modelJson, setModelJson] = useState<ImportAIModelModel | null>(null);
  const [error, setError] = useState<string>("");
  const [isImported, setIsImported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sourceId = useRef<null | string>(null);

  const { addSource, removeSource } = useAiStore((s) => s);

  useEffect(() => {
    // 1. Get the hash from the URL
    const hash = window.location.hash;

    if (!hash) {
      router.replace("/");
      return;
    }

    // 2. Parse the JSON
    try {
      const jsonString = hash.substring(1);
      // Decode URI component in case the JSON was URL encoded
      const decodedString = decodeURIComponent(jsonString);
      const parsedData = JSON.parse(decodedString);

      // Basic validation checking if necessary fields exist
      if (!parsedData.name || !parsedData.provider) {
        throw new Error("Missing required fields (name or provider).");
      }

      setModelJson(parsedData);
    } catch (err) {
      console.error(err);
      setError("Failed to parse configuration. The link might be broken.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Handler: User confirms import
  const handleConfirmImport = () => {
    if (!modelJson) return;

    const newSourceId = addSource({
      apiKey: modelJson.key,
      name: modelJson.name,
      model: modelJson.model,
      provider: modelJson.provider,
      baseUrl: modelJson.baseUrl,
      enabled: true,
    });

    sourceId.current = newSourceId;

    setIsImported(true);
  };

  // Handler: User cancels
  const handleCancel = () => {
    router.push("/");
  };

  const handleUndo = () => {
    if (!sourceId.current) return;

    removeSource(sourceId.current);

    setIsImported(false);
  };

  // ------------------------------------------------------------------
  // Render Views
  // ------------------------------------------------------------------

  // View 1: Error State
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push("/")}>
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // View 2: Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">
          Parsing configuration...
        </p>
      </div>
    );
  }

  // View 3: Success State (After clicking Yes)
  if (isImported) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
        <Card className="w-full max-w-md text-center py-10">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              You&apos;re all set!
            </h2>
            <p className="text-muted-foreground">
              The AI model <strong>{modelJson?.name}</strong> has been
              successfully imported.
            </p>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col w-full gap-2">
              <div className="flex w-full gap-2">
                <Button
                  onClick={() => router.push("/settings")}
                  variant="secondary"
                  className="flex-1"
                >
                  Settings
                </Button>
                <Button
                  onClick={handleUndo}
                  variant="destructive"
                  className="flex-1"
                >
                  Undo
                </Button>
              </div>
              <Button onClick={() => router.push("/")} className="flex-1">
                Let&apos;s Skid
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // View 4: Confirmation State (Default)
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Import AI Model</CardTitle>
          <CardDescription>
            Do you want to add this configuration to your settings?
          </CardDescription>
        </CardHeader>

        <CardContent>
          {modelJson && (
            <div className="grid gap-4 rounded-md border p-4 bg-card/50">
              <div className="grid grid-cols-[100px_1fr] items-center gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Name:
                </span>
                <span className="font-medium">{modelJson.name}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Provider:
                </span>
                <span className="font-medium capitalize">
                  {modelJson.provider}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Model Name:
                </span>
                <span className="text-sm truncate" title={modelJson.model}>
                  {modelJson.model}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Base URL:
                </span>
                <span className="text-sm truncate" title={modelJson.baseUrl}>
                  {modelJson.baseUrl}
                </span>
              </div>
            </div>
          )}

          <Alert className="mt-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Security Check</AlertTitle>
            <AlertDescription>
              Only import configurations from sources you trust. This will
              contain your API keys.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex justify-between gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirmImport}>Yes, Import</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
