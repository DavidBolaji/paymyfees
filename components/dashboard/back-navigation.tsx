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
      className="group inline-flex items-center gap-3 mb-6 text-[#7C7C7C] hover:text-[#002561] transition-colors"
    >
      <div className="flex justify-center items-center border-[#E5E5E5] border-2 group-hover:border-[#002561] rounded-lg w-6 h-6 transition-colors">
        <ChevronLeft className="w-3 h-3" />
      </div>
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  );
}
