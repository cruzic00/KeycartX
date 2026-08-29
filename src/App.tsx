import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Providers from "./Providers";
import RootShell from "./RootShell";
import RequireAuth from "./RequireAuth";
import ErrorBoundary from "./ErrorBoundary";
import Home from "./routes/Home";

// Route-level code splitting: only Home (the landing page) loads eagerly.
// Everything else — including the entire admin panel most visitors never
// touch — is fetched on demand, which is what actually keeps first load fast.
const Products = lazy(() => import("./routes/Products"));
const ProductDetail = lazy(() => import("./routes/ProductDetail"));
const Anime = lazy(() => import("./routes/Anime"));
const Gym = lazy(() => import("./routes/Gym"));
const College = lazy(() => import("./routes/College"));
const Mafia = lazy(() => import("./routes/Mafia"));
const Office = lazy(() => import("./routes/Office"));
const CategoryDynamic = lazy(() => import("./routes/CategoryDynamic"));
const Cart = lazy(() => import("./routes/Cart"));
const CheckoutSuccess = lazy(() => import("./routes/checkout/Success"));
const CheckoutCancel = lazy(() => import("./routes/checkout/Cancel"));
const Login = lazy(() => import("./routes/Login"));
const Register = lazy(() => import("./routes/Register"));
const Orders = lazy(() => import("./routes/Orders"));
const Account = lazy(() => import("./routes/Account"));
const Profile = lazy(() => import("./routes/profile/Profile"));
const ProfileEdit = lazy(() => import("./routes/profile/Edit"));
const ProfileAddresses = lazy(() => import("./routes/profile/Addresses"));
const NotFound = lazy(() => import("./routes/NotFound"));

const AdminLayout = lazy(() => import("./routes/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./routes/admin/Dashboard"));
const AdminCustomization = lazy(() => import("./routes/admin/Customization"));
const AdminOrders = lazy(() => import("./routes/admin/Orders"));
const AdminOrderDetail = lazy(() => import("./routes/admin/OrderDetail"));
const AdminPayments = lazy(() => import("./routes/admin/Payments"));
const AdminStocks = lazy(() => import("./routes/admin/Stocks"));
const AdminUsers = lazy(() => import("./routes/admin/Users"));

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Providers>
          <Suspense fallback={null}>
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
          </Suspense>
        </Providers>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
