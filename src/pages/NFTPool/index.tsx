import { NFTPoolInfo } from '../../features/NFTPools/NFTPoolInfo'
import { UserInvestmentInfo } from '../../features/NFTPools/UserInvestmentInfo'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
import { useContractKit } from '@celo-tools/use-contractkit'

const Container = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding-top: 1rem;
  padding-bottom: 1rem;
  margin-left: auto;
  margin-right: auto;
  max-width: 80rem;
`

const MenuWrapper = styled.div`
    position: sticky;
    top: 0;
    max-height: 40rem;
`

export default function NFTPoolPage({
        match: {
            params: { id },
        },
    }: RouteComponentProps<{ id: string }>) {

    let { network, account } = useContractKit();
    console.log(account);
    console.log(network);
    account = account ?? null;

    return (
        <>
            <p>NFT Pool Info</p>
            <NFTPoolInfo address={id}></NFTPoolInfo>

            {account && <UserInvestmentInfo poolAddress={id} userAddress={account}></UserInvestmentInfo>}
        </>
    )
}