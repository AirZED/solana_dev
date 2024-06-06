"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import { createMintToInstruction } from "@solana/spl-token";

export const MintToForm: FC = () => {
  const mintRef = useRef<HTMLInputElement>(null);
  const recipientRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const [txSig, setTxSig] = useState("");
  const [tokenAccount, setTokenAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const link = () => {
    return txSig
      ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
      : "";
  };

  const mintTo = async (event: any) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }

    try {
      const recipientPublicKey = new web3.PublicKey(
        recipientRef.current?.value || ""
      );
      const amount = parseFloat(amountRef.current?.value || "");
      const mint = new web3.PublicKey(mintRef.current?.value || "");

      const buildMintToTransaction = async (
        authority: web3.PublicKey,
        mint: web3.PublicKey,
        amount: number,
        destination: web3.PublicKey
      ): Promise<web3.Transaction> => {
        const transaction = new web3.Transaction().add(
          createMintToInstruction(mint, destination, authority, amount)
        );

        return transaction;
      };

      const transaction = await buildMintToTransaction(
        publicKey,
        mint,
        amount * Math.pow(10, 2),
        recipientPublicKey
      );

      const signature = await sendTransaction(transaction, connection);

      const tokenBalance = await connection.getAccountInfo(publicKey);
      setBalance(tokenBalance?.lamports || 0);
      setTxSig(signature.toString());
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div>
      <br />
      {publicKey ? (
        <form onSubmit={mintTo} className={styles.form}>
          <label htmlFor="mint">Token Mint:</label>
          <input
            id="mint"
            type="text"
            className={styles.formField}
            placeholder="Enter Token Mint"
            required
            ref={mintRef}
          />
          <label htmlFor="recipient">Recipient:</label>
          <input
            id="recipient"
            type="text"
            className={styles.formField}
            placeholder="Enter Recipient PublicKey"
            required
            ref={recipientRef}
          />
          <label htmlFor="amount">Amount Tokens to Mint:</label>
          <input
            id="amount"
            type="text"
            className={styles.formField}
            placeholder="e.g. 100"
            ref={amountRef}
            required
          />
          <button type="submit" className={styles.formButton}>
            Mint Tokens
          </button>
        </form>
      ) : (
        <span></span>
      )}
      {txSig ? (
        <div>
          <p>Token Balance: {balance} </p>
          <p>View your transaction on </p>
          <a href={link()}>Solana Explorer</a>
        </div>
      ) : null}
    </div>
  );
};
