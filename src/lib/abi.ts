export const abi = [
  {
    name: 'safeMint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'uri',
        type: 'string'
      }
    ],
    outputs: [],
  },
] as const