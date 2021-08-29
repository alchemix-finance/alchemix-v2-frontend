<script>
import HeaderBar from '../HeaderBar.svelte';
import SideBar from '../SideBar.svelte';
import Footer from '../Footer.svelte';
</script>

<div class="wrapper max-w-none grid grid-cols-12 font-alcxFlow">
  <div class="col-span-12 bg-grey30 pl-8 pt-5 pb-5 border-grey5 border-b">
    <HeaderBar />
  </div>
  <div class="col-span-12 flex">
    <div class="pl-8 pr-9 pt-8 w-96">
      <SideBar />
    </div>
    <div class="border-l border-grey5 w-full">
      <slot />
    </div>
  </div>
  <div class="col-span-12 pl-8 py-12 border-t border-grey5">
    <Footer />
  </div>
</div>
