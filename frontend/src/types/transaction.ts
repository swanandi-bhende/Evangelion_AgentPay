export interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  recipient: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  hashScanUrl: string;
  token: string;
}

export interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  addTransactionFromAgent: (response: string, transactionId?: string) => void;
  loading: boolean;
}