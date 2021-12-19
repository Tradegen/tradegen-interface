import { useProvider, useContractKit } from '@celo-tools/use-contractkit'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonConfirmed, ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { AutoRow, RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const TextRow = styled.div`
  width: 100%;
  color: white;
  margin-top: 30px;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
    activeClassName,
  })`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: left;
    border-radius: 3rem;
    outline: none;
    cursor: pointer;
    text-decoration: none;
    color: white;
    font-size: 1rem;
    width: fit-content;
    margin: 0 12px;
    font-weight: 500;
  `

interface ManagerModalProps {
  isOpen: boolean
  poolAddress: string
  onDismiss: () => void
}

export default function ManagerModal({ isOpen, poolAddress, onDismiss }: ManagerModalProps) {
  const library = useProvider()
  const { address: account, network } = useContractKit()
  const { chainId } = network

  poolAddress = poolAddress ?? ""

  const handleClick = useCallback(
    () => {
        console.log("click")
    },
    []
  )

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Restricted Page</TYPE.mediumHeader>
          </RowBetween>
          <TextRow>
            Only the pool manager can access this page.
          </TextRow>
          <RowBetween>
            <ButtonError
              onClick={handleClick}
            >
                <StyledNavLink
                 id={`pool-nav-link`}
                 to={'/investments'}
                >
                    Return to Investments page
                </StyledNavLink>
            </ButtonError>
          </RowBetween>
        </ContentWrapper>
    </Modal>
  )
}