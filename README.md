# TrustKey Recovery

### The problem TrustKey Recovery solves

Securing crypto accounts is paramount. Traditional methods often rely on centralized custodial services, which can be a single point of failure. Our project introduces a decentralized approach to account recovery, focusing on leveraging trust within a user's social circle—friends, family, and close acquaintances—without the necessity for them to have prior a crypto wallet, nor maintaining any funds. It all starts with a pub/private key pair. 

#### Key Features

- Trusted Contacts: Users can designate multiple trusted contacts who can assist in recovering their accounts, with a selected threshold for added security. These contacts can be anyone with a mobile phone or a laptop.  
- No Wallet Required: Trusted contacts do not need to download a wallet, or backup a seedphrase. Instead, our webapp generates an ethereum compatible public/private key pair, and store it on their secure element of their device with Passkeys. 

#### WebAuthn Integration:

- LargeBlob Extension: We leverage the new WebAuthn LargeBlob extension to securely store the private key within the Passkey authenticator. This ensures that the private key is protected and only accessible by the designated contact through their WebAuthn credentials.

#### Anonymity and Security:

- Local Signing: In the event of a recovery request, the trusted contact can sign a recovery message locally on their device. This message confirms their agreement to assist in the account recovery process.
- No On-Chain Transactions: Trusted contacts never have to perform any on-chain transactions. Their role is limited to locally signing the recovery message, ensuring their actions remain anonymous and private.
- Enhanced Privacy: The recovery process maintains the privacy of the trusted contacts, as their involvement is never broadcasted on the blockchain, even during recovery.

### Challenges you ran into

Initially, we wanted to experiment with the new WebAuthn PRF extension. This extension allows sites to request that a WebAuthn authenticator create a Pseudo-Random Function (PRF) along with a credential, and query that PRF during assertions. Unlike the WebAuthn LargeBlob extension, where the secret is generated in the browser by a third-party cryptography library, allowing parties to store a small amount of data (key) associated with a credential.

However, we encountered limited support for the WebAuthn PRF extension and could not find any devices that support it. As a result, we decided to use the LargeBlob extension instead. Even then, LargeBlob is only supported on the latest Apple devices and newer devices with Chromium browsers. We expect support for these WebAuthn extensions to improve as more devices and operating systems adopt them.

### Technology used

- Main Account: Candide's Account Abstraction: Smart Wallet creation, Gas Sponsorship, and Social Recovery Module.  Safe Accounts for the Base Account Contract. 
- Recover Account: WebAuthn LargeBlob Extension
## Install dependencies

```bash
npm install 
npm run build
```

## Fill in the environment variables

```bash
cp .env.example .env
```

and fill in the variables in `.env` file.

### Run the app in development mode

```bash
npm run dev
```