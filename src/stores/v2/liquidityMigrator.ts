import { Signer, BigNumber, ContractTransaction } from 'ethers';
import { contractWrapper, erc20Contract } from '@helpers/contractWrapper';
import {
  setPendingWallet,
  setPendingTx,
  setError,
  setSuccessTx,
  setPendingApproval,
} from '@helpers/setToast';

// token, pool and feed addresses
const slpToken = '0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8';
const blpToken = '0xf16aEe6a71aF1A9Bc8F56975A4c2705ca7A782Bc';
const auraPool = '0x8B227E3D50117E80a02cd0c67Cd6F89A8b7B46d7';
const wethPriceFeed = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';
const tokenPriceFeed = '0x194a9AaF2e0b67c35915cD01101585A33Fe25CAa';
// users can't be trusted with making sane decisions so we hardcode slippage
const slippage = BigNumber.from(10);

export async function calculateParams(toAura: boolean, amount: BigNumber, signer: Signer) {
  try {
    // const { instance: liquidityMigrator } = await externalContractWrapper('LiquidityMigrator', signer);
    const { instance: liquidityMigrator } = await contractWrapper('MigrationCalcs', signer, 'ethereum');
    return liquidityMigrator.getMigrationParams([
      toAura,
      amount,
      slippage,
      slpToken,
      blpToken,
      auraPool,
      wethPriceFeed,
      tokenPriceFeed,
    ]);
  } catch (e) {
    console.log('[calculateParams]:', e);
    return false;
  }
}

export async function beginMigration(paramStruct: any, signer: Signer, userAddress: string) {
  try {
    const { instance: liquidityMigrator, address: liquidityMigratorAddress } = await contractWrapper(
      'Migrator',
      signer,
      'ethereum',
    );
    const slpInstance = erc20Contract(slpToken, signer);
    const slpAllowance = await slpInstance.allowanceOf(userAddress, liquidityMigratorAddress);
    if (BigNumber.from(slpAllowance).lt(paramStruct.poolTokensIn)) {
      setPendingApproval();
      const sendApe = (await slpInstance.approve(liquidityMigratorAddress)) as ContractTransaction;
      await sendApe.wait();
    }
    setPendingWallet();
    const tx = (await liquidityMigrator.migrate(paramStruct)) as ContractTransaction;
    setPendingTx();
    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);
      return true;
    });
  } catch (e) {
    setError(e.data ? await e.data.message : e.message, e);
    console.log('[beginMigration]:', e);
    return false;
  }
}
