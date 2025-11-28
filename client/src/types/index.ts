
// Account and Transaction types
export interface Account {
  accountId: number;
  accountName: string | null;
  accountNumber: string;
  accountStatus: string;
  accountType: string;
  availableBalance: number;
  blockedFunds: number;
  branchCode: string;
  clearedBalance: number;
  currencyCode: string;
  currentBalance: number;
  dateCreated: string; // or Date if you convert it
  overdraftLimit: number;
  productCode: string;
}


export interface Transaction {
  id: number;
  approver: string;
  balanceAfter: number;
  balanceBefore: number;
  creditAmount: number;
  debitAmount: number;
  narration: string;
  referenceNumber: string;
  transactionDate: number;  // looks like a timestamp (ms)
  valueDate: string;        // or Date if you convert it
}

// Auth types
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    userName: string;
    userId: string;
  };
}


export interface FormErrors {
  baseNumber?: string;
  password?: string;
}