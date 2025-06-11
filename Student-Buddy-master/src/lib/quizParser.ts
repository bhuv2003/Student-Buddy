import type { ParsedQuizQuestion } from './types';

// This is a very basic parser and might need significant improvements
// based on the actual output format from the AI.
export function parseQuizText(text: string): ParsedQuizQuestion[] {
  const questions: ParsedQuizQuestion[] = [];
  if (!text || typeof text !== 'string') return questions;

  // Attempt to split by common question delimiters like "Question X:", "X."
  const questionBlocks = text.split(/\n(?:Question\s*\d+\s*:|\d+\.\s*)/g).filter(block => block.trim() !== "");

  questionBlocks.forEach((block, index) => {
    const lines = block.trim().split('\n');
    if (lines.length === 0) return;

    let questionText = "";
    const options: string[] = [];
    let correctAnswerLetter: string | undefined = undefined;

    // First line is usually the question
    questionText = lines[0].trim();
    let optionParsing = true;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Try to parse options (e.g., "A. Option Text", "a) Option Text")
      const optionMatch = line.match(/^([A-Da-d][\.\)])\s*(.*)/);
      if (optionMatch && optionParsing) {
        options.push(optionMatch[2].trim());
      } else {
        // If it's not an option, it might be the answer or fluff, stop parsing options
        optionParsing = false;
        // Try to parse correct answer (e.g., "Correct Answer: B", "Answer: B)")
        const answerMatch = line.match(/(?:Correct Answer|Answer)\s*[:\-]?\s*([A-Da-d])/i);
        if (answerMatch) {
          correctAnswerLetter = answerMatch[1].toUpperCase();
        }
      }
    }
    
    // If no question text was found from the first line, this block might be problematic
    if (!questionText && lines.length > 0) {
        questionText = lines.join(' ').trim(); // Fallback: consider the whole block as question if options/answer not found
    }


    const isTrueFalse = options.length === 2 && 
                        options.some(opt => opt.toLowerCase().includes('true')) &&
                        options.some(opt => opt.toLowerCase().includes('false'));

    if (questionText) {
      questions.push({
        id: `q-${index}-${Date.now()}`,
        questionText,
        options,
        correctAnswerLetter,
        isTrueFalse,
      });
    }
  });
  
  // If no questions were parsed using the primary method, treat the whole text as a single question's content
  if (questions.length === 0 && text.trim()) {
    questions.push({
      id: `q-fallback-${Date.now()}`,
      questionText: `Quiz content (auto-parsing failed, showing raw content):\n\n${text.trim()}`,
      options: [],
      isTrueFalse: false,
    });
  }

  return questions;
}
