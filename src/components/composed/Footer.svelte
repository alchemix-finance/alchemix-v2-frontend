<script>
import { _ } from 'svelte-i18n';

const copyrightYear = () => {
  return `2020 - ${new Date().getFullYear()}`;
};
</script>

<div class="flex flex-col">
  <div class="flex flex-row">
    <div class="mr-11 w-60">
      <img src="images/icons/ALCX_Std_logo.svg" class="w-max mb-5" alt="The Alchemix logo" />

      <p class="text-sm mb-3">&copy; {copyrightYear()} {$_('alchemix_labs')}</p>
      <p class="text-sm mb-3 text-justify">
        {$_('footer_disclaimer')}
      </p>
      <p class="mb-3">
        <a href="https://zapper.fi/" target="_blank">
          <img src="images/integrations/zapper.png" class="w-60" alt="The logo of Zapper" />
        </a>
      </p>
      <p>
        <a href="https://snapshot.org/" target="_blank">
          <img src="images/integrations/snapshot.png" class="w-60" alt="The logo of Snapshot" />
        </a>
      </p>
    </div>
    <div class="mr-11">
      <p class="uppercase text-sm alcxTitle mb-5">{$_('navigation')}</p>
      <ul class="text-sm space-y-3">
        <li class="opacity-50 hover:opacity-100">
          <a href="https://alchemix-finance.gitbook.io/alchemix-finance/" target="_blank"
            >{$_('documentation')}</a
          >
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="/governance">{$_('governance')}</a>
        </li>
        <!--        <li class="opacity-50 hover:opacity-100">-->
        <!--          <a href="" target="_blank">{$_('modules')}</a>-->
        <!--        </li>-->
        <li class="opacity-50 hover:opacity-100">
          <a href="https://forum.alchemix.fi/public/" target="_blank">
            <span>{$_('forum')}</span>
          </a>
        </li>
      </ul>
    </div>
    <div class="mr-11">
      <p class="uppercase text-sm alcxTitle mb-5">{$_('social')}</p>
      <ul class="text-sm space-y-3">
        <li class="opacity-50 hover:opacity-100">
          <a href="https://discord.com/invite/alchemix" target="_blank">
            <span>{$_('discord')}</span>
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="https://twitter.com/AlchemixFi" target="_blank">
            <span>{$_('twitter')}</span>
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="https://github.com/orgs/alchemix-finance/" target="_blank">
            <span>{$_('github')}</span>
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="https://alchemixfi.substack.com/" target="_blank">
            <span>{$_('newsletter')}</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</div>
