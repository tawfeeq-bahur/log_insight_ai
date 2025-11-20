'use client';

import { useState, useCallback } from 'react';
import {
  Inbox,
  Loader2,
  Database,
  Lock,
  FileCode,
  Activity,
  Shield,
  Server,
  History,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { performMasking, performAnalysis } from '@/app/actions';
import type { AnalysisResult } from '@/lib/types';
import { Logo } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['.log', '.txt', '.json'];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isMasking, setIsMasking] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [maskedLogContent, setMaskedLogContent] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResult | null>(null);

  const { toast } = useToast();

  const handleFileChange = useCallback(
    async (selectedFile: File | null) => {
      if (!selectedFile) return;

      if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB.',
        });
        return;
      }

      if (!ALLOWED_FILE_TYPES.some((type) => selectedFile.name.endsWith(type))) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: `Please upload a .log, .txt, or .json file.`,
        });
        return;
      }

      resetState();
      setFile(selectedFile);
      setIsMasking(true);

      const content = await selectedFile.text();

      try {
        const maskResult = await performMasking({ logContent: content });
        setMaskedLogContent(maskResult.maskedLog);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Masking Failed',
          description: 'Could not process the file for data masking.',
        });
        resetState();
      } finally {
        setIsMasking(false);
      }
    },
    [toast]
  );

  const handleAnalysis = useCallback(async () => {
    if (!maskedLogContent) {
       toast({
        variant: 'destructive',
        title: 'No file to analyze',
        description:
          'Please upload a log file first before starting the analysis.',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null); // Clear previous results
    try {
      const result = await performAnalysis({
        logContent: maskedLogContent,
      });
      setAnalysisResult(result);
    } catch (error: any) {
      console.error('Detailed error in performAnalysis:', error.message);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description:
          'The AI analysis could not be completed. Please try again.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [maskedLogContent, toast]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFile = event.dataTransfer.files && event.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const resetState = () => {
    setFile(null);
    setMaskedLogContent(null);
    setAnalysisResult(null);
  };


  const renderAnalysisResult = () => {
     if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            AI is analyzing your log data...
          </p>
        </div>
      );
    }

    if (!analysisResult) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-muted-foreground">
                {file ? "Click 'Analyze' in the header to start." : "Upload a log file to begin."}
            </p>
        </div>
      );
    }

    const {
      overviewSummary,
      categorizedLogSummary,
    } = analysisResult;

    const summaryItems = [
      { label: 'Total Entries', value: overviewSummary.totalEntries },
      { label: 'Info Logs', value: overviewSummary.infoLogs },
      { label: 'Error Logs', value: overviewSummary.errorLogs },
      { label: 'Security Alerts', value: overviewSummary.securityAlerts },
      { label: 'DB Failures', value: overviewSummary.dbFailures },
      { label: 'Auth Failures', value: overviewSummary.authFailures },
      { label: 'Payment Failures', value: overviewSummary.paymentFailures },
      { label: 'File/Upload Failures', value: overviewSummary.fileUploadFailures },
      { label: 'API Failures', value: overviewSummary.apiFailures },
      { label: 'Suspicious Requests', value: overviewSummary.suspiciousRequests },
    ];

    const categoryIcons: { [key: string]: React.ElementType } = {
      applicationAndSystem: Server,
      authenticationAndAuthorization: Lock,
      database: Database,
      payments: '💳',
      api: FileCode,
      fileUpload: '📁',
      security: Shield,
      userActions: Activity,
    };

    return (
      <ScrollArea className="h-full">
        <div className="space-y-6 pr-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">1</span>
                Overview Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {summaryItems.map(item => (
                  <div key={item.label} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">{item.label}:</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">2</span>
                Categorized Log Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(categorizedLogSummary).map(([category, logs]) => {
                const Icon = categoryIcons[category] || Activity;
                if (logs.length === 0) return null;
                const formattedCategory = category.replace(/([A-Z])/g, ' $1').replace('And ', ' & ');
                return (
                  <div key={category}>
                    <h3 className="font-semibold capitalize flex items-center gap-2 mb-2">
                      {typeof Icon === 'string' ? <span className="text-xl">{Icon}</span> : <Icon className="h-5 w-5" />}
                       {formattedCategory}
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                      {logs.map((log, i) => <li key={i}>{log}</li>)}
                    </ul>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            resetState();
          }}
        >
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">LogInsightsAI</h1>
        </div>
         <div className="flex items-center gap-4">
            <Button onClick={handleAnalysis} disabled={isAnalyzing || !file}>
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Analyze
            </Button>
            <Button variant="outline" disabled>
                <History className="mr-2 h-4 w-4" />
                History
            </Button>
        </div>
      </header>

      <main className="flex-1 grid md:grid-cols-2 gap-6 p-4 md:p-6">
        <Card onDrop={handleDrop} onDragOver={handleDragOver} className="flex flex-col">
          <CardHeader>
            <CardTitle>Upload Log File</CardTitle>
            <CardDescription>
              {file ? file.name : 'Drag & drop a file or click to upload (.log, .txt, .json, max 5MB)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6 pt-0">
            <div className="w-full h-full rounded-lg border-2 border-dashed border-border p-12 flex flex-col justify-center items-center">
              <>
                <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Drag your file here or
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="sr-only"
                  onChange={(e) =>
                    handleFileChange(e.target.files ? e.target.files[0] : null)
                  }
                  accept=".log,.txt,.json"
                />
                <Button asChild variant="link" className="p-0 h-auto">
                  <label htmlFor="file-upload">browse files</label>
                </Button>
              </>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col gap-6">
          <Card className="flex-1 flex flex-col">
             <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>AI-powered insights into your log data.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {renderAnalysisResult()}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
