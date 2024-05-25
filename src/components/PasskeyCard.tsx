import { useMemo } from "react";

import {
  PasskeyLocalStorageFormat,
  generateAndStorePrivateKey,
} from "../logic/passkeys";

const chainName = import.meta.env.VITE_CHAIN_NAME as string;

function PasskeyCard({
  passkey,
  handleCreatePasskeyClick,
}: {
  passkey?: PasskeyLocalStorageFormat;
  handleCreatePasskeyClick: () => void;
}) {
  const getAccountAddress = useMemo(() => {
    if (!passkey) return undefined;

    async function generateAndStoreKey(p: PasskeyLocalStorageFormat) {
      const guardianAddress = await generateAndStorePrivateKey(p);
      return guardianAddress;
    }

    generateAndStoreKey(passkey);
  }, [passkey]);

  return passkey ? (
    <div className="card">
      <p>
        Address:{" "}
        <a
          target="_blank"
          href={`https://eth-${chainName}.blockscout.com/address/${getAccountAddress}`}
        >
          {getAccountAddress}
        </a>
      </p>
    </div>
  ) : (
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
