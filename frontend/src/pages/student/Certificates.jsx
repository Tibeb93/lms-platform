import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, Share2, ExternalLink } from 'lucide-react';
import { certificateService } from '../../services/api';
import { formatDate } from '../../lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateService.getMyCertificates()
      .then(({ data }) => setCertificates(data.certificates))
      .finally(() => setLoading(false));
  }, []);

  const handleShare = (cert) => {
    const url = `${window.location.origin}/verify-certificate/${cert.verificationId}`;
    navigator.clipboard.writeText(url);
    toast.success('Certificate link copied!');
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">My Certificates</h1>

      {certificates.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
          <p className="text-muted-foreground mb-6">Complete a course to earn your first certificate.</p>
          <Link to="/courses" className="btn-primary">Browse Courses</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert._id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              {/* Certificate preview */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950/30 dark:to-yellow-950/30 p-6 text-center border-b border-border">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-sm mb-1">Certificate of Completion</h3>
                <p className="text-xs text-muted-foreground">Issued to {cert.studentName}</p>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{cert.courseName}</h4>
                <p className="text-xs text-muted-foreground mb-1">By {cert.instructorName}</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Completed {formatDate(cert.completionDate || cert.issuedAt)}
                </p>
                <p className="text-xs text-muted-foreground mb-4 font-mono">
                  ID: {cert.verificationId}
                </p>

                <div className="flex gap-2">
                  {cert.pdfUrl && (
                    <a
                      href={cert.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs rounded-lg transition-colors"
                    >
                      <Download className="w-3 h-3" /> Download
                    </a>
                  )}
                  <button
                    onClick={() => handleShare(cert)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 border border-border rounded-lg hover:bg-muted text-xs transition-colors"
                  >
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                  <Link
                    to={`/verify-certificate/${cert.verificationId}`}
                    className="flex items-center justify-center p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
