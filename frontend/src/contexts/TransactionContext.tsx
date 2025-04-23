import { useState, ReactNode } from "react";
import { TransactionContext } from "./transactionContext";

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [otherTransactionDone, setOtherTransactionDone] = useState(false);

  return (
    <TransactionContext.Provider
      value={{ otherTransactionDone, setOtherTransactionDone }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
