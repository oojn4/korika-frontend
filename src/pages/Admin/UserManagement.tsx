import { Paper, SimpleGrid, Space, Title } from '@mantine/core';
import { useEffect } from 'react';
import UserManagement from '../../components/UserManagement/UserManagement';
import classes from './Admin.module.css';

const AdminPage = () => {


  return (
    <div className={classes.root}>
      <Title order={1}>User Management</Title>
      <Space h="lg" />
      <SimpleGrid cols={{ base: 1, xs: 1, md: 1 }}>
        <Paper withBorder p="md" radius="md">
          <UserManagement />
        </Paper>
        
      </SimpleGrid>
    </div>
  );
}

export default AdminPage;