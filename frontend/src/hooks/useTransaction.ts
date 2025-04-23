import { useContext } from "react";
import { TransactionContext } from "../contexts/transactionContext";

export function useTransaction() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransaction must be used within a TransactionProvider");
  }
  return context;
}
