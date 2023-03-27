import React from 'react'
import { suspend } from 'suspend-react'

function randid() {
  const S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

export default function Plot({ kind, gene }) {
  const ref = React.useRef(null)
  const plot = suspend(async () => {
    if (!kind || !gene) return
    const res = await fetch(`${typeof process !== 'undefined' ? process.env.ENDPOINT_URL : ''}/api/plot/${kind}/${gene}`)
    return await res.json()
  }, [kind, gene])
  const Bokeh = suspend(async () => import('@bokeh/bokehjs'), [])
  React.useEffect(() => {
    if (!ref.current || !plot) return
    const id = randid()
    const div = document.createElement('div')
    div.id = id
    ref.current.appendChild(div)
    Bokeh.embed.embed_item(plot, id)
    return () => {
      ref.current.removeChild(div)
    }
  }, [ref.current, Bokeh, plot])
  return <div ref={ref} />
}
