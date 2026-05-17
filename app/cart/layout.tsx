import type { Metadata } from 'next';
import Script from 'next/script';
import ThemeSwitcher from '../components/ThemeSwitcher/ThemeSwitcher';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Securely complete your subscription.',
};

export default function CartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      {children}
      <ThemeSwitcher />
    </main>
  );
}
