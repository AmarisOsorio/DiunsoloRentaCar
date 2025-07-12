import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import UsuariosPage from './pages/UsuariosPage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <UsuariosPage />
    </>
  )
}

export default App
