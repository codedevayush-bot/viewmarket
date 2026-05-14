import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import ThemeSwitcher from '../components/ThemeSwitcher/ThemeSwitcher';

export const metadata: Metadata = {
  title: {
    absolute: 'View Market',
  },
  description:
    'View Market — Algorithmic trading platform with 30+ broker integrations',
  icons: {
    icon: '/icon.svg',
  },
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <ThemeSwitcher />
    </>
  );
}
