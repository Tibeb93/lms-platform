import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, CheckCircle, XCircle, Download } from 'lucide-react';
import { certificateService } from '../services/api';
import { formatDate } from '../lib/utils';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function VerifyCertificate() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateService.verifyCertificate(id)
      .then(({ data }) => setResult(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full">
        <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
          {result?.valid ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-heading font-bold mb-2 text-green-700">Certificate Verified ✓</h1>
              <p className="text-muted-foreground mb-6">This is a valid LearnHub certificate.</p>

              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 rounded-xl p-6 text-left mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-amber-500" />
                  <div>
                    <p className="font-bold">Certificate of Completion</p>
                    <p className="text-xs text-muted-foreground">LearnHub</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Student:</span> <span className="font-medium">{result.certificate?.studentName || result.certificate?.user?.name}</span></div>
                  <div><span className="text-muted-foreground">Course:</span> <span className="font-medium">{result.certificate?.courseName || result.certificate?.course?.title}</span></div>
                  <div><span className="text-muted-foreground">Instructor:</span> <span className="font-medium">{result.certificate?.instructorName || result.certificate?.instructor?.name}</span></div>
                  <div><span className="text-muted-foreground">Issued:</span> <span className="font-medium">{formatDate(result.certificate?.issuedAt)}</span></div>
                  <div><span className="text-muted-foreground">ID:</span> <span className="font-mono text-xs">{result.certificate?.verificationId}</span></div>
                </div>
              </div>

              {result.certificate?.pdfUrl && (
                <a href={result.certificate.pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="btn-primary flex items-center justify-center gap-2 w-full py-3">
                  <Download className="w-4 h-4" /> Download Certificate
                </a>
              )}
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-heading font-bold mb-2 text-red-700">Certificate Not Found</h1>
              <p className="text-muted-foreground">
                {result?.message || 'This certificate could not be verified. It may be invalid or revoked.'}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
