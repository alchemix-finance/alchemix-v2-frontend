<script>
const copyrightYear = () => {
  return `2020 - ${new Date().getFullYear()}`;
};
</script>

<div class="flex flex-col">
  <div class="flex flex-row">
    <div class="mr-11 w-60">
      <p class="uppercase text-sm alcxTitle mb-5">Alchemix</p>
      <p class="text-sm mb-3">&copy; {copyrightYear()} Alchemix Labs</p>
      <p class="text-sm text-justify">
        All rights reserved, no guarantees given. DeFi tools are not toys. Use
        at your own risk.
      </p>
    </div>
    <div class="mr-11">
      <p class="uppercase text-sm alcxTitle mb-5">Navigation</p>
      <ul class="text-sm space-y-3">
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">Documentation</a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">Governance</a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">Modules</a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">Voting</a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">
            <span>Forum</span>
          </a>
        </li>
      </ul>
    </div>
    <div>
      <p class="uppercase text-sm alcxTitle mb-5">Social</p>
      <ul class="text-sm space-y-3">
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">
            <span>Discord</span>
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">
            <span>Twitter</span>
          </a>
        </li>
        <li class="opacity-50 hover:opacity-100">
          <a href="" target="_blank">
            <span>Github</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
  <div class="flex flex-row mt-10 justify-center space-x-10">
    <a href="https://zapper.fi/" target="_blank">
      <img
        src="images/integrations/zapper.png"
        class="w-60"
        alt="The logo of Zapper"
      />
    </a>
  </div>
</div>
