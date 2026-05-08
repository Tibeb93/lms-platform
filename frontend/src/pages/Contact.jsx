import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    // In production, send to backend
    console.log('Contact form:', data);
    setSent(true);
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-900 to-purple-900 text-white py-16">
        <div className="page-container text-center">
          <h1 className="text-4xl font-heading font-bold mb-3">Contact Us</h1>
          <p className="text-brand-200">Have a question? We'd love to hear from you.</p>
        </div>
      </section>

      <section className="py-16 page-container">
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-heading font-bold mb-6">Get in Touch</h2>
            <div className="space-y-4">
              {[
                { icon: Mail, label: 'Email', value: 'gkiflemeskel@gmail.com', href: 'mailto:gkiflemeskel@gmail.com' },
                { icon: Phone, label: 'Phone', value: '+251 911 956 080', href: 'tel:+251911956080' },
                { icon: MapPin, label: 'Address', value: 'Bahir Dar, Ethiopia', href: 'https://maps.google.com/?q=Bahir+Dar,Ethiopia' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <a
                        href={item.href}
                        target={item.label === 'Address' ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="text-muted-foreground text-sm hover:text-brand-600 transition-colors"
                      >
                        {item.value}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-xl p-6">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Message Sent!</h3>
                <p className="text-muted-foreground text-sm">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Name</label>
                    <input {...register('name', { required: true })} className="input-field" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <input type="email" {...register('email', { required: true })} className="input-field" placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Subject</label>
                  <input {...register('subject', { required: true })} className="input-field" placeholder="How can we help?" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Message</label>
                  <textarea {...register('message', { required: true })} rows={5} className="input-field resize-none" placeholder="Your message..." />
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
