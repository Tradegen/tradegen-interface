import { ChainId } from '@ubeswap/sdk'
import React from 'react'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useContractKit } from '@celo-tools/use-contractkit'
import styled from 'styled-components'

const Wrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
`

const NavLink = styled.div`
  font-weight: 700;
  background-color: transparent;
  border-width: 1px;
  border-radius: 0.625rem;
  color: white;
  border-color: transparent;
  background: linear-gradient(90deg, #161522, #161522), linear-gradient(90deg, #27b0e6, #fa52a0);
  background-clip: padding-box, border-box;
  background-origin: padding-box, border-box;
  margin-top: 20px;
`

const NavLinkText = styled.a`
  display: flex;
  align-items: center;
  color: white;
  justify-content: space-between;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 700;
  border-width: 1px;
  border-color: transparent;
  border-radius: 0.625rem;
  cursor: pointer;
  background-color: rgba(22, 21, 34, 1);
`

const NavLinkText2 = styled.a`
  background: repeating-linear-gradient(45deg, #161522, #161522 10px, #0d0415 0, #0d0415 20px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 700;
  border-width: 1px;
  border-color: transparent;
  border-radius: 0.625rem;
  cursor: pointer;
  background-color: rgba(22, 21, 34, 1);
`

const Divider = styled.div`
  width: 100%;
  height: 0;
  font-weight: 700;
  border-width: 1px;
  border-bottom-width: 0;
  border-color: transparent;
  border-radius: 0.625rem;
  color: rgba(227, 227, 227, 1);
`

export default function InvestmentMenu(props:any) {
    const { network, address } = useContractKit()
    const toggleWalletModal = useWalletModalToggle()

    return (
        <Wrapper>
          { address ? (
            <NavLink>
              <NavLinkText>
                Your Investments
              </NavLinkText>
            </NavLink>
          ) : (
            <NavLinkText2 onClick={toggleWalletModal}>
              Your Investments
            </NavLinkText2>
          )}
          <Divider></Divider>
          <NavLink>
            <NavLinkText>
              All Investments
            </NavLinkText>
          </NavLink>
          <NavLink>
            <NavLinkText>
              Pools
            </NavLinkText>
          </NavLink>
          <NavLink>
            <NavLinkText>
              NFT Pools
            </NavLinkText>
          </NavLink>
        </Wrapper>
    )
}