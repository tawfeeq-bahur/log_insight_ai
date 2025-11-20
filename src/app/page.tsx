'use client';

import {useState, useEffect, useCallback} from 'react';
import {
  AlertCircle,
  FileText,
  History,
  Inbox,
  Loader2,
  X,
  Sparkles,
  ChevronRight,
  Database,
  ShieldCheck,
  BarChart2,
  Github,
  Download,
  EyeOff,
  Trash2,
  FileDown,
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
import {getSha256} from '@/lib/log-parser';
import {
  performAnalysis,
  performAction,
  checkCache,
  performMasking,
} from '@/app/actions';
import type {LogAnalysisResult, LogHistoryEntry, MaskingResult} from '@/lib/types';
import {Logo} from '@/components/icons';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['.log', '.txt', '.json'];

type ViewState = 'upload' | 'masked' | 'analyzing' | 'analyzed';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMasking, setIsMasking] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<LogAnalysisResult | null>(null);
  const [maskingResult, setMaskingResult] = useState<MaskingResult | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [history, setHistory] = useState<LogHistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [selectedHistory, setSelectedHistory] = useState<LogHistoryEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<LogHistoryEntry | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{actionResult: string; followUpTasks: string} | null>(null);
  const [cacheCheckResult, setCacheCheckResult] = useState<string | null>(null);

  const {toast} = useToast();

  useEffect(() => {
    const storedHistory = localStorage.getItem('logHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const saveHistory = (newHistory: LogHistoryEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem('logHistory', JSON.stringify(newHistory));
  };

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

    const content = await selectedFile.text();
    setFileContent(content);

    try {
      const maskResult = await performMasking({ logContent: content });
      setMaskingResult(maskResult);
      const fileHash = await getSha256(content);
      setHash(fileHash);
      setViewState('masked');

      const existingEntry = history.find(entry => entry.hash === fileHash);
      if (existingEntry) {
        setIsDuplicate(true);
      }
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
  }, [history, toast]);

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
    setFileContent('');
    setViewState('upload');
    setIsLoading(false);
    setAnalysisResult(null);
    setMaskingResult(null);
    setHash(null);
    setActionResult(null);
    setCacheCheckResult(null);
  };

  const handleAnalysis = async (forceNew = false) => {
    if (!hash || !maskingResult) return;
  
    const existingEntry = history.find(entry => entry.hash === hash);
    if (existingEntry && !forceNew) {
      setAnalysisResult(existingEntry.analysis);
      setViewState('analyzed');
      return;
    }
  
    setIsLoading(true);
    setViewState('analyzing');
    setAnalysisResult(null);
    setActionResult(null);
    setCacheCheckResult(null);
  
    try {
      const result = await performAnalysis({ logContent: maskingResult.maskedLog });
      setAnalysisResult(result);
      if (file && fileContent) {
        const newEntry: LogHistoryEntry = {
          id: new Date().toISOString(),
          filename: file.name,
          uploadTime: new Date().toLocaleString(),
          fileSize: (file.size / 1024).toFixed(2) + ' KB',
          hash,
          analysis: result,
          content: fileContent, // Save original content
        };
        const updatedHistory = [newEntry, ...history.filter(h => h.hash !== hash)];
        saveHistory(updatedHistory);
      }
    } catch (error: any) {
      console.error('Detailed error in performAnalysis:', error.message);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: `An error occurred during AI analysis: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
      setViewState('analyzed');
    }
  };

  const handleAction = async (action: string) => {
    if (!analysisResult || !action) return;
    setIsActionLoading(true);
    setActionResult(null);
    try {
      const result = await performAction({
        logAnalysis: JSON.stringify(analysisResult),
        desiredAction: action,
      });
      setActionResult(result);
      toast({
        title: 'Action Successful',
        description: `Action '${action}' completed.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Action Failed',
        description: 'Could not perform the automated action.',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const useExistingAnalysis = () => {
    const existingEntry = history.find(entry => entry.hash === hash);
    if (existingEntry) {
      setAnalysisResult(existingEntry.analysis);
      setViewState('analyzed');
    }
    setIsDuplicate(false);
  };
  
  const analyzeNew = () => {
    setIsDuplicate(false);
    handleAnalysis(true);
  };
  
  const viewHistoryEntry = (entry: LogHistoryEntry) => {
    setSelectedHistory(entry);
  }

  const handleDeleteHistoryEntry = (id: string) => {
    const updatedHistory = history.filter(entry => entry.id !== id);
    saveHistory(updatedHistory);
    toast({
      title: 'Entry Deleted',
      description: 'The analysis has been removed from your history.',
    });
    setEntryToDelete(null);
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

  const renderSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'critical':
        return <Badge variant="destructive">{severity}</Badge>;
      case 'medium':
        return <Badge className="bg-accent text-accent-foreground">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{severity || 'N/A'}</Badge>;
    }
  };
  
  const renderAnalysisResult = (result: LogAnalysisResult) => {
    if (!result || !result.overviewSummary) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground p-12">
          <AlertCircle className="h-10 w-10 mb-4 text-destructive" />
          <p className="font-medium">Analysis Incomplete</p>
          <p className="text-sm">The AI response was not in the expected format.</p>
        </div>
      );
    }

    return (
     <div className="space-y-6">
        {cacheCheckResult && (
          <Card className="bg-secondary/50">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Smart Cache Check</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{cacheCheckResult}</p>
            </CardContent>
          </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle className='text-lg'>1️⃣ Overview Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <p><strong>Total Entries:</strong> {result.overviewSummary.totalEntries}</p>
                    <p><strong>Info Logs:</strong> {result.overviewSummary.infoLogs}</p>
                    <p><strong>Error Logs:</strong> {result.overviewSummary.errorLogs}</p>
                    <p><strong>Security Alerts:</strong> {result.overviewSummary.securityAlerts}</p>
                    <p><strong>DB Failures:</strong> {result.overviewSummary.databaseFailures}</p>
                    <p><strong>Auth Failures:</strong> {result.overviewSummary.authenticationFailures}</p>
                    <p><strong>Payment Failures:</strong> {result.overviewSummary.paymentFailures}</p>
                    <p><strong>File/Upload Failures:</strong> {result.overviewSummary.fileUploadFailures}</p>
                    <p><strong>API Failures:</strong> {result.overviewSummary.apiFailures}</p>
                    <p><strong>Suspicious Requests:</strong> {result.overviewSummary.suspiciousRequests}</p>
                </div>
            </CardContent>
        </Card>
        
        {result.categorizedLogSummary?.length > 0 && (
          <Card>
            <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>2️⃣ Categorized Log Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.categorizedLogSummary.map((cat, index) => (
                <div key={index}>
                    <h4 className='font-semibold flex items-center gap-2'><Database className='h-5 w-5'/> {cat.category}</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                        {cat.summary.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {result.errorLogExtraction?.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2 text-destructive'>3️⃣ Error Log Extraction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.errorLogExtraction.map((cat, index) => (
                <div key={index}>
                  <h4 className='font-semibold flex items-center gap-2'><AlertCircle className='h-5 w-5'/> {cat.title}</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                      {cat.details.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {result.securityAlerts?.length > 0 && (
            <Card className="border-amber-500">
                <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2 text-amber-600'>4️⃣ Security Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.securityAlerts.map((cat, index) => (
                    <div key={index}>
                      <h4 className='font-semibold flex items-center gap-2'><ShieldCheck className='h-5 w-5'/> {cat.title}</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                          {cat.details.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  ))}
                </CardContent>
            </Card>
        )}

        {result.keyStatistics?.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle className='text-lg flex items-center gap-2'>5️⃣ Key Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Category</TableHead>
                              <TableHead className='text-right'>Count</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {result.keyStatistics.map((stat, index) => (
                              <TableRow key={index}>
                                  <TableCell>{stat.category}</TableCell>
                                  <TableCell className='text-right'>{stat.count}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
        )}

        {result.finalConclusion && (
          <Card>
              <CardHeader>
                  <CardTitle className='text-lg flex items-center gap-2'>6️⃣ Final Conclusion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div>
                      <h4 className="font-semibold">Summary</h4>
                      <p className="text-sm">{result.finalConclusion.summary}</p>
                  </div>
                  <div>
                      <h4 className="font-semibold">Recommendations</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                          {result.finalConclusion.recommendations.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                  </div>
              </CardContent>
          </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle className='text-lg'>Actionable Resolutions</CardTitle>
                <CardDescription>Automate resolution steps and create follow-up tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className='flex items-center gap-4'>
                <Select onValueChange={handleAction} disabled={isActionLoading}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an action..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Create Jira Ticket">Create Jira Ticket</SelectItem>
                        <SelectItem value="Send Email Notification">Send Email Notification</SelectItem>
                        <SelectItem value="Page On-call Engineer">Page On-call Engineer</SelectItem>
                    </SelectContent>
                </Select>
                    {isActionLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                </div>
                
                {actionResult && (
                    <div className="space-y-4 rounded-md border p-4">
                            <h4 className="font-semibold">Action Result</h4>
                            <p className="text-sm text-muted-foreground">{actionResult.actionResult}</p>
                            <h4 className="font-semibold">Follow-up Tasks</h4>
                            <p className="text-sm text-muted-foreground">{actionResult.followUpTasks}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
    )
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
          {isMasking ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Masking sensitive data...</p>
            </div>
          ) : (
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
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDashboard = () => (
    <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{file?.name}</CardTitle>
                    <CardDescription>File has been masked. What would you like to do next?</CardDescription>
                </CardHeader>
                <CardContent className='flex gap-4'>
                    <Button onClick={() => handleAnalysis()} disabled={viewState === 'analyzing'}>
                        {viewState === 'analyzing' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className='mr-2 h-4 w-4' />
                                Analyze
                            </>
                        )}
                    </Button>
                    <Button onClick={downloadMaskedLog} variant="secondary">
                        <FileDown className='mr-2 h-4 w-4'/>
                        Download Masked File
                    </Button>
                </CardContent>
            </Card>

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
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
            <Card className="flex-1">
            <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                AI-powered insights into your log data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {viewState === 'analyzing' && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">AI is thinking...</p>
                </div>
                )}
                {viewState === 'analyzed' && analysisResult && (
                    <ScrollArea className='h-[calc(100vh-20rem)]'>
                        {renderAnalysisResult(analysisResult)}
                    </ScrollArea>
                )}
                {viewState !== 'analyzing' && viewState !== 'analyzed' && (
                    <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground p-12">
                    <Sparkles className="h-10 w-10 mb-4" />
                    <p className="font-medium">Your insights will appear here</p>
                    <p className="text-sm">Click "Analyze" to get started.</p>
                    </div>
                )}
            </CardContent>
            </Card>
        </div>
    </div>
  );


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
          resetState();
          setActiveTab('upload');
        }}>
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">LogInsightsAI</h1>
        </div>
        <nav className="ml-auto flex items-center gap-4">
          <Button
            variant={activeTab === 'upload' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('upload')}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Analyze
          </Button>
          <Button
            variant={activeTab === 'history' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('history')}
          >
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
        </nav>
      </header>

      <main className="flex-1 p-4 md:p-6">
        {activeTab === 'upload' ? (
          viewState === 'upload' ? renderUpload() : renderDashboard()
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Upload History</CardTitle>
              <CardDescription>
                Review your past log analyses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead className='hidden md:table-cell'>Upload Time</TableHead>
                    <TableHead className='hidden sm:table-cell'>Size</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length > 0 ? (
                    history.map(entry => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.filename}</TableCell>
                        <TableCell className='hidden md:table-cell'>{entry.uploadTime}</TableCell>
                        <TableCell className='hidden sm:table-cell'>{entry.fileSize}</TableCell>
                        <TableCell>{renderSeverityBadge(entry.analysis.severityRating)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => viewHistoryEntry(entry)}>
                            View
                            <ChevronRight className='h-4 w-4 ml-2'/>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setEntryToDelete(entry)}>
                            <Trash2 className='h-4 w-4 text-destructive'/>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No history yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
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

      <AlertDialog open={isDuplicate} onOpenChange={setIsDuplicate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Log Detected</AlertDialogTitle>
            <AlertDialogDescription>
              This log file has been analyzed before. Do you want to view the
              existing analysis or perform a new one?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="outline" onClick={useExistingAnalysis}>View Existing</Button>
            <AlertDialogAction onClick={analyzeNew}>Analyze Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              analysis for "{entryToDelete?.filename}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => entryToDelete && handleDeleteHistoryEntry(entryToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!selectedHistory} onOpenChange={() => setSelectedHistory(null)}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedHistory?.filename}</DialogTitle>
              <DialogDescription>
                Analysis from {selectedHistory?.uploadTime}
              </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto">
              <div className='space-y-4'>
                <h3 className='font-semibold'>Analysis Details</h3>
                {selectedHistory?.analysis && renderAnalysisResult(selectedHistory.analysis)}
              </div>
              <div className='space-y-4'>
                <h3 className='font-semibold'>Original Log Content</h3>
                <ScrollArea className="h-96 w-full rounded-md border p-4">
                  <pre className="text-sm font-code whitespace-pre-wrap">
                    <code>{selectedHistory?.content}</code>
                  </pre>
                </ScrollArea>
              </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    