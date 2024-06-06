import { createMint } from "@solana/spl-token";
import "dotenv/config";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const user = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `Loaded our keypair securely, our publicKey is ${user.publicKey.toBase58()}`
);

// The function below runs: SystemProgram.createAccount and token.createInitailization
const tokenMint = await createMint(connection, user, user.publicKey, null, 2);
// hence in the above case, freeze authority is null

const link = getExplorerLink("address", tokenMint.toString(), "devnet");

console.log(`✅ Finished! Created token mint: ${link}`);
