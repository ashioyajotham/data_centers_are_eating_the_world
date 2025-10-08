import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import MapView from './pages/MapView'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import DataExplorer from './pages/DataExplorer'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MapView />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="explorer" element={<DataExplorer />} />
        <Route path="about" element={<About />} />
        <Route 
          path="admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  )
}

export default App
