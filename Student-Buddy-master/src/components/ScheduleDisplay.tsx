"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import type { ScheduleItem } from '@/lib/types';

const MOCK_SCHEDULE_DATA: ScheduleItem[] = [
  { id: '1', time: '09:00 AM - 10:30 AM', subject: 'Advanced Calculus', location: 'Math Building, Room 301' },
  { id: '2', time: '11:00 AM - 12:30 PM', subject: 'Quantum Physics I', location: 'Science Hall, Lecture A' },
  { id: '3', time: '02:00 PM - 03:30 PM', subject: 'Data Structures & Algorithms', location: 'CS Hub, Lab 2' },
  { id: '4', time: '04:00 PM - 05:00 PM', subject: 'Academic Writing Workshop', location: 'Library, Group Study Room 5' },
];

const ScheduleDisplay: React.FC = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-2">
          <CalendarDays className="h-8 w-8 text-primary" />
          Today's Schedule
        </CardTitle>
        <CardDescription className="font-body">Here are your classes and academic events for today.</CardDescription>
      </CardHeader>
      <CardContent>
        {MOCK_SCHEDULE_DATA.length > 0 ? (
          <ul className="space-y-4">
            {MOCK_SCHEDULE_DATA.map((item) => (
              <li key={item.id} className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow bg-card">
                <h3 className="font-headline text-xl font-semibold text-primary">{item.subject}</h3>
                <div className="text-muted-foreground font-body space-y-1 mt-1">
                  <p className="flex items-center gap-2">
                    <Clock size={16} />
                    {item.time}
                  </p>
                  {item.location && (
                    <p className="flex items-center gap-2">
                      <MapPin size={16} />
                      {item.location}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground font-body py-8">You have no scheduled events for today. Enjoy your free day!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleDisplay;
