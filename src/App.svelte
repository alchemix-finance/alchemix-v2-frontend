<script>
// libraries
// import Router from 'svelte-spa-router';
import { Router, Route } from 'svelte-routing';
import Modal from 'svelte-simple-modal';

// stores
import global from './stores/global';
import account from './stores/account';

// composed components
import HeaderBar from './components/composed/HeaderBar.svelte';
import SideBar from './components/composed/SideBar.svelte';
import Footer from './components/composed/Footer.svelte';

// router configuration and views
import Landing from './views/Landing.svelte';
import Error from './views/Error.svelte';
import Components from './views/Components.svelte';

export let url = '';
</script>

<Modal>
  <Router url="{url}">
    <div class="wrapper max-w-none grid grid-cols-12">
      <div class="col-span-12">
        <HeaderBar />
      </div>
      <div class="col-span-12 grid grid-cols-12">
        <div class="col-span-2">
          <SideBar />
        </div>
        <div class="col-span-10">
          <Route path="/components" component="{Components}" />
          <Route path="/" component="{Landing}" />
          <Route path="/*" component="{Error}" />
        </div>
      </div>
      <div class="col-span-12">
        <Footer />
      </div>
    </div>
  </Router>
</Modal>
