import { PoolInfo } from '../../features/pools/PoolInfo'
import { UserInvestmentInfo } from '../../features/pools/UserInvestmentInfo'
import { useUserInvestmentInfo, useStableCoinBalance } from '../../features/pools/hooks'
import { RouteComponentProps } from 'react-router-dom'
import { useContractKit } from '@celo-tools/use-contractkit'
import { cUSD } from '@ubeswap/sdk'
import { ZERO_ADDRESS } from '../../constants'

export default function PoolPage({
        match: {
            params: { id },
        },
    }: RouteComponentProps<{ id: string }>) {

    let { network, account } = useContractKit();
    const { chainId } = network
    console.log(account);
    account = account ?? ZERO_ADDRESS;

    const investmentInfo = useUserInvestmentInfo(id)
    const tokenBalance = investmentInfo ? investmentInfo.userBalance.toString() : '0'
    const cUSDBalance = useStableCoinBalance(cUSD[chainId].address, account).toString()

    return (
        <>
            <PoolInfo address={id} account={account} tokenBalance={tokenBalance} cUSDBalance={cUSDBalance}></PoolInfo>
            <UserInvestmentInfo poolAddress={id}></UserInvestmentInfo>
        </>
    )
}