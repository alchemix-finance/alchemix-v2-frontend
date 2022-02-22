import toastConfig from '../stores/toast';
import getItl from './getItl';

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
  _toastConfig.title = getItl('toast.pending');
  _toastConfig.subtitle = getItl('toast.pending_sign');
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
  _toastConfig.title = getItl('toast.pending');
  _toastConfig.subtitle = getItl('toast.pending_confirm');
  _toastConfig.closeOnMount = false;
  _toastConfig.visible = true;
  toastConfig.set({ ..._toastConfig });
}

export function setSuccessTx(hash) {
  _toastConfig.kind = 'success';
  _toastConfig.title = getItl('toast.success');
  _toastConfig.subtitle = getItl('toast.tx_confirmed');
  _toastConfig.closeOnMount = true;
  _toastConfig.etherscanUrl = hash;
  _toastConfig.spinner = false;
  _toastConfig.visible = true;
  _toastConfig.closeTimeout = 2000;
  toastConfig.set({ ..._toastConfig });
}

export function setError(message) {
  _toastConfig.kind = 'error';
  _toastConfig.title = getItl('toast.error');
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
    _toastConfig.title = `${getItl('toast.init_data')} (${step}/${totalSteps})`;
  } else {
    _toastConfig.title = getItl('toast.init_data');
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
  _toastConfig.title = getItl('toast.pending');
  _toastConfig.subtitle = getItl('toast.registering_vote');
  _toastConfig.closeOnMount = false;
  _toastConfig.spinner = true;
  toastConfig.set({ ..._toastConfig });
}

export function setSuccessVote() {
  _toastConfig.kind = 'success';
  _toastConfig.title = getItl('toast.success');
  _toastConfig.subtitle = getItl('toast.vote_registered');
  _toastConfig.closeOnMount = true;
  _toastConfig.spinner = false;
  _toastConfig.visible = true;
  _toastConfig.closeTimeout = 2000;
  toastConfig.set({ ..._toastConfig });
}

export function setRejectedVote() {
  _toastConfig.kind = 'error';
  _toastConfig.title = getItl('toast.error');
  _toastConfig.subtitle = getItl('toast.vote_rejected');
  _toastConfig.closeOnMount = true;
  _toastConfig.spinner = false;
  _toastConfig.visible = true;
  _toastConfig.closeTimeout = 4000;
  toastConfig.set({ ..._toastConfig })
};