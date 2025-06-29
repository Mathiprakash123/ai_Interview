
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { InterviewSession } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        if (!db) {
            setIsLoading(false);
            toast({ title: "Error", description: "Could not connect to the database.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
          const q = query(
            collection(db, "interviewSessions"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          const sessions = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const timestamp = data.createdAt?.toDate ? data.createdAt.toDate().getTime() : Date.now();
            return {
              id: doc.id,
              timestamp: timestamp,
              category: data.category,
              difficulty: data.difficulty,
              exchanges: data.exchanges || [],
            } as InterviewSession;
          });
          setHistory(sessions);
        } catch (e) {
          console.error("Could not fetch history from Firestore", e);
          toast({ title: "Error", description: "Could not load interview history.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    }
  }, [user, toast]);

  const clearHistory = async () => {
    if (user && db) {
      setIsClearing(true);
      try {
        const q = query(collection(db, "interviewSessions"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        setHistory([]);
        toast({ title: "Success", description: "Your interview history has been cleared." });
      } catch (e) {
        console.error("Could not clear history from Firestore", e);
        toast({ title: "Error", description: "Could not clear history.", variant: "destructive" });
      } finally {
        setIsClearing(false);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-4">Authenticating...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Loading history...</p>
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
            <Button variant="outline" asChild>
              <Link href="/">Back</Link>
            </Button>
            <h1 className="text-3xl font-bold font-headline">Interview History</h1>
          </div>
          
          {history.length > 0 && (
            <Button variant="destructive" onClick={clearHistory} disabled={isClearing}>
              {isClearing ? 'Clearing...' : 'Clear History'}
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
                        <h3 className="font-semibold font-headline">{session.category} Interview</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-2 mr-4 flex-shrink-0">
                        <Badge variant="secondary">{session.difficulty}</Badge>
                        <Badge variant="outline">{(session.exchanges || []).length} Question{(session.exchanges || []).length !== 1 ? 's' : ''}</Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-6 pt-0">
                    <Accordion type="single" collapsible className="w-full space-y-2">
                      {(session.exchanges || []).map((exchange, index) => {
                        const questionText = typeof exchange.question === 'string'
                          ? exchange.question
                          : (exchange.question as any)?.text;

                        return (
                          <AccordionItem value={`exchange-${session.id}-${index}`} key={`exchange-${session.id}-${index}`} className="border-b-0">
                            <Card className="bg-secondary/50">
                              <AccordionTrigger className="p-4 hover:no-underline text-left">
                                <p className="font-semibold">Q{index + 1}: {questionText || 'Question not available'}</p>
                              </AccordionTrigger>
                              <AccordionContent className="p-4 pt-0">
                                  <div className="space-y-6">
                                    <div>
                                      <h4 className="font-semibold mb-2 font-headline">Your Answer:</h4>
                                      <blockquote className="text-muted-foreground p-4 bg-background rounded-md border-l-4 border-primary">{exchange.answer}</blockquote>
                                    </div>
                                    {exchange.feedback && (
                                      <>
                                        <Separator />
                                        <div>
                                          <h4 className="font-semibold mb-4 font-headline">AI Feedback:</h4>
                                          <div className="space-y-4 text-muted-foreground">
                                            <p><strong>Clarity:</strong> {exchange.feedback.clarity}</p>
                                            <p><strong>Conciseness:</strong> {exchange.feedback.conciseness}</p>
                                            <p><strong>Overall Quality:</strong> {exchange.feedback.overallQuality}</p>
                                            <p><strong>Suggestions:</strong> {exchange.feedback.suggestions}</p>
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                              </AccordionContent>
                            </Card>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
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
