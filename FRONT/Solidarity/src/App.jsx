import { useState } from 'react'
import Landing from './views/Landing'
import './App.css'
import Donations from './components/Donations_panel'
import Contrato from './ConexionSol'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Contrato/>
    <br />
    <Donations/>
    <br></br>
    <Landing/>
    </>
  )
}

export default App
