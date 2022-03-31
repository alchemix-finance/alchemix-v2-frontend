// see documentation at https://docs.lido.fi/contracts/lido-oracle/#add-calculation-of-staker-rewards-apr

import { externalContractWrapper } from '../helpers/contractWrapper';
import { utils } from 'ethers';

export async function getLidoApr(signer) {
  try {
    const { instance: oracle } = externalContractWrapper('Lido', signer);
    const delta = await oracle.getLastCompletedReportDelta();
    const prePool = utils.formatEther(delta.preTotalPooledEther);
    const postPool = utils.formatEther(delta.postTotalPooledEther);
    const timeElapsed = delta.timeElapsed;
    const secondsPA = 60 * 60 * 24 * 365;
    return ((postPool - prePool) * secondsPA) / (prePool * timeElapsed);
  } catch (error) {
    console.error(`[lido/getLidoApr]: ${error}`);
    throw Error(error);
  }
}
