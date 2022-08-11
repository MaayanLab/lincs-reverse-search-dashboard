import React from 'react'

const Plot = React.lazy(() => import('./plot'))
const Table = React.lazy(() => import('./table'))

export default function Dashboard({ tab, name, title, gene, kind, columns }) {
  return (
    <div
      style={{
        flex: '1 0 auto',
        display: tab === name ? 'flex' : 'none',
        flexDirection: 'column',
      }}
    >
      <React.Suspense fallback={"Loading..."}>
        <h4 style={{ fontWeight: 'bold', alignSelf: 'center', marginTop: '0.5em', marginBottom: '0.5em' }}>
          {title}
        </h4>
        <div style={{ alignSelf: 'center' }}>
          <Plot gene={gene} kind={kind} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Table
            gene={gene}
            kind={kind}
            direction="down"
            columns={columns}
            initialState={{
              sorting: {
                sortModel: [{ field: 'Log2(Fold Change)', sort: 'asc' }],
              },
            }}
          />
          <Table
            gene={gene}
            kind={kind}
            direction="up"
            columns={columns}
            initialState={{
              sorting: {
                sortModel: [{ field: 'Log2(Fold Change)', sort: 'desc' }],
              },
            }}
          />
        </div>
      </React.Suspense>
    </div>
  )
}
