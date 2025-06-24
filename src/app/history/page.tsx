"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { InterviewSession } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function HistoryPage() {
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
        const storedHistory = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
        setHistory(storedHistory);
    } catch (e) {
        console.error("Could not parse history from localStorage", e);
        setHistory([]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const clearHistory = () => {
    try {
        localStorage.removeItem('interviewHistory');
        setHistory([]);
    } catch (e) {
        console.error("Could not clear history from localStorage", e);
    }
  };

  if (isLoading) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-1 flex items-center justify-center">
                <p>Loading history...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/"><ArrowLeft/></Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Interview History</h1>
            </div>
          
          {history.length > 0 && (
            <Button variant="destructive" onClick={clearHistory}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear History
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <Card className="text-center py-16">
            <CardHeader>
                <CardTitle className="font-headline">No History Found</CardTitle>
                <CardDescription>You haven't completed any interviews yet. Go back to the main page to start one!</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/">Start an Interview</Link>
                </Button>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {history.map((session) => (
              <AccordionItem value={session.id} key={session.id} className="border-b-0">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <AccordionTrigger className="p-6 hover:no-underline">
                    <div className="flex justify-between items-center w-full">
                        <div className="text-left">
                            <h3 className="font-semibold font-headline">{session.question.text}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                        <div className="flex gap-2 mr-4 flex-shrink-0">
                            <Badge variant="secondary">{session.question.category}</Badge>
                            <Badge variant="secondary">{session.question.difficulty}</Badge>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-6 pt-0">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2 font-headline">Your Answer:</h4>
                        <blockquote className="text-muted-foreground p-4 bg-secondary rounded-md border-l-4 border-primary">{session.answer}</blockquote>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-4 font-headline">AI Feedback:</h4>
                        <div className="space-y-4 text-muted-foreground">
                          <p><strong>Clarity:</strong> {session.feedback.clarity}</p>
                          <p><strong>Conciseness:</strong> {session.feedback.conciseness}</p>
                          <p><strong>Overall Quality:</strong> {session.feedback.overallQuality}</p>
                          <p><strong>Suggestions:</strong> {session.feedback.suggestions}</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </main>
    </div>
  );
}
