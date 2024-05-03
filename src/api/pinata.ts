"use server"

export async function pinFileToIPFS(data: FormData, name: string) {
  try {
    data.append("pinataMetadata", JSON.stringify({ name: name }));
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: data,
    });
    const { IpfsHash } = await res.json();
    console.log(IpfsHash);
    const URI = `${process.env.PINATA_GATEWAY_URL}/ipfs/${IpfsHash}`;
    return URI;
  } catch (e) {
    console.log(e);
    return {
      error: "Internal Server Error",
      status: 500
    }
  }
}