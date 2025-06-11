
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarContent,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BotMessageSquare, CalendarClock, ClipboardCheck, BookOpen, Sparkles, GraduationCap } from 'lucide-react';
import type { ReactNode } from 'react';
import { AssignmentProvider } from '@/contexts/AssignmentContext'; // Import the provider

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Chat', icon: <BotMessageSquare /> },
  { href: '/schedule', label: 'Schedule', icon: <CalendarClock /> },
  { href: '/assignments', label: 'Assignments', icon: <ClipboardCheck /> },
  { href: '/study/quiz', label: 'Quiz Helper', icon: <Sparkles /> },
  { href: '/study/definitions', label: 'Define Terms', icon: <BookOpen /> },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AssignmentProvider> {/* Wrap with AssignmentProvider */}
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen">
          <Sidebar collapsible="icon" className="shadow-md">
            <SidebarHeader className="flex items-center justify-between p-4">
              <Link href="/" className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-headline font-semibold text-primary group-data-[collapsible=icon]:hidden">
                  Student Buddy
                </h1>
              </Link>
              <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
            </SidebarHeader>
            <ScrollArea className="flex-1">
              <SidebarContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href}>
                        <SidebarMenuButton
                          isActive={pathname === item.href}
                          tooltip={{ children: item.label, className: "font-body" }}
                          className="font-body"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
            </ScrollArea>
          </Sidebar>
          <SidebarInset className="flex-1 bg-background">
            <div className="p-2 sm:p-4 lg:p-6 h-full">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AssignmentProvider>
  );
}
