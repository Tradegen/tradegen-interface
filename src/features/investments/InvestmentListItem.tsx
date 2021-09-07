import { formatNumber, formatPercent } from '../../functions/format'
import styled from 'styled-components'
import BigNumber from 'bignumber.js';
import { Investment } from './hooks' 
import React from 'react'

const Wrapper = styled.div`
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  text-align: left;
  border-radius: .625rem;
  cursor: pointer;
  background-color: rgba(22, 21, 34, 1);
  color: rgba(191, 191, 191, 1);
  font-size: .875rem;
  line-height: 1.25rem;
`

const ColumnWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
`

const FirstColumn = styled.div`
  display: flex;
  grid-column: span 2/span 2;
  margin-right: 1rem;
  margin-left: 1rem;
`

const FirstColumnContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const InvestmentName = styled.div`
  font-weight: 700;
`

const InvestmentType = styled.div`
    font-size: .75rem;
    line-height: 1rem;
    color: rgba(127, 127, 127, 1);
`

const SecondColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-weight: 700;
`

interface Props {
    investmentInfo: Investment
}

export const InvestmentListItem: React.FC<Props> = ({ investmentInfo }: Props) => {
    return (
        <>
            <Wrapper>
                <ColumnWrapper>
                    <FirstColumn>
                        <FirstColumnContent>
                            <InvestmentName>{investmentInfo.name}</InvestmentName>
                            <InvestmentType>{investmentInfo.type}</InvestmentType>
                        </FirstColumnContent>
                    </FirstColumn>
                    <SecondColumn>{investmentInfo.TVL}</SecondColumn>
                    <SecondColumn>{investmentInfo.tokenPrice}</SecondColumn>
                    <SecondColumn>{investmentInfo.totalReturn}</SecondColumn>
                </ColumnWrapper>
            </Wrapper>
        </>
    )
}