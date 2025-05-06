import type { BytesLike, ResolvedOutput } from "fuels";
import type { Dispatch, SetStateAction } from "react";

import type { FarmContract } from "../../sway-api";

import BuySeeds from "./BuySeeds";
import SellItem from "./SellItem";

interface MarketModalProps {
  contract: FarmContract | null;
  updatePageNum: () => void;
  items: number;
  setItems: Dispatch<SetStateAction<number>>;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  farmCoinAssetID: BytesLike;
  onBuySuccess: () => void;
  lastETHResolvedOutput: React.MutableRefObject<ResolvedOutput[] | null>;
  isTransactionInProgress: React.MutableRefObject<boolean>;
}

export default function MarketModal({
  contract,
  updatePageNum,
  items,
  setItems,
  setCanMove,
  farmCoinAssetID,
  onBuySuccess,
  lastETHResolvedOutput,
  isTransactionInProgress,
}: MarketModalProps) {
  return (
    <div className="market-modal">
      <BuySeeds
        contract={contract}
        updatePageNum={updatePageNum}
        setCanMove={setCanMove}
        farmCoinAssetID={farmCoinAssetID}
        onBuySuccess={onBuySuccess}
        lastETHResolvedOutput={lastETHResolvedOutput}
        isTransactionInProgress={isTransactionInProgress}
      />
      {items > 0 && (
        <SellItem
          contract={contract}
          updatePageNum={updatePageNum}
          items={items}
          setCanMove={setCanMove}
          setItems={setItems}
          lastETHResolvedOutput={lastETHResolvedOutput}
          isTransactionInProgress={isTransactionInProgress}
        />
      )}
    </div>
  );
}
