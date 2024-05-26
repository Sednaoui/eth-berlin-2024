import { useEffect, useState } from "react";
import { SocialRecoveryModule } from "abstractionkit";

import { PasskeyLocalStorageFormat, readPrivateKey } from "../logic/passkeys";
import { getItem } from "../logic/storage";
import { JsonRpcProvider, Wallet } from "ethers";
import {socialRecoveryModuleAddress} from "../utils.ts";

const jsonRPCProvider = import.meta.env.VITE_JSON_RPC_PROVIDER;

function GuardianCard({ passkey }: { passkey: PasskeyLocalStorageFormat }) {
  const [deployed, setDeployed] = useState<boolean>(false);
  const [loadingTx, setLoadingTx] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [newOwnerAddress, setNewOwnerAddress] = useState("");

  const [recoverySignature, setRecoverySignature] = useState("");
  const recoveryAccountAddress = getItem("safe:account-address") as string;

  const provider = new JsonRpcProvider(import.meta.env.VITE_JSON_RPC_PROVIDER);

  const isDeployed = async () => {
    const safeCode = await provider.getCode(recoveryAccountAddress);
    setDeployed(safeCode !== "0x");
  };

  const handleRecoverAccount = async () => {
    setLoadingTx(true);
    setRecoverySignature("");
    setError("");

    const provider = new JsonRpcProvider(jsonRPCProvider);
    const guardianPrivateKey = (await readPrivateKey(passkey))!;

    const eoaWallet = new Wallet(guardianPrivateKey, provider);

    const srm = new SocialRecoveryModule(socialRecoveryModuleAddress);
    const nonce = await srm.nonce(jsonRPCProvider, recoveryAccountAddress);
    const recoveryHash = await srm.getRecoveryHash(
      jsonRPCProvider,
      recoveryAccountAddress,
      [newOwnerAddress],
      1,
      nonce
    );

    console.log("signer", eoaWallet.address);
    console.log("nonce", nonce);
    console.log("recoveryHash", recoveryHash);

    const recoverySignature = eoaWallet.signingKey.sign(recoveryHash);
    setRecoverySignature(recoverySignature.serialized);

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
    if (recoveryAccountAddress) {
      async function isAccountDeployed() {
        await isDeployed();
      }
      isAccountDeployed();
    }
  }, [deployed, recoveryAccountAddress]);

  return (
    <div className="card">
      {loadingTx ? (
        <p>"Signing.."</p>
      ) : (
        <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
          <label style={{marginTop: '10px'}}>
            Account to recover
          </label>
          <input
            type="text"
            placeholder="Account to Recover"
            value={recoveryAccountAddress}
            disabled={true}
          />
          <label style={{marginTop: '10px'}}>
            New Owner Address
          </label>
          <input
            type="text"
            placeholder="New owner"
            value={newOwnerAddress}
            onChange={(event) =>
              setNewOwnerAddress(event.target.value)
            }
          />
          <br/>
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

export {GuardianCard};
