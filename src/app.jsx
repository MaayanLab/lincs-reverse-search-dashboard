import React from 'react'
import { suspend } from 'suspend-react'

function location_hash()  {
  return (window.location.hash || '').replace(/^#/, '')
}

function randid() {
  const S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function Heading({ children }) {
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

function Plot({ kind, gene }) {
  const id = React.useState(randid)
  const ref = React.useRef(null)
  const Bokeh = suspend(async () => {
    const Bokeh = await import('@bokeh/bokehjs')
    return Bokeh
  }, [])
  const plot = suspend(async () => {
    const res = await fetch(`/api/plot/${kind}/${gene}`)
    return await res.json()
  }, [kind, gene])
  React.useEffect(() => {
    if (!ref.current || !Bokeh || !id || !plot) return
    Bokeh.embed.embed_item(plot, id)
  }, [ref.current, Bokeh, id, plot])
  return <div id={id} ref={ref} />
}

function Table({ kind, direction, gene, limit }) {
  const table = suspend(async () => {
    const res = await fetch(`/api/table/${kind}/${direction}/${gene}${limit ? `?limit=${limit}` : ''}`)
    return await res.json()
  }, [kind, direction, gene, limit])
  const columns = Object.keys(table)
  const index = Object.keys(Object.values(table)[0])
  return (
    <div>
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {index.map(ind => (
            <tr key={ind}>
              <th>{ind}</th>
              {columns.map(col => (
                <td key={col}>{table[col][ind]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Input({ onSubmit }) {
  const [value, setValue] = React.useState('')
  return (
    <form onSubmit={evt => { evt.preventDefault(); onSubmit(value) }}>
      <input value={value} onChange={evt => setValue(evt.currentTarget.value)} />
      &nbsp;
      <input type="submit" text="Submit" />
    </form>
  )
}

export default function App() {
  const [gene, setGene] = React.useState(location_hash())
  React.useEffect(() => {
    const onHashChange = (evt) => {
      setGene(location_hash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      fontSize: '1rem',
      fontWeight: 400,
      margin: 0,
    }}>
      {!gene ? (
        <>
          <Heading>LINCS L1000 Reverse Search</Heading>
          <p>
            Based off of the <a href="https://appyters.maayanlab.cloud/#/L1000_RNAseq_Gene_Search">RNA-seq-like Gene Centric Signature Reverse Search (RGCSRS)</a> Appyter
            this web application is a dashboard for L1000 Reverse Search results.
          </p>
          <div style={{ display: 'flex', flexDirection: 'row'  }}>
            Gene:&nbsp;
            <Input onSubmit={(gene) => window.location.hash = `#${gene}`} />
          </div>
        </>
      ) : (
        <>
          <Heading>LINCS L1000 Chemical Perturbations Reverse Search for {gene}</Heading>
          <React.Suspense fallback={"Loading..."}>
            <Plot gene={gene} kind="cp" />
            <Table gene={gene} kind="cp" direction="up" limit={10} />
            <Table gene={gene} kind="cp" direction="down" limit={10} />
          </React.Suspense>
          <Heading>LINCS L1000 CRISPR KO Reverse Search for {gene}</Heading>
          <React.Suspense fallback={"Loading..."}>
            <Plot gene={gene} kind="xpr" />
            <Table gene={gene} kind="xpr" direction="up" limit={10} />
            <Table gene={gene} kind="xpr" direction="down" limit={10} />
          </React.Suspense>
        </>
      )}
    </div>
  )
}
