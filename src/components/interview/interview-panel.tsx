"use client";

import { useState, useMemo, useEffect } from 'react';
import type { InterviewQuestion, InterviewSession } from '@/lib/types';
import { analyzeAnswerQuality, type AnalyzeAnswerQualityOutput } from '@/ai/flows/analyze-answer-quality';
import { transcribeAnswer } from '@/ai/flows/transcribe-answer';
import { useRecorder } from '@/hooks/use-recorder';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, StopCircle, RefreshCw, Star, BarChart, CheckCircle, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type InterviewState = 'selecting' | 'ready' | 'recording' | 'transcribing' | 'analyzing' | 'feedback';

export function InterviewPanel({ questions }: { questions: InterviewQuestion[] }) {
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [interviewState, setInterviewState] = useState<InterviewState>('selecting');
  const [transcribedText, setTranscribedText] = useState('');
  const [feedback, setFeedback] = useState<AnalyzeAnswerQualityOutput | null>(null);
  
  const { isRecording, startRecording, stopRecording, audioBlob } = useRecorder();
  const { toast } = useToast();

  const questionCategories = useMemo(() => [...new Set(questions.map(q => q.category))], [questions]);
  const questionDifficulties = ['Easy', 'Medium', 'Hard'];
  const [selectedCategory, setSelectedCategory] = useState<string>(questionCategories[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(questionDifficulties[0]);
  
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => q.category === selectedCategory && q.difficulty === selectedDifficulty);
  }, [questions, selectedCategory, selectedDifficulty]);

  useEffect(() => {
    if (audioBlob) {
      handleTranscription();
    }
  }, [audioBlob]);

  const handleSelectQuestion = (question: InterviewQuestion) => {
    setCurrentQuestion(question);
    setInterviewState('ready');
    setTranscribedText('');
    setFeedback(null);
  };

  const handleStartRecording = () => {
    startRecording();
    setInterviewState('recording');
  };

  const handleStopRecording = () => {
    stopRecording();
    setInterviewState('transcribing');
  };

  const handleTranscription = async () => {
    if (!audioBlob) return;
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const { transcription } = await transcribeAnswer({ audioDataUri: base64Audio });
        setTranscribedText(transcription);
        setInterviewState('analyzing');
        handleAnalysis(transcription);
      };
    } catch (error) {
      console.error('Transcription error:', error);
      toast({ title: "Transcription Failed", description: "Could not transcribe audio.", variant: "destructive" });
      setInterviewState('ready');
    }
  };
  
  const handleAnalysis = async (answer: string) => {
    if (!currentQuestion) return;
    try {
      const result = await analyzeAnswerQuality({ question: currentQuestion.text, answer });
      setFeedback(result);
      setInterviewState('feedback');
      saveSessionToHistory(answer, result);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({ title: "Feedback Analysis Failed", description: "Could not analyze your answer.", variant: "destructive" });
      setInterviewState('ready');
    }
  };

  const saveSessionToHistory = (answer: string, feedback: AnalyzeAnswerQualityOutput) => {
    if (!currentQuestion) return;
    const newSession: InterviewSession = {
      id: new Date().toISOString(),
      question: currentQuestion,
      answer,
      feedback,
      timestamp: Date.now(),
    };
    try {
        const history = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
        history.unshift(newSession);
        localStorage.setItem('interviewHistory', JSON.stringify(history.slice(0, 20))); // Limit history size
    } catch (e) {
        console.error("Could not save to localStorage", e)
    }
  };

  const resetInterview = () => {
    setCurrentQuestion(null);
    setInterviewState('selecting');
    setTranscribedText('');
    setFeedback(null);
  };

  const renderContent = () => {
    if (interviewState === 'selecting' || !currentQuestion) {
      return (
        <Card className="flex flex-col items-center justify-center text-center p-16 h-[50vh]">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Welcome to AInterView</CardTitle>
                <CardDescription>Select a question from the sidebar to start your practice session.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-primary" data-ai-hint="interview team">
                    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
            </CardContent>
        </Card>
      );
    }
    return (
        <div className="space-y-8">
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="font-headline text-2xl">{currentQuestion.text}</CardTitle>
            <CardDescription className="pt-2">
                <Badge variant="secondary">{currentQuestion.category}</Badge>
                <Badge variant="secondary" className="ml-2">{currentQuestion.difficulty}</Badge>
            </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 min-h-[120px]">
            {interviewState === 'ready' && (
                <Button size="lg" onClick={handleStartRecording}>
                <Mic className="mr-2 h-5 w-5" /> Record Answer
                </Button>
            )}
            {interviewState === 'recording' && (
                <Button size="lg" variant="destructive" onClick={handleStopRecording} className="animate-pulse">
                <StopCircle className="mr-2 h-5 w-5" /> Stop Recording
                </Button>
            )}
            {(interviewState === 'transcribing' || interviewState === 'analyzing') && (
                <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {interviewState === 'transcribing' ? 'Transcribing your answer...' : 'Analyzing feedback...'}
                </div>
            )}
            </CardContent>
        </Card>

        {transcribedText && (
            <Card>
            <CardHeader>
                <CardTitle>Your Answer</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-muted-foreground">
                <p>{transcribedText}</p>
            </CardContent>
            </Card>
        )}

        {feedback && interviewState === 'feedback' && (
            <>
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center font-headline"><Star className="mr-2 text-yellow-400 fill-yellow-400"/> AI Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                <FeedbackItem icon={<CheckCircle className="text-green-500" />} title="Clarity" content={feedback.clarity} />
                <FeedbackItem icon={<BarChart className="text-primary" />} title="Conciseness" content={feedback.conciseness} />
                <FeedbackItem icon={<Star className="text-yellow-500" />} title="Overall Quality" content={feedback.overallQuality} />
                <FeedbackItem icon={<Lightbulb className="text-accent" />} title="Suggestions" content={feedback.suggestions} />
                </CardContent>
            </Card>
            <div className="text-center">
                <Button onClick={resetInterview}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Practice Another Question
                </Button>
            </div>
            </>
        )}
        </div>
    );
  };

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarContent className="p-0">
          <SidebarGroup className="p-2">
            <SidebarGroupLabel>Category</SidebarGroupLabel>
            <SidebarMenu>
              {questionCategories.map(category => (
                <SidebarMenuItem key={category}>
                  <SidebarMenuButton onClick={() => setSelectedCategory(category)} isActive={selectedCategory === category}>{category}</SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator/>
          <SidebarGroup className="p-2">
            <SidebarGroupLabel>Difficulty</SidebarGroupLabel>
            <SidebarMenu>
              {questionDifficulties.map(difficulty => (
                <SidebarMenuItem key={difficulty}>
                  <SidebarMenuButton onClick={() => setSelectedDifficulty(difficulty)} isActive={selectedDifficulty === difficulty}>{difficulty}</SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator/>
           <SidebarGroup className="p-2 flex-1 min-h-0">
            <SidebarGroupLabel>Questions</SidebarGroupLabel>
            <SidebarMenu className="overflow-y-auto h-full">
              {filteredQuestions.map(q => (
                <SidebarMenuItem key={q.id}>
                    <SidebarMenuButton onClick={() => handleSelectQuestion(q)} isActive={currentQuestion?.id === q.id} size="sm" className="h-auto py-2 text-left">
                        <span className="whitespace-normal">{q.text}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {filteredQuestions.length === 0 && <p className="p-2 text-sm text-muted-foreground">No questions found.</p>}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <div className="container mx-auto p-4 md:p-8">
            {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

const FeedbackItem = ({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-secondary">{icon}</div>
        <div>
            <h4 className="font-semibold font-headline text-lg">{title}</h4>
            <p className="text-muted-foreground mt-1">{content}</p>
        </div>
    </div>
);
