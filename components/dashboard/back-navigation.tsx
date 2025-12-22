import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface BackNavigationProps {
  href: string;
  label: string;
}

export function BackNavigation({ href, label }: BackNavigationProps) {
  return (
    <Link 
      href={href}
      className="inline-flex items-center gap-3 mb-6 text-[#7C7C7C] hover:text-[#002561] transition-colors group"
    >
      <div className="w-12 h-12 rounded-lg border-2 border-[#E5E5E5] flex items-center justify-center group-hover:border-[#002561] transition-colors">
        <ChevronLeft className="w-6 h-6" />
      </div>
      <span className="text-[1.125rem] font-medium">{label}</span>
    </Link>
  );
}
