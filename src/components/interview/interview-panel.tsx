"use client";

import { useState, useEffect } from 'react';
import type { InterviewQuestion, InterviewExchange } from '@/lib/types';
import { generateQuestion } from '@/ai/flows/generate-question';
import { analyzeAnswerQuality, type AnalyzeAnswerQualityOutput } from '@/ai/flows/analyze-answer-quality';
import { transcribeAnswer } from '@/ai/flows/transcribe-answer';
import { useRecorder } from '@/hooks/use-recorder';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Mic, StopCircle, RefreshCw, Star, BarChart, CheckCircle, Lightbulb, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


type InterviewState = 'setup' | 'generating' | 'ready' | 'recording' | 'transcribing' | 'analyzing' | 'feedback';

const questionCategories: InterviewQuestion['category'][] = ['Behavioral', 'Technical'];
const questionDifficulties: InterviewQuestion['difficulty'][] = ['Easy', 'Medium', 'Hard'];

export function InterviewPanel() {
  const [interviewState, setInterviewState] = useState<InterviewState>('setup');
  const [selectedCategory, setSelectedCategory] = useState<InterviewQuestion['category']>(questionCategories[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewQuestion['difficulty']>(questionDifficulties[0]);
  
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [feedback, setFeedback] = useState<AnalyzeAnswerQualityOutput | null>(null);
  const [currentExchanges, setCurrentExchanges] = useState<InterviewExchange[]>([]);
  
  const { isRecording, startRecording, stopRecording, audioBlob } = useRecorder();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (audioBlob) {
      handleTranscription();
    }
  }, [audioBlob]);

  const handleStartInterview = async () => {
    setInterviewState('generating');
    setCurrentExchanges([]);
    await generateNewQuestion();
  };

  const generateNewQuestion = async () => {
    setInterviewState('generating');
    try {
      const { question: questionText } = await generateQuestion({
        category: selectedCategory,
        difficulty: selectedDifficulty,
        previousExchanges: currentExchanges.map((exchange) => ({
          question: exchange.question.text,
          answer: exchange.answer,
        })),
      });

      const newQuestion: InterviewQuestion = {
        id: new Date().toISOString(),
        text: questionText,
        category: selectedCategory,
        difficulty: selectedDifficulty,
      };

      setCurrentQuestion(newQuestion);
      setInterviewState('ready');
      setTranscribedText('');
      setFeedback(null);
    } catch (error) {
      console.error('Error generating question:', error);
      toast({ title: "Failed to Start Interview", description: "Could not generate a new question.", variant: "destructive" });
      setInterviewState('setup');
    }
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
      
      const newExchange: InterviewExchange = {
        question: currentQuestion,
        answer: answer,
        feedback: result
      };
      setCurrentExchanges(prev => [...prev, newExchange]);

      setInterviewState('feedback');
    } catch (error) {
      console.error('Analysis error:', error);
      toast({ title: "Feedback Analysis Failed", description: "Could not analyze your answer.", variant: "destructive" });
      setInterviewState('ready');
    }
  };

  const handleEndSession = async () => {
    if (user && currentExchanges.length > 0) {
      const sessionToSave = {
          userId: user.uid,
          createdAt: serverTimestamp(),
          category: selectedCategory,
          difficulty: selectedDifficulty,
          exchanges: currentExchanges,
      };
      try {
          await addDoc(collection(db, 'interviewSessions'), sessionToSave);
          toast({ title: "Session Saved!", description: "Your interview has been saved to your history." });
      } catch (e) {
          console.error("Could not save to Firestore", e);
          toast({ title: "Error Saving Session", description: "Your interview session could not be saved.", variant: "destructive" });
      }
    }
  
    setInterviewState('setup');
    setCurrentQuestion(null);
    setTranscribedText('');
    setFeedback(null);
    setCurrentExchanges([]);
  };

  const renderSetup = () => (
    <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                <Bot size={32} />
            </div>
            <CardTitle className="font-headline text-3xl">AInterView Ready</CardTitle>
            <CardDescription>Configure your mock interview session and start practicing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
                        <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {questionCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={selectedDifficulty} onValueChange={(v) => setSelectedDifficulty(v as any)}>
                        <SelectTrigger id="difficulty"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {questionDifficulties.map(diff => <SelectItem key={diff} value={diff}>{diff}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Button size="lg" className="w-full" onClick={handleStartInterview} disabled={interviewState === 'generating'}>
                {interviewState === 'generating' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Mic className="mr-2 h-5 w-5" />}
                Start Interview
            </Button>
        </CardContent>
    </Card>
  );

  const renderInterview = () => {
    if (!currentQuestion) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-16 h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating your first question...</p>
            </div>
        );
    }
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
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
                {(interviewState === 'transcribing' || interviewState === 'analyzing' || interviewState === 'generating') && (
                    <div className="flex items-center text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {interviewState === 'transcribing' ? 'Transcribing your answer...' : interviewState === 'analyzing' ? 'Analyzing feedback...' : 'Generating next question...'}
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
                <div className="flex justify-center gap-4">
                    <Button onClick={generateNewQuestion} disabled={interviewState === 'generating'}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Next Question
                    </Button>
                    <Button variant="outline" onClick={handleEndSession}>
                        End Session
                    </Button>
                </div>
                </>
            )}
        </div>
    );
  };

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8">
        {interviewState === 'setup' ? renderSetup() : renderInterview()}
    </main>
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
