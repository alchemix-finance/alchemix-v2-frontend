import toastConfig from '../stores/toast';
import errorLog from '../stores/errorLog';
import getItl from './getItl';

let _toastConfig;
let _errorLog;

toastConfig.subscribe((val) => {
  _toastConfig = val;
});

errorLog.subscribe((val) => {
  _errorLog = val;
});

export function closeToast() {
  _toastConfig.forceClose = true;
  toastConfig.set({ ..._toastConfig });
}

export function setPendingGas() {
  _toastConfig.kind = 'pending';
  _toastConfig.title = getItl('toast.pending');
  _toastConfig.subtitle = getItl('toast.pending_gas');
  _toastConfig.closeOnMount = false;
  _toastConfig.visible = true;
  toastConfig.set({ ..._toastConfig });
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

export function setSuccessTx(hash, closeToggle) {
  _toastConfig.kind = 'success';
  _toastConfig.title = getItl('toast.success');
  _toastConfig.subtitle = getItl('toast.tx_confirmed');
  _toastConfig.closeOnMount = closeToggle || true;
  _toastConfig.showOpenButton = true;
  _toastConfig.etherscanUrl = hash;
  _toastConfig.spinner = false;
  _toastConfig.visible = true;
  _toastConfig.closeTimeout = 2000;
  toastConfig.set({ ..._toastConfig });
}

export function setLoginSuccess(message) {
  _toastConfig.spinner = false;
  _toastConfig.kind = 'success';
  _toastConfig.showCloseButton = false;
  _toastConfig.closeOnMount = true;
  _toastConfig.closeTimeout = 2500;
  _toastConfig.title = message;
  _toastConfig.visible = true;
  toastConfig.set({ ..._toastConfig });
}

export function setSuccess(message) {
  _toastConfig.kind = 'success';
  _toastConfig.title = getItl('toast.success');
  _toastConfig.subtitle = message;
  _toastConfig.closeOnMount = true;
  _toastConfig.showOpenButton = false;
  _toastConfig.spinner = false;
  _toastConfig.visible = true;
  _toastConfig.closeTimeout = 2000;
  toastConfig.set({ ..._toastConfig });
}

export function setError(message, fullError) {
  const errorMsg = typeof fullError === 'object' ? JSON.stringify(fullError) : fullError;
  _toastConfig.kind = 'error';
  _toastConfig.title = getItl('toast.error');
  _toastConfig.subtitle = message;
  _toastConfig.closeOnMount = true;
  _toastConfig.showOpenButton = false;
  _toastConfig.spinner = false;
  _toastConfig.visible = true;
  _toastConfig.closeTimeout = 10000;
  _errorLog.push({
    timeStamp: Date.now(),
    message: errorMsg,
  });
  toastConfig.set({ ..._toastConfig });
  errorLog.set([..._errorLog]);
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
  toastConfig.set({ ..._toastConfig });
}
