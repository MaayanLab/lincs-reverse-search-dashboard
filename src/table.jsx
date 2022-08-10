import React from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { suspend } from 'suspend-react'

export default function Table({ kind, direction, gene, limit }) {
  const table = suspend(async () => {
    const res = await fetch(`/api/table/${kind}/${direction}/${gene}${limit ? `?limit=${limit}` : ''}`)
    return await res.json()
  }, [kind, direction, gene, limit])
  const columns = Object.keys(table)
  const index = Object.keys(Object.values(table)[0])
  const cols = [{ field: 'Term', fieldName: 'Term', width: 250 }, ...columns.map(col => ({ field: col, fieldName: col, width: 150 }))]
  const rows = index.map(ind => columns.reduce((row, col) => ({
    ...row,
    [col]: typeof table[col][ind] === 'number' ? table[col][ind].toPrecision(3) : table[col][ind]
  }), { id: ind, Term: ind }))
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
        />
      </div>
    </div>
  )
}
