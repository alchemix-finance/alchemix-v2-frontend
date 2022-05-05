<script>
  import settings from '@stores/settings';

  const supportedTokens = {
    gALCX: {
      name: 'gALCX',
      address: {
        ethereum: '0x93Dede06AE3B5590aF1d4c111BC54C3f717E4b35',
        fantom: {
          bridge: '0x4CbA8902ce48AB1d5eEa1920D65faeDB934B9916',
          canonical: '0x70F9fd19f857411b089977E7916c05A0fc477Ac9',
        },
      },
      selector: 'CrossChainCanonicalGALCX',
    },
    alUSD: {
      name: 'alUSD',
      address: {
        ethereum: '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9',
        fantom: {
          bridge: '0xe5130d3dbfac6ae7d73a24d719762df74d8e4c27',
          canonical: '0xB67FA6deFCe4042070Eb1ae1511Dcd6dcc6a532E',
        },
      },
      selector: 'CrossChainCanonicalAlchemicTokenV2_alUSD',
    },
  };
</script>

<div
  class="border-y-1 py-2 rounded text-sm border border-green4 {$settings.invertColors
    ? 'bg-green7 text-white2inverse'
    : 'bg-black2 text-white2'} flex flex-row justify-center space-x-4"
>
  You have bridge tokens that need swapping!
</div>
