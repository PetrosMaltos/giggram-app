// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomeScreen from './WelcomeScreen';
import Main from './Main';
import Loading from './components/Loading';
import Categories from './components/Categories';
import Services from './components/Services';
import Orders from './Orders';
import OrderDetail from './components/OrderDetail';
import Profile from './Profile';
import { useOrderStore } from './store';
import CreateOrder from './CreateOrder';
import Favors from './Favors';
import CreateFavor from './CreateFavor';
import Projects from './Projects';
import Specialists from './Specialists';
import Settings from './Settings';
import ProjectPage from './components/ProjectPage';
import { projectsData } from './components/projectData';
import Help from './Help';
import MyOrders from './MyOrders';
import MyProjects from './MyProjects';
import MyFavors from './MyFavors';
import { ordersData } from './components/ordersData';
import Login from './Login';
import Register from './Register';
import EditProfile from './EditProfile';
import { UserProvider, useUser } from './UserContext';
import OtherProfile from './OtherProfile';
import NotFound from './NotFound';
import CreateProject from './CreateProject';
import ClientDashboard from './ClientDashboard';
import FreelancerDashboard from './FreelancerDashboard';
import Subscribe from './Subscribe';
import MyResponses from './MyResponses';
import MyInvites from './MyInvites';
import MyDeals from './MyDeals';
import DealDetail from './DealDetail';
import Work from './Work';
import Review from './Review';
import Payment from './Payment';
import CardPayment from './CardPayment';
import EditPassword from './components/EditPassword';
import ForgotPassword from './ForgotPassword';
import Moderation from './Moderation';

const App = () => {
  const [loading, setLoading] = useState(true);
  const { fetchOrders } = useOrderStore(state => ({
    fetchOrders: state.fetchOrders,
  }));

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.setHeaderColor('#000000');
    }

    const timer = setTimeout(() => {
      setLoading(false);
      fetchOrders(); // Загрузка заказов при старте приложения
    }, 3000);

    return () => clearTimeout(timer);
  }, [fetchOrders]);

  return (
    <UserProvider> {/* Обернули приложение в UserProvider */}
      <Router>
        {loading ? (
          <Loading />
        ) : (
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/orders" element={<Orders orders={ordersData} />} />
            <Route path="/orders/:id" element={<OrderDetail orders={ordersData} />} />
            <Route path="/create" element={<CreateOrder />} />
            <Route path="/main" element={<Main />} />
            <Route path="/favors" element={<Favors />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users/:userId" element={<OtherProfile />} /> {/* Изменено на /users/:userId */}
            <Route path="/editprofile" element={<EditProfile />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/services" element={<Services />} />
            <Route path="/specialists" element={<Specialists />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/help" element={<Help />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/my-responses" element={<MyResponses />} />
            <Route path="/my-favors" element={<MyFavors />} />
            <Route path="/create-favor" element={<CreateFavor />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/my-invites" element={<MyInvites />} />
            <Route path="/my-deals" element={<MyDeals />} />
            <Route path="/deal/:dealId" element={<DealDetail />} />
            <Route path="/deal/:dealId/work" element={<Work />} />
            <Route path="/deal/:dealId/review" element={<Review />} />
            <Route path="/deal/:dealId/payment" element={<Payment />} />
            <Route path="/deal/:dealId/card-payment" element={<CardPayment />} />
            <Route path="/editpassword" element={<EditPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/moderation" element={<Moderation />} />
          </Routes>
        )}
      </Router>
    </UserProvider>
  );
};

export default App;