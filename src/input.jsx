import React from 'react'

const Button = React.lazy(() => '@mui/material/Button')
const TextField = React.lazy(() => '@mui/material/TextField')

export default function Input({ label, onSubmit }) {
  const [value, setValue] = React.useState('')
  return (
    <form
      style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center', fontSize: '1em', margin: '0.5em' }}
      onSubmit={evt => { evt.preventDefault(); onSubmit(value) }}
    >
      <TextField
        label={label}
        value={value}
        onChange={evt => setValue(evt.currentTarget.value)}
        variant="outlined"
      />
      &nbsp;
      <Button variant="contained" onClick={() => onSubmit(value)}>Submit</Button>
    </form>
  )
}