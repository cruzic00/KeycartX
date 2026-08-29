import { BrowserRouter, Routes, Route } from "react-router-dom";
import Providers from "./Providers";
import RootShell from "./RootShell";
import RequireAuth from "./RequireAuth";
import ErrorBoundary from "./ErrorBoundary";

import Home from "./routes/Home";
import Products from "./routes/Products";
import ProductDetail from "./routes/ProductDetail";
import Anime from "./routes/Anime";
import Gym from "./routes/Gym";
import College from "./routes/College";
import Mafia from "./routes/Mafia";
import Office from "./routes/Office";
import CategoryDynamic from "./routes/CategoryDynamic";
import Cart from "./routes/Cart";
import CheckoutSuccess from "./routes/checkout/Success";
import CheckoutCancel from "./routes/checkout/Cancel";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Orders from "./routes/Orders";
import Account from "./routes/Account";
import Profile from "./routes/profile/Profile";
import ProfileEdit from "./routes/profile/Edit";
import ProfileAddresses from "./routes/profile/Addresses";
import NotFound from "./routes/NotFound";

import AdminLayout from "./routes/admin/AdminLayout";
import AdminDashboard from "./routes/admin/Dashboard";
import AdminCustomization from "./routes/admin/Customization";
import AdminOrders from "./routes/admin/Orders";
import AdminOrderDetail from "./routes/admin/OrderDetail";
import AdminPayments from "./routes/admin/Payments";
import AdminStocks from "./routes/admin/Stocks";
import AdminUsers from "./routes/admin/Users";

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Providers>
          <Routes>
            <Route element={<RootShell />}>
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:slug" element={<ProductDetail />} />
              <Route path="anime" element={<Anime />} />
              <Route path="gym" element={<Gym />} />
              <Route path="college" element={<College />} />
              <Route path="mafia" element={<Mafia />} />
              <Route path="office" element={<Office />} />
              <Route path="c/:category" element={<CategoryDynamic />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout/success" element={<CheckoutSuccess />} />
              <Route path="checkout/cancel" element={<CheckoutCancel />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              <Route
                path="account"
                element={
                  <RequireAuth>
                    <Account />
                  </RequireAuth>
                }
              />
              <Route
                path="orders"
                element={
                  <RequireAuth>
                    <Orders />
                  </RequireAuth>
                }
              />
              <Route
                path="profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />
              <Route
                path="profile/edit"
                element={
                  <RequireAuth>
                    <ProfileEdit />
                  </RequireAuth>
                }
              />
              <Route
                path="profile/addresses"
                element={
                  <RequireAuth>
                    <ProfileAddresses />
                  </RequireAuth>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="customization" element={<AdminCustomization />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="stocks" element={<AdminStocks />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Routes>
        </Providers>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
