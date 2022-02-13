import toastConfig from '../stores/toast';

let _toastConfig;

toastConfig.subscribe((val) => {
  _toastConfig = val;
});

export function closeToast() {
  _toastConfig.forceClose = true;
  toastConfig.set({ ...toastConfig });
}

export function setPendingWallet() {
  _toastConfig.kind = 'pending';
  _toastConfig.title = 'Pending';
  _toastConfig.subtitle = 'Sign transaction in wallet';
  _toastConfig.closeOnMount = false;
  _toastConfig.visible = true;
  toastConfig.set({ ..._toastConfig });
}

export function setPendingApproval() {
  toastConfig.update((_toast) => {
    _toast.kind = 'pending';
    _toast.title = 'Pending token approval';
    _toast.subtitle = 'Approve token allowance in wallet';
    _toast.closeOnMount = false;
    _toast.visible = true;

    return _toast;
  });
}

export function setPendingTx() {
  _toastConfig.kind = 'pending';
  _toastConfig.title = 'Pending';
  _toastConfig.subtitle = 'Confirming transaction';
  _toastConfig.closeOnMount = false;
  _toastConfig.visible = true;
  toastConfig.set({ ..._toastConfig });
}

export function setSuccessTx(hash) {
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

export function setError(message) {
  _toastConfig.kind = 'error';
  _toastConfig.title = 'Something went wrong';
  _toastConfig.subtitle = message;
  _toastConfig.closeOnMount = true;
  _toastConfig.spinner = false;
  _toastConfig.visible = true;
  _toastConfig.closeTimeout = 4000;
  toastConfig.set({ ..._toastConfig });
}

export function setLoadingData(message, step, totalSteps) {
  _toastConfig.kind = 'pending';
  if (step && totalSteps) {
    _toastConfig.title = `Initializing Data (${step}/${totalSteps})`;
  } else {
    _toastConfig.title = 'Initializing Data';
  }
  _toastConfig.subtitle = message;
  _toastConfig.closeOnMount = false;
  _toastConfig.visible = true;
  _toastConfig.spinner = true;
  toastConfig.set({ ..._toastConfig });
}

export function setPendingVote() {
  _toastConfig.visible = true;
  _toastConfig.kind = 'pending';
  _toastConfig.title = 'Pending';
  _toastConfig.subtitle = 'Registering Vote on Snapshot';
  _toastConfig.closeOnMount = false;
  _toastConfig.spinner = true;
  toastConfig.set({ ..._toastConfig });
}

export function setSuccessVote() {
  _toastConfig.kind = 'success';
  _toastConfig.title = 'Success';
  _toastConfig.subtitle = 'Vote was registered';
  _toastConfig.closeOnMount = true;
  _toastConfig.spinner = false;
  _toastConfig.visible = true;
  _toastConfig.closeTimeout = 2000;
  toastConfig.set({ ..._toastConfig });
}
