// Mock data for dashboard components
import type { 
  TransactionItem, 
  ProgressStep, 
  ChartDataItem, 
  DashboardStats,
  PaymentPlan,
} from './types';


export const recentTransactionsData: TransactionItem[] = [
  {
    date: 'Dec 12, 2024',
    description: 'Installment Payment (1/5)',
    amount: 15000,
    method: 'Bank Transfer',
    status: 'paid'
  },
  {
    date: 'Dec 05, 2024',
    description: 'Wallet Top-Up',
    amount: 25000,
    method: 'Bank Transfer',
    status: 'pending'
  },
  {
    date: 'Nov 22, 2024',
    description: 'Installment Payment (2/5)',
    amount: 15000,
    method: 'Wallet Debit',
    status: 'paid'
  },
  {
    date: 'Oct 15, 2024',
    description: 'Installment Payment (1/5)',
    amount: 15000,
    method: 'Bank Transfer',
    status: 'paid'
  },
  {
    date: 'Oct 05, 2024',
    description: 'Wallet Top-Up',
    amount: 6000,
    method: 'Card Payment',
    status: 'paid'
  }
];

export const progressSteps: ProgressStep[] = [
  {
    id: '1',
    title: 'School Verified',
    status: 'completed'
  },
  {
    id: '2',
    title: 'Loan Approved',
    status: 'completed'
  },
  {
    id: '3',
    title: 'School Paid',
    status: 'completed'
  },
  {
    id: '4',
    title: '1st Repayment made',
    status: 'active'
  },
  {
    id: '5',
    title: '2nd Repayment made',
    status: 'upcoming'
  }
];

export const chartData: ChartDataItem[] = [
  { month: 'Jan', value: 0 },
  { month: 'Feb', value: 20000 },
  { month: 'Mar', value: 35000 },
  { month: 'Apr', value: 45000 },
  { month: 'May', value: 50000 },
  { month: 'Jun', value: 65000 },
  { month: 'Jul', value: 70000 },
  { month: 'Aug', value: 75000 },
  { month: 'Sep', value: 65000 },
  { month: 'Oct', value: 80000 },
  { month: 'Nov', value: 95000 },
  { month: 'Dec', value: 100000 }
];

// API simulation functions
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    upcomingPayment: {
      amount: 45000,
      dueDate: 'Jan 15, 2025'
    },
    activePlan: {
      current: 3,
      total: 5,
      planType: 'Flex Plan'
    },
    balance: {
      amount: 90000,
      description: 'Balance'
    },
    wallet: {
      amount: 50000,
      description: 'Available'
    }
  };
};


export const fetchRecentTransactions = async (): Promise<TransactionItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return recentTransactionsData;
};

export const fetchChartData = async (year: string): Promise<ChartDataItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Return different data based on year for demo
  if (year === '2024') {
    return chartData.map(item => ({ ...item, value: item.value * 0.8 }));
  }
  if (year === '2023') {
    return chartData.map(item => ({ ...item, value: item.value * 0.6 }));
  }
  
  return chartData;
};

// Wallet mock data
export const walletTransactionsData = [
  {
    date: 'Dec 15, 2024',
    description: 'Wallet Top-Up',
    amount: 25000,
    type: 'credit',
    status: 'completed'
  },
  {
    date: 'Dec 12, 2024',
    description: 'Loan Repayment',
    amount: -15000,
    type: 'debit',
    status: 'completed'
  },
  {
    date: 'Dec 08, 2024',
    description: 'Wallet Top-Up',
    amount: 30000,
    type: 'credit',
    status: 'completed'
  },
  {
    date: 'Dec 05, 2024',
    description: 'School Fee Payment',
    amount: -20000,
    type: 'debit',
    status: 'completed'
  },
  {
    date: 'Jan 10, 2025',
    description: 'Fund Wallet Top-Up',
    amount: 40000,
    type: 'credit',
    status: 'pending'
  },
  {
    date: 'Jan 12, 2025',
    description: 'Wallet Debit for Payment',
    amount: -10000,
    type: 'debit',
    status: 'completed'
  }
];

// FAQ data
export const faqItems = [
  {
    question: 'How do I apply for a loan?',
    answer: 'You can apply for a loan by clicking on "Apply for Loan" in your dashboard and filling out the required information.'
  },
  {
    question: 'What documents do I need for school verification?',
    answer: 'You need your school ID, admission letter, and current school fee structure for verification.'
  },
  {
    question: 'How long does loan approval take?',
    answer: 'Loan approval typically takes 24-48 hours after all required documents are submitted.'
  },
  {
    question: 'Can I make early repayments?',
    answer: 'Yes, you can make early repayments without any penalties. This will help reduce your total interest.'
  }
];

// School verification data
export const verificationStepsData = [
  {
    id: 1,
    title: 'School Information',
    description: 'Provide your school details and contact information',
    status: 'completed'
  },
  {
    id: 2,
    title: 'Document Upload',
    description: 'Upload required documents for verification',
    status: 'completed'
  },
  {
    id: 3,
    title: 'School Verification',
    description: 'We verify your school details with the institution',
    status: 'completed'
  },
  {
    id: 4,
    title: 'Final Approval',
    description: 'Final approval and account activation',
    status: 'completed'
  }
];

export const schoolDetailsData = {
  name: 'Springfield School',
  address: '123 Education Street, Lagos, Nigeria',
  phone: '+234 801 234 5678',
  email: 'admin@springfieldschool.edu.ng',
  verificationDate: 'Dec 1, 2024',
  status: 'verified'
};

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Select status' },
  { value: 'employed_full_time', label: 'Employed (Full-time)' },
  { value: 'employed_part_time', label: 'Employed (Part-time)' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'student', label: 'Student' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'freelancer', label: 'Freelancer / Contractor' },
];

export const COUNTRY_OPTIONS = [
  { value: '', label: 'Select country' },

  // Africa
  { value: 'NG', label: 'Nigeria' },
  { value: 'GH', label: 'Ghana' },
  { value: 'KE', label: 'Kenya' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'EG', label: 'Egypt' },
  { value: 'MA', label: 'Morocco' },
  { value: 'TN', label: 'Tunisia' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'UG', label: 'Uganda' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'SN', label: 'Senegal' },

  // North America
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' },

  // South America
  { value: 'BR', label: 'Brazil' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colombia' },
  { value: 'PE', label: 'Peru' },

  // Europe
  { value: 'GB', label: 'United Kingdom' },
  { value: 'IE', label: 'Ireland' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'AT', label: 'Austria' },
  { value: 'ES', label: 'Spain' },
  { value: 'PT', label: 'Portugal' },
  { value: 'IT', label: 'Italy' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'FI', label: 'Finland' },
  { value: 'DK', label: 'Denmark' },
  { value: 'PL', label: 'Poland' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'HU', label: 'Hungary' },
  { value: 'RO', label: 'Romania' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'GR', label: 'Greece' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'EE', label: 'Estonia' },
  { value: 'LV', label: 'Latvia' },
  { value: 'LT', label: 'Lithuania' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'SI', label: 'Slovenia' },

  // Middle East
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'QA', label: 'Qatar' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'OM', label: 'Oman' },
  { value: 'IL', label: 'Israel' },
  { value: 'TR', label: 'Turkey' },
  { value: 'JO', label: 'Jordan' },

  // Asia
  { value: 'CN', label: 'China' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'IN', label: 'India' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'TH', label: 'Thailand' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'PH', label: 'Philippines' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'TW', label: 'Taiwan' },

  // Oceania
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },

  // Others
  { value: 'RU', label: 'Russia' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'KZ', label: 'Kazakhstan' },
];

export const PROGRAM_OPTIONS = [
  { value: '', label: 'Select program' },

  // Tech & Engineering
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'software_engineering', label: 'Software Engineering' },
  { value: 'information_technology', label: 'Information Technology' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'artificial_intelligence', label: 'Artificial Intelligence' },
  { value: 'cyber_security', label: 'Cyber Security' },
  { value: 'computer_engineering', label: 'Computer Engineering' },
  { value: 'electrical_engineering', label: 'Electrical Engineering' },
  { value: 'mechanical_engineering', label: 'Mechanical Engineering' },
  { value: 'civil_engineering', label: 'Civil Engineering' },
  { value: 'chemical_engineering', label: 'Chemical Engineering' },
  { value: 'biomedical_engineering', label: 'Biomedical Engineering' },
  { value: 'environmental_engineering', label: 'Environmental Engineering' },

  // Business & Economics
  { value: 'business_admin', label: 'Business Administration' },
  { value: 'economics', label: 'Economics' },
  { value: 'finance', label: 'Finance' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'international_business', label: 'International Business' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
  { value: 'human_resources', label: 'Human Resource Management' },
  { value: 'management', label: 'Management' },
  { value: 'supply_chain', label: 'Supply Chain Management' },

  // Health & Medicine
  { value: 'medicine', label: 'Medicine (MBBS / MD)' },
  { value: 'nursing', label: 'Nursing' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'dentistry', label: 'Dentistry' },
  { value: 'public_health', label: 'Public Health' },
  { value: 'biochemistry', label: 'Biochemistry' },
  { value: 'biotechnology', label: 'Biotechnology' },
  { value: 'microbiology', label: 'Microbiology' },
  { value: 'physiotherapy', label: 'Physiotherapy' },
  { value: 'radiography', label: 'Radiography' },

  // Law, Politics & Social Sciences
  { value: 'law', label: 'Law' },
  { value: 'international_law', label: 'International Law' },
  { value: 'political_science', label: 'Political Science' },
  { value: 'international_relations', label: 'International Relations' },
  { value: 'sociology', label: 'Sociology' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'criminology', label: 'Criminology' },
  { value: 'public_administration', label: 'Public Administration' },

  // Arts, Media & Design
  { value: 'art_design', label: 'Art & Design' },
  { value: 'graphic_design', label: 'Graphic Design' },
  { value: 'fashion_design', label: 'Fashion Design' },
  { value: 'fine_arts', label: 'Fine Arts' },
  { value: 'photography', label: 'Photography' },
  { value: 'film_production', label: 'Film Production' },
  { value: 'media_studies', label: 'Media Studies' },
  { value: 'journalism', label: 'Journalism' },
  { value: 'communication_studies', label: 'Communication Studies' },

  // Education & Humanities
  { value: 'education', label: 'Education' },
  { value: 'early_childhood_education', label: 'Early Childhood Education' },
  { value: 'english_literature', label: 'English Literature' },
  { value: 'linguistics', label: 'Linguistics' },
  { value: 'history', label: 'History' },
  { value: 'philosophy', label: 'Philosophy' },
  { value: 'theology', label: 'Theology' },

  // Natural Sciences
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'statistics', label: 'Statistics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'geology', label: 'Geology' },
  { value: 'environmental_science', label: 'Environmental Science' },

  // Architecture & Built Environment
  { value: 'architecture', label: 'Architecture' },
  { value: 'urban_planning', label: 'Urban Planning' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'construction_management', label: 'Construction Management' },

  // Hospitality & Tourism
  { value: 'hospitality_management', label: 'Hospitality Management' },
  { value: 'tourism_management', label: 'Tourism Management' },
  { value: 'event_management', label: 'Event Management' },

  // Agriculture & Food
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'food_science', label: 'Food Science' },
  { value: 'nutrition', label: 'Nutrition & Dietetics' },
  { value: 'animal_science', label: 'Animal Science' },
  { value: 'forestry', label: 'Forestry' },

  // Other professional programs
  { value: 'actuarial_science', label: 'Actuarial Science' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'project_management', label: 'Project Management' },
  { value: 'logistics', label: 'Logistics & Transport' },
  { value: 'sports_science', label: 'Sports Science' },
];


// Extended transaction data with additional fields
export const recentTransactionsDataFull = recentTransactionsData.map((transaction, index) => ({
  ...transaction,
  transactionId: `TXN-${String(index + 1000).padStart(6, '0')}`,
  category: transaction.description.includes('Installment') ? 'Loan Repayment' : 
            transaction.description.includes('Wallet') ? 'Wallet' : 'Payment',
  reference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
  balance: 50000 + (index * 5000),
  actions: 'View Receipt'
}));

// Payment plan mock data
export const paymentPlanData: PaymentPlan = {
  planType: 'Flex Plan',
  planDuration: '6 Months',
  totalTuition: 75000,
  schoolName: 'Day School',
  currentStatus: 'active',
  paymentsCompleted: 3,
  totalPayments: 6,
  progress: 50,
  totalPaid: 37500,
  outstanding: 37500,
  nextRepayment: 12500,
  nextPaymentDate: 'January 12, 2026',
  installments: [
    {
      installmentNumber: 1,
      amount: 12500,
      dueDate: 'Oct 12, 2025',
      status: 'paid'
    },
    {
      installmentNumber: 2,
      amount: 12500,
      dueDate: 'Oct 12, 2025',
      status: 'paid'
    },
    {
      installmentNumber: 3,
      amount: 12500,
      dueDate: 'Nov 12, 2025',
      status: 'pending'
    },
    {
      installmentNumber: 4,
      amount: 12500,
      dueDate: 'Dec 12, 2025',
      status: 'pending'
    },
    {
      installmentNumber: 5,
      amount: 12500,
      dueDate: 'Jan 12, 2026',
      status: 'pending'
    },
    {
      installmentNumber: 6,
      amount: 12500,
      dueDate: 'Feb 12, 2026',
      status: 'pending'
    }
  ]
};

// Overdue payment plan mock data
export const overduePaymentPlanData: PaymentPlan = {
  planType: 'Flex Plan',
  planDuration: '6 Months',
  totalTuition: 75000,
  schoolName: 'Day School',
  currentStatus: 'overdue',
  paymentsCompleted: 3,
  totalPayments: 6,
  progress: 50,
  totalPaid: 37500,
  outstanding: 37500,
  nextRepayment: 17500,
  nextPaymentDate: 'January 12, 2026',
  overdueAmount: 17500,
  overdueDays: 10,
  installments: [
    {
      installmentNumber: 1,
      amount: 12500,
      dueDate: 'Oct 12, 2025',
      status: 'paid'
    },
    {
      installmentNumber: 2,
      amount: 12500,
      dueDate: 'Oct 12, 2025',
      status: 'paid'
    },
    {
      installmentNumber: 3,
      amount: 12500,
      dueDate: 'Nov 12, 2025',
      status: 'overdue'
    },
    {
      installmentNumber: 4,
      amount: 12500,
      dueDate: 'Dec 12, 2025',
      status: 'pending'
    },
    {
      installmentNumber: 5,
      amount: 12500,
      dueDate: 'Jan 12, 2026',
      status: 'pending'
    },
    {
      installmentNumber: 6,
      amount: 12500,
      dueDate: 'Feb 12, 2026',
      status: 'pending'
    }
  ]
};

export const fetchPaymentPlan = async (): Promise<PaymentPlan | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate different states - you can change this to test different scenarios
  const scenarios = [
    paymentPlanData,        // Active plan
    overduePaymentPlanData, // Overdue plan
    null                    // No plan
  ];
  
  // Return active plan by default (change index to test other scenarios)
  //@ts-ignore
  return scenarios[0];
};
