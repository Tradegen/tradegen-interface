import { UserInvestments, ManagedInvestments } from '../../features/investments/InvestmentList'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'

const FirstRow = styled.div`
  width: 100%;
  display: flex;
  background-color: none;
  margin-top: 30px;
  margin-bottom: 30px;
  font-size: 30px;
  color: black;
`

const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
  min-width:1000px;
`

export default function Profile({
    match: {
        params: { account },
    },
}: RouteComponentProps<{ account: string }>) {
    return (
        <ItemWrapper>
            <FirstRow>Investments</FirstRow>
            <UserInvestments userAddress={account}></UserInvestments>
            <FirstRow>Managed Pools</FirstRow>
            <ManagedInvestments userAddress={account}></ManagedInvestments>
        </ItemWrapper>
    )
}