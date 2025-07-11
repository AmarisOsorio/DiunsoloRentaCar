/** Antes de iniciarla y todo tenes que instalar
 * las librerias de:
 * 
 * npm i recharts axio
 * 
 */

import { useState } from 'react'
import Dashboard from '../src/components/Dashboard';

function App() {
  const [count, setCount] = useState(0)

  return (
   <div className="App">
      <Dashboard />
    </div>
  );
}

export default App
