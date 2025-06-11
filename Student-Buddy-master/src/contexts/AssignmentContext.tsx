
'use client';

import type { Assignment } from '@/lib/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface AssignmentContextType {
  assignments: Assignment[];
  addAssignment: (newAssignmentData: Omit<Assignment, 'id' | 'completed'>) => void;
  toggleComplete: (id: string) => void;
  deleteAssignment: (id: string) => void;
  updateAssignment: (updatedAssignment: Assignment) => void;
  isLoaded: boolean;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'assignmentsAppData';

export const AssignmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedAssignments = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedAssignments) {
        const parsedAssignments = JSON.parse(storedAssignments).map((a: any) => ({
          ...a,
          dueDate: a.dueDate ? new Date(a.dueDate) : undefined,
        }));
        setAssignments(parsedAssignments);
      }
    } catch (error) {
      console.error("Failed to load assignments from local storage", error);
      // Initialize with empty array if loading fails
      setAssignments([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(assignments));
      } catch (error) {
        console.error("Failed to save assignments to local storage", error);
      }
    }
  }, [assignments, isLoaded]);

  const addAssignment = useCallback((newAssignmentData: Omit<Assignment, 'id' | 'completed'>) => {
    const newAssignment: Assignment = {
      id: `assign-${Date.now()}`,
      name: newAssignmentData.name.trim(),
      dueDate: newAssignmentData.dueDate,
      completed: false,
    };
    setAssignments((prevAssignments) => [...prevAssignments, newAssignment]);
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setAssignments((prevAssignments) =>
      prevAssignments.map((a) =>
        a.id === id ? { ...a, completed: !a.completed } : a
      )
    );
  }, []);

  const deleteAssignment = useCallback((id: string) => {
    setAssignments((prevAssignments) => prevAssignments.filter((a) => a.id !== id));
  }, []);

  const updateAssignment = useCallback((updatedAssignment: Assignment) => {
    setAssignments((prevAssignments) =>
      prevAssignments.map((a) =>
        a.id === updatedAssignment.id ? updatedAssignment : a
      )
    );
  }, []);

  return (
    <AssignmentContext.Provider value={{ assignments, addAssignment, toggleComplete, deleteAssignment, updateAssignment, isLoaded }}>
      {children}
    </AssignmentContext.Provider>
  );
};

export const useAssignments = (): AssignmentContextType => {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error('useAssignments must be used within an AssignmentProvider');
  }
  return context;
};
