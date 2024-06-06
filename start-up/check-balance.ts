import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const publicKey = new PublicKey("2WKb1EQDfEKbivtmYHjx2cErQjASaNizVUC1AW2nbHKR");
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const balanceInSol =
  (await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL;

console.log(balanceInSol);
