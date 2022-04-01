import React, { useState } from 'react'
import { ChevronDown as Arrow } from 'react-feather'
import styled from 'styled-components'

import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import Row, { RowBetween } from '../Row'

const StyledIcon = styled.div`
  color: white;
`

const Wrapper = styled.div`
  z-index: 20;
  color: black;
  position: relative;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.15); 
  width: 160px;
  padding: 4px 10px;
  padding-right: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  :hover {
    cursor: pointer;
  }
`

const Dropdown = styled.div`
  position: absolute;
  top: 34px;
  padding-top: 40px;
  width: 100%;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 10px 10px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  color: black;
  :hover {
    cursor: pointer;
  }
`

const ArrowStyled = styled(Arrow)`
  height: 20px;
  width: 20px;
  margin-left: 6px;
  color: #5271FF;
`

const DropdownSelect = ({ options, active, setActive, color }) => {
  const [showDropdown, toggleDropdown] = useState(false)

  console.log(active)

  return (
    <Wrapper open={showDropdown} color={color}>
      <RowBetween onClick={() => toggleDropdown(!showDropdown)} justify="center">
        <TYPE.black>{active}</TYPE.black>
        <StyledIcon>
          <ArrowStyled />
        </StyledIcon>
      </RowBetween>
      {showDropdown && (
        <Dropdown>
          <AutoColumn gap="20px">
            {Object.keys(options).map((key, index) => {
              let option = options[key]
              return (
                option !== active && (
                  <Row
                    onClick={() => {
                      toggleDropdown(!showDropdown)
                      setActive(option)
                    }}
                    key={index}
                  >
                    <TYPE.black>{option}</TYPE.black>
                  </Row>
                )
              )
            })}
          </AutoColumn>
        </Dropdown>
      )}
    </Wrapper>
  )
}

export default DropdownSelect