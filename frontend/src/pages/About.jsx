import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, BookOpen, Award, Heart } from 'lucide-react';

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-purple-900 text-white py-20">
        <div className="page-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">About LearnHub</h1>
            <p className="text-brand-200 text-lg max-w-2xl mx-auto">
              We're on a mission to make quality education accessible to everyone, everywhere.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 page-container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-heading font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              LearnHub was founded with a simple belief: everyone deserves access to world-class education. We connect passionate instructors with eager learners across the globe.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our platform empowers instructors to share their expertise and students to gain the skills they need to succeed in today's rapidly changing world.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, value: '50K+', label: 'Students' },
              { icon: BookOpen, value: '1,200+', label: 'Courses' },
              { icon: GraduationCap, value: '300+', label: 'Instructors' },
              { icon: Award, value: '25K+', label: 'Certificates' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-card border border-border rounded-xl p-5 text-center">
                  <Icon className="w-8 h-8 text-brand-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="page-container">
          <h2 className="text-3xl font-heading font-bold text-center mb-10">Our Values</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: 'Passion for Learning', desc: 'We believe learning is a lifelong journey and we make it enjoyable.' },
              { icon: Users, title: 'Community First', desc: 'We foster a supportive community where everyone can grow together.' },
              { icon: Award, title: 'Quality Education', desc: 'We maintain high standards for all courses on our platform.' },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-card border border-border rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
