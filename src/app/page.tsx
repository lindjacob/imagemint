"use client"

import * as React from 'react'
import { useState, useEffect } from "react";
import { connectWallet, getCurrentWalletConnected } from "../utils/interact";
import { pinFileToIPFS } from "../api/pinata";
import {
  type BaseError,
  useWaitForTransactionReceipt,
  useWriteContract
} from 'wagmi';
import { abi } from '../lib/abi';

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

export default function Home() {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState<string | JSX.Element>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uri, setURI] = useState("");
  const [uploading, setUploading] = useState(false);

  const {
    data: hash,
    error,
    isPending,
    writeContract
  } = useWriteContract()

  const handleFileChange = async (e: ChangeEvent) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const data = new FormData();
      data.set("file", file);
      setUploading(true);
      const result = await pinFileToIPFS(data, file.name);
      if (typeof result === 'string') {
        setURI(result);
      } else {
        // Handle the error case
        console.error(result.error);
        setStatus(`Error: ${result.error}`);
        setStatus(
          <p>
            {" "}
            ❌ {" "}
            Failed to upload to IPFS. Please upload a valid image file.
          </p>
        );
      }
      setUploading(false);
    }
  };

  const handleConnectWallet = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
    addWalletListener();
  }

  async function handleMintNFT() {
    console.log('submitting')
    console.log('walletAddress:', `0x${walletAddress.slice(2)}`);
    console.log('contract address:', (`0x${process.env.NEXT_PUBLIC_IMAGE_MINT_POLYGON_CONTRACT_ADDRESS}`).length)
    writeContract({
      address: `0x${process.env.NEXT_PUBLIC_IMAGE_MINT_POLYGON_CONTRACT_ADDRESS}`,
      abi,
      functionName: 'safeMint',
      args: [`0x${walletAddress.slice(2)}`, uri],
    });
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👇🏼 Fill in the form below.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask in your browser. <u>Click here</u>
          </a>
        </p>
      );
    }
  }

  // Update our UI to reflect it if a wallet is already connected upon page load
  useEffect(() => {
    const updateWallet = async () => {
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);
    }
    updateWallet();
  }, []);

  useEffect(() => {
    // activate mintButton element if all fields are filled
    if (walletAddress && uri && name && description) {
      const mintButton = document.getElementById("mintButton");
      mintButton!.classList.remove("btn-disabled");
    }

    // if wallet address is connected, display success colored button
    if (walletAddress) {
      const connectWalletButton = document.getElementById("connectWalletButton");
      connectWalletButton!.classList.remove("btn-primary");
      connectWalletButton!.classList.add("btn-success");
    } else {
      const connectWalletButton = document.getElementById("connectWalletButton");
      connectWalletButton!.classList.remove("btn-success");
      connectWalletButton!.classList.add("btn-primary");
    }

    // display success colored border if input is valid
    if (uri) {
      const fileInput = document.getElementById("fileInput");
      fileInput!.classList.remove("file-input-primary");
      fileInput!.classList.add("file-input-success");
    } else {
      const fileInput = document.getElementById("fileInput");
      fileInput!.classList.remove("file-input-success");
      fileInput!.classList.add("file-input-primary");
    }

    if (name.length > 2) {
      const nameInput = document.getElementById("nameInput");
      nameInput!.classList.remove("input-primary");
      nameInput!.classList.add("input-success");
    } else {
      const nameInput = document.getElementById("nameInput");
      nameInput!.classList.remove("input-success");
      nameInput!.classList.add("input-primary");
    }

    if (description.length > 4) {
      const descriptionInput = document.getElementById("descriptionInput");
      descriptionInput!.classList.remove("input-primary");
      descriptionInput!.classList.add("input-success");
    } else {
      const descriptionInput = document.getElementById("descriptionInput");
      descriptionInput!.classList.remove("input-success");
      descriptionInput!.classList.add("input-primary");
    }

  }, [walletAddress, uri, name, description]);

  return (
    <main className="h-screen container mx-auto py-20">
      <h1 className="text-4xl text-center">Image Mint</h1>
      <div className="flex justify-center my-10">
        <button
          id="connectWalletButton"
          className="btn btn-active btn-primary"
          onClick={handleConnectWallet}>{walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
        </button>
      </div>
      <div className="flex justify-center">
        <p>{status}</p>
      </div>

      <div className="flex justify-center">
        <form className="*:my-3">
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Link to asset</span>
            </div>
            <input
              id="fileInput"
              type="file"
              className="file-input file-input-bordered file-input-primary w-full max-w-xs"
              onChange={handleFileChange}
            />
          </label>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Name</span>
            </div>
            <input
              id="nameInput"
              type="text"
              placeholder="My first NFT"
              className="input input-bordered w-full max-w-xs input-primary"
              onChange={event => setName(event.target.value)}
            />
          </label>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Description</span>
            </div>
            <input
              id="descriptionInput"
              type="text"
              placeholder="Cooler than the Mona Lisa!"
              className="input input-bordered w-full max-w-xs input-primary"
              onChange={event => setDescription(event.target.value)}
            />
          </label>  
        </form>
      </div>
      <div className="flex justify-center my-3">
        {hash && <div>Transaction Hash: {hash}</div>}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
        {error && (
          <div>Error: {(error as BaseError).shortMessage || error.message}</div>
        )}
      </div>
      <div className="flex justify-center my-5">
        <button
          id="mintButton"
          className="btn btn-outline btn-secondary btn-disabled"
          disabled={isPending}
          onClick={handleMintNFT}
        >
          {isPending ? 'Confirming...' : 'Mint NFT'}
        </button>
      </div>
    </main>
  );
}
