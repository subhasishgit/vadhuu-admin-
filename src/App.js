import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box, CssBaseline, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Login from './components/Login';
import Forget from './components/Forget';
import Dashboard from './components/Dashboard';

import { ThemeProvider } from '@mui/material/styles';
import { GlobalTheme } from './theme.js';

import Sidebar from './components/Sidebar';

import DynamicTablePage from './components/DynamicTablePage';
import CMSPage from './components/CMSPage';
import ProductPage from './components/ProductPage';
import DynamicTablePotrait from './components/DynamicTablePotrait';
import DynamicTablePageView from './components/DynamicTablePageView';
const drawerWidth = 100;
const collapsedWidth = 60;

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate(); // Adding useNavigate hook

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/');
    setSidebarOpen(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('isAuthenticated', 'false');
    setSidebarOpen(false);
    navigate('/login'); // Redirect to login page after logout
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={GlobalTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>

        {isAuthenticated && (
          <>
            <AppBar position="fixed" sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1, background: '#fff',
              boxShadow: `0 0 10px 0 rgba(0, 0, 0, 0.1), 0 0 1px 0 #d99f59, 0 0 0 1px #f9d8af`,
              borderBottom: '1px solid transparent',
            }}>
              <Toolbar>
                {/* Back Button */}
                {/* <IconButton edge="start" color="black" aria-label="back" onClick={() => navigate(-1)}>
                  <ArrowBackIcon />
                </IconButton> */}
                {/* Menu Toggle Button */}
                {/* <IconButton edge="start" color="black" aria-label="menu" onClick={toggleSidebar} sx={{ marginLeft: 2 }}>
                  <MenuIcon />
                </IconButton> */}
                <Box component="div" sx={{ flexGrow: 1 }}>
                  <img src='https://vadhuu.com/static/media/logo.38ec35200b67031298a5.gif' alt='' style={{
                    width: 100
                  }} />
                </Box>
                {/* Logout Button */}
                <Button color="primary" onClick={handleLogout}>
                  Logout
                </Button>
              </Toolbar>
            </AppBar>
            <Sidebar open={sidebarOpen} onClose={handleLogout} onToggle={toggleSidebar} collapsed={!sidebarOpen} />
          </>
        )
        }
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            // p: 3,
            mt: 10,
            transition: 'all .3s ease',
            // marginLeft: isAuthenticated && sidebarOpen ? `${drawerWidth}px` : `${collapsedWidth}px`,
            width: `calc(100vw - ${isAuthenticated && sidebarOpen ? drawerWidth : collapsedWidth}px)`,
            overflowX: 'hidden',
          }}
        >
          {/* <Toolbar /> */}
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/Forgot" element={<Forget />} />
            <Route
              path="/"
              element={isAuthenticated ? <Dashboard /> : <Login onLogin={handleLogin} />}
            />
            {isAuthenticated && (
              <>
                <Route path="/table/:tableName/:pageTitle/:viewType" element={<DynamicTablePage />} />
                <Route path="/Ptable/:tableName/:pageTitle" element={<DynamicTablePotrait />} />
                <Route path="/CMSPage" element={<CMSPage />} />
                
                <Route path="/manage-products/:subCategoryId" element={<ProductPage />} />
                <Route path="/view/:tableName/:pageTitle/:viewType" element={<DynamicTablePageView />} />
              </>
            )}
          </Routes>
        </Box>
      </Box >
    </ThemeProvider>
  );
};

const AppWrapper = () => (
  <Router>
    <Routes>
      <Route path="*" element={<App />} />
    </Routes>
  </Router>
);

export default AppWrapper;
