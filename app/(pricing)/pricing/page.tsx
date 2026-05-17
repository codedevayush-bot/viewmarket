import PricingClient from '@/app/components/pricing/PricingClient';

export const metadata = {
  title: 'Pricing',
  description:
    'Premium-grade algorithmic trading tools, optimized for performance and reliability.',
};

export default function PricingPage() {
  return (
    <div className="page-content">
      <PricingClient />
    </div>
  );
}
