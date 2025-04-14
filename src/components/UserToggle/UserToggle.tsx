import { Center, Menu, Text } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store/store';
import { showSuccessNotification } from '../../utils/notifications';

const UserToggle: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login')
  }

  const handleLogout = () => {
    dispatch(logout());
    showSuccessNotification('success-signout', 'Logout successful', 3000)
  };

  const LoginMenuButton = () => {
    return (
      <Menu key="login-toggle">
        <Menu.Target>
          <Text onClick={handleLogin} style={{ cursor: 'pointer'}}>Login</Text>
        </Menu.Target>
      </Menu>
    )
  }

  if(user){
    return (
      <Menu key="user-toggle" trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
        <Menu.Target>
          <Center style={{ cursor: 'pointer' }} onClick={handleLogout}>
            <IconLogout size="1.5rem" stroke={1.5} />
          </Center>
        </Menu.Target>
      </Menu>
    );
  }

  return (
    <LoginMenuButton />
  )
};

export default UserToggle;
