<script>
  export let snapshot;
  export let state;
</script>

<div class="{state === 'closed' ? 'opacity-50' : 'opacity-100'}">
  <a href="https://etherscan.io/block/{snapshot}" target="_blank" on:click|stopPropagation>
    {snapshot}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 inline"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
    </svg>
  </a>
</div>
