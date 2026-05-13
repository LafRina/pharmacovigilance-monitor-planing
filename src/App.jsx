import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './modules/Auth/Login';
import Register from './modules/Auth/Register';
import CalendarView from './modules/Calendar/CalendarView';
import UserDashboard from './modules/Dashboard/User/UserDashboard';
import AdminDashboard from './modules/Dashboard/Admin/AdminDashboard';
import DrugsList from './modules/Drugs/Common/DrugsList';
import Reports from './modules/Reports/Reports';
import RootLayout from './components/RootLayout';
import PrivateRoutes from './components/PrivateRoutes';
import AllUsersPage from './modules/AllUsers/AllUsersPage';
import { useEffect, useState } from 'react';
import { supabase } from './api/supabaseClient';
import AddDrug from './modules/Drugs/Admin/AddDrug';
import DrugDetails from './modules/Drugs/Common/DrugDetails';
import EditDrug from './modules/Drugs/Admin/EditDrug';
import AdminCreateTask from './modules/Dashboard/Admin/AdminCreateTask';
import GenerateReport from './modules/Reports/GenerateReport';
import ReportDetails from './modules/Reports/ReportsDetails';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsRoleLoading(true); // Починаємо завантаження
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(data?.role || 'user');
      }
      setIsRoleLoading(false); // Закінчуємо тільки після всіх запитів
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(data?.role || 'user');
      } else {
        setUser(null);
        setRole(null);
      }
      setIsRoleLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isRoleLoading) return <div>Завантаження профілю...</div>;

  console.log("APP STATE: user:", user?.email, "role:", role, "loading:", isRoleLoading);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login userRole={role} />} />
        <Route path="/login" element={<Login userRole={role} />} />
        <Route path="/register" element={<Register />} />

        {/* 1. Загальна обгортка для всіх, хто увійшов (і юзери, і адміни) */}
        <Route element={<PrivateRoutes allowedRoles={['user', 'admin']} userRole={role} isRoleLoading={isRoleLoading} />}>
          <Route element={<RootLayout user={user} userRole={role} isRoleLoading={isRoleLoading} />}>
            
            {/* 2. СПІЛЬНІ СТОРІНКИ (пишемо їх ТУТ один раз) */}
            <Route path="/drugslist" element={<DrugsList userRole={role}/>} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/drugs/:id" element={<DrugDetails user={user} userRole={role}/>} />

            {/* 3. Маршрути ТІЛЬКИ для Юзера */}
            <Route element={<PrivateRoutes allowedRoles={['user']} userRole={role} isRoleLoading={isRoleLoading} />}>
              <Route path="/userdashboard" element={<UserDashboard user={user}/>} />
              <Route path="/usercalendar" element={<CalendarView />} />
            </Route>

            {/* 4. Маршрути ТІЛЬКИ для Адміна */}
            <Route element={<PrivateRoutes allowedRoles={['admin']} userRole={role} isRoleLoading={isRoleLoading} />}>
              <Route path="/admindashboard" element={<AdminDashboard user={user} userRole={role}/>} />
              <Route path="/allusers" element={<AllUsersPage />} />
              <Route path="/adddrug" element={<AddDrug user={user}/>} />
              <Route path="/edit-drug/:id" element={<EditDrug user={user} />} />
              <Route path="/create-task" element={<AdminCreateTask adminUser={user}/>} />
              <Route path="/generatereports" element={<GenerateReport user={user}/>} />
              <Route path="/reports/:id" element={<ReportDetails user={user} />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<h1 style={{color: 'red'}}>404: Сторінку не знайдено</h1>} />
      </Routes>
    </Router>
  );
}

export default App;