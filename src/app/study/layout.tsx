import type { ReactNode } from 'react';

export default function StudyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
