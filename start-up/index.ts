import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
  Keypair,
} from "@solana/web3.js";

// making keypair from code
const keypair = Keypair.generate();

console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The secret key is: `, keypair.secretKey);

const connection = new Connection(clusterApiUrl("devnet"));
const address = new PublicKey("2WKb1EQDfEKbivtmYHjx2cErQjASaNizVUC1AW2nbHKR");
const balance = await connection.getBalance(address);

console.log(`The balance of the account at ${address} is ${balance} lamports`);
console.log(`The balance in SOL is ${balance / LAMPORTS_PER_SOL}`);
