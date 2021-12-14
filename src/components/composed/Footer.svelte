<script>
import { _ } from 'svelte-i18n';

const copyrightYear = () => {
  return `2020 - ${new Date().getFullYear()}`;
};
</script>

<div class="flex flex-col">
  <div class="flex flex-row">
    <div class="mr-11 w-60">
      <p class="uppercase text-sm alcxTitle mb-5">{$_('alchemix')}</p>
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
          <a href="" target="_blank">{$_('documentation')}</a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">{$_('governance')}</a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">{$_('modules')}</a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">{$_('voting')}</a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">
            <span>{$_('forum')}</span>
          </a>
        </li>
      </ul>
    </div>
    <div class="mr-11">
      <p class="uppercase text-sm alcxTitle mb-5">{$_('social')}</p>
      <ul class="text-sm space-y-3">
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">
            <span>{$_('discord')}</span>
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">
            <span>{$_('twitter')}</span>
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">
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
