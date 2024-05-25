import { useEffect, useState } from "react";
import { SocialRecoveryModule } from "abstractionkit";

import { PasskeyLocalStorageFormat, readPrivateKey } from "../logic/passkeys";
import { getItem } from "../logic/storage";
import { JsonRpcProvider, Wallet } from "ethers";

const jsonRPCProvider = import.meta.env.VITE_JSON_RPC_PROVIDER;
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

    const provider = new JsonRpcProvider(jsonRPCProvider);
    const guardianPrivateKey = await readPrivateKey(passkey) || "";

    const eoaWallet = new Wallet(guardianPrivateKey, provider);

    const srm = new SocialRecoveryModule();
    const confirmRecoveryTx = srm.createConfirmRecoveryMetaTransaction(
      accountToRecoverAddress,
      [newOwnerPublicAddress],
      1,
      false
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
