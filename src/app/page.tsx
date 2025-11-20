'use client';

import {useState, useCallback} from 'react';
import {
  FileText,
  Inbox,
  Loader2,
  FileDown,
  EyeOff,
} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import { performMasking } from '@/app/actions';
import type { MaskingResult} from '@/lib/types';
import {Logo} from '@/components/icons';
import {ScrollArea} from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Github } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['.log', '.txt', '.json'];

type ViewState = 'upload' | 'masked';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [isMasking, setIsMasking] = useState<boolean>(false);
  const [maskingResult, setMaskingResult] = useState<MaskingResult | null>(null);
  
  const {toast} = useToast();

  const handleFileChange = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB.',
      });
      return;
    }

    if (!ALLOWED_FILE_TYPES.some(type => selectedFile.name.endsWith(type))) {
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
    setViewState('masked');

    const content = await selectedFile.text();

    try {
      const maskResult = await performMasking({ logContent: content });
      setMaskingResult(maskResult);
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
  }, [toast]);

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
    setViewState('upload');
    setMaskingResult(null);
  };
  
  const downloadMaskedLog = () => {
    if (!maskingResult || !file) return;

    const blob = new Blob([maskingResult.maskedLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `masked-${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const renderUpload = () => (
    <Card
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <CardHeader>
        <CardTitle>Upload Log File</CardTitle>
        <CardDescription>
          Drag & drop a file or click to upload (.log, .txt, .json, max 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center p-6 pt-0">
        <div className="w-full rounded-lg border-2 border-dashed border-border p-12">
            <>
                <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                Drag your file here or
                </p>
                <input
                type="file"
                id="file-upload"
                className="sr-only"
                onChange={e => handleFileChange(e.target.files ? e.target.files[0] : null)}
                accept=".log,.txt,.json"
                />
                <Button asChild variant="link" className="p-0 h-auto">
                <label htmlFor="file-upload">browse files</label>
                </Button>
            </>
        </div>
      </CardContent>
    </Card>
  );

  const renderDashboard = () => (
    <div className="grid gap-6">
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{file?.name}</CardTitle>
                    <CardDescription>File has been masked. You can now download the redacted file.</CardDescription>
                </CardHeader>
                <CardContent className='flex gap-4'>
                    <Button onClick={downloadMaskedLog} variant="secondary">
                        <FileDown className='mr-2 h-4 w-4'/>
                        Download Masked File
                    </Button>
                </CardContent>
            </Card>

            {isMasking ? (
                 <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Masking sensitive data...</p>
                </div>
            ) : (
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <EyeOff className="h-5 w-5" />
                        Masked Areas
                    </CardTitle>
                    <CardDescription>
                        Sensitive information that has been redacted from the log.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <ScrollArea className="h-96 w-full rounded-md border">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Line</TableHead>
                            <TableHead>Original Value</TableHead>
                            <TableHead>Masked Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {maskingResult && maskingResult.redactions.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.lineNumber}</TableCell>
                                <TableCell className="font-mono text-xs text-red-600 truncate max-w-[200px]">{item.original}</TableCell>
                                <TableCell className="font-mono text-xs text-green-600">{item.masked}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                        {maskingResult && maskingResult.redactions.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No sensitive data found to mask.
                        </div>
                        )}
                    </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
          resetState();
        }}>
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">LogMasker</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        {viewState === 'upload' ? renderUpload() : renderDashboard()}
      </main>

      <footer className="flex items-center justify-center gap-4 p-4 border-t bg-background">
        <p className="text-sm text-muted-foreground">
          A project for{' '}
          <a
            href="https://www.grootan.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            GROOTAN TECHNOLOGIES
          </a>
        </p>
        <a
          href="https://github.com/tawfeeq-bahur/log_insight_ai.git"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Grootan GitHub"
        >
          <Github className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </a>
      </footer>
    </div>
  );
}
