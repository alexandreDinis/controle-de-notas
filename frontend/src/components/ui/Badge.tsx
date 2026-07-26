type Variant = 'primary' | 'accent' | 'danger' | 'muted';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const styles: Record<Variant, string> = {
  primary: 'bg-primary-light text-primary border-primary/20',
  accent: 'bg-accent-light text-accent border-accent/20',
  danger: 'bg-danger-light text-danger border-danger/20',
  muted: 'bg-surface text-text-secondary border-border',
};

export default function Badge({ children, variant = 'muted', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
