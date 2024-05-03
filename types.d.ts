interface Ethereum {
  request: ({ method }: { method: string }) => Promise<any>;
  on: (event: string, callback: (accounts: string[]) => void) => void;
}

interface Window {
  ethereum?: Ethereum;
}