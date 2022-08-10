import React from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

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