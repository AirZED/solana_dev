import "dotenv/config";
import {
  PublicKey,
  Connection,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";

import { getKeypairFromEnvironment } from "@solana-developers/helpers";

const senderKeyPair = getKeypairFromEnvironment("SECRET_KEY");

const toPubkey = new PublicKey("2WKb1EQDfEKbivtmYHjx2cErQjASaNizVUC1AW2nbHKt");

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const transaction = new Transaction();

const sendSolInstruction = SystemProgram.transfer({
  fromPubkey: senderKeyPair.publicKey,
  toPubkey,
  lamports: LAMPORTS_PER_SOL * 0.1,
});

transaction.add(sendSolInstruction);

const signature = await sendAndConfirmTransaction(connection, transaction, [
  senderKeyPair,
]);

console.log(`💸 Finished! Sent ${1} sol to the address ${toPubkey}. `);
console.log(`Transaction signature is ${signature}!`);
