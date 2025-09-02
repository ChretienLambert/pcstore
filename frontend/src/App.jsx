import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {Toaster} from "sonner"
import UserLayout from './components/Layout/UserLayout'
import Home from "./pages/Home"
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import CollectionPage from './pages/CollectionPage'
import ProductDetails from './components/Products/ProductDetails'
import Checkout from './components/Cart/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import OrderDetailsPage from './pages/OrderDetailsPage'
import MyOrdersPage from './pages/MyOrdersPage'
import AdminLayout from './components/Admin/AdminLayout'
import AdminHomePage from './pages/AdminHomePage'
import UserManagement from './components/Admin/UserManagement'

const App = () => {
  return (
   <BrowserRouter>
   <Toaster position="top-right"></Toaster>
   <Routes>
    <Route path="/" element={<UserLayout />}>
    <Route path="profile" element={<Profile />} />
    <Route index element={<Home />}/>
    <Route path="login" element={<Login />}/>
    <Route path="collections/:collection" element={<CollectionPage />}/>
    <Route path="product/:id" element={<ProductDetails/>}/>
    <Route path="Register" element={<Register />} />
    <Route path="checkout" element={<Checkout />}/>
    <Route path='order-confirmation' element={<OrderConfirmation />}/>
    <Route path="order/:id" element={<OrderDetailsPage/>} />
    <Route path="my-orders" element={<MyOrdersPage/>}/>
    </Route>
    {/*Admin Layout */}
    <Route path='/admin' element={<AdminLayout />}>
    <Route index element={<AdminHomePage />}/>
    <Route path='users' element={<UserManagement />}/>
    </Route>
   </Routes>
   </BrowserRouter>
  )
}

export default App
