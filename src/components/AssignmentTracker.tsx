
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { ListChecks, PlusCircle, Trash2, Edit3, Loader2 } from 'lucide-react';
import type { Assignment } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAssignments } from '@/contexts/AssignmentContext';
import { Skeleton } from '@/components/ui/skeleton';

const AssignmentTracker: React.FC = () => {
  const { 
    assignments, 
    addAssignment: contextAddAssignment, 
    toggleComplete: contextToggleComplete, 
    deleteAssignment: contextDeleteAssignment, 
    updateAssignment: contextUpdateAssignment,
    isLoaded 
  } = useAssignments();

  const [newAssignmentName, setNewAssignmentName] = useState('');
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState<Date | undefined>();
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const { toast } = useToast();

  const handleAddOrUpdateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentName.trim()) {
      toast({ title: "Error", description: "Assignment name cannot be empty.", variant: "destructive" });
      return;
    }

    if (editingAssignment) {
      contextUpdateAssignment({
        ...editingAssignment,
        name: newAssignmentName.trim(),
        dueDate: newAssignmentDueDate,
      });
      toast({ title: "Assignment Updated", description: `"${newAssignmentName.trim()}" has been updated.` });
      setEditingAssignment(null);
    } else {
      contextAddAssignment({
        name: newAssignmentName.trim(),
        dueDate: newAssignmentDueDate,
      });
      toast({ title: "Assignment Added", description: `"${newAssignmentName.trim()}" has been added.` });
    }

    setNewAssignmentName('');
    setNewAssignmentDueDate(undefined);
  };

  const handleDeleteAssignment = (id: string) => {
    const assignmentToDelete = assignments.find(a => a.id === id);
    contextDeleteAssignment(id);
    if (assignmentToDelete) {
      toast({ title: "Assignment Deleted", description: `"${assignmentToDelete.name}" has been deleted.`, variant: "destructive" });
    }
  };
  
  const startEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setNewAssignmentName(assignment.name);
    setNewAssignmentDueDate(assignment.dueDate);
  };

  const upcomingAssignments = assignments.filter(a => !a.completed).sort((a, b) => {
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return dateA - dateB;
  });
  const completedAssignments = assignments.filter(a => a.completed);

  if (!isLoaded) {
    return (
      <div className="space-y-8">
        <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
          <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <ListChecks className="h-8 w-8 text-primary" />
            Assignment Tracker
          </CardTitle>
          <CardDescription className="font-body">
            {editingAssignment ? `Editing "${editingAssignment.name}"` : "Add a new assignment to your list."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddOrUpdateAssignment} className="space-y-4 font-body">
            <div>
              <label htmlFor="assignmentName" className="block text-sm font-medium text-foreground mb-1">
                Assignment Name
              </label>
              <Input
                id="assignmentName"
                type="text"
                placeholder="e.g., Math Homework Chapter 3"
                value={newAssignmentName}
                onChange={(e) => setNewAssignmentName(e.target.value)}
                required
                className="font-body"
              />
            </div>
            <div>
              <label htmlFor="assignmentDueDate" className="block text-sm font-medium text-foreground mb-1">
                Due Date (Optional)
              </label>
              <DatePicker date={newAssignmentDueDate} setDate={setNewAssignmentDueDate} buttonClassName="w-full justify-start font-normal font-body" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="w-full font-body">
                <PlusCircle size={18} className="mr-2" />
                {editingAssignment ? 'Update Assignment' : 'Add Assignment'}
              </Button>
              {editingAssignment && (
                <Button variant="outline" onClick={() => { setEditingAssignment(null); setNewAssignmentName(''); setNewAssignmentDueDate(undefined); }} className="w-full font-body">
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {assignments.length > 0 && (
        <div className="space-y-6">
          {upcomingAssignments.length > 0 && (
            <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Upcoming Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {upcomingAssignments.map((assignment) => (
                    <AssignmentItemComponent 
                      key={assignment.id} 
                      assignment={assignment} 
                      onToggleComplete={contextToggleComplete}
                      onDelete={handleDeleteAssignment}
                      onEdit={startEdit}
                    />
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {completedAssignments.length > 0 && (
            <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg opacity-70">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Completed Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                 <ul className="space-y-3">
                  {completedAssignments.map((assignment) => (
                     <AssignmentItemComponent 
                      key={assignment.id} 
                      assignment={assignment} 
                      onToggleComplete={contextToggleComplete}
                      onDelete={handleDeleteAssignment}
                      onEdit={startEdit}
                    />
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

interface AssignmentItemProps {
  assignment: Assignment;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (assignment: Assignment) => void;
}

const AssignmentItemComponent: React.FC<AssignmentItemProps> = ({ assignment, onToggleComplete, onDelete, onEdit }) => {
  return (
    <li className={`p-3 border rounded-md flex items-center justify-between transition-all ${assignment.completed ? 'bg-muted line-through' : 'bg-card hover:shadow-md'}`}>
      <div className="flex items-center gap-3">
        <Checkbox
          id={`assign-${assignment.id}`}
          checked={assignment.completed}
          onCheckedChange={() => onToggleComplete(assignment.id)}
          aria-label={assignment.completed ? "Mark as incomplete" : "Mark as complete"}
        />
        <div>
          <label htmlFor={`assign-${assignment.id}`} className={`font-medium font-body cursor-pointer ${assignment.completed ? 'text-muted-foreground' : 'text-foreground'}`}>
            {assignment.name}
          </label>
          {assignment.dueDate && (
            <p className={`text-xs font-body ${
              assignment.completed
                ? 'text-muted-foreground'
                : new Date(assignment.dueDate) < new Date() 
                  ? 'text-destructive' 
                  : 'text-accent-foreground' 
            }`}>
              Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
              {!assignment.completed && new Date(assignment.dueDate) < new Date() && <span className="font-semibold"> (Overdue)</span>}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {!assignment.completed && (
          <Button variant="ghost" size="icon" onClick={() => onEdit(assignment)} aria-label="Edit assignment">
            <Edit3 size={16} />
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" aria-label="Delete assignment">
              <Trash2 size={16} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="font-body">
                This action cannot be undone. This will permanently delete the assignment "{assignment.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(assignment.id)} className="bg-destructive hover:bg-destructive/90 font-body">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
};

export default AssignmentTracker;
