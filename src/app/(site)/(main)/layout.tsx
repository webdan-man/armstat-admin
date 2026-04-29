import React from 'react';
import Footer from '@/components/site/Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center">
      {children}
      <Footer />
    </div>
  );
}
