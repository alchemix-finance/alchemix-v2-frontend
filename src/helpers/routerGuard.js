import { navigate } from 'svelte-routing';
import { connect } from './walletManager';
import account from '@stores/account';

let _account;

account.subscribe((val) => {
  _account = val;
});

/*
 * @dev verifies that user is logged in before switching to a new page
 * @params path the URL to navigate to
 * */
async function routerGuard(path) {
  if (!_account.signer) {
    try {
      await connect();
      navigate(`${path}`, { replace: true });
    } catch (e) {
      console.error(e);
      navigate('/', { replace: true });
    }
  } else {
    navigate(`${path}`, { replace: true });
  }
}

export { routerGuard };
