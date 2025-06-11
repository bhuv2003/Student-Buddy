export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  type:
    | 'text'
    | 'quiz_request'
    | 'quiz_response'
    | 'definition_request'
    | 'definition_response'
    | 'schedule_request'
    | 'schedule_response'
    | 'add_assignment_request'
    | 'assignment_form_response' // Bot sends a form
    | 'assignment_submission' // User submits the form data
    | 'assignment_confirmation' // Bot confirms
    | 'error';
  data?: any; // For structured data like quiz, definition, schedule, assignment form data
  isLoading?: boolean;
}

export interface ScheduleItem {
  id: string;
  time: string;
  subject: string;
  location?: string;
}

export interface Assignment {
  id: string;
  name: string;
  dueDate: Date | undefined;
  completed: boolean;
}

export interface ParsedQuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerLetter?: string;
  isTrueFalse: boolean;
  userAnswer?: string;
}

export interface RawQuiz {
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    type: 'multiple-choice' | 'true-false';
  }>;
}
