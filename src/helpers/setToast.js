import toastConfig from '../stores/toast';

let _toastConfig;

toastConfig.subscribe((val) => {
  _toastConfig = val;
});

function setPendingWallet() {
  _toastConfig.kind = 'pending';
  _toastConfig.title = 'Pending';
  _toastConfig.subtitle = 'Sign transaction in wallet';
  _toastConfig.closeOnMount = false;
  _toastConfig.visible = true;
  toastConfig.set({ ..._toastConfig });
}

function setPendingTx() {
  _toastConfig.kind = 'pending';
  _toastConfig.title = 'Pending';
  _toastConfig.subtitle = 'Confirming transaction';
  _toastConfig.closeOnMount = false;
  _toastConfig.visible = true;
  toastConfig.set({ ..._toastConfig });
}

function setSuccessTx(hash) {
  _toastConfig.kind = 'success';
  _toastConfig.title = 'Success';
  _toastConfig.subtitle = 'Transaction was confirmed';
  _toastConfig.closeOnMount = true;
  _toastConfig.etherscanUrl = hash;
  _toastConfig.spinner = false;
  _toastConfig.visible = true;
  _toastConfig.closeTimeout = 2000;
  toastConfig.set({ ..._toastConfig });
}

function setError(message) {
  _toastConfig.kind = 'error';
  _toastConfig.title = 'Something went wrong';
  _toastConfig.subtitle = message;
  _toastConfig.closeOnMount = true;
  _toastConfig.spinner = false;
  _toastConfig.visible = true;
  _toastConfig.closeTimeout = 2000;
  toastConfig.set({ ..._toastConfig });
}

export { setPendingWallet, setPendingTx, setSuccessTx, setError };
