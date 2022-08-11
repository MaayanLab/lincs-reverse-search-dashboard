import React from 'react'
import Skeleton from '@mui/material/Skeleton'

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
      <h4 style={{ fontWeight: 'bold', alignSelf: 'center', marginTop: '0.5em', marginBottom: '0.5em' }}>
        {title}
      </h4>
      <div style={{ alignSelf: 'center' }}>
        <React.Suspense fallback={<Skeleton animation="wave" variant="rounded" width={700} height={500} />}>
          <Plot gene={gene} kind={kind} />
        </React.Suspense>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <React.Suspense fallback={<Skeleton animation="wave" variant="rounded" width={'50%'} height={450} />}>
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
        </React.Suspense>
        <React.Suspense fallback={<Skeleton animation="wave" variant="rounded" width={'50%'} height={450} />}>
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
        </React.Suspense>
      </div>
    </div>
  )
}
