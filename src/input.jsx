import React from 'react'

export default function Input({ onSubmit }) {
  const [value, setValue] = React.useState('')
  return (
    <form onSubmit={evt => { evt.preventDefault(); onSubmit(value) }}>
      <input value={value} onChange={evt => setValue(evt.currentTarget.value)} />
      &nbsp;
      <input type="submit" text="Submit" />
    </form>
  )
}