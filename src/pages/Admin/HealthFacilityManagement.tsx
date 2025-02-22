import { Paper, SimpleGrid, Space, Title } from '@mantine/core';
import { useEffect } from 'react';
import { HealthFacilityManagement } from '../../components/HealthFacilityManagement/HealthFacilityManagement';
import classes from './Admin.module.css';

const AdminPage = () => {

  useEffect(() => {
    console.log("ok")
  })

  return (
    <div className={classes.root}>
      <Title order={1}>Health Facility Management</Title>
      <Space h="lg" />
      <SimpleGrid cols={{ base: 1, xs: 1, md: 1 }}>
        <Paper withBorder p="md" radius="md">
          <HealthFacilityManagement />
        </Paper>
        
      </SimpleGrid>
    </div>
  );
}

export default AdminPage;