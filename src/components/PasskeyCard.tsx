import {useState} from "react";

import {
  generateAndStorePrivateKey, getBlobPublicKey,
  PasskeyLocalStorageFormat,
} from "../logic/passkeys";
import {GuardianCard} from "./GuardianCard.tsx";

const chainName = import.meta.env.VITE_CHAIN_NAME as string;

function PasskeyCard({
  passkey,
  handleCreatePasskeyClick,
}: {
  passkey?: PasskeyLocalStorageFormat;
  handleCreatePasskeyClick: () => void;
}) {
  const [accountAddress, setAccountAddress] = useState<string | null>(passkey ? getBlobPublicKey(passkey) : null);

  const handleAccountInitiation = async () => {
    if (!passkey) return false;
    const accountAddress = await generateAndStorePrivateKey(passkey!);
    if (!accountAddress){
      alert("Blob writing failed, this may be due to webauthn large blob extension not being supported by your browser or your credentials authenticator");
      return false;
    }
    setAccountAddress(accountAddress);
  };

  return passkey ? (accountAddress ? (
    <div className="card">
      <p>
        Address:{" "}
        <a
          target="_blank"
          href={`https://eth-${chainName}.blockscout.com/address/${accountAddress}`}
        >
          {accountAddress}
        </a>
      </p>
      {passkey && <GuardianCard passkey={passkey} />}
    </div>
  ) : (
      <div className="card">
        <p>
          Now you need to initiate your account by storing a private key blob to your passkey credentials, this private key is not stored locally or on any backend, only on your passkey credentials
        </p>
        <button onClick={handleAccountInitiation}>Initiate Account</button>
      </div>
  )) : (
      <div className="card">
        <p>
          First, you need to create a passkey which will be used to sign
          transactions
        </p>
        <button onClick={handleCreatePasskeyClick}>Create Account</button>
      </div>
  );
}

export { PasskeyCard };
