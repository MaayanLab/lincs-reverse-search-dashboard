import React from 'react'

export default function Heading({ children }) {
  return (
    <div style={{
      flex: '1 0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: 'rgb(51, 102, 153)',
      color: 'white',
      fontWeight: '700',
    }}>
      <img src="static/CFDE-icon-1.png" style={{ height: '2rem' }} />
      {children}
    </div>
  )
}
