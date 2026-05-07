import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    desc: 'Perfect for getting started',
    features: ['Access to free courses', 'Basic progress tracking', 'Community forum access', 'Mobile app access'],
    cta: 'Get Started Free',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 29,
    desc: 'For serious learners',
    features: ['Unlimited course access', 'Advanced analytics', 'Priority support', 'Offline downloads', 'Certificate of completion', 'Ad-free experience'],
    cta: 'Start Pro',
    href: '/register',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Team',
    price: 99,
    desc: 'For teams and organizations',
    features: ['Everything in Pro', 'Up to 10 team members', 'Team analytics dashboard', 'Custom learning paths', 'Dedicated account manager', 'SSO integration'],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-900 to-purple-900 text-white py-16">
        <div className="page-container text-center">
          <h1 className="text-4xl font-heading font-bold mb-3">Simple, Transparent Pricing</h1>
          <p className="text-brand-200">Choose the plan that works best for you.</p>
        </div>
      </section>

      <section className="py-16 page-container">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 border ${
                plan.highlighted
                  ? 'border-brand-500 bg-gradient-to-b from-brand-50 to-white dark:from-brand-950/30 dark:to-card shadow-xl'
                  : 'border-border bg-card'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {plan.badge}
                  </span>
                </div>
              )}
              <h3 className="text-xl font-heading font-bold mb-1">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.href}
                className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-brand-600 hover:bg-brand-700 text-white'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include a 30-day money-back guarantee. No questions asked.
        </p>
      </section>
    </div>
  );
}
