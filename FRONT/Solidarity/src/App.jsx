import { useState } from 'react'
import Landing from './views/Landing'
import './App.css'
import Donations from './components/Donation_panel'
import DonationsList from './components/Donation_list'
import Contrato from './ConexionSol'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Landing/>
    </>
  )
}

export default App
