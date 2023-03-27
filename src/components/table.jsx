import React from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { suspend } from 'suspend-react'

export default function Table({ kind, direction, gene, limit, columns, ...props }) {
  const table = suspend(async () => {
    const res = await fetch(`${typeof process !== 'undefined' ? process.env.ENDPOINT_URL : ''}/api/table/${kind}/${direction}/${gene}${limit ? `?limit=${limit}` : ''}`)
    return await res.json()
  }, [kind, direction, gene, limit])
  if (columns === undefined) columns = Object.keys(table)
  const index = Object.keys(Object.values(table)[0])
  const cols = columns.map(col => {
    const type = typeof table[col][index[0]]
    let valueFormatter
    if (type === 'number') valueFormatter = ({ value }) => value.toPrecision(3)
    return {
      field: col,
      fieldName: col,
      width: 150,
      type,
      valueFormatter,
    }
  })
  const rows = index.map(ind => columns.reduce((row, col) => ({
    ...row,
    [col]: table[col][ind]
  }), { id: ind }))
  return (
    <div style={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '450px' }}>
      <h4 style={{ fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em' }}>
        {direction[0].toUpperCase() + direction.slice(1)}-regulating perturbations
      </h4>
      <div style={{ flex: '1 0 auto', alignSelf: 'stretch' }}>
        <DataGrid
          rows={rows}
          columns={cols}
          autoPageSize
          disableColumnMenu
          pageSize={5}
          {...props}
        />
      </div>
    </div>
  )
}
