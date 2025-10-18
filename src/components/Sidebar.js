import React, { useEffect, useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Badge,
  Divider,
} from '@mui/material';

import { GlobalTheme } from './../theme.js';

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PanoramaOutlinedIcon from '@mui/icons-material/PanoramaOutlined';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import Groups3OutlinedIcon from '@mui/icons-material/Groups3Outlined';
import Diversity2OutlinedIcon from '@mui/icons-material/Diversity2Outlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import PermContactCalendarOutlinedIcon from '@mui/icons-material/PermContactCalendarOutlined';
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

import axios from 'axios';

const drawerWidth = 240;
const collapsedWidth = 60;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  justifyContent: 'space-between',
}));

const Sidebar = ({ open, onToggle }) => {
  const [careerUnreadCount, setCareerUnreadCount] = useState(0);
  const [connectUnreadCount, setConnectUnreadCount] = useState(0);

  useEffect(() => {
    const socket = io(''); // Connect to backend

    socket.on('update-unread-counts', ({ careerUnread, connectUnread }) => {
      // console.log('Unread counts received:', { careerUnread, connectUnread }); // Debugging log
      setCareerUnreadCount(careerUnread);
      setConnectUnreadCount(connectUnread);
    });

    return () => {
      socket.disconnect(); // Clean up connection on unmount
    };
  }, []);

  // Function to mark all as read
  const markAllAsRead = (type) => {
    axios.post(``)
      .then(() => {
        // Reset unread count for the respective type
        if (type === 'career') {
          setCareerUnreadCount(0);
        } else if (type === 'connect') {
          setConnectUnreadCount(0);
        }
      })
      .catch((err) => {
        console.error(`Error marking ${type} records as read:`, err);
      });
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardOutlinedIcon />, link: '/' },
    { text: 'Product', icon: <DiamondOutlinedIcon />, link: '/CMSPage' },
    { text: 'Home Banner', icon: <PanoramaOutlinedIcon />, link: '/table/banka_home_banner/Home%20Banner/landscape' },
    { text: 'Popular Banner', icon: <ImageOutlinedIcon />, link: '/table/banka_popular_banner/Popular%20Banner/landscape' },
    // { text: 'Valley Banner', icon: <PhotoOutlinedIcon />, link: '/table/banka_valley_banner/Valley%20Banner/landscape' },
    { text: 'About Us', icon: <Diversity2OutlinedIcon />, link: '/table/banka_about_us/About Us/potrait' },
    { text: 'Director', icon: <Groups3OutlinedIcon />, link: '/table/banka_director/Director/landscape' },
    { text: 'Event Page', icon: <DateRangeOutlinedIcon />, link: '/table/banka_event_data/Event Page Text/landscape' },
    { text: 'Event Participation', icon: <PermContactCalendarOutlinedIcon />, link: '/table/banka_event_participation/Event Participation/landscape' },
    { text: 'Event Snaps', icon: <PermMediaOutlinedIcon />, link: '/table/banka_event_snapshots/Event Snaps/landscape' },
    { text: 'Career Data', icon: <ArticleOutlinedIcon />, link: '/view/banka_career_applications/Career/landscape', badge: careerUnreadCount, markAsRead: () => markAllAsRead('career') },
    { text: 'Connect Data', icon: <ContactsOutlinedIcon />, link: '/view/banka_connect_requests/Connect/landscape', badge: connectUnreadCount, markAsRead: () => markAllAsRead('connect') },
    // { text: 'Logout', icon: <LogoutOutlinedIcon />, action: () => console.log('Logout clicked') },
  ];

  return (

    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          mt: 8,
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          backgroundColor: '#f3f3f3'
        },
      }}
    >
      {/* <DrawerHeader>
        {open && (
          <Typography variant="h6" noWrap>
            Banka Admin
          </Typography>
        )}
        <IconButton onClick={onToggle}>
          <Menu />
        </IconButton>
      </DrawerHeader> */}
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem sx={{
              p: 0,
              // borderBottom: `1px solid ${GlobalTheme.palette.general.grayDark}`,
            }}>
              <ListItemButton component={item.link ? Link : 'div'} to={item.link} onClick={item.markAsRead || item.action}>
                <ListItemIcon sx={{
                  width: open ? 22 : 25,
                  minWidth: 36, fontSize: GlobalTheme.typography.subtitle1.fontSize
                }}>
                  {item.badge !== undefined ? (
                    <Badge badgeContent={`${item.badge}`} color="secondary">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Drawer>

  );
};

export default Sidebar;
