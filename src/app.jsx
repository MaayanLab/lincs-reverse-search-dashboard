import React from 'react'

const Tab = React.lazy(() => import('@mui/material/Tab'))
const Tabs = React.lazy(() => import('@mui/material/Tabs'))
const Heading = React.lazy(() => import('./heading'))
const Input = React.lazy(() => import('./input'))
const Dashboard = React.lazy(() => import('./dashboard'))

function location_hash()  {
  return (window.location.hash || '').replace(/^#/, '')
}

export default function App() {
  const [tab, setTab] = React.useState("Chemical Perturbations")
  const [gene, setGene] = React.useState(location_hash())
  const [title, setTitle] = React.useState(`LINCS L1000 Reverse Search`)
  React.useEffect(() => {
    const onHashChange = (evt) => {
      setGene(location_hash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  React.useEffect(() => {
    const title = gene ? `LINCS L1000 ${tab} Reverse Search for ${gene}` : `LINCS L1000 Reverse Search`
    document.title = title
    setTitle(title)
  }, [gene, tab])
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyItems: 'center',
      alignItems: 'stretch',
      fontSize: '1rem',
      fontWeight: 400,
    }}>
      <Heading>{title}</Heading>
      {!gene ? (
        <>
          <p style={{ fontSize: '1em', margin: '0.5em' }}>
            Based off of the <a href="https://appyters.maayanlab.cloud/#/L1000_RNAseq_Gene_Search">RNA-seq-like Gene Centric Signature Reverse Search (RGCSRS)</a> Appyter
            this web application is a dashboard for L1000 Reverse Search results.
          </p>
          <Input label="Gene" onSubmit={(gene) => window.location.hash = `#${gene}`} />
        </>
      ) : (
        <React.Suspense fallback={"Loading..."}>
          <Tabs value={tab} onChange={(evt, newTab) => setTab(newTab)}>
            <Tab label="Chemical Perturbations" value="Chemical Perturbations" />
            <Tab label="CRISPR KO" value="CRISPR KO" />
          </Tabs>
          <Dashboard
            tab={tab}
            gene={gene}
            name="Chemical Perturbations"
            title={`Differential Expression of ${gene} in RNA-seq-like Chemical Signatures`}
            kind="cp"
            columns={[
              'Perturbagen',
              'Dose',
              'Timepoint',
              'Cell Line',
              'Log2(Fold Change)',
              'CD Coefficient',
              'Rank in Signature',
            ]}
          />
          <Dashboard
            tab={tab}
            gene={gene}
            name="CRISPR KO"
            title={`Differential Expression of ${gene} in RNA-seq-like CRISPR KO Signatures`}
            kind="xpr"
            columns={[
              'KO Gene',
              'Cell Line',
              'Timepoint',
              'Log2(Fold Change)',
              'CD Coefficient',
              'Rank in Signature',
            ]}
          />
        </React.Suspense>
      )}
    </div>
  )
}
