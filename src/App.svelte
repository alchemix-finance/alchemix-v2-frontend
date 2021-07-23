<script>
// libraries
import Router from 'svelte-spa-router';
import Modal from 'svelte-simple-modal';

// configuration
import { routes } from './configs/routes';

// stores
import global from './stores/global';
import account from './stores/account';

//components
import HeaderBar from './components/composed/HeaderBar.svelte';
import SideBar from './components/composed/SideBar.svelte';
import Footer from './components/composed/Footer.svelte';
</script>

<Modal>
  <div class="wrapper max-w-none grid grid-cols-12">
    <div class="col-span-12">
      <HeaderBar />
    </div>
    <div class="col-span-12 grid grid-cols-12">
      <div class="col-span-2">
        <SideBar />
      </div>
      <div class="col-span-10">
        <Router routes="{routes}" />
      </div>
    </div>
    <div class="col-span-12">
      <Footer />
    </div>
  </div>
</Modal>
