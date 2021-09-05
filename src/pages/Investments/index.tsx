import InvestmentMenu from '../../features/investments/InvestmentMenu'
import styled from 'styled-components'
import { useInvestments } from '../../features/investments/hooks'

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
    const investments = useInvestments();
    console.log(investments);
    
    return (
        <Container>
            <MenuWrapper>
                <InvestmentMenu></InvestmentMenu>
            </MenuWrapper>
        </Container>
    )
}