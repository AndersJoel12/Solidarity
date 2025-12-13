import { useState } from 'react'
import Landing from './views/Landing'
import './App.css'
import Donations from './components/Donations_panel'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Donations/>
    <br></br>
    <Landing/>
    </>
  )
}

export default App
