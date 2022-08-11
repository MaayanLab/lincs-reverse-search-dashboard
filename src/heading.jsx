import React from 'react'

export default function Heading({ style, children }) {
  return (
    <div style={{
      ...(style || {}),
      flex: '1 0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: 'rgb(51, 102, 153)',
      color: 'white',
      fontWeight: '700',
    }}>
      <img src="static/lincslogo.svg" style={{ height: '2rem', margin: '0.25em' }} />
      {children}
    </div>
  )
}
