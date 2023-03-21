import BuySeeds from "./BuySeeds"
import SellItem from "./SellItem"
import { ContractAbi } from "../../contracts";

interface MarketModalProps {
    contract: ContractAbi | null;
    updatePageNum: () => void;
}

export default function MarketModal({ contract, updatePageNum }: MarketModalProps) {
    return (
        <div className="market-modal">
            <BuySeeds
                contract={contract}
                updatePageNum={updatePageNum}
            />
            <SellItem
                contract={contract}
                updatePageNum={updatePageNum}
            />
        </div>
    )
}