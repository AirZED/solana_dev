import * as token from "@solana/spl-token";
import * as web3 from "@solana/web3.js";

// CREATE MINT

/*
const tokenMint = await createMint(
  connection, payer, mintAuthority, freezeAuthority, decimal
)

-------------- PARAMETERS ------------------
connection - the JSON-RPC connection to the cluster
payer - the public key of the payer for the transaction
mintAuthority - the account that is authorized to do the actual minting of tokens from the token mint.
freezeAuthority - an account authorized to freeze the tokens in a token account. If freezing is not a desired attribute, the parameter can be set to null
decimals - specifies the desired decimal precision of the token
*/

async function buildCreateMintTransaction(
  connection: web3.Connection,
  payer: web3.PublicKey,
  decimals: number
): Promise<web3.Transaction> {
  const lamports = await token.getMinimumBalanceForRentExemptMint(connection);
  const accountKeypair = web3.Keypair.generate();
  const programId = token.TOKEN_PROGRAM_ID;

  const transaction = new web3.Transaction().add(
    web3.SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: accountKeypair.publicKey,
      space: token.MINT_SIZE,
      programId,
      lamports,
    }),
    token.createInitializeMintInstruction(
      accountKeypair.publicKey,
      decimals,
      payer,
      payer,
      programId
    )
  );

  return transaction;
}

// Creating account
async function buildCreateTokenAccountTransaction(
  connection: web3.Connection,
  payer: web3.PublicKey,
  mint: web3.PublicKey
): Promise<web3.Transaction> {
  const mintState = await token.getMint(connection, mint);
  const accountKeypair = web3.Keypair.generate();
  const space = token.getAccountLenForMint(mintState);
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  const programId = token.TOKEN_PROGRAM_ID;

  const transaction = new web3.Transaction().add(
    web3.SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: accountKeypair.publicKey,
      space,
      lamports,
      programId,
    }),
    token.createInitializeAccountInstruction(
      accountKeypair.publicKey,
      mint,
      payer,
      programId
    )
  );

  return transaction;
}

// associated token account
// this token account store token in an address made from the owners public key and the token mint
// example, Bob's USDC is stored in an Associated Token account made from Bob's public key and the USDC mint address

// it makes it better to locate token that belongs to a specific publickey and token

// you can use this from the spl-token library

/*
cosnt associatedTokenAccount = await createAssociatedTokenAccount(connection, payer, mint, owner)
the above returns a publicKey of the new associated token account

-------------- PARAMETERS ----------------
connection - the JSON-RPC connection to the cluster
payer - the account of the payer for the transaction
mint - the token mint that the new token account is associated with
owner - the account of the owner of the new token account

*/

// OR, you can use this instead, this creates the account if it does not exist and still airdrops the user incases where you want to airdrop users

async function buildCreateAssociatedTokenAccountTransaction(
  payer: web3.PublicKey,
  mint: web3.PublicKey
): Promise<web3.Transaction> {
  const associatedTokenAccount = await token.getAssociatedTokenAddress(
    mint,
    payer,
    false
  );

  const transaction = new web3.Transaction().add(
    token.createAssociatedTokenAccountInstruction(
      payer,
      associatedTokenAccount,
      payer,
      mint
    )
  );

  return transaction;
}

// MINTNG TOKENS
// This is the process of issuing new tokens into circulation
// only the mint authority of the mint account is allowed to mint new tokens

/*
You can use the mintTo function from the spl-token

const transactionSignature = await mintTo(
  connection, payer, mint, destination, authority, amount
)

-------------------PARAMETERS----------------
connection - the JSON-RPC connection to the cluster
payer - the account of the payer for the transaction
mint - the token mint that the new token account is associated with
destination - the token account that tokens will be minted to
authority - the account authorized to mint tokens
amount - the raw amount of tokens to mint outside of decimals
*/

// It is not uncommon to update the mint authority to null after the token has been minted so that tokens cannot be minted in the future
// also, we can programatically allow token mints at intervals
// this mint tokens

async function buildMintToTransaction(
  authority: web3.PublicKey,
  mint: web3.PublicKey,
  amount: number,
  destination: web3.PublicKey
): Promise<web3.Transaction> {
  const transaction = new web3.Transaction().add(
    token.createMintToInstruction(mint, destination, authority, amount)
  );

  return transaction;
}

// TRANSFER TOKENS
// This requires the sender and the reciever having tokens accounts, hence tokens are sent from the sender token account to the reciever token account

/*

const transactionSignature = await transfer(
  connection, payer, source, destination, owner, amount
)

---------------------- PARAMETERS -----------------------
connection - the JSON-RPC connection to the cluster
payer - the account of the payer for the transaction
source - the token account sending tokens
destination - the token account receiving tokens
owner - the account of the owner of the source token account
amount - the number of tokens to transfer

*/

// this can also be used as the transfer function
async function buildTransferTransaction(
  source: web3.PublicKey,
  destination: web3.PublicKey,
  owner: web3.PublicKey,
  amount: number
): Promise<web3.Transaction> {
  const transaction = new web3.Transaction().add(
    token.createTransferInstruction(source, destination, owner, amount)
  );

  return transaction;
}
