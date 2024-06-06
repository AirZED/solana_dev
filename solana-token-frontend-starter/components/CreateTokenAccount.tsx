"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ChangeEvent, FC, FormEvent, useRef, useState } from "react";
import styles from "../styles/Home.module.css";

import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getMint,
  getAccountLenForMint,
  createInitializeAccountInstruction,
} from "@solana/spl-token";

export const CreateTokenAccountForm: FC = () => {
  const mintRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);
  const [txSig, setTxSig] = useState("");
  const [tokenAccount, setTokenAccount] = useState("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const link = () => {
    return txSig
      ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
      : "";
  };

  const createTokenAccount = async (event: FormEvent) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }

    const tokenMint = new web3.PublicKey(mintRef.current?.value || "");
    const accountKeypair = await web3.Keypair.generate();

    const buildCreateTokenAccountTransaction = async (
      connection: web3.Connection,
      payer: web3.PublicKey,
      mint: web3.PublicKey
    ): Promise<web3.Transaction> => {
      const mintState = await getMint(connection, mint);
      const space = getAccountLenForMint(mintState);
      const lamports = await connection.getMinimumBalanceForRentExemption(
        space
      );
      const programId = TOKEN_PROGRAM_ID;

      const transaction = new web3.Transaction().add(
        web3.SystemProgram.createAccount({
          fromPubkey: payer,
          newAccountPubkey: accountKeypair.publicKey,
          space,
          lamports,
          programId,
        }),
        createInitializeAccountInstruction(
          accountKeypair.publicKey,
          mint,
          payer,
          programId
        )
      );

      return transaction;
    };

    const transaction = await buildCreateTokenAccountTransaction(
      connection,
      publicKey,
      tokenMint
    );

    const signature = await sendTransaction(transaction, connection, {
      signers: [accountKeypair],
    });

    setTokenAccount(accountKeypair.publicKey.toString());
    setTxSig(signature);
  };

  return (
    <div>
      <br />
      {publicKey ? (
        <form onSubmit={createTokenAccount} className={styles.form}>
          <label htmlFor="owner">Token Mint:</label>
          <input
            id="mint"
            type="text"
            className={styles.formField}
            placeholder="Enter Token Mint"
            required
            ref={mintRef}
          />
          <label htmlFor="owner">Token Account Owner:</label>
          <input
            id="owner"
            type="text"
            className={styles.formField}
            placeholder="Enter Token Account Owner PublicKey"
            required
            ref={tokenRef}
          />
          <button type="submit" className={styles.formButton}>
            Create Token Account
          </button>
        </form>
      ) : (
        <span></span>
      )}
      {txSig ? (
        <div>
          <p>Token Account Address: {tokenAccount}</p>
          <p>View your transaction on </p>
          <a href={link()}>Solana Explorer</a>
        </div>
      ) : null}
    </div>
  );
};
