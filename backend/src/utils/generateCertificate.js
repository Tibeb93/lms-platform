const PDFDocument = require('pdfkit');
const { cloudinary } = require('../config/cloudinary');
const { Readable } = require('stream');

/**
 * Generate a PDF certificate and upload to Cloudinary
 */
exports.generateCertificatePDF = async (certificateData) => {
  const { studentName, courseName, instructorName, completionDate, verificationId, grade } = certificateData;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);

        // Upload to Cloudinary
        const uploadResult = await new Promise((res, rej) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'lms/certificates',
              resource_type: 'raw',
              format: 'pdf',
              public_id: `cert_${verificationId}`,
            },
            (error, result) => {
              if (error) rej(error);
              else res(result);
            }
          );
          const readable = new Readable();
          readable.push(pdfBuffer);
          readable.push(null);
          readable.pipe(uploadStream);
        });

        resolve({ url: uploadResult.secure_url, public_id: uploadResult.public_id });
      } catch (err) {
        reject(err);
      }
    });

    // ─── Certificate Design ───────────────────────────────────────────────────

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Background gradient simulation with rectangles
    doc.rect(0, 0, pageWidth, pageHeight).fill('#fefefe');

    // Decorative border
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
      .lineWidth(3)
      .stroke('#c9a84c');

    doc.rect(28, 28, pageWidth - 56, pageHeight - 56)
      .lineWidth(1)
      .stroke('#e8d5a3');

    // Header accent bar
    doc.rect(20, 20, pageWidth - 40, 8).fill('#c9a84c');
    doc.rect(20, pageHeight - 28, pageWidth - 40, 8).fill('#c9a84c');

    // Title
    doc.font('Helvetica-Bold')
      .fontSize(42)
      .fillColor('#1a1a2e')
      .text('CERTIFICATE', 0, 80, { align: 'center' });

    doc.font('Helvetica')
      .fontSize(18)
      .fillColor('#c9a84c')
      .text('OF COMPLETION', 0, 130, { align: 'center' });

    // Divider
    doc.moveTo(pageWidth / 2 - 150, 165)
      .lineTo(pageWidth / 2 + 150, 165)
      .lineWidth(1)
      .stroke('#c9a84c');

    // "This is to certify that"
    doc.font('Helvetica')
      .fontSize(14)
      .fillColor('#555')
      .text('This is to certify that', 0, 185, { align: 'center' });

    // Student name
    doc.font('Helvetica-Bold')
      .fontSize(36)
      .fillColor('#1a1a2e')
      .text(studentName, 0, 215, { align: 'center' });

    // Underline for name
    const nameWidth = doc.widthOfString(studentName, { fontSize: 36 });
    const nameX = (pageWidth - nameWidth) / 2;
    doc.moveTo(nameX, 258)
      .lineTo(nameX + nameWidth, 258)
      .lineWidth(1.5)
      .stroke('#c9a84c');

    // "has successfully completed"
    doc.font('Helvetica')
      .fontSize(14)
      .fillColor('#555')
      .text('has successfully completed the course', 0, 275, { align: 'center' });

    // Course name
    doc.font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#667eea')
      .text(courseName, 60, 305, { align: 'center', width: pageWidth - 120 });

    // Grade if available
    if (grade) {
      doc.font('Helvetica')
        .fontSize(14)
        .fillColor('#555')
        .text(`with ${grade}`, 0, 345, { align: 'center' });
    }

    // Bottom section
    const bottomY = pageHeight - 130;

    // Completion date
    doc.font('Helvetica')
      .fontSize(12)
      .fillColor('#555')
      .text('Date of Completion', 100, bottomY, { align: 'left', width: 200 });

    doc.font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#1a1a2e')
      .text(new Date(completionDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      }), 100, bottomY + 20, { align: 'left', width: 200 });

    // Instructor signature
    doc.font('Helvetica')
      .fontSize(12)
      .fillColor('#555')
      .text('Instructor', pageWidth / 2 - 100, bottomY, { align: 'center', width: 200 });

    doc.font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#1a1a2e')
      .text(instructorName, pageWidth / 2 - 100, bottomY + 20, { align: 'center', width: 200 });

    // Verification ID
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#999')
      .text(`Verification ID: ${verificationId}`, pageWidth - 300, bottomY, { align: 'right', width: 200 });

    doc.font('Helvetica')
      .fontSize(9)
      .fillColor('#bbb')
      .text('Verify at: lms-platform.com/verify', pageWidth - 300, bottomY + 15, { align: 'right', width: 200 });

    doc.end();
  });
};
