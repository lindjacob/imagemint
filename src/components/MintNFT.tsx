import * as React from 'react'
 
export function MintNFT() {
  return (
    <form>
      <input name="tokenId" placeholder="69420" required />
      <button type="submit">Mint</button>
    </form>
  )
}