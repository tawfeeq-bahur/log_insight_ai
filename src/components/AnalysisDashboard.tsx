
'use client';

import type { AnalysisResult } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Database,
  ShieldCheck,
  CreditCard,
  FileUp,
  Plug,
  User,
  KeyRound,
  AlertTriangle,
  ServerCrash,
  FileTerminal,
  BarChart,
  CheckCircle,
  BrainCircuit,
  Lightbulb,
} from 'lucide-react';

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

const OverviewCard = ({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const CategorySection = ({ title, items, icon: Icon }: { title: string; items: string[]; icon: React.ElementType }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex items-start gap-4">
      <div className="bg-primary/10 text-primary p-2 rounded-full">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground space-y-1">
          {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
};


export default function AnalysisDashboard({ result }: AnalysisDashboardProps) {
  const { overviewSummary, categorizedLogSummary, errorLogExtraction, securityAlerts, keyStatistics, finalConclusion } = result;

  return (
    <ScrollArea className="h-full">
      <div className="p-1 space-y-6">
        {/* Overview Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart className="h-6 w-6" />
              <CardTitle>1️⃣ Overview Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <OverviewCard title="Total Entries" value={overviewSummary.totalEntries} icon={FileTerminal} />
            <OverviewCard title="Info Logs" value={overviewSummary.infoLogs} icon={CheckCircle} />
            <OverviewCard title="Error Logs" value={overviewSummary.errorLogs} icon={AlertTriangle} />
            <OverviewCard title="Security Alerts" value={overviewSummary.securityAlerts} icon={ShieldCheck} />
            <OverviewCard title="DB Failures" value={overviewSummary.dbFailures} icon={Database} />
            <OverviewCard title="Payment Failures" value={overviewSummary.paymentFailures} icon={CreditCard} />
            <OverviewCard title="Auth Failures" value={overviewSummary.authFailures} icon={KeyRound} />
            <OverviewCard title="File Upload Failures" value={overviewSummary.fileUploadFailures} icon={FileUp} />
            <OverviewCard title="API Failures" value={overviewSummary.apiFailures} icon={Plug} />
            <OverviewCard title="Suspicious Requests" value={overviewSummary.suspiciousRequests} icon={User} />
          </CardContent>
        </Card>
        
        {/* Categorized Log Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-6 w-6" />
              <CardTitle>2️⃣ Categorized Log Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <CategorySection title="Authentication" items={categorizedLogSummary.authenticationAndAuthorization} icon={KeyRound} />
            <CategorySection title="Database" items={categorizedLogSummary.database} icon={Database} />
            <CategorySection title="Payments" items={categorizedLogSummary.payments} icon={CreditCard} />
            <CategorySection title="API" items={categorizedLogSummary.api} icon={Plug} />
            <CategorySection title="File Upload" items={categorizedLogSummary.fileUpload} icon={FileUp} />
            <CategorySection title="Security" items={categorizedLogSummary.security} icon={ShieldCheck} />
            <CategorySection title="User Actions" items={categorizedLogSummary.userActions} icon={User} />
          </CardContent>
        </Card>

        {/* Error Log Extraction */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <ServerCrash className="h-6 w-6 text-destructive" />
              <CardTitle>3️⃣ Error Log Extraction</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {errorLogExtraction.map((error, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <div className='flex items-center gap-2'>
                        <Badge variant={error.severity === 'Critical' ? 'destructive' : 'secondary'}>{error.severity}</Badge>
                        <span className='font-semibold'>{error.service}</span> - <span className='text-sm text-muted-foreground truncate'>{error.message}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='font-code text-xs bg-muted/50 p-4 rounded-md'>
                    {error.details}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-accent" />
              <CardTitle>4️⃣ Security Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityAlerts.map((alert, index) => (
              <Card key={index} className='bg-accent/10'>
                <CardHeader>
                  <CardTitle className='text-base'>{alert.alertType}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">Description:</p>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  <p className="text-sm font-medium">Recommendation:</p>
                  <p className="text-sm text-muted-foreground">{alert.recommendation}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Key Statistics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart className="h-6 w-6" />
              <CardTitle>5️⃣ Key Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-4'>
             <div className='flex justify-between items-center p-3 rounded-lg bg-muted/50'>
                <span className='font-medium text-sm'>Requests Processed</span>
                <span className='font-bold text-lg'>{keyStatistics.requestsProcessed}</span>
             </div>
             <div className='flex justify-between items-center p-3 rounded-lg bg-muted/50'>
                <span className='font-medium text-sm'>Successful Actions</span>
                <span className='font-bold text-lg'>{keyStatistics.successfulActions}</span>
             </div>
             <div className='flex justify-between items-center p-3 rounded-lg bg-muted/50'>
                <span className='font-medium text-sm'>Errors</span>
                <span className='font-bold text-lg text-destructive'>{keyStatistics.errors}</span>
             </div>
             <div className='flex justify-between items-center p-3 rounded-lg bg-muted/50'>
                <span className='font-medium text-sm'>Critical Errors</span>
                <span className='font-bold text-lg text-destructive'>{keyStatistics.criticalErrors}</span>
             </div>
             <div className='flex justify-between items-center p-3 rounded-lg bg-muted/50 col-span-2'>
                <span className='font-medium text-sm'>Security Alerts</span>
                <span className='font-bold text-lg text-accent'>{keyStatistics.securityAlerts}</span>
             </div>
          </CardContent>
        </Card>

        {/* Final Conclusion */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-primary" />
              <CardTitle>6️⃣ Final Conclusion</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground mb-4'>{finalConclusion.summary}</p>
            <h4 className='font-semibold mb-2'>Recommendations:</h4>
            <ul className='list-disc pl-5 text-sm space-y-1'>
                {finalConclusion.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
