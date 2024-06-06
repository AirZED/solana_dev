"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { FC, FormEvent, useState } from "react";
import styles from "../styles/Home.module.css";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
} from "@solana/spl-token";

export const CreateMintForm: FC = () => {
  const [txSig, setTxSig] = useState("");
  const [mint, setMint] = useState("");

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const link = () => {
    return txSig
      ? `https://explorer.solana.com/address/${txSig}?cluster=devnet`
      : "";
  };

  const createMintHandler = async (event: FormEvent) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }

    try {
      const mintKeypair = web3.Keypair.generate();

      const buildCreateMintTransaction = async (
        connection: web3.Connection,
        payer: web3.PublicKey,
        decimals: number
      ): Promise<web3.Transaction> => {
        const lamports = await getMinimumBalanceForRentExemptMint(connection);
        const programId = TOKEN_PROGRAM_ID;

        const transaction = new web3.Transaction().add(
          web3.SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: mintKeypair.publicKey,
            space: MINT_SIZE,
            programId,
            lamports,
          }),
          createInitializeMintInstruction(
            mintKeypair.publicKey,
            decimals,
            payer,
            payer,
            programId
          )
        );

        return transaction;
      };

      const transaction = await buildCreateMintTransaction(
        connection,
        publicKey,
        2
      );

      console.log(transaction);

      const signature = await sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      });

      setMint(mintKeypair.publicKey.toString());
      setTxSig(signature);
    } catch (error) {
      console.error(error);
    }

    // BUILD AND SEND CREATE MINT TRANSACTION HERE
  };

  return (
    <div>
      {publicKey ? (
        <form onSubmit={createMintHandler} className={styles.form}>
          <button type="submit" className={styles.formButton}>
            Create Mint
          </button>
        </form>
      ) : (
        <span>Connect Your Wallet</span>
      )}
      {txSig ? (
        <div className="text-[1rem]">
          <p className="flex flex-col">
            Token Mint Address: <span className="font-bold">{mint}</span>
          </p>
          <p>
            View your transaction on <a href={link()}>Solana Explorer</a>{" "}
          </p>
        </div>
      ) : null}
    </div>
  );
};
