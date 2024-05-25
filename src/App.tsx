import ethberlinLogo from "/ethberlin_logo.png";
import {
	PasskeyLocalStorageFormat,
	createPasskey,
	toLocalStorageFormat,
} from "./logic/passkeys.ts";
import "./App.css";
import { useLocalStorageState } from "./hooks/useLocalStorageState.ts";
import { useState } from "react";
import { PasskeyCard } from "./components/PasskeyCard.tsx";
import { GuardianCard } from "./components/GuardianCard.tsx";
import { FaqCard } from "./components/FaqCard.tsx";
import { UserWalletCard } from "./components/UserWalletCard.tsx";

const PASSKEY_LOCALSTORAGE_KEY = "passkeyId";

function App() {
	const [passkey, setPasskey] = useLocalStorageState<
		PasskeyLocalStorageFormat | undefined
	>(PASSKEY_LOCALSTORAGE_KEY, undefined);
	const [error, setError] = useState<string>();

	const handleCreatePasskeyClick = async () => {
		setError(undefined);
		try {
			const passkey = await createPasskey();

			setPasskey(toLocalStorageFormat(passkey));
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("Unknown error");
			}
		}
	};

	let userWalletContent = (
		<>
			{/* <PasskeyCard
				passkey={passkey}
				handleCreatePasskeyClick={handleCreatePasskeyClick}
			/> */}

			<UserWalletCard />

			{/* {error && (
				<div className="card">
					<p>Error: {error}</p>
				</div>
			)} */}
			{/* <FaqCard /> */}
		</>
	);

	let guardianContent = (
		<>
			<PasskeyCard
				passkey={passkey}
				handleCreatePasskeyClick={handleCreatePasskeyClick}
			/>

			{passkey && <GuardianCard passkey={passkey} />}

			{/* {error && (
				<div className="card">
					<p>Error: {error}</p>
				</div>
			)} */}
			<FaqCard />
		</>
	);

	return (
		<>
			<header className="header">
				<a href="https://candide.dev" target="_blank">
					<img src={ethberlinLogo} className="logo" alt="Safe logo" />
				</a>
			</header>
			<h1>Smart Wallet</h1>
			{userWalletContent}
			<br/>
			<br/>
			<h1>Recovery Contact</h1>
			{guardianContent}
		</>
	);
}

export default App;
