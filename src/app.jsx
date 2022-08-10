import React from 'react'

const Heading = React.lazy(() => import('./heading'))
const Input = React.lazy(() => import('./input'))
const Plot = React.lazy(() => import('./plot'))
const Table = React.lazy(() => import('./table'))

function location_hash()  {
  return (window.location.hash || '').replace(/^#/, '')
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
      justifyItems: 'center',
      alignItems: 'stretch',
      fontSize: '1rem',
      fontWeight: 400,
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
            <h4 style={{ fontWeight: 'bold', alignSelf: 'center', marginTop: '0.5em', marginBottom: '0.5em' }}>
              Differential Expression of {gene} in RNA-seq-like Chemical Signatures
            </h4>
            <div style={{ alignSelf: 'center' }}>
              <Plot gene={gene} kind="cp" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Table gene={gene} kind="cp" direction="down" limit={10} />
              <Table gene={gene} kind="cp" direction="up" limit={10} />
            </div>
          </React.Suspense>
          <Heading>LINCS L1000 CRISPR KO Reverse Search for {gene}</Heading>
            <React.Suspense fallback={"Loading..."}>
              <h4 style={{ fontWeight: 'bold', alignSelf: 'center', marginTop: '0.5em', marginBottom: '0.5em' }}>
                Differential Expression of {gene} in RNA-seq-like CRISPR KO Signatures
              </h4>
              <div style={{ alignSelf: 'center' }}>
                <Plot gene={gene} kind="xpr" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Table gene={gene} kind="xpr" direction="down" limit={10} />
              <Table gene={gene} kind="xpr" direction="up" limit={10} />
            </div>
          </React.Suspense>
        </>
      )}
    </div>
  )
}
