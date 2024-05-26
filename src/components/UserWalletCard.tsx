import {useEffect, useState} from "react";
import {CandidePaymaster, SafeAccountV0_2_0 as SafeAccount, SocialRecoveryModule,} from "abstractionkit";
import {JsonRpcProvider, toBigInt} from "ethers";
import {setItem} from "../logic/storage.ts";
import {socialRecoveryModuleAddress} from "../utils.ts";

const jsonRPCProvider = import.meta.env.VITE_JSON_RPC_PROVIDER;
const bundlerUrl = import.meta.env.VITE_BUNDLER_URL;
const paymasterUrl = import.meta.env.VITE_PAYMASTER_URL;
const chainId = import.meta.env.VITE_CHAIN_ID;
const chainName = import.meta.env.VITE_CHAIN_NAME as string;
const ownerPublicAddress = import.meta.env.VITE_OWNER_PUBLIC_ADDRESS as string;
const pk = import.meta.env.VITE_OWNER_PRIVATE_KEY as string;
const c2Nonce = import.meta.env.VITE_OWNER_NONCE as string;

function UserWalletCard() {
  const [userOpHash, setUserOpHash] = useState<string>();
  const [deployed, setDeployed] = useState<boolean>(false);
  const [loadingTx, setLoadingTx] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [txHash, setTxHash] = useState<string>();

  const safeAccount = SafeAccount.initializeNewAccount([ownerPublicAddress], {c2Nonce: toBigInt(c2Nonce)});
  const accountAddress = safeAccount.accountAddress;
  setItem("safe:account-address", accountAddress);

  const provider = new JsonRpcProvider(import.meta.env.VITE_JSON_RPC_PROVIDER);

  const isDeployed = async () => {
    const safeCode = await provider.getCode(accountAddress);
    setDeployed(safeCode !== "0x");
  };

  const [guardianAddress, setGuardianAddress] = useState("");

  const handleAddGuardian = async () => {
    setLoadingTx(true);
    setTxHash("");
    setError("");

    // mint an NFT
    const srm = new SocialRecoveryModule(socialRecoveryModuleAddress);

    const enableModuleTx =
      srm.createEnableModuleMetaTransaction(accountAddress);

    const addGuardianTx = srm.createAddGuardianWithThresholdMetaTransaction(
      accountAddress,
      guardianAddress,
      1n //threshold
    );

    let userOperation = await safeAccount.createUserOperation(
      [enableModuleTx, addGuardianTx],
      jsonRPCProvider,
      bundlerUrl
    );

    let paymaster: CandidePaymaster = new CandidePaymaster(paymasterUrl);
    userOperation = await paymaster.createSponsorPaymasterUserOperation(
      userOperation,
      bundlerUrl
    );
    try {
      userOperation.signature = safeAccount.signUserOperation(
          userOperation,
          [pk],
          chainId
      );

      const bundlerResponse = await safeAccount.sendUserOperation(
        userOperation,
        bundlerUrl
      );
      setUserOpHash(bundlerResponse.userOperationHash);
      let userOperationReceiptResult = await bundlerResponse.included();
      if (userOperationReceiptResult.success) {
        setTxHash(userOperationReceiptResult.receipt.transactionHash);
        console.log(
          "Added Guardian. The transaction hash is : " +
            userOperationReceiptResult.receipt.transactionHash
        );
        setUserOpHash("");
      } else {
        setError("Useroperation execution failed");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        setError(error.message);
      } else {
        setError("Unknown error");
      }
    }
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

  const [guardians, setGuardians] = useState([""]);
  const [guardiansCount, setGuardianCount] = useState(0);
  useEffect(() => {
    async function displayGuardians() {
      const srm = new SocialRecoveryModule(socialRecoveryModuleAddress);
      const guardiansList = await srm.getGuardians(
        jsonRPCProvider,
        accountAddress
      );

      setGuardians(guardiansList);
      setGuardianCount(guardiansList.length);
    }
    displayGuardians();
  }, [userOpHash]);

  return (
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
      {userOpHash && (
        <p>
          Adding Recovery Contact.. Track your operation on{" "}
          <a
            target="_blank"
            href={`https://eth-${chainName.toLowerCase()}.blockscout.com/op/${userOpHash}`}
          >
            the block explorer
          </a>
        </p>
      )}
      {txHash && (
        <>
          You collected an NFT, secured with your Safe Account & authenticated
          by your Device Passkeys.
          <br />
          <br />
          View more on{" "}
          <a
            target="_blank"
            href={`https://eth-${chainName}.blockscout.com/tx/${txHash}`}
          >
            the block explorer
          </a>
          <br />
        </>
      )}
      {loadingTx && !userOpHash ? (
        <p>"Preparing transaction.."</p>
      ) : (
        accountAddress && (
          <div className="card">
            <br />
            <input
              type="text"
              placeholder="Recovery Contact Address"
              value={guardianAddress}
              onChange={(event) => setGuardianAddress(event.target.value)}
            />
            <button onClick={handleAddGuardian} disabled={!!userOpHash}>
              Add
            </button>
          </div>
        )
      )}{" "}
      <br />
      Recovery Contacts: {guardiansCount}
      <ul>
        {guardians.map((guardian, index) => (
          <li key={index}>{`${index + 1}. ${guardian}`}</li>
        ))}
      </ul>
      {error && (
        <div className="card">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}

export { UserWalletCard };
