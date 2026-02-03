/**
 * Add Documents to Existing Loans Script
 * 
 * This script finds active loans without documents and adds placeholder documents.
 * It's used to fix the issue where loans were created before document saving was implemented.
 * 
 * Usage:
 * 1. Update the DOCUMENT_URLS array with your actual Cloudinary URLs (optional)
 * 2. Run: node scripts/run-add-documents.js
 */

import { PrismaClient, LoanStatus, DocumentType } from '@prisma/client';

const prisma = new PrismaClient();

// Sample document URLs - Replace these with actual Cloudinary URLs if available
const SAMPLE_DOCUMENTS = [
  {
    fileName: 'bvn_verification.pdf',
    fileUrl: 'https://res.cloudinary.com/demo/sample.pdf', // Replace with actual URL
    fileSize: 2400000, // 2.4 MB
    mimeType: 'application/pdf',
    documentType: DocumentType.BVN
  },
  {
    fileName: 'nin_document.pdf',
    fileUrl: 'https://res.cloudinary.com/demo/sample.pdf', // Replace with actual URL
    fileSize: 1800000, // 1.8 MB
    mimeType: 'application/pdf',
    documentType: DocumentType.NIN
  },
  {
    fileName: 'bank_statement.pdf',
    fileUrl: 'https://res.cloudinary.com/demo/sample.pdf', // Replace with actual URL
    fileSize: 3200000, // 3.2 MB
    mimeType: 'application/pdf',
    documentType: DocumentType.BANK_STATEMENT
  }
];

async function addDocumentsToLoans() {
  try {
    console.log('🔍 Searching for loans without documents...\n');

    // Find all active loans
    const activeStatuses = [
      LoanStatus.ACTIVE,
      LoanStatus.DISBURSED,
      LoanStatus.APPROVED,
      LoanStatus.UNDER_REVIEW,
      LoanStatus.PENDING,
    ];

    const loans = await prisma.loan.findMany({
      where: {
        status: {
          in: activeStatuses
        }
      },
      include: {
        documents: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    if (loans.length === 0) {
      console.log('❌ No active loans found in the database.');
      return;
    }

    console.log(`✅ Found ${loans.length} active loan(s)\n`);

    // Filter loans without documents
    const loansWithoutDocs = loans.filter(loan => loan.documents.length === 0);

    if (loansWithoutDocs.length === 0) {
      console.log('✅ All active loans already have documents!');
      
      // Show loans with documents
      console.log('\n📋 Loans with documents:');
      loans.forEach(loan => {
        console.log(`  - ${loan.loanNumber} (${loan.user.fullName}): ${loan.documents.length} document(s)`);
      });
      return;
    }

    console.log(`⚠️  Found ${loansWithoutDocs.length} loan(s) without documents:\n`);

    // Process each loan without documents
    for (const loan of loansWithoutDocs) {
      console.log(`📄 Processing loan: ${loan.loanNumber}`);
      console.log(`   User: ${loan.user.fullName} (${loan.user.email})`);
      console.log(`   Status: ${loan.status}`);
      console.log(`   Amount: ₦${Number(loan.loanAmount).toLocaleString()}`);

      // Add sample documents
      const documentsToCreate = SAMPLE_DOCUMENTS.map(doc => ({
        userId: loan.userId,
        loanId: loan.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        isVerified: false
      }));

      // Create documents
      await prisma.document.createMany({
        data: documentsToCreate
      });

      console.log(`   ✅ Added ${documentsToCreate.length} document(s)\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Migration completed successfully!\n');

    // Summary
    console.log('📊 Summary:');
    console.log(`   Total loans processed: ${loansWithoutDocs.length}`);
    console.log(`   Documents added per loan: ${SAMPLE_DOCUMENTS.length}`);
    console.log(`   Total documents created: ${loansWithoutDocs.length * SAMPLE_DOCUMENTS.length}`);

  } catch (error) {
    console.error('❌ Error adding documents:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
addDocumentsToLoans()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });