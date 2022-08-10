import React from 'react'
import * as Bokeh from '@bokeh/bokehjs'
import { suspend } from 'suspend-react'

function randid() {
  const S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

export default function Plot({ kind, gene }) {
  const id = React.useState(randid)
  const ref = React.useRef(null)
  const plot = suspend(async () => {
    const res = await fetch(`/api/plot/${kind}/${gene}`)
    return await res.json()
  }, [kind, gene])
  React.useEffect(() => {
    if (!ref.current || !id || !plot) return
    Bokeh.embed.embed_item(plot, id)
  }, [ref.current, id, plot])
  return <div id={id} ref={ref} />
}
