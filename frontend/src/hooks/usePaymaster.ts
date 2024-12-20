import axios from "axios";
import { Address, type Coin, TransactionRequest, bn } from "fuels";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

type PaymasterMetadata = {
  maxValuePerCoin: string;
  allocateCoinRateLimit: {
    totalHits: number;
    resetTime: string;
  };
};

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
};

type PaymasterAllocate = {
  coin: Coin;
  jobId: string;
  utxoId: string;
};

export const usePaymaster = () => {
  const baseUrl = "https://fuelstation-mainnet.xyz:3001";
  const metadataUrl = `${baseUrl}/metadata`;
  const allocateUrl = `${baseUrl}/allocate-coin`;
  const signUrl = `${baseUrl}/sign`;
  // const jobCompleteUrl = `${baseUrl}/jobs/${jobId}/complete`;
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getRecaptchaToken = async (): Promise<string | null> => {
    if (!executeRecaptcha) {
      console.log("reCAPTCHA not yet available");
      return null;
    }
    const token = await executeRecaptcha("global_token");

    // Check if token exists and is less than 2 minutes old
    if (token) {
      return token;
    }
    return null;
  };

  const metadata = async (): Promise<PaymasterMetadata> => {
    const token = getRecaptchaToken();
    if (!token) {
      throw new Error("No valid reCAPTCHA token available");
    }

    const { data: MetaDataResponse } = await axios.get<PaymasterMetadata>(
      metadataUrl,
      {
        data: { recaptchaToken: token },
      },
    );
    console.log("MetaDataResponse", MetaDataResponse);
    const { maxValuePerCoin, allocateCoinRateLimit } = MetaDataResponse;
    if (!maxValuePerCoin) {
      throw new Error("No maxValuePerCoin found");
    }
    return { maxValuePerCoin, allocateCoinRateLimit };
  };

  const allocate = async (): Promise<PaymasterAllocate> => {
    const token = await getRecaptchaToken();
    if (!token) {
      throw new Error("No valid reCAPTCHA token available");
    }

    const { data } = await axios.post<PaymasterAllocateResponse>(allocateUrl, {
      recaptchaToken: token,
    });
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

    return { coin: gasCoin, jobId, utxoId };
  };

  const fetchSignature = async (request: TransactionRequest, jobId: string) => {
    const token = await getRecaptchaToken();
    if (!token) {
      throw new Error("No valid reCAPTCHA token available");
    }

    const response = await axios.post(signUrl, {
      request: request.toJSON(),
      jobId,
      recaptchaToken: token,
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

    return { signature: response.data.signature, gasInput, request };
  };

  const postJobComplete = async (jobId: string) => {
    const token = await getRecaptchaToken();
    if (!token) {
      throw new Error("No valid reCAPTCHA token available");
    }

    try {
      const response = await axios.post(`${baseUrl}/jobs/${jobId}/complete`, {
        recaptchaToken: token,
      });
      console.log("response", response);
      return true;
    } catch (error) {
      console.error("Failed to post job complete:", error);
      return true;
    }
  };

  const shouldUseGasless = async (): Promise<boolean> => {
    try {
      if (window.location.hostname === "localhost") {
        return true;
      }
      const { allocateCoinRateLimit } = await metadata();
      return allocateCoinRateLimit.totalHits < 19;
    } catch (error) {
      console.error("Failed to check rate limit:", error);
      return false;
    }
  };

  return {
    allocate,
    metadata,
    fetchSignature,
    shouldUseGasless,
    postJobComplete,
  };
};
