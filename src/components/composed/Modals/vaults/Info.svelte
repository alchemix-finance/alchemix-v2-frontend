<script>
  import settings from '@stores/settings';
  import { VaultTypesInfos, chainIds, VaultConstants } from '@stores/v2/constants';
  import { networkStore } from '@stores/v2/alcxStore';
  import getAddress from '@helpers/getContract';

  export let vault;

  let info = {
    alchemist: { label: 'Alchemist', address: '' },
    debtToken: { label: 'Debt Token', address: '' },
    underlyingToken: { label: 'Underlying Token', address: '' },
    yieldToken: { label: 'Yield Token', address: '' },
    yieldTokenOverride: { label: 'Yield Token Override', address: '' },
    gateway: { label: 'Gateway', address: '' },
    strategy: { label: 'Strategy', address: '', vanity: '' },
  };

  $: explorerUrl = chainIds.filter((chain) => chain.id === $networkStore)[0].explorer;

  const resolveMetaData = async (_metaConfig) => {
    const path = chainIds.filter((chain) => chain.id === $networkStore)[0].abiPath;
    info.debtToken.address = vault.debtToken;
    info.underlyingToken.address = vault.underlyingAddress;
    info.yieldToken.address = vault.address;
    const alchemist = await getAddress(VaultConstants[vault.type].alchemistContractSelector, path);
    info.alchemist.address = alchemist.address;
    if (!!_metaConfig.customAddress) info.yieldTokenOverride.address = _metaConfig.customAddress;
    if (!!_metaConfig.strategy) {
      info.strategy.address = _metaConfig.strategy;
      info.strategy.vanity = _metaConfig.vaultName + ' ' + _metaConfig.token;
    }
    if (!!_metaConfig.gateway) {
      const gateway = await getAddress(_metaConfig.gateway, path);
      info.gateway.address = gateway.address;
    }
  };

  $: metaConfig = VaultTypesInfos[vault.type].metaConfig[vault.address];
  $: resolveMetaData(metaConfig);

  const externalLinkIcon = () => {
    return `<svg
      xmlns='http://www.w3.org/2000/svg'
      class='h-4 w-4 inline'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        stroke-linecap='round'
        stroke-linejoin='round'
        stroke-width='2'
        d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'></path>
    </svg>`;
  };
</script>

<div class="flex flex-col space-y-4">
  <p class="text-sm text-lightgrey10 w-full self-center">List of contracts associated with this vault:</p>
  <div
    class="flex flex-col flex-wrap gap-2 items-center justify-center break-all p-4 rounded {$settings.invertColors
      ? 'border-grey5inverse bg-grey1inverse text-white2inverse'
      : 'border-grey5 bg-grey1 text-white2'}"
  >
    {#each Object.entries(info) as item}
      {#if !!item[1].address}
        <div class="flex flex-col lg:flex-row w-full gap-4 justify-center items-center hover:bg-black2 px-2 rounded">
          <p class="flex-1">{item[1].label}:</p>
          <p class="font-alcxMono flex-2">
            <a
              href="{item[1].vanity ? item[1].address : `${explorerUrl}address/${item[1].address}`}"
              target="_blank"
            >
              {item[1].vanity ? item[1].vanity : item[1].address}
              {@html externalLinkIcon()}
            </a>
          </p>
        </div>
      {/if}
    {/each}
  </div>
</div>
