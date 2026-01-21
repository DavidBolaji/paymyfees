
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  phone: 'phone',
  password: 'password',
  role: 'role',
  fullName: 'fullName',
  profileImage: 'profileImage',
  emailVerified: 'emailVerified',
  phoneVerified: 'phoneVerified',
  isActive: 'isActive',
  lastLogin: 'lastLogin',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ParentProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  dateOfBirth: 'dateOfBirth',
  address: 'address',
  city: 'city',
  state: 'state',
  country: 'country',
  bvn: 'bvn',
  nin: 'nin',
  bvnVerified: 'bvnVerified',
  ninVerified: 'ninVerified',
  employmentStatus: 'employmentStatus',
  employerName: 'employerName',
  monthlyIncome: 'monthlyIncome',
  creditScore: 'creditScore',
  totalLoans: 'totalLoans',
  activeLoans: 'activeLoans',
  completedLoans: 'completedLoans',
  defaultedLoans: 'defaultedLoans',
  totalBorrowed: 'totalBorrowed',
  totalRepaid: 'totalRepaid',
  outstandingBalance: 'outstandingBalance',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SchoolProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  schoolName: 'schoolName',
  schoolAddress: 'schoolAddress',
  city: 'city',
  state: 'state',
  country: 'country',
  schoolEmail: 'schoolEmail',
  schoolPhone: 'schoolPhone',
  website: 'website',
  contactPersonName: 'contactPersonName',
  contactPersonPosition: 'contactPersonPosition',
  contactPersonEmail: 'contactPersonEmail',
  contactPersonPhone: 'contactPersonPhone',
  bankName: 'bankName',
  accountNumber: 'accountNumber',
  accountName: 'accountName',
  isVerified: 'isVerified',
  verifiedAt: 'verifiedAt',
  totalStudents: 'totalStudents',
  totalDisbursements: 'totalDisbursements',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StudentScalarFieldEnum = {
  id: 'id',
  parentId: 'parentId',
  schoolId: 'schoolId',
  fullName: 'fullName',
  dateOfBirth: 'dateOfBirth',
  studentClass: 'studentClass',
  studentId: 'studentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LoanScalarFieldEnum = {
  id: 'id',
  loanNumber: 'loanNumber',
  userId: 'userId',
  studentId: 'studentId',
  schoolId: 'schoolId',
  loanAmount: 'loanAmount',
  interestRate: 'interestRate',
  totalInterest: 'totalInterest',
  totalAmount: 'totalAmount',
  monthlyPayment: 'monthlyPayment',
  repaymentMonths: 'repaymentMonths',
  schoolName: 'schoolName',
  academicSession: 'academicSession',
  term: 'term',
  status: 'status',
  amountDisbursed: 'amountDisbursed',
  amountRepaid: 'amountRepaid',
  outstandingBalance: 'outstandingBalance',
  applicationDate: 'applicationDate',
  approvalDate: 'approvalDate',
  disbursementDate: 'disbursementDate',
  firstPaymentDate: 'firstPaymentDate',
  lastPaymentDate: 'lastPaymentDate',
  completionDate: 'completionDate',
  approvedBy: 'approvedBy',
  rejectionReason: 'rejectionReason',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InstallmentScalarFieldEnum = {
  id: 'id',
  loanId: 'loanId',
  installmentNumber: 'installmentNumber',
  amount: 'amount',
  dueDate: 'dueDate',
  paidDate: 'paidDate',
  status: 'status',
  daysOverdue: 'daysOverdue',
  lateFee: 'lateFee',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  paymentReference: 'paymentReference',
  loanId: 'loanId',
  installmentId: 'installmentId',
  userId: 'userId',
  amount: 'amount',
  paymentMethod: 'paymentMethod',
  status: 'status',
  gatewayReference: 'gatewayReference',
  gatewayResponse: 'gatewayResponse',
  paymentDate: 'paymentDate',
  confirmedAt: 'confirmedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DisbursementScalarFieldEnum = {
  id: 'id',
  disbursementReference: 'disbursementReference',
  loanId: 'loanId',
  schoolId: 'schoolId',
  amount: 'amount',
  status: 'status',
  bankName: 'bankName',
  accountNumber: 'accountNumber',
  accountName: 'accountName',
  transferReference: 'transferReference',
  transferResponse: 'transferResponse',
  disbursedAt: 'disbursedAt',
  confirmedAt: 'confirmedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LoanStatusHistoryScalarFieldEnum = {
  id: 'id',
  loanId: 'loanId',
  previousStatus: 'previousStatus',
  newStatus: 'newStatus',
  changedBy: 'changedBy',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.SchoolVerificationScalarFieldEnum = {
  id: 'id',
  loanId: 'loanId',
  schoolId: 'schoolId',
  studentName: 'studentName',
  studentClass: 'studentClass',
  invoiceAmount: 'invoiceAmount',
  status: 'status',
  enrollmentConfirmed: 'enrollmentConfirmed',
  invoiceConfirmed: 'invoiceConfirmed',
  actualInvoiceAmount: 'actualInvoiceAmount',
  requestedAt: 'requestedAt',
  respondedAt: 'respondedAt',
  verifiedBy: 'verifiedBy',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  parentId: 'parentId',
  schoolId: 'schoolId',
  loanId: 'loanId',
  documentType: 'documentType',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  fileSize: 'fileSize',
  mimeType: 'mimeType',
  isVerified: 'isVerified',
  verifiedAt: 'verifiedAt',
  verifiedBy: 'verifiedBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WalletScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  balance: 'balance',
  currency: 'currency',
  dailyLimit: 'dailyLimit',
  monthlyLimit: 'monthlyLimit',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  transactionReference: 'transactionReference',
  userId: 'userId',
  walletId: 'walletId',
  paymentId: 'paymentId',
  type: 'type',
  amount: 'amount',
  balanceBefore: 'balanceBefore',
  balanceAfter: 'balanceAfter',
  description: 'description',
  category: 'category',
  paymentMethod: 'paymentMethod',
  status: 'status',
  gatewayReference: 'gatewayReference',
  gatewayResponse: 'gatewayResponse',
  metadata: 'metadata',
  transactionDate: 'transactionDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  isRead: 'isRead',
  readAt: 'readAt',
  actionUrl: 'actionUrl',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmailLogScalarFieldEnum = {
  id: 'id',
  recipientEmail: 'recipientEmail',
  recipientName: 'recipientName',
  subject: 'subject',
  body: 'body',
  status: 'status',
  sentAt: 'sentAt',
  failedAt: 'failedAt',
  errorMessage: 'errorMessage',
  emailType: 'emailType',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.SmsLogScalarFieldEnum = {
  id: 'id',
  recipientPhone: 'recipientPhone',
  message: 'message',
  status: 'status',
  sentAt: 'sentAt',
  failedAt: 'failedAt',
  errorMessage: 'errorMessage',
  gatewayReference: 'gatewayReference',
  gatewayResponse: 'gatewayResponse',
  smsType: 'smsType',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.SupportTicketScalarFieldEnum = {
  id: 'id',
  ticketNumber: 'ticketNumber',
  userId: 'userId',
  subject: 'subject',
  category: 'category',
  priority: 'priority',
  status: 'status',
  description: 'description',
  assignedTo: 'assignedTo',
  resolvedAt: 'resolvedAt',
  closedAt: 'closedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SupportMessageScalarFieldEnum = {
  id: 'id',
  ticketId: 'ticketId',
  senderId: 'senderId',
  senderRole: 'senderRole',
  message: 'message',
  isInternal: 'isInternal',
  createdAt: 'createdAt'
};

exports.Prisma.SupportAttachmentScalarFieldEnum = {
  id: 'id',
  ticketId: 'ticketId',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  fileSize: 'fileSize',
  mimeType: 'mimeType',
  createdAt: 'createdAt'
};

exports.Prisma.FaqScalarFieldEnum = {
  id: 'id',
  question: 'question',
  answer: 'answer',
  category: 'category',
  order: 'order',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WaitlistScalarFieldEnum = {
  id: 'id',
  role: 'role',
  fullName: 'fullName',
  email: 'email',
  phone: 'phone',
  institution: 'institution',
  loanAmount: 'loanAmount',
  status: 'status',
  invitedAt: 'invitedAt',
  registeredAt: 'registeredAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  oldValues: 'oldValues',
  newValues: 'newValues',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.SystemSettingScalarFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentReminderScalarFieldEnum = {
  id: 'id',
  installmentId: 'installmentId',
  reminderType: 'reminderType',
  sentAt: 'sentAt',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.UserOrderByRelevanceFieldEnum = {
  id: 'id',
  email: 'email',
  phone: 'phone',
  password: 'password',
  fullName: 'fullName',
  profileImage: 'profileImage'
};

exports.Prisma.ParentProfileOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  address: 'address',
  city: 'city',
  state: 'state',
  country: 'country',
  bvn: 'bvn',
  nin: 'nin',
  employmentStatus: 'employmentStatus',
  employerName: 'employerName'
};

exports.Prisma.SchoolProfileOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  schoolName: 'schoolName',
  schoolAddress: 'schoolAddress',
  city: 'city',
  state: 'state',
  country: 'country',
  schoolEmail: 'schoolEmail',
  schoolPhone: 'schoolPhone',
  website: 'website',
  contactPersonName: 'contactPersonName',
  contactPersonPosition: 'contactPersonPosition',
  contactPersonEmail: 'contactPersonEmail',
  contactPersonPhone: 'contactPersonPhone',
  bankName: 'bankName',
  accountNumber: 'accountNumber',
  accountName: 'accountName'
};

exports.Prisma.StudentOrderByRelevanceFieldEnum = {
  id: 'id',
  parentId: 'parentId',
  schoolId: 'schoolId',
  fullName: 'fullName',
  studentClass: 'studentClass',
  studentId: 'studentId'
};

exports.Prisma.LoanOrderByRelevanceFieldEnum = {
  id: 'id',
  loanNumber: 'loanNumber',
  userId: 'userId',
  studentId: 'studentId',
  schoolId: 'schoolId',
  schoolName: 'schoolName',
  academicSession: 'academicSession',
  term: 'term',
  approvedBy: 'approvedBy',
  rejectionReason: 'rejectionReason',
  notes: 'notes'
};

exports.Prisma.InstallmentOrderByRelevanceFieldEnum = {
  id: 'id',
  loanId: 'loanId'
};

exports.Prisma.PaymentOrderByRelevanceFieldEnum = {
  id: 'id',
  paymentReference: 'paymentReference',
  loanId: 'loanId',
  installmentId: 'installmentId',
  userId: 'userId',
  gatewayReference: 'gatewayReference',
  gatewayResponse: 'gatewayResponse'
};

exports.Prisma.DisbursementOrderByRelevanceFieldEnum = {
  id: 'id',
  disbursementReference: 'disbursementReference',
  loanId: 'loanId',
  schoolId: 'schoolId',
  bankName: 'bankName',
  accountNumber: 'accountNumber',
  accountName: 'accountName',
  transferReference: 'transferReference',
  transferResponse: 'transferResponse'
};

exports.Prisma.LoanStatusHistoryOrderByRelevanceFieldEnum = {
  id: 'id',
  loanId: 'loanId',
  changedBy: 'changedBy',
  reason: 'reason'
};

exports.Prisma.SchoolVerificationOrderByRelevanceFieldEnum = {
  id: 'id',
  loanId: 'loanId',
  schoolId: 'schoolId',
  studentName: 'studentName',
  studentClass: 'studentClass',
  verifiedBy: 'verifiedBy',
  notes: 'notes'
};

exports.Prisma.DocumentOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  parentId: 'parentId',
  schoolId: 'schoolId',
  loanId: 'loanId',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  mimeType: 'mimeType',
  verifiedBy: 'verifiedBy'
};

exports.Prisma.WalletOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  currency: 'currency'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.TransactionOrderByRelevanceFieldEnum = {
  id: 'id',
  transactionReference: 'transactionReference',
  userId: 'userId',
  walletId: 'walletId',
  paymentId: 'paymentId',
  description: 'description',
  category: 'category',
  gatewayReference: 'gatewayReference',
  gatewayResponse: 'gatewayResponse'
};

exports.Prisma.NotificationOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  message: 'message',
  actionUrl: 'actionUrl'
};

exports.Prisma.EmailLogOrderByRelevanceFieldEnum = {
  id: 'id',
  recipientEmail: 'recipientEmail',
  recipientName: 'recipientName',
  subject: 'subject',
  body: 'body',
  status: 'status',
  errorMessage: 'errorMessage',
  emailType: 'emailType'
};

exports.Prisma.SmsLogOrderByRelevanceFieldEnum = {
  id: 'id',
  recipientPhone: 'recipientPhone',
  message: 'message',
  status: 'status',
  errorMessage: 'errorMessage',
  gatewayReference: 'gatewayReference',
  gatewayResponse: 'gatewayResponse',
  smsType: 'smsType'
};

exports.Prisma.SupportTicketOrderByRelevanceFieldEnum = {
  id: 'id',
  ticketNumber: 'ticketNumber',
  userId: 'userId',
  subject: 'subject',
  category: 'category',
  description: 'description',
  assignedTo: 'assignedTo'
};

exports.Prisma.SupportMessageOrderByRelevanceFieldEnum = {
  id: 'id',
  ticketId: 'ticketId',
  senderId: 'senderId',
  message: 'message'
};

exports.Prisma.SupportAttachmentOrderByRelevanceFieldEnum = {
  id: 'id',
  ticketId: 'ticketId',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  mimeType: 'mimeType'
};

exports.Prisma.FaqOrderByRelevanceFieldEnum = {
  id: 'id',
  question: 'question',
  answer: 'answer',
  category: 'category'
};

exports.Prisma.WaitlistOrderByRelevanceFieldEnum = {
  id: 'id',
  role: 'role',
  fullName: 'fullName',
  email: 'email',
  phone: 'phone',
  institution: 'institution',
  loanAmount: 'loanAmount',
  status: 'status'
};

exports.Prisma.AuditLogOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent'
};

exports.Prisma.SystemSettingOrderByRelevanceFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  description: 'description'
};

exports.Prisma.PaymentReminderOrderByRelevanceFieldEnum = {
  id: 'id',
  installmentId: 'installmentId',
  reminderType: 'reminderType',
  status: 'status'
};
exports.UserRole = exports.$Enums.UserRole = {
  PARENT: 'PARENT',
  SCHOOL: 'SCHOOL',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT'
};

exports.LoanStatus = exports.$Enums.LoanStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DISBURSED: 'DISBURSED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  DEFAULTED: 'DEFAULTED',
  CANCELLED: 'CANCELLED'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  BANK_TRANSFER: 'BANK_TRANSFER',
  CARD: 'CARD',
  WALLET: 'WALLET',
  USSD: 'USSD'
};

exports.TransactionStatus = exports.$Enums.TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REVERSED: 'REVERSED'
};

exports.VerificationStatus = exports.$Enums.VerificationStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED'
};

exports.DocumentType = exports.$Enums.DocumentType = {
  BVN: 'BVN',
  NIN: 'NIN',
  PASSPORT: 'PASSPORT',
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  VOTERS_CARD: 'VOTERS_CARD',
  SALARY_SLIP: 'SALARY_SLIP',
  BANK_STATEMENT: 'BANK_STATEMENT',
  SCHOOL_INVOICE: 'SCHOOL_INVOICE',
  SCHOOL_ID: 'SCHOOL_ID',
  CAC_DOCUMENT: 'CAC_DOCUMENT',
  OTHER: 'OTHER'
};

exports.TransactionType = exports.$Enums.TransactionType = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  REMINDER: 'REMINDER'
};

exports.SupportTicketPriority = exports.$Enums.SupportTicketPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

exports.SupportTicketStatus = exports.$Enums.SupportTicketStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};

exports.Prisma.ModelName = {
  User: 'User',
  ParentProfile: 'ParentProfile',
  SchoolProfile: 'SchoolProfile',
  Student: 'Student',
  Loan: 'Loan',
  Installment: 'Installment',
  Payment: 'Payment',
  Disbursement: 'Disbursement',
  LoanStatusHistory: 'LoanStatusHistory',
  SchoolVerification: 'SchoolVerification',
  Document: 'Document',
  Wallet: 'Wallet',
  Transaction: 'Transaction',
  Notification: 'Notification',
  EmailLog: 'EmailLog',
  SmsLog: 'SmsLog',
  SupportTicket: 'SupportTicket',
  SupportMessage: 'SupportMessage',
  SupportAttachment: 'SupportAttachment',
  Faq: 'Faq',
  Waitlist: 'Waitlist',
  AuditLog: 'AuditLog',
  SystemSetting: 'SystemSetting',
  PaymentReminder: 'PaymentReminder'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
