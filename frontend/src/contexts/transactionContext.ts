import { createContext } from "react";

interface TransactionContextType {
  otherTransactionDone: boolean;
  setOtherTransactionDone: (value: boolean) => void;
}

export const TransactionContext = createContext<
  TransactionContextType | undefined
>(undefined);
