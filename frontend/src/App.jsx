import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Customer Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ProductCatalog from './pages/public/ProductCatalog';
import ProductDetails from './pages/public/ProductDetails';
import MyRentals from './pages/customer/MyRentals';
import RentalTracking from './pages/customer/RentalTracking';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import RentalManagement from './pages/admin/RentalManagement';
import UserManagement from './pages/admin/UserManagement';
import ReportsDashboard from './pages/admin/ReportsDashboard';

// Inventory Manager Pages
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import InspectionWorkflow from './pages/inventory/InspectionWorkflow';
import StockManagement from './pages/inventory/StockManagement';

function App() {
  return (
    <Routes>
      {/* Public Storefront Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/catalog" element={<ProductCatalog />} />
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* Customer Protected Routes */}
        <Route
          path="/my-rentals"
          element={
            <ProtectedRoute allowedRoles={['customer', 'admin']}>
              <MyRentals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rental/track/:id"
          element={
            <ProtectedRoute allowedRoles={['customer', 'admin', 'inventory_manager']}>
              <RentalTracking />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Protected Dashboard Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="rentals" element={<RentalManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<ReportsDashboard />} />
      </Route>

      {/* Inventory Manager Protected Dashboard Layout */}
      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={['inventory_manager', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<InventoryDashboard />} />
        <Route path="inspection" element={<InspectionWorkflow />} />
        <Route path="stock" element={<StockManagement />} />
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
