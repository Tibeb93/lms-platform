import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, BookOpen, ArrowRight } from 'lucide-react';
import { paymentService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading');
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    if (sessionId) {
      paymentService.verifyPayment(sessionId)
        .then(({ data }) => { setPayment(data.payment); setStatus('success'); })
        .catch(() => setStatus('error'));
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
        {status === 'success' ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">
              You've been enrolled in the course. Start learning right away!
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/my-courses" className="btn-primary py-3 flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" /> Go to My Courses
              </Link>
              <Link to="/courses" className="btn-secondary py-3 flex items-center justify-center gap-2">
                Browse More Courses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-heading font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">We couldn't verify your payment. Please contact support.</p>
            <Link to="/dashboard" className="btn-primary py-3 block">Go to Dashboard</Link>
          </>
        )}
      </div>
    </div>
  );
}
