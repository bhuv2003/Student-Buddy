'use server';
/**
 * @fileOverview Defines a Genkit flow to provide definitions for academic terms or concepts.
 *
 * - defineTerm - A function that takes a term as input and returns its definition.
 * - DefineTermInput - The input type for the defineTerm function.
 * - DefineTermOutput - The return type for the defineTerm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DefineTermInputSchema = z.object({
  term: z.string().describe('The term or concept to define.'),
});
export type DefineTermInput = z.infer<typeof DefineTermInputSchema>;

const DefineTermOutputSchema = z.object({
  definition: z.string().describe('The definition of the term.'),
});
export type DefineTermOutput = z.infer<typeof DefineTermOutputSchema>;

export async function defineTerm(input: DefineTermInput): Promise<DefineTermOutput> {
  return defineTermFlow(input);
}

const prompt = ai.definePrompt({
  name: 'defineTermPrompt',
  input: {schema: DefineTermInputSchema},
  output: {schema: DefineTermOutputSchema},
  prompt: `You are an expert academic assistant. Provide a clear and concise definition for the following term:

Term: {{{term}}}`,
});

const defineTermFlow = ai.defineFlow(
  {
    name: 'defineTermFlow',
    inputSchema: DefineTermInputSchema,
    outputSchema: DefineTermOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
