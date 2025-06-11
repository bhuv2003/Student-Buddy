
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import type { Message, ScheduleItem, Assignment } from '@/lib/types';
import { defineTerm } from '@/ai/flows/define-term';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import { useAssignments } from '@/contexts/AssignmentContext';

// Mock data for schedule
const MOCK_SCHEDULE: ScheduleItem[] = [
  { id: '1', time: '09:00 AM - 10:30 AM', subject: 'Calculus I', location: 'Room 301' },
  { id: '2', time: '11:00 AM - 12:30 PM', subject: 'Physics Mechanics', location: 'Lab A' },
  { id: '3', time: '02:00 PM - 03:30 PM', subject: 'Intro to Programming', location: 'CS Hub' },
];

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addAssignment: contextAddAssignment } = useAssignments(); // Use context
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);
  
  useEffect(() => {
    setMessages([
      {
        id: 'initial-bot-message',
        sender: 'bot',
        type: 'text',
        text: "Hello! I'm Student Buddy, your student assistant. How can I help you today? You can ask me to define terms, quiz you on a subject, show your schedule, or add an assignment.",
      }
    ]);
  }, []);


  const addMessageToChat = (message: Message, replaceLoadingId?: string) => {
    setMessages(prevMessages => {
      if (replaceLoadingId) {
        return prevMessages.map(m => m.id === replaceLoadingId ? message : m);
      }
      return [...prevMessages, message];
    });
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      sender: 'user',
      text: inputValue,
      type: 'text', 
    };
    addMessageToChat(userMessage);
    setInputValue('');
    setIsLoading(true);

    const botLoadingMessageId = `bot-loading-${Date.now()}`;
    addMessageToChat({
      id: botLoadingMessageId,
      sender: 'bot',
      type: 'text',
      isLoading: true,
    });

    try {
      const lowerCaseInput = inputValue.toLowerCase();
      let botResponse: Message | null = null;

      if (lowerCaseInput.includes('schedule') || lowerCaseInput.includes('what\'s my schedule')) {
        userMessage.type = 'schedule_request';
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          type: 'schedule_response',
          data: MOCK_SCHEDULE,
        };
      } else if (lowerCaseInput.startsWith('add assignment')) {
        userMessage.type = 'add_assignment_request';
        const assignmentName = inputValue.substring('add assignment'.length).trim();
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          type: 'assignment_form_response',
          data: { defaultName: assignmentName || '' },
        };
      } else if (lowerCaseInput.startsWith('define ')) {
        userMessage.type = 'definition_request';
        const termToDefine = inputValue.substring('define '.length).trim();
        if (termToDefine) {
          const definitionResult = await defineTerm({ term: termToDefine });
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            type: 'definition_response',
            text: definitionResult.definition,
          };
        } else {
           botResponse = { id: `bot-${Date.now()}`, sender: 'bot', type: 'error', text: 'Please provide a term to define.' };
        }
      } else if (lowerCaseInput.startsWith('quiz me on ')) {
        userMessage.type = 'quiz_request';
        const subject = inputValue.substring('quiz me on '.length).trim();
         if (subject) {
          const quizResult = await generateQuiz({ subject });
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            type: 'quiz_response',
            data: { rawQuizText: quizResult.quiz },
          };
        } else {
          botResponse = { id: `bot-${Date.now()}`, sender: 'bot', type: 'error', text: 'Please provide a subject for the quiz.' };
        }
      } else {
        // Fallback for general queries - try to define it if it's not a command
        if (!lowerCaseInput.includes("what") && !lowerCaseInput.includes("how") && !lowerCaseInput.includes("who") && inputValue.trim().split(" ").length <=5 ) {
            const termToDefine = inputValue.trim();
             try {
                const definitionResult = await defineTerm({ term: termToDefine });
                botResponse = {
                    id: `bot-${Date.now()}`,
                    sender: 'bot',
                    type: 'definition_response',
                    text: definitionResult.definition,
                };
             } catch (e) {
                 // If defineTerm fails, use the generic unknown help response
                 botResponse = {
                    id: `bot-${Date.now()}`,
                    sender: 'bot',
                    type: 'text',
                    text: "I'm not sure how to help with that. Try asking me to 'define [term]', 'quiz me on [subject]', 'show my schedule', or 'add assignment'.",
                 };
             }
        } else {
            botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            type: 'text',
            text: "I'm not sure how to help with that. Try asking me to 'define [term]', 'quiz me on [subject]', 'show my schedule', or 'add assignment'.",
            };
        }
      }
      
      if (botResponse) {
        addMessageToChat(botResponse, botLoadingMessageId);
      } else {
        setMessages(prev => prev.filter(m => m.id !== botLoadingMessageId));
      }

    } catch (error) {
      console.error('Error processing message:', error);
      const errorResponseMessage: Message = {
        id: `bot-error-${Date.now()}`,
        sender: 'bot',
        type: 'error',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      addMessageToChat(errorResponseMessage, botLoadingMessageId);
      toast({
        title: "Error",
        description: "Could not process your request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInlineAssignmentSubmit = (name: string, dueDate?: Date) => {
    contextAddAssignment({ // Use context function
      name,
      dueDate,
    });
    const confirmationMessage: Message = {
      id: `bot-confirm-${Date.now()}`,
      sender: 'bot',
      type: 'assignment_confirmation',
      text: `Assignment "${name}" ${dueDate ? `due ${format(dueDate, 'PPP')}` : ''} has been added. You can view all assignments on the Assignments page.`,
    };
    addMessageToChat(confirmationMessage);
    toast({
      title: "Assignment Added",
      description: `${name} has been added to your assignments.`,
    });
  };

  return (
    <Card className="w-full h-[calc(100vh-100px)] md:h-[calc(100vh-120px)] flex flex-col shadow-xl rounded-lg">
      <CardHeader className="border-b">
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Bot /> Student Buddy
        </CardTitle>
        <CardDescription className="font-body">Your personal academic assistant.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot size={20} /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-3 shadow ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  }`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : msg.type === 'schedule_response' && msg.data ? (
                    <div>
                      <p className="font-semibold mb-2 font-body">Here is your schedule for today:</p>
                      <ul className="space-y-1 font-body">
                        {(msg.data as ScheduleItem[]).map(item => (
                          <li key={item.id} className="text-sm p-2 bg-secondary rounded-md">
                            <strong>{item.time}</strong> - {item.subject} {item.location && `(${item.location})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : msg.type === 'assignment_form_response' && msg.data ? (
                    <InlineAssignmentForm defaultName={msg.data.defaultName} onSubmit={handleInlineAssignmentSubmit} />
                  ) : msg.type === 'quiz_response' && msg.data?.rawQuizText ? (
                     <div>
                      <p className="font-semibold mb-2 font-body">Here's your quiz:</p>
                      <pre className="whitespace-pre-wrap bg-secondary p-2 rounded-md text-sm font-code">{msg.data.rawQuizText}</pre>
                    </div>
                  ) : (
                    <p className="font-body whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
                {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User size={20} /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="font-body"
          />
          <Button onClick={handleSendMessage} disabled={isLoading || inputValue.trim() === ''}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

interface InlineAssignmentFormProps {
  defaultName?: string;
  onSubmit: (name: string, dueDate?: Date) => void;
}

const InlineAssignmentForm: React.FC<InlineAssignmentFormProps> = ({ defaultName, onSubmit }) => {
  const [name, setName] = useState(defaultName || '');
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), dueDate);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-body">
      <p className="font-semibold">Add a new assignment:</p>
      <div>
        <label htmlFor="inlineAssignmentName" className="text-sm font-medium">Name</label>
        <Input 
          id="inlineAssignmentName" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Assignment name"
          required 
          className="mt-1 bg-background"
        />
      </div>
      <div>
        <label htmlFor="inlineAssignmentDueDate" className="text-sm font-medium">Due Date (Optional)</label>
        <DatePicker date={dueDate} setDate={setDueDate} buttonClassName="w-full mt-1 justify-start font-normal bg-background" />
      </div>
      <Button type="submit" size="sm" className="w-full">Add Assignment</Button>
    </form>
  );
};


export default ChatWindow;
