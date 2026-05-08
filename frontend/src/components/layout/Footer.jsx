import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Twitter, Linkedin, Github, Youtube, Mail } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    Platform: [
      { label: 'Browse Courses', href: '/courses' },
      { label: 'Become Instructor', href: '/register?role=instructor' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'About Us', href: '/about' },
    ],
    Support: [
      { label: 'Help Center', href: '/contact' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
    Learn: [
      { label: 'Web Development', href: '/courses?category=Web+Development' },
      { label: 'Data Science', href: '/courses?category=Data+Science' },
      { label: 'UI/UX Design', href: '/courses?category=UI%2FUX+Design' },
      { label: 'Business', href: '/courses?category=Business' },
    ],
  };

  return (
    <footer className="bg-gray-950 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl text-white mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              LearnHub
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-xs">
              Empowering learners worldwide with high-quality online education. Learn from industry experts at your own pace.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Github, href: '#' },
                { icon: Youtube, href: '#' },
                { icon: Mail, href: 'mailto:gkiflemeskel@gmail.com' },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href} className="p-2 bg-gray-800 rounded-lg hover:bg-brand-600 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© {year} LearnHub. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-gray-500">
            <span>📍 Bahir Dar, Ethiopia</span>
            <span className="hidden sm:block">•</span>
            <a href="tel:+251911956080" className="hover:text-white transition-colors">📞 +251 911 956 080</a>
            <span className="hidden sm:block">•</span>
            <a href="mailto:gkiflemeskel@gmail.com" className="hover:text-white transition-colors">✉️ gkiflemeskel@gmail.com</a>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
