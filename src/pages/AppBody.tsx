import React from 'react'
import styled from 'styled-components'

export const BodyWrapper = styled.div`
  position: relative;
  max-width: 420px;
  width: 100%;
  background-color: rgba(86,86,86,0.15);
  box-shadow: 0 3px 20px 0  rgb(0 0 0 / 45%);
  border-radius: 30px;
  /* padding: 1rem; */
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>
}
