
'use client';

import { useState, useCallback } from 'react';
import {
  Inbox,
  Loader2,
  FileCode,
  Sparkles,
  Download,
  Eye,
  EyeOff,
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
import type { AnalysisResult, MaskingResult } from '@/lib/types';
import { Logo } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AnalysisDashboard from '@/components/AnalysisDashboard';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['.log', '.txt', '.json'];

type ViewState = 'uploading' | 'masking' | 'masked' | 'analyzing' | 'analyzed';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [maskingResult, setMaskingResult] = useState<MaskingResult | null>(
    null
  );
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResult | null>(null);
  const [viewState, setViewState] = useState<ViewState>('uploading');
  const [showOriginal, setShowOriginal] = useState(false);

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

      if (
        !ALLOWED_FILE_TYPES.some((type) => selectedFile.name.endsWith(type))
      ) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: `Please upload a .log, .txt, or .json file.`,
        });
        return;
      }

      resetState();
      setFile(selectedFile);
      setViewState('masking');

      const content = await selectedFile.text();

      try {
        const result = await performMasking({ logContent: content });
        setMaskingResult(result);
        setViewState('masked');
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Masking Failed',
          description: 'Could not process the file for data masking.',
        });
        resetState();
      }
    },
    [toast]
  );

  const handleAnalysis = useCallback(async () => {
    if (!maskingResult?.maskedLog) {
      toast({
        variant: 'destructive',
        title: 'No file to analyze',
        description:
          'Please upload a log file first before starting the analysis.',
      });
      return;
    }

    setViewState('analyzing');
    setAnalysisResult(null); // Clear previous results
    try {
      const result = await performAnalysis({
        logContent: maskingResult.maskedLog,
      });
      setAnalysisResult(result);
      setViewState('analyzed');
    } catch (error: any) {
      console.error('Detailed error in performAnalysis:', error.message);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description:
          'The AI analysis could not be completed. Please try again.',
      });
      setViewState('masked'); // Revert to masked state on failure
    }
  }, [maskingResult, toast]);

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
    setMaskingResult(null);
    setAnalysisResult(null);
    setViewState('uploading');
    setShowOriginal(false);
  };

  const downloadMaskedLog = () => {
    if (!maskingResult?.maskedLog || !file) return;

    const blob = new Blob([maskingResult.maskedLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const originalName = file.name.split('.').slice(0, -1).join('.');
    link.download = `${originalName}_masked.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderLeftPanel = () => {
    if (viewState === 'uploading' || viewState === 'masking') {
      return (
        <Card
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col flex-1"
        >
          <CardHeader>
            <CardTitle>Upload Log File</CardTitle>
            <CardDescription>
              Drag & drop or click to upload (.log, .txt, .json, max 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6 pt-0">
            {viewState === 'masking' ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Masking sensitive data...</p>
              </div>
            ) : (
              <div className="w-full h-full rounded-lg border-2 border-dashed border-border p-12 flex flex-col justify-center items-center">
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
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (maskingResult) {
      return (
        <Card className="flex flex-col flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Masked Log Content</CardTitle>
                <CardDescription>{file?.name}</CardDescription>
              </div>
              <Button onClick={downloadMaskedLog} size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-full rounded-md border bg-muted/20 font-code text-sm">
              <pre className="p-4">{maskingResult.maskedLog}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  const renderRightPanel = () => {
    if (viewState === 'uploading' || viewState === 'masking' || !maskingResult) {
      return (
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Redacted Items</CardTitle>
            <CardDescription>
              Sensitive data found and masked in your file.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Upload a file to see redacted items.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (viewState === 'analyzing') {
       return (
        <Card className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">
            AI is analyzing your log data...
          </p>
        </Card>
       );
    }
    
    if (viewState === 'analyzed' && analysisResult) {
      return <AnalysisDashboard result={analysisResult} />;
    }

    // Default to 'masked' state view
    return (
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Redacted Items</CardTitle>
              <CardDescription>
                Found and masked {maskingResult.redactions.length} items.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOriginal(!showOriginal)}
              >
                {showOriginal ? (
                  <EyeOff className="mr-2 h-4 w-4" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                {showOriginal ? 'Hide' : 'Show'} Original
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[100px]">Line</TableHead>
                  {showOriginal && <TableHead>Original Value</TableHead>}
                  <TableHead>Masked Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maskingResult.redactions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.lineNumber}</TableCell>
                    {showOriginal && (
                      <TableCell className="font-code text-red-600">
                        {item.original}
                      </TableCell>
                    )}
                    <TableCell className="font-code text-green-600">
                      {item.masked}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={resetState}
        >
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">LogInsightsAI</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleAnalysis}
            disabled={viewState !== 'masked'}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Analyze
          </Button>
        </div>
      </header>
      <main className="flex-1 grid md:grid-cols-2 gap-6 p-4 md:p-6">
        {renderLeftPanel()}
        {renderRightPanel()}
      </main>
    </div>
  );
}
