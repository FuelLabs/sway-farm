import { useState } from "react";
import { ContractAbi } from "../contracts";

interface LevelUpProps {
    contract: ContractAbi | null;
}

export default function LevelUp({ contract }: LevelUpProps) {
    return (
        <div>
            <h3>Level Up</h3>
        </div>
    )
}