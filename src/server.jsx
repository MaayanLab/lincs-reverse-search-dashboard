import 'isomorphic-unfetch'
import { JSDOM } from 'jsdom'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import App from './components/app'

const [_0, _1, gene] = process.argv

const dom = new JSDOM()
global.window = dom.window
global.document = dom.window.document
global.navigator = dom.window.navigator
global.HTMLElement = dom.window.HTMLElement

const stream = ReactDOMServer
  .renderToPipeableStream(<App gene={gene} />, {
    onShellReady: () => {
      stream.pipe(process.stdout)
    },
    onShellError: (e) => {
      console.error(e)
    }
  })
