import { useEffect, useState } from "react";
import { SocialRecoveryModule } from "abstractionkit";

import { PasskeyLocalStorageFormat } from "../logic/passkeys";
import { getItem } from "../logic/storage";
import { JsonRpcProvider, Wallet } from "ethers";

const jsonRPCProvider = import.meta.env.VITE_JSON_RPC_PROVIDER;
const chainId = import.meta.env.VITE_CHAIN_ID;
const chainName = import.meta.env.VITE_CHAIN_NAME as string;
const newOwnerPublicAddress = import.meta.env.VITE_NEW_OWNER_PUBLIC_ADDRESS;

function GuardianCard({ passkey }: { passkey: PasskeyLocalStorageFormat }) {
  const [deployed, setDeployed] = useState<boolean>(false);
  const [loadingTx, setLoadingTx] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [accountToRecoverAddress, setAccountToRecoveryAddress] = useState("");

  const [recoverySignature, setRecoverySignature] = useState("");

  const accountAddress = getItem("accountAddress") as string;
  const provider = new JsonRpcProvider(import.meta.env.VITE_JSON_RPC_PROVIDER);

  const isDeployed = async () => {
    const safeCode = await provider.getCode(accountAddress);
    setDeployed(safeCode !== "0x");
  };

  const handleRecoverAccount = async () => {
    setLoadingTx(true);
    setRecoverySignature("");
    setError("");

    // local wallet demo to test
    const provider = new JsonRpcProvider(jsonRPCProvider);
    const eoaGuardianAddress = "0x9d4982D853B09E863669cEfB1111A08c0b0124aA";
    const eoaWallet = new Wallet(
      "0x",
      provider
    );

    const srm = new SocialRecoveryModule();
    const confirmRecoveryTx = srm.createConfirmRecoveryMetaTransaction(
      accountToRecoverAddress,
      [newOwnerPublicAddress],
      1,
      true
    );
    const confirmRecovery = await eoaWallet.sendTransaction({
      to: confirmRecoveryTx.to,
      data: confirmRecoveryTx.data,
    });
    const txHash = confirmRecovery.hash;
    setRecoverySignature(txHash);

    // const finilizeRecoveryTx = srm.createFinalizeRecoveryMetaTransaction(
    //   accountToRecoverAddress,
    // )
    // const finilizeRecovery = await eoaWallet.sendTransaction({
    //   to: finilizeRecoveryTx.to,
    //   data: finilizeRecoveryTx.data,
    // });
    // const finilizeHash = finilizeRecovery.hash;

    setLoadingTx(false);
  };

  useEffect(() => {
    if (accountAddress) {
      async function isAccountDeployed() {
        await isDeployed();
      }
      isAccountDeployed();
    }
  }, [deployed, accountAddress]);

  return (
    <div className="card">
      {loadingTx ? (
        <p>"Signing.."</p>
      ) : (
        <div className="card">
          <br />
          <input
            type="text"
            placeholder="Account To Recover"
            value={accountToRecoverAddress}
            onChange={(event) =>
              setAccountToRecoveryAddress(event.target.value)
            }
          />
          <button onClick={handleRecoverAccount}>Recover Account</button>
        </div>
      )}{" "}
      {recoverySignature && <p>Recovery Signature: {recoverySignature}</p>}
      {error && (
        <div className="card">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}

export { GuardianCard };
