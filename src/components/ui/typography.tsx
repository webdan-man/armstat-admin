import { cn } from '@/lib/utils';
import React from 'react';

export function TypographyH1({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        className,
        'text-fontSizeM leading-fontLine-heightMD tracking-normal font-(--font-montserrat)',
      )}
    >
      {children}
    </h1>
  );
}

export function TypographyH2({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h2 className={cn(className, 'text-[32px] font-semibold')}>{children}</h2>;
}

export function TypographyH3({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn(className, 'text-fontSizeL leading-fontLine-heightMD font-semibold')}>
      {children}
    </h3>
  );
}

export function TypographyH4({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={cn(className, 'text-[24px] font-semibold')}>{children}</h3>;
}

export function TypographyP({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn(className, 'leading-fontLine-heightMD')}>{children}</p>;
}
