export function sidebarSetup() {
  return [
    // {
    //   label: 'my_account',
    //   path: 'accounts',
    //   icon: 'vault_med.svg',
    // },
    {
      label: 'vaults',
      path: 'vaults',
      icon: 'yield_med.svg',
      supportedChains: ['0x1', '0xfa'],
    },
    {
      label: 'transmuter',
      path: 'transmuter',
      icon: 'transmuter_med.svg',
      supportedChains: ['0x1', '0xfa'],
    },
    {
      label: 'swap',
      path: 'swap',
      icon: 'swap_med.svg',
      supportedChains: ['0x1', '0xfa'],
    },
    {
      label: 'farms',
      path: 'farms',
      icon: 'farm_med.svg',
      supportedChains: ['0x1'],
    },
    {
      label: 'governance',
      path: 'governance',
      icon: 'alcx_med.svg',
      supportedChains: ['0x1', '0xfa'],
    },
    {
      label: 'sentinel',
      path: 'sentinel',
      icon: 'sentinel_med.svg',
      supportedChains: ['0x1'],
    },
    {
      label: 'Cows',
      path: 'get-out',
      icon: 'cow_med.svg',
      supportedChains: ['0x1', '0xfa'],
    },
  ];
}
