import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import AddApplication from './pages/AddApplication'
import EditApplication from './pages/EditApplication'
import ApplicationDetail from './pages/ApplicationDetail'
import Profile from './pages/Profile'
import Assistant from './pages/Assistant'
import Import from './pages/Import'
import Kanban from './pages/Kanban'
import ToastProvider from './components/Toast'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/new" element={<AddApplication />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/applications/:id/edit" element={<EditApplication />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/import" element={<Import />} />
          <Route path="/board" element={<Kanban />} />
        </Routes>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App