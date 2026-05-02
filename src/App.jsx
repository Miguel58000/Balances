import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingScreen from './components/layout/LoadingScreen';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/auth" />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px', flex: 1 }}>
        {children}
      </div>
      <Footer />
    </div>
  );
};

function App() {
  const { currentUser, loading } = useApp();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route
        path="/auth"
        element={!currentUser ? <AuthPage /> : <Navigate to="/" />}
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
