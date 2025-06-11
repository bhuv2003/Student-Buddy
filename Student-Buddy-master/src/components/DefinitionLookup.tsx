
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BookOpen, Loader2, Search } from 'lucide-react';
import { defineTerm } from '@/ai/flows/define-term';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const DefinitionLookup: React.FC = () => {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDefineTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) {
      toast({ title: "Error", description: "Please enter a term to define.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setDefinition(null);

    try {
      const result = await defineTerm({ term });
      setDefinition(result.definition);
    } catch (error) {
      console.error('Error defining term:', error);
      toast({ title: "Error", description: "Failed to define term. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Term Definitions
        </CardTitle>
        <CardDescription className="font-body">Enter an academic term or concept to get its definition.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDefineTerm} className="space-y-4 font-body">
          <div>
            <Label htmlFor="term" className="block text-sm font-medium text-foreground mb-1">Term</Label>
            <Input
              id="term"
              type="text"
              placeholder="e.g., Photosynthesis, Stoichiometry, Existentialism"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search size={18} className="mr-2" />}
            Define Term
          </Button>
        </form>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 font-body">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Defining "{term}"...</p>
          </div>
        )}

        {!isLoading && definition && (
          <div className="mt-6 pt-6 border-t font-body">
            <h3 className="font-headline text-2xl mb-2">Definition for <span className="text-primary">{term}</span></h3>
            <ScrollArea className="h-auto max-h-80 p-4 bg-muted/50 rounded-md">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">{definition}</p>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DefinitionLookup;
