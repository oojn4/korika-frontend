import { Paper, SimpleGrid, Space, Title } from '@mantine/core';
import UploadActualData from '../../components/UploadData/UploadActualData';
import classes from './Admin.module.css';

const AdminPage = () => {


  return (
    <div className={classes.root}>
      <Title order={1}>Upload Actual Data</Title>
      <Space h="lg" />
      <SimpleGrid cols={{ base: 1, xs: 1, md: 1 }}>
        <Paper withBorder p="md" radius="md">
          <UploadActualData />
        </Paper>
        
      </SimpleGrid>
    </div>
  );
}

export default AdminPage;