import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Placeholder from './components/Placeholder'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/applications"
            element={<Placeholder title="Applications" />}
          />
          <Route
            path="/assistant"
            element={<Placeholder title="AI Assistant" />}
          />
          <Route path="/profile" element={<Placeholder title="Profile" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App