// @dev abi has to contain name(), symbol(), and balanceOf(address)
const genericAbi = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint)',
];

const debugging = Boolean(parseInt(process.env.DEBUG_MODE, 10));

// @dev mainly used for wallet balance checks of supported collaterals
const externalContracts = {
  tokens: [
    {
      abi: [...genericAbi],
      // @dev address may be ENS or actual address, ENS won't work on testnet
      address: debugging ? '0x6b175474e89094c44da98b954eedeac495271d0f' : 'dai.tokens.ethers.eth',
      // @dev not used anywhere aside from keeping track inside this file
      symbol: 'DAI',
    },
    {
      abi: [...genericAbi],
      address: '0xdbdb4d16eda451d0503b854cf79d55697f90c8df',
      symbol: 'ALCX',
    },
    {
      abi: [...genericAbi],
      address: '0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9',
      symbol: 'ALUSD',
    },
    {
      abi: [...genericAbi],
      address: '0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6',
      symbol: 'ALETH',
    },
    {
      abi: [...genericAbi],
      address: '0xc9da65931abf0ed1b74ce5ad8c041c4220940368',
      symbol: 'saddlealETH',
    },
    {
      abi: [...genericAbi],
      address: '0xD3B5D9a561c293Fb42b446FE7e237DaA9BF9AA84',
      symbol: 'tALCX',
    },
  ],
};

export default externalContracts;
