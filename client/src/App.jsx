import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import Placeholder from './components/Placeholder'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route
            path="/applications/new"
            element={<Placeholder title="Add Application" />}
          />
          <Route
            path="/applications/:id"
            element={<Placeholder title="Application Detail" />}
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