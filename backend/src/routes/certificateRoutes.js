const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getMyCertificates, getCertificate, verifyCertificate, revokeCertificate,
} = require('../controllers/certificateController');

router.get('/verify/:verificationId', verifyCertificate);
router.get('/:id', getCertificate);

router.use(protect);

router.get('/', getMyCertificates);
router.put('/:id/revoke', restrictTo('admin'), revokeCertificate);

module.exports = router;
