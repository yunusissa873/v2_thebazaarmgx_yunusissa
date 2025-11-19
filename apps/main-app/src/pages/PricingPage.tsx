import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@thebazaar/ui/button';
import { Badge } from '@thebazaar/ui/badge';

const pricingTiers = [
  {
    name: 'Basic',
    price: 0,
    period: 'month',
    description: 'Perfect for getting started',
    features: [
      'Directory listing',
      'Profile page',
      'Contact form',
      'Basic analytics',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Bronze',
    price: 2500,
    period: 'month',
    description: 'For growing businesses',
    features: [
      'Everything in Basic',
      'Up to 50 products',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
    ],
    popular: false,
  },
  {
    name: 'Silver',
    price: 7500,
    period: 'month',
    description: 'Best for established vendors',
    features: [
      'Everything in Bronze',
      'Unlimited products',
      'Promoted listings',
      '24/7 support',
      'Marketing tools',
      'Sales reports',
    ],
    popular: true,
  },
  {
    name: 'Gold',
    price: 15000,
    period: 'month',
    description: 'For high-volume sellers',
    features: [
      'Everything in Silver',
      'Featured placement',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced reporting',
      'API access',
    ],
    popular: false,
  },
  {
    name: 'Platinum',
    price: 30000,
    period: 'month',
    description: 'Enterprise solution',
    features: [
      'Everything in Gold',
      'White-label options',
      'Custom development',
      'SLA guarantee',
      'Multi-branch support',
      'Exclusive features',
    ],
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Pricing Plans</h1>
            <p className="text-xl text-gray-400">
              Choose the perfect plan for your business. All prices in KES.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-netflix-dark-gray rounded-lg border ${
                  tier.popular
                    ? 'border-netflix-red ring-2 ring-netflix-red'
                    : 'border-netflix-medium-gray'
                } p-6 relative flex flex-col`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-netflix-red">
                    Most Popular
                  </Badge>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{tier.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">
                      {tier.price === 0 ? 'Free' : `KES ${tier.price.toLocaleString()}`}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-gray-400">/{tier.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 flex-1 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full ${
                    tier.popular
                      ? 'bg-netflix-red hover:bg-netflix-red/90'
                      : 'bg-netflix-medium-gray hover:bg-netflix-medium-gray/80'
                  } text-white`}
                >
                  <Link to="/vendors/register">Get Started</Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Need Custom Pricing?</h2>
            <p className="text-gray-400 mb-6">
              Contact us for enterprise solutions and custom packages tailored to your business.
            </p>
            <Link to="/contact">
              <Button variant="outline" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

