/**
 * Debug script to check admin analytics data
 * Run with: node scripts/run-debug-admin-analytics.js
 */

import { PrismaClient, LoanStatus, SupportTicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function debugAnalytics() {
  try {
    console.log('\n=== DEBUGGING ADMIN ANALYTICS ===\n');

    // Check loans
    const totalLoans = await prisma.loan.count();
    const pendingLoans = await prisma.loan.count({ where: { status: LoanStatus.PENDING } });
    const approvedLoans = await prisma.loan.count({ where: { status: LoanStatus.APPROVED } });
    const activeLoans = await prisma.loan.count({ where: { status: LoanStatus.ACTIVE } });
    const disbursedLoans = await prisma.loan.count({ where: { status: LoanStatus.DISBURSED } });
    
    console.log('📊 LOANS:');
    console.log(`  Total: ${totalLoans}`);
    console.log(`  Pending: ${pendingLoans}`);
    console.log(`  Approved: ${approvedLoans}`);
    console.log(`  Active: ${activeLoans}`);
    console.log(`  Disbursed: ${disbursedLoans}`);

    // Check loan amounts
    const loanAmountSum = await prisma.loan.aggregate({ _sum: { loanAmount: true } });
    const disbursedAmountSum = await prisma.loan.aggregate({ _sum: { amountDisbursed: true } });
    const repaidAmountSum = await prisma.loan.aggregate({ _sum: { amountRepaid: true } });
    
    console.log('\n💰 FINANCIAL:');
    console.log(`  Total Loan Amount: ₦${Number(loanAmountSum._sum.loanAmount || 0).toLocaleString()}`);
    console.log(`  Total Disbursed: ₦${Number(disbursedAmountSum._sum.amountDisbursed || 0).toLocaleString()}`);
    console.log(`  Total Repaid: ₦${Number(repaidAmountSum._sum.amountRepaid || 0).toLocaleString()}`);

    // Check schools
    const totalSchools = await prisma.schoolProfile.count();
    const verifiedSchools = await prisma.schoolProfile.count({ where: { isVerified: true } });
    const pendingSchools = await prisma.schoolProfile.count({ where: { isVerified: false } });
    
    console.log('\n🏫 SCHOOLS:');
    console.log(`  Total: ${totalSchools}`);
    console.log(`  Verified: ${verifiedSchools}`);
    console.log(`  Pending: ${pendingSchools}`);

    // Check support tickets
    const totalTickets = await prisma.supportTicket.count();
    const openTickets = await prisma.supportTicket.count({ where: { status: SupportTicketStatus.OPEN } });
    
    console.log('\n🎫 SUPPORT TICKETS:');
    console.log(`  Total: ${totalTickets}`);
    console.log(`  Open: ${openTickets}`);

    // List all loans with details
    console.log('\n📋 LOAN DETAILS:');
    const loans = await prisma.loan.findMany({
      select: {
        id: true,
        loanNumber: true,
        status: true,
        loanAmount: true,
        amountDisbursed: true,
        amountRepaid: true,
        user: {
          select: {
            fullName: true,
            email: true
          }
        },
        school: {
          select: {
            schoolName: true
          }
        }
      }
    });

    if (loans.length === 0) {
      console.log('  No loans found in database');
    } else {
      loans.forEach((loan, index) => {
        console.log(`\n  Loan ${index + 1}:`);
        console.log(`    Number: ${loan.loanNumber}`);
        console.log(`    Status: ${loan.status}`);
        console.log(`    Amount: ₦${Number(loan.loanAmount).toLocaleString()}`);
        console.log(`    Disbursed: ₦${Number(loan.amountDisbursed).toLocaleString()}`);
        console.log(`    Repaid: ₦${Number(loan.amountRepaid).toLocaleString()}`);
        console.log(`    User: ${loan.user.fullName} (${loan.user.email})`);
        console.log(`    School: ${loan.school.schoolName}`);
      });
    }

    // List all schools
    console.log('\n🏫 SCHOOL DETAILS:');
    const schools = await prisma.schoolProfile.findMany({
      select: {
        id: true,
        schoolName: true,
        isVerified: true,
        verifiedAt: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });

    if (schools.length === 0) {
      console.log('  No schools found in database');
    } else {
      schools.forEach((school, index) => {
        console.log(`\n  School ${index + 1}:`);
        console.log(`    Name: ${school.schoolName}`);
        console.log(`    Verified: ${school.isVerified ? 'Yes' : 'No'}`);
        console.log(`    Verified At: ${school.verifiedAt || 'N/A'}`);
        console.log(`    Email: ${school.user.email}`);
      });
    }

    // List all support tickets
    console.log('\n🎫 SUPPORT TICKET DETAILS:');
    const tickets = await prisma.supportTicket.findMany({
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        priority: true,
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    });

    if (tickets.length === 0) {
      console.log('  No support tickets found in database');
    } else {
      tickets.forEach((ticket, index) => {
        console.log(`\n  Ticket ${index + 1}:`);
        console.log(`    Number: ${ticket.ticketNumber}`);
        console.log(`    Subject: ${ticket.subject}`);
        console.log(`    Status: ${ticket.status}`);
        console.log(`    Priority: ${ticket.priority}`);
        console.log(`    User: ${ticket.user.fullName} (${ticket.user.email})`);
      });
    }

    console.log('\n=== DEBUG COMPLETE ===\n');

  } catch (error) {
    console.error('Error debugging analytics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAnalytics();
