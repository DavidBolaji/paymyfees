// Basic form validation without external dependencies

export interface LoanApplicationFormData {
  selectedPlan: number;
  loanAmount: number;
  schoolName: string;
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