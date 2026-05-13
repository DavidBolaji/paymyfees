// Basic form validation without external dependencies

import { UploadedFile } from "@/components/ui/file-upload";

export interface LoanApplicationFormData {
  selectedPlan: number;
  loanAmount: number;
  schoolName: string;
  schoolId: string;
  academicSession: string;
  term: string;
  uploadedFiles: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    file: File;
  }>;
  consents: {
    schoolDetails: boolean;
    directPayment: boolean;
    terms: boolean;
  };
}

export interface LoanApplicationIntFormData {
  selectedPlan: number;
  loanAmount: number;
  schoolName: string;
  academicSession: string;
  countryOfStudy: string,
  programCourseOfStudy: string,
  employmentStatus: string,
  companyName: string,
  jobTitleRole: string,
  monthlyNetIncome: number,
  paymentFrequency: string,
  accountHolderName: string,
  bankName: string,
  accountNumber: string,
  countryOfBankAccount: '',
  term: string;
  uploadedFiles: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    file: File;
  }>;
  consents: {
    schoolDetails: boolean;
    directPayment: boolean;
    terms: boolean;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateLoanApplication = (data: Partial<LoanApplicationFormData>): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validate loan amount
  if (!data.loanAmount || data.loanAmount < 1000) {
    errors.loanAmount = 'Minimum loan amount is ₦1,000';
  } else if (data.loanAmount > 10000000) {
    errors.loanAmount = 'Maximum loan amount is ₦10,000,000';
  }

  // Validate school name
  if (!data.schoolName || data.schoolName.trim().length < 2) {
    errors.schoolName = 'School name is required';
  } else if (data.schoolName.length > 100) {
    errors.schoolName = 'School name is too long';
  }

  // Validate academic session
  if (!data.academicSession) {
    errors.academicSession = 'Academic session is required';
  }

  // Validate term
  if (!data.term) {
    errors.term = 'Term is required';
  }

  // Validate uploaded files
  if (!data.uploadedFiles || data.uploadedFiles.length === 0) {
    errors.uploadedFiles = 'At least one document is required';
  }

  // Validate consents
  if (!data.consents?.schoolDetails) {
    errors['consents.schoolDetails'] = 'You must confirm school details are correct';
  }
  if (!data.consents?.directPayment) {
    errors['consents.directPayment'] = 'You must understand direct payment terms';
  }
  if (!data.consents?.terms) {
    errors['consents.terms'] = 'You must agree to terms and conditions';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateLoanIntApplication = (data: Partial<LoanApplicationIntFormData>): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.loanAmount || data.loanAmount < 1000) {
    errors.loanAmount = 'Minimum loan amount is ₦1,000';
  } else if (data.loanAmount > 10000000) {
    errors.loanAmount = 'Maximum loan amount is ₦10,000,000';
  }

  if (!data.schoolName || data.schoolName.trim().length < 2) {
    errors.schoolName = 'School name is required';
  }

  if (!data.academicSession) {
    errors.academicSession = 'Academic session is required';
  }

  if (!data.countryOfStudy) {
    errors.countryOfStudy = 'Country of study is required';
  }

  if (!data.programCourseOfStudy) {
    errors.programCourseOfStudy = 'Program/Course of study is required';
  }

  if (!data.employmentStatus) {
    errors.employmentStatus = 'Employment status is required';
  }

  if (!data.accountHolderName || data.accountHolderName.trim().length < 2) {
    errors.accountHolderName = 'Account holder name is required';
  }

  if (!data.bankName || data.bankName.trim().length < 2) {
    errors.bankName = 'Bank name is required';
  }

  if (!data.accountNumber || data.accountNumber.trim().length < 10) {
    errors.accountNumber = 'Account number must be at least 10 digits';
  }

  if (!data.countryOfBankAccount) {
    errors.countryOfBankAccount = 'Country of bank account is required';
  }

  if (!data.uploadedFiles || data.uploadedFiles.length === 0) {
    errors.uploadedFiles = 'At least one document is required';
  }

  if (!data.consents?.schoolDetails) {
    errors['consents.schoolDetails'] = 'You must confirm school details are correct';
  }
  if (!data.consents?.directPayment) {
    errors['consents.directPayment'] = 'You must understand direct payment terms';
  }
  if (!data.consents?.terms) {
    errors['consents.terms'] = 'You must agree to terms and conditions';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Individual field validation helpers
export const validateSchoolName = (value: string): string | null => {
  if (!value || value.trim().length < 2) {
    return 'School name is required';
  }
  if (value.length > 100) {
    return 'School name is too long';
  }
  return null;
};

export const validateLoanAmount = (value: number): string | null => {
  if (!value || value < 1000) {
    return 'Minimum loan amount is ₦1,000';
  }
  if (value > 10000000) {
    return 'Maximum loan amount is ₦10,000,000';
  }
  return null;
};


export interface SchoolVerficationFormData {
  schoolName: string;
  academicLevel: string;
  address: string;
  academicSession: string;
  uploadedFiles: UploadedFile[];
  consents: {
    terms: boolean;
  };
}


export const validateSchoolApplication = (data: Partial<SchoolVerficationFormData>): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validate school name
  if (!data.schoolName || data.schoolName.trim().length < 2) {
    errors.schoolName = 'School name is required';
  } else if (data.schoolName.length > 100) {
    errors.schoolName = 'School name is too long';
  }

  // Validate Academic level
  if (!data.academicLevel || data.academicLevel.trim().length < 2) {
    errors.academicLevel = 'Academic level is required';
  } else if (data.academicLevel.length > 100) {
    errors.schoolName = 'Academic level is too long';
  }

  // Validate Address
  if (!data.address || data.address.trim().length < 2) {
    errors.address = 'Address is required';
  } else if (data.address.length > 400) {
    errors.schoolName = 'Address is too long';
  }

  // Validate academic session
  if (!data.academicSession) {
    errors.academicSession = 'Academic session is required';
  }

  // Validate uploaded files
  if (!data.uploadedFiles || data.uploadedFiles.length === 0) {
    errors.uploadedFiles = 'At least one document is required';
  }

  if (!data.consents?.terms) {
    errors['consents.terms'] = 'You must agree to terms and conditions';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};


