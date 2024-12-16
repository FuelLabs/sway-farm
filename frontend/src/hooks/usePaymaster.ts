import axios from "axios";
import { Address, type Coin, TransactionRequest, bn } from "fuels";

type PaymasterMetadata = {
  maxValuePerCoin: string;
}

type PaymasterAllocateResponse = {
  coin: {
    id: string;
    amount: string;
    assetId: string;
    owner: string;
    blockCreated: string;
    txCreatedIdx: string;
  };
  jobId: string;
  utxoId: string;
}

type PaymasterAllocate = {
  coin: Coin;
  jobId: string;
  utxoId: string;
}

export const usePaymaster = () => {
  const baseUrl = 'http://167.71.42.88:3000';
  const metadataUrl = `${baseUrl}/metadata`;
  const allocateUrl = `${baseUrl}/allocate-coin`;
  const signUrl = `${baseUrl}/sign`;


  const metadata = async (): Promise<PaymasterMetadata> => {
    const { data: MetaDataResponse } = await axios.get<PaymasterMetadata>(metadataUrl);
    const { maxValuePerCoin } = MetaDataResponse;
    if (!maxValuePerCoin) {
      throw new Error("No maxValuePerCoin found");
    }
    return { maxValuePerCoin};
  }


  const allocate = async (): Promise<PaymasterAllocate> => {
    const { data } = await axios.post<PaymasterAllocateResponse>(allocateUrl);
    const { jobId, utxoId, coin } = data;

    if (!coin) {
      throw new Error("No coin found");
    }
    if (!jobId) {
      throw new Error("No jobId found");
    }
    const gasCoin: Coin = {
      id: data.coin.id,
      amount: bn(data.coin.amount),
      assetId: data.coin.assetId,
      owner: Address.fromAddressOrString(data.coin.owner),
      blockCreated: bn(data.coin.blockCreated),
      txCreatedIdx: bn(data.coin.txCreatedIdx),
    };

    return { coin: gasCoin, jobId, utxoId }
  }

  const fetchSignature = async (request: TransactionRequest, jobId: string) => {
    // return;
    const response = await axios.post(signUrl, {
      request: request.toJSON(),
      jobId,
    });
    if (response.status !== 200) {
      throw new Error("Failed to sign transaction");
    }

    if (!response.data.signature) {
      throw new Error("No signature found");
    }
    console.log("response.data", response.data);
    const gasInput = request.inputs.find((coin) => {
      return coin.type === 0;
    });
    if (!gasInput) {
      throw new Error("Gas coin not found");
    }

    return { signature: response.data.signature, gasInput, request }
  }

  return {
    allocate,
    metadata,
    fetchSignature,
  }
}