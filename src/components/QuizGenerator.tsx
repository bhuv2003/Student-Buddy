
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, CheckCircle, XCircle, RotateCcw, FileText } from 'lucide-react';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import type { ParsedQuizQuestion } from '@/lib/types';
import { parseQuizText } from '@/lib/quizParser';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';

const MOCK_JSON_QUIZ = [{"type": "multiple_choice", "question": "Which ancient civilization is credited with developing the concept of democracy?", "options": ["Ancient Rome", "Ancient Greece", "Ancient Egypt", "Ancient China"], "answer": "Ancient Greece"}, {"type": "multiple_choice", "question": "What was the primary cause of World War I?", "options": ["Religious conflict", "Economic depression", "Assassination of Archduke Franz Ferdinand", "Territorial disputes in South America"], "answer": "Assassination of Archduke Franz Ferdinand"}, {"type": "multiple_choice", "question": "Which of the following explorers is credited with circumnavigating the globe?", "options": ["Christopher Columbus", "Ferdinand Magellan", "Marco Polo", "Vasco da Gama"], "answer": "Ferdinand Magellan"}, {"type": "true_false", "question": "The Renaissance was a period of renewed interest in classical art and learning that began in Italy.", "answer": "true"}, {"type": "true_false", "question": "The Cold War was a direct military conflict between the United States and the Soviet Union.", "answer": "false"}, {"type": "multiple_choice", "question": "Who was the first Emperor of a unified China?", "options": ["Confucius", "Qin Shi Huang", "Mao Zedong", "Sun Tzu"], "answer": "Qin Shi Huang"}, {"type": "multiple_choice", "question": "The Magna Carta, signed in 1215, primarily limited the power of which European monarch?", "options": ["King of France", "Holy Roman Emperor", "King of England", "King of Spain"], "answer": "King of England"}, {"type": "true_false", "question": "The French Revolution resulted in the immediate establishment of a stable democracy in France.", "answer": "false"}, {"type": "multiple_choice", "question": "Which event is considered the start of the Protestant Reformation?", "options": ["The Council of Trent", "The Act of Supremacy", "Martin Luther's 95 Theses", "The Peace of Westphalia"], "answer": "Martin Luther's 95 Theses"}, {"type": "true_false", "question": "The Industrial Revolution began in the United States.", "answer": "false"}];

const QuizGenerator: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [quiz, setQuiz] = useState<ParsedQuizQuestion[] | null>(null);
  const [rawQuizText, setRawQuizText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const transformJsonQuiz = (jsonData: any[]): ParsedQuizQuestion[] => {
    return jsonData.map((item, index) => {
      const isTrueFalse = item.type === "true_false";
      const options = isTrueFalse ? ["True", "False"] : item.options;
      let correctAnswerLetter: string | undefined = undefined;

      if (item.answer) {
        if (isTrueFalse) {
          correctAnswerLetter = item.answer.toString().toLowerCase() === "true" ? "A" : "B";
        } else {
          const answerIndex = options.findIndex((opt: string) => opt === item.answer);
          if (answerIndex !== -1) {
            correctAnswerLetter = String.fromCharCode(65 + answerIndex);
          }
        }
      }

      return {
        id: `q-json-${index}-${Date.now()}`,
        questionText: item.question,
        options: options,
        correctAnswerLetter: correctAnswerLetter,
        isTrueFalse: isTrueFalse,
      };
    });
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSubject = subject.trim();
    if (!trimmedSubject) {
      toast({ title: "Error", description: "Please enter a subject.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setQuiz(null);
    setRawQuizText(null);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});

    if (trimmedSubject.toLowerCase() === "world history json") {
      try {
        const parsedQuestions = transformJsonQuiz(MOCK_JSON_QUIZ);
        if (parsedQuestions.length > 0) {
          setQuiz(parsedQuestions);
           toast({
            title: "JSON Quiz Loaded",
            description: "The World History JSON quiz has been loaded.",
            variant: "default",
        });
        } else {
          toast({ title: "Error", description: "Failed to parse JSON quiz data.", variant: "destructive" });
        }
      } catch (error) {
        console.error('Error processing JSON quiz:', error);
        toast({ title: "Error", description: "Failed to load or parse JSON quiz data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const result = await generateQuiz({ subject: trimmedSubject });
      setRawQuizText(result.quiz);
      const parsedQuestions = parseQuizText(result.quiz);
      
      if (parsedQuestions.length > 0 && parsedQuestions[0].options.length > 0 && !(parsedQuestions.length === 1 && parsedQuestions[0].questionText.includes("auto-parsing failed"))) {
         setQuiz(parsedQuestions);
      } else {
        setQuiz(null); 
        toast({
            title: "Quiz Generated",
            description: "Quiz content is ready. Auto-parsing to interactive format had limited success, showing raw text.",
            variant: "default",
        });
      }
     
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({ title: "Error", description: "Failed to generate quiz. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers({ ...userAnswers, [questionId]: answer });
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSubject('');
    setQuiz(null);
    setRawQuizText(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
  };
  
  const currentQuestion = quiz?.[currentQuestionIndex];
  let score = 0;
  if (showResults && quiz) {
    quiz.forEach(q => {
      // Find the index of the user's selected option string
      const userAnswerOptionIndex = q.options.findIndex(opt => opt === userAnswers[q.id]);
      
      // Convert correct answer letter (A, B, C...) to 0-based index
      const correctAnswerIndex = q.correctAnswerLetter ? q.correctAnswerLetter.charCodeAt(0) - 'A'.charCodeAt(0) : -1;

      if (userAnswerOptionIndex !== -1 && userAnswerOptionIndex === correctAnswerIndex) {
        score++;
      }
    });
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Quiz Helper
        </CardTitle>
        <CardDescription className="font-body">Generate a quiz on any subject to test your knowledge. Try "World History JSON" for a pre-loaded example.</CardDescription>
      </CardHeader>
      <CardContent>
        {!quiz && !rawQuizText && !isLoading && (
          <form onSubmit={handleGenerateQuiz} className="space-y-4 font-body">
            <div>
              <Label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">Subject</Label>
              <Input
                id="subject"
                type="text"
                placeholder="e.g., World History, Organic Chemistry"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles size={18} className="mr-2" />}
              Generate Quiz
            </Button>
          </form>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 font-body">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Generating your quiz on "{subject}"...</p>
          </div>
        )}

        {(!isLoading && quiz && currentQuestion && !showResults) && (
          <div className="font-body">
            <p className="text-sm text-muted-foreground mb-2">Question {currentQuestionIndex + 1} of {quiz.length}</p>
            <h3 className="text-lg font-semibold mb-4">{currentQuestion.questionText}</h3>
            <RadioGroup
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              value={userAnswers[currentQuestion.id]}
              className="space-y-2"
            >
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-secondary transition-colors">
                  <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${idx}`} />
                  <Label htmlFor={`${currentQuestion.id}-option-${idx}`} className="flex-1 cursor-pointer">{String.fromCharCode(65 + idx)}. {option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
        
        {(!isLoading && !quiz && rawQuizText && !showResults) && (
           <Alert>
             <FileText className="h-4 w-4" />
             <AlertTitle className="font-headline">Quiz Content</AlertTitle>
             <AlertDescription className="font-body">
                <p className="mb-2">Here is the generated quiz content. Automatic parsing to an interactive format was not fully successful.</p>
                <ScrollArea className="h-64 mt-2 p-2 border rounded-md bg-muted/50">
                    <pre className="whitespace-pre-wrap text-sm font-code">{rawQuizText}</pre>
                </ScrollArea>
             </AlertDescription>
           </Alert>
        )}


        {(!isLoading && (quiz || rawQuizText) && showResults) && (
          <div className="font-body">
            <h3 className="font-headline text-2xl mb-4 text-center">Quiz Results</h3>
             {quiz ? (
                <>
                <p className="text-xl text-center mb-6">You scored {score} out of {quiz.length}!</p>
                <ScrollArea className="h-72">
                <div className="space-y-4">
                    {quiz.map((q, idx) => {
                    const userAnswer = userAnswers[q.id];
                    // Find the index of the user's selected option string
                    const userAnswerOptionIndex = q.options.findIndex(opt => opt === userAnswer);
                    // Convert correct answer letter (A, B, C...) to 0-based index
                    const correctAnswerIndex = q.correctAnswerLetter ? q.correctAnswerLetter.charCodeAt(0) - 'A'.charCodeAt(0) : -1;
                    const isCorrect = userAnswerOptionIndex !== -1 && userAnswerOptionIndex === correctAnswerIndex;
                    
                    return (
                        <div key={q.id} className={`p-3 border rounded-md ${isCorrect ? 'border-accent bg-accent/10' : 'border-destructive bg-destructive/10'}`}>
                        <p className="font-semibold">{idx + 1}. {q.questionText}</p>
                        <p className={`text-sm mt-1 ${isCorrect ? 'text-accent-foreground' : 'text-destructive-foreground'}`}>Your answer: {userAnswer || <span className="italic">Not answered</span>}</p>
                        {!isCorrect && q.correctAnswerLetter && q.options[correctAnswerIndex] && (
                            <p className="text-sm text-green-700">Correct answer: {q.options[correctAnswerIndex]}</p>
                        )}
                         {!isCorrect && q.correctAnswerLetter && !q.options[correctAnswerIndex] && (
                            <p className="text-sm text-muted-foreground italic">Note: Correct answer ({q.correctAnswerLetter}) was specified but not found in options. Original answer: {MOCK_JSON_QUIZ.find(mjq => mjq.question === q.questionText)?.answer || 'N/A'}</p>
                        )}
                        {!q.correctAnswerLetter && <p className="text-sm text-muted-foreground italic">Correct answer not specified in parsed data.</p>}
                        </div>
                    );
                    })}
                </div>
                </ScrollArea>
                </>
             ) : (
                <Alert variant="default">
                    <FileText className="h-4 w-4" />
                    <AlertTitle className="font-headline">Quiz Content</AlertTitle>
                    <AlertDescription className="font-body">
                        <p className="mb-2">Review the generated quiz content below:</p>
                        <ScrollArea className="h-64 mt-2 p-2 border rounded-md bg-muted/50">
                             <pre className="whitespace-pre-wrap text-sm font-code">{rawQuizText}</pre>
                        </ScrollArea>
                    </AlertDescription>
                </Alert>
             )}
          </div>
        )}

      </CardContent>
      {(!isLoading && (quiz || rawQuizText)) && (
        <CardFooter className="flex justify-between font-body pt-4 border-t">
          <Button variant="outline" onClick={resetQuiz}>
            <RotateCcw size={16} className="mr-2" /> New Quiz
          </Button>
          {quiz && !showResults && (
            <div className="flex gap-2">
              {currentQuestionIndex < quiz.length - 1 && currentQuestion?.options && currentQuestion.options.length > 0 ? (
                <Button onClick={handleNextQuestion} disabled={!userAnswers[currentQuestion.id]}>Next Question</Button>
              ) : (
                <Button onClick={handleSubmitQuiz} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!userAnswers[currentQuestion.id] || (currentQuestion?.options && currentQuestion.options.length === 0)}>
                  <CheckCircle size={18} className="mr-2" /> Submit Quiz
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default QuizGenerator;

    