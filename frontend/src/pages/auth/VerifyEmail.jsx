import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, GraduationCap } from 'lucide-react';
import { authService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center">
          <Link to="/" className="flex items-center justify-center gap-2 font-heading font-bold text-xl mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="gradient-text">LearnHub</span>
          </Link>

          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
              <p className="text-muted-foreground text-sm mb-6">Your email has been verified. You can now access all features.</p>
              <Link to="/dashboard" className="btn-primary w-full block text-center py-2.5">Go to Dashboard</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
              <p className="text-muted-foreground text-sm mb-6">The verification link is invalid or has expired.</p>
              <Link to="/login" className="btn-primary w-full block text-center py-2.5">Back to Login</Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
