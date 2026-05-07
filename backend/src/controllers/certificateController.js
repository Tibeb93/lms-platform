const Certificate = require('../models/Certificate');
const { AppError } = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user certificates
// @route   GET /api/certificates
// @access  Private
exports.getMyCertificates = asyncHandler(async (req, res, next) => {
  const certificates = await Certificate.find({ user: req.user.id, isValid: true })
    .populate('course', 'title thumbnail slug category')
    .populate('instructor', 'name avatar')
    .sort('-issuedAt');

  res.status(200).json({ success: true, count: certificates.length, certificates });
});

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Public
exports.getCertificate = asyncHandler(async (req, res, next) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate('course', 'title thumbnail slug category')
    .populate('user', 'name avatar')
    .populate('instructor', 'name avatar');

  if (!certificate) return next(new AppError('Certificate not found', 404));

  res.status(200).json({ success: true, certificate });
});

// @desc    Verify certificate by verification ID
// @route   GET /api/certificates/verify/:verificationId
// @access  Public
exports.verifyCertificate = asyncHandler(async (req, res, next) => {
  const certificate = await Certificate.findOne({ verificationId: req.params.verificationId })
    .populate('course', 'title thumbnail slug')
    .populate('user', 'name avatar')
    .populate('instructor', 'name');

  if (!certificate) {
    return res.status(200).json({ success: true, valid: false, message: 'Certificate not found' });
  }

  res.status(200).json({
    success: true,
    valid: certificate.isValid,
    certificate: certificate.isValid ? certificate : null,
    message: certificate.isValid ? 'Certificate is valid' : 'Certificate has been revoked',
  });
});

// @desc    Revoke certificate (Admin)
// @route   PUT /api/certificates/:id/revoke
// @access  Private (Admin)
exports.revokeCertificate = asyncHandler(async (req, res, next) => {
  const certificate = await Certificate.findById(req.params.id);
  if (!certificate) return next(new AppError('Certificate not found', 404));

  certificate.isValid = false;
  certificate.revokedAt = Date.now();
  certificate.revokeReason = req.body.reason;
  await certificate.save();

  res.status(200).json({ success: true, message: 'Certificate revoked' });
});
