import { TradePool } from '../../features/pools/Trade'
import { useUserInvestmentInfo, useStableCoinBalance } from '../../features/pools/hooks'
import { RouteComponentProps } from 'react-router-dom'
import { useContractKit } from '@celo-tools/use-contractkit'
import { mcUSD } from '../../constants/tokens'
import { ZERO_ADDRESS } from '../../constants'
import { formatNumber } from '../../functions/format'

export default function TradePoolPage({
        match: {
            params: { id },
        },
    }: RouteComponentProps<{ id: string }>) {

    let { network, account } = useContractKit();
    const { chainId } = network
    console.log(account);
    account = account ?? ZERO_ADDRESS;

    const investmentInfo = useUserInvestmentInfo(id)
    const tokenBalance = investmentInfo ? investmentInfo.userBalance.toString() : undefined
    const positionValue = investmentInfo ? formatNumber(Number(investmentInfo.userUSDBalance / BigInt(1e16)) / 100, true, true, 18) : undefined
    const mcUSDBalance = useStableCoinBalance(mcUSD[chainId].address, account).toString()

    return (
        <>
            <TradePool address={id} account={account} tokenBalance={tokenBalance} mcUSDBalance={mcUSDBalance} positionValue={positionValue}></TradePool>
        </>
    )
}