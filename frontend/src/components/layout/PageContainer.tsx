import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function PageContainer({ title, subtitle, action, children }: PageContainerProps) {
  return (
    <div className="ml-56 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">{title}</h1>
            {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
