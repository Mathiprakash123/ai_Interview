import { Header } from '@/components/layout/header';
import { InterviewPanel } from '@/components/interview/interview-panel';
import { interviewQuestions } from '@/lib/questions';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <InterviewPanel questions={interviewQuestions} />
    </div>
  );
}
