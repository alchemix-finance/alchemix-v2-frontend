<script>
  import { _ } from 'svelte-i18n';
  import { Link } from 'svelte-routing';

  const copyrightYear = () => {
    return `2020 - ${new Date().getFullYear()}`;
  };
</script>

<div class="flex flex-col">
  <div class="flex flex-col space-y-4 lg:flex-row lg:space-x-11">
    <div class="w-60">
      <img
        src="images/icons/ALCX_Std_logo.svg"
        class="h-9 mb-5"
        style="filter:saturate(0);"
        alt="The Alchemix logo"
      />

      <p class="text-sm mb-3 opacity-50">&copy; {copyrightYear()} {$_('alchemix_labs')}</p>
      <p class="text-sm mb-3 text-justify opacity-50">
        {$_('footer_disclaimer')}
      </p>
    </div>

    <div>
      <p class="uppercase text-sm alcxTitle mb-5">{$_('navigation')}</p>
      <ul class="text-sm space-y-3">
        <li class="opacity-50 hover:opacity-100">
          <Link to="/">{$_('main_page')}</Link>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="https://legacy.alchemix.fi/" class="flex space-x-4" target="_blank">
            <span>Legacy v1 UI</span>
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="https://github.com/orgs/alchemix-finance/" class="flex space-x-4" target="_blank">
            <span>{$_('github')}</span>
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="https://alchemix-finance.gitbook.io/v2/" class="flex space-x-4" target="_blank">
            <span>{$_('documentation')}</span></a
          >
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a class="flex space-x-4" href="/governance">
            <span>
              {$_('table.snapshot')}
            </span>
          </a>
        </li>
      </ul>
    </div>
    <div class="mr-11">
      <p class="uppercase text-sm alcxTitle mb-5">{$_('social')}</p>
      <ul class="text-sm space-y-3">
        <li class="opacity-50 hover:opacity-100">
          <a href="https://alchemixfi.medium.com/" class="flex space-x-4" target="_blank">
            <svg
              class="w-5 h-5"
              fill="currentColor"
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              ><title>Medium</title>
              <path
                d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"
              ></path>
            </svg>
            <span>Medium</span>
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="https://discord.com/invite/alchemix" class="flex space-x-4" target="_blank">
            <svg
              class="w-5 h-5"
              fill="currentColor"
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
              ></path>
            </svg>
            <span>{$_('discord')}</span>
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="https://forum.alchemix.fi/public/" class="flex space-x-4" target="_blank">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 32C28.8366 32 36 26.6274 36 20C36 13.3726 28.8366 8 20 8C11.1634 8 4 13.3726 4 20C4 22.6842 5.17509 25.1626 7.16049 27.1616C6.35561 29.4537 5.31284 31.1723 4.6499 32.1319C4.4071 32.4834 4.65714 32.9802 5.08289 32.9453C6.78453 32.8058 10.1224 32.3105 12.3741 30.5519C14.6411 31.4754 17.2389 32 20 32Z"
              ></path>
              <path
                d="M22.7843 33.8337C31.4033 32.7928 38 26.9957 38 20.0002C38 19.4632 37.9611 18.9333 37.8855 18.4121C41.5534 20.1003 44 23.136 44 26.6002C44 28.7476 43.0599 30.7303 41.4716 32.3295C42.068 34.0278 42.8276 35.3325 43.3579 36.1259C43.5953 36.481 43.3423 36.9779 42.917 36.9372C41.5041 36.8021 39.0109 36.3773 37.3007 35.0418C35.4872 35.7806 33.4089 36.2002 31.2 36.2002C27.9781 36.2002 25.0343 35.3074 22.7843 33.8337Z"
              ></path>
            </svg>

            <span>{$_('forum')}</span>
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="https://twitter.com/AlchemixFi" class="flex space-x-4" target="_blank">
            <svg
              class="h-5 w-5"
              fill="currentColor"
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Twitter</title>
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
              ></path>
            </svg>
            <span>{$_('twitter')}</span>
          </a>
        </li>

        <li class="opacity-50 hover:opacity-100">
          <a href="https://alchemixfi.substack.com/" class="flex space-x-4" target="_blank">
            <svg
              class="h-5 w-5"
              fill="currentColor"
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Substack</title>
              <path
                d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"
              ></path>
            </svg>
            <span>{$_('newsletter')}</span>
          </a>
        </li>
      </ul>
    </div>
    <div>
      <p class="uppercase text-sm alcxTitle mb-5">{$_('proudly_using')}</p>
      <ul class="text-sm space-y-3">
        <li class="opacity-50 hover:opacity-100">
          <a href="https://coingecko.com/" target="_blank">
            <img src="images/integrations/coingecko.svg" class="w-32" alt="The logo of Coingecko" />
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="https://li.fi/" target="_blank">
            <img src="images/integrations/lifi.svg" class="w-32" alt="The logo of Li.Fi" />
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="https://snapshot.org/" target="_blank">
            <img src="images/integrations/snapshot.svg" class="w-32" alt="The logo of Snapshot" />
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="https://zapper.fi/" target="_blank">
            <img src="images/integrations/zapper_black.svg" class="w-32" alt="The logo of Zapper" />
          </a>
        </li>
      </ul>
    </div>
  </div>
</div>
