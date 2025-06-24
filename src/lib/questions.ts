import type { InterviewQuestion } from './types';

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: '1',
    category: 'Behavioral',
    difficulty: 'Easy',
    text: 'Tell me about yourself.',
  },
  {
    id: '2',
    category: 'Behavioral',
    difficulty: 'Easy',
    text: 'What are your strengths and weaknesses?',
  },
  {
    id: '3',
    category: 'Behavioral',
    difficulty: 'Medium',
    text: 'Describe a challenging situation you faced at work and how you handled it.',
  },
  {
    id: '4',
    category: 'Behavioral',
    difficulty: 'Medium',
    text: 'Where do you see yourself in 5 years?',
  },
  {
    id: '5',
    category: 'Behavioral',
    difficulty: 'Hard',
    text: 'How do you handle conflict with a coworker?',
  },
  {
    id: '6',
    category: 'Technical',
    difficulty: 'Easy',
    text: 'What is the difference between `let`, `const`, and `var` in JavaScript?',
  },
  {
    id: '7',
    category: 'Technical',
    difficulty: 'Medium',
    text: 'Explain the concept of "this" in JavaScript.',
  },
  {
    id: '8',
    category: 'Technical',
    difficulty: 'Medium',
    text: 'What are promises and how do they work?',
  },
  {
    id: '9',
    category: 'Technical',
    difficulty: 'Hard',
    text: 'Explain the event loop in Node.js.',
  },
  {
    id: '10',
    category: 'Technical',
    difficulty: 'Hard',
    text: 'What is a closure in JavaScript? Provide an example.',
  },
];
