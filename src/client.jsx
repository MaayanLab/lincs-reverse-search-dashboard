import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/app'

let div = document.getElementById('root')
if (div === null) {
  div = document.createElement('div')
  document.body.appendChild(div)
  const root = ReactDOM.createRoot(div)
  root.render(<App />)
} else {
  ReactDOM.hydrateRoot(div, <App gene={window.location.pathname.split('/').slice(-1)[0]} />)
}
