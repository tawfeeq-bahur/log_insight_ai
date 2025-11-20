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
  Lightbulb,
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
import {getSha256, redactSensitiveData} from '@/lib/log-parser';
import {
  performAnalysis,
  performAction,
  checkCache,
} from '@/app/actions';
import type {LogAnalysisResult, LogHistoryEntry} from '@/lib/types';
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

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [redactedContent, setRedactedContent] = useState<string>('');
  const [isRedacted, setIsRedacted] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<LogAnalysisResult | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [history, setHistory] = useState<LogHistoryEntry[]>([]);
  const [view, setView] = useState<'upload' | 'history'>('upload');
  const [selectedHistory, setSelectedHistory] = useState<LogHistoryEntry | null>(null);
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

    const content = await selectedFile.text();
    setFileContent(content);

    const fileHash = await getSha256(content);
    setHash(fileHash);

    const existingEntry = history.find(entry => entry.hash === fileHash);
    if (existingEntry) {
      setIsDuplicate(true);
    } else {
      const redacted = redactSensitiveData(content);
      setRedactedContent(redacted);
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
    setRedactedContent('');
    setIsLoading(false);
    setAnalysisResult(null);
    setHash(null);
    setActionResult(null);
    setCacheCheckResult(null);
  };

  const handleAnalysis = async (forceNew = false) => {
    if (!hash || !redactedContent) return;

    const existingEntry = history.find(entry => entry.hash === hash);
    if (existingEntry && !forceNew) {
      setAnalysisResult(existingEntry.analysis);
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    setActionResult(null);
    setCacheCheckResult(null);

    try {
      const cacheResult = await checkCache({logData: redactedContent, analysisResults: ''});
      setCacheCheckResult(cacheResult.analysisResults || 'No similar logs found in cache.');
      
      const result = await performAnalysis({logContent: redactedContent});
      setAnalysisResult(result);
      
      if (file) {
        const newEntry: LogHistoryEntry = {
          id: new Date().toISOString(),
          filename: file.name,
          uploadTime: new Date().toLocaleString(),
          fileSize: (file.size / 1024).toFixed(2) + ' KB',
          hash,
          analysis: result,
          content: fileContent,
        };
        const updatedHistory = [newEntry, ...history.filter(h => h.hash !== hash)];
        saveHistory(updatedHistory);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'An error occurred during AI analysis. Please try again.',
      });
    } finally {
      setIsLoading(false);
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
      setFileContent(existingEntry.content);
      const redacted = redactSensitiveData(existingEntry.content);
      setRedactedContent(redacted);
    }
    setIsDuplicate(false);
  };

  const analyzeNew = () => {
    if(fileContent) {
        const redacted = redactSensitiveData(fileContent);
        setRedactedContent(redacted);
    }
    setIsDuplicate(false);
    handleAnalysis(true);
  };
  
  const viewHistoryEntry = (entry: LogHistoryEntry) => {
    setSelectedHistory(entry);
  }

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
        return <Badge variant="outline">{severity}</Badge>;
    }
  };
  
  const renderAnalysisResult = (result: LogAnalysisResult) => (
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
                <CardTitle className='text-lg'>Overview Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <p><strong>Total Entries:</strong> {result.overviewSummary.totalEntries}</p>
                    <p><strong>Info Logs:</strong> {result.overviewSummary.infoLogs}</p>
                    <p><strong>Error Logs:</strong> {result.overviewSummary.errorLogs}</p>
                    <p><strong>Security Alerts:</strong> {result.overviewSummary.securityAlerts}</p>
                    <p><strong>DB Failures:</strong> {result.overviewSummary.databaseFailures}</p>
                    <p><strong>Auth Failures:</strong> {result.overviewSummary.authenticationFailures}</p>
                </div>
            </CardContent>
        </Card>
        
        {result.categorizedLogSummary?.map((cat, index) => (
            <Card key={index}>
                <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2'><Database className='h-5 w-5'/> {cat.category}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        {cat.summary.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </CardContent>
            </Card>
        ))}

        {result.errorLogExtraction?.map((cat, index) => (
            <Card key={index} className="border-destructive">
                <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2 text-destructive'><AlertCircle className='h-5 w-5'/> {cat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                         {cat.details.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </CardContent>
            </Card>
        ))}

        {result.securityAlerts?.map((cat, index) => (
            <Card key={index} className="border-amber-500">
                <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2 text-amber-600'><ShieldCheck className='h-5 w-5'/> {cat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        {cat.details.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </CardContent>
            </Card>
        ))}

        <Card>
            <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'><BarChart2 className='h-5 w-5'/> Key Statistics</CardTitle>
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

        <Card>
            <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'><Lightbulb className='h-5 w-5'/> Final Conclusion</CardTitle>
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">LogInsightsAI</h1>
        </div>
        <nav className="ml-auto flex items-center gap-4">
          <Button
            variant={view === 'upload' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('upload')}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Analyze
          </Button>
          <Button
            variant={view === 'history' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('history')}
          >
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
        </nav>
      </header>

      <main className="flex-1 p-4 md:p-6">
        {view === 'upload' ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <Card
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex-1"
              >
                <CardHeader>
                  <CardTitle>Upload Log File</CardTitle>
                  <CardDescription>
                    Drag & drop a file or click to upload (.log, .txt, .json, max 5MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center p-6 pt-0">
                  <div className="w-full rounded-lg border-2 border-dashed border-border p-12">
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
                  </div>
                </CardContent>
              </Card>

              {fileContent && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Log Content</CardTitle>
                        <CardDescription>{file?.name}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="redaction-toggle"
                          checked={isRedacted}
                          onCheckedChange={setIsRedacted}
                        />
                        <Label htmlFor="redaction-toggle">Redact PII</Label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-72 w-full rounded-md border p-4">
                      <pre className="text-sm font-code whitespace-pre-wrap">
                        <code>
                          {isRedacted ? redactedContent : fileContent}
                        </code>
                      </pre>
                    </ScrollArea>
                    {file && (
                      <div className="mt-4 flex justify-end">
                        <Button onClick={() => handleAnalysis()} disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            'Analyze Log'
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="flex flex-col gap-6">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    AI-powered insights into your log data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">AI is thinking...</p>
                    </div>
                  )}
                  {analysisResult && renderAnalysisResult(analysisResult)}
                  {!isLoading && !analysisResult && (
                     <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground p-12">
                       <Sparkles className="h-10 w-10 mb-4" />
                       <p className="font-medium">Your insights will appear here</p>
                       <p className="text-sm">Upload a log file to get started.</p>
                     </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
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
