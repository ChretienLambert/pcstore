import { BrowserRouter, Route, Routes } from 'react-router-dom'
import UserLayout from './components/Layout/UserLayout'
import Home from "./pages/Home"
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import CollectionPage from './pages/CollectionPage'
import ProductDetails from './components/Products/ProductDetails'

const App = () => {
  return (
   <BrowserRouter>
   <Routes>
    {/* USERLAYOUT */}
    <Route path="/" element={<UserLayout />}>
    <Route path="profile" element={<Profile />} />
    <Route index element={<Home />}/>
    <Route path="login" element={<Login />}/>
    <Route path="collections/:collection" element={<CollectionPage />}/>
    <Route path="product/:id" element={<ProductDetails/>}/>
    {/*Register*/}
    <Route path="Register" element={<Register />} />
    </Route>
   </Routes>
   </BrowserRouter>
  )
}

export default App
