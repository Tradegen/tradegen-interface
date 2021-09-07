import InvestmentMenu from '../../features/investments/InvestmentMenu'
import { InvestmentList } from '../../features/investments/InvestmentList'
import styled from 'styled-components'

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

export default function Investments() {
    return (
        <>
            <Container>
                <MenuWrapper>
                    <InvestmentMenu></InvestmentMenu>
                </MenuWrapper>
            </Container>
            <InvestmentList></InvestmentList>
        </>
    )
}