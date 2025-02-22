// UserManagement.tsx - Component for managing users
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Menu,
  Modal,
  Notification,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  TextInput
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDotsVertical, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { UserService } from '../../services/services/user.service';

// Define types
interface User {
  id: number;
  full_name: string;
  email: string;
  access_level: string;
  id_faskes?: number | null;
}



interface FormData {
  full_name: string;
  email: string;
  access_level: string;
  password: string;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState>({ show: false, message: '', type: 'success' });
  const [activePage, setActivePage] = useState<number>(1);
  const [opened, { open, close }] = useDisclosure(false);
  const itemsPerPage = 10;

  // Form data for creating/updating users
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    access_level: '',
    password: ''
  });

  // Load users and facilities on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(users.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  // Mock API functions (replace with actual API calls)
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Replace with actual API call
      const response = await UserService.getAllUsers();
    //   const mockUsers: User[] = [
    //     { id: 1, name: 'Admin User', email: 'admin@example.com', access_level: 'admin' },
    //     { id: 2, name: 'Manager User', email: 'manager@example.com', access_level: 'manager', id_faskes: 1 },
    //     { id: 3, name: 'Staff User', email: 'staff@example.com', access_level: 'staff', id_faskes: 2 }
    //   ];
      
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };



  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData({ ...formData, [name]: value });
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string | null) => {
    setFormData({ ...formData, [name]: value || '' });
  };

  // Open modal for creating a new user
  const handleAddUser = () => {
    setCurrentUser(null);
    setFormData({
      full_name: '',
      email: '',
      access_level: '',
      password: '',
    });
    open();
  };

  // Open modal for editing an existing user
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      access_level: user.access_level || '',
      password: '',  // Password field is empty for editing
    });
    open();
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log('Form data:', formData);
    setIsLoading(true);
    setError(null);

    try {
      // Mock API call (replace with actual API call)
      if (currentUser) {
        await UserService.updateUser(currentUser.id, formData);
      } else {
        await UserService.createUser(formData);
      }

      // Simulate API success
      setTimeout(() => {
        setNotification({
          show: true,
          message: currentUser ? 'User updated successfully!' : 'User created successfully!',
          type: 'success'
        });
        fetchUsers();
        close();
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error:', err);
      setError('Operation failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setIsLoading(true);
    try {
      // Mock API call (replace with actual API call)
      await UserService.deleteUser(userId);
      
      // Simulate API success
      setTimeout(() => {
        setNotification({
          show: true,
          message: 'User deleted successfully!',
          type: 'success'
        });
        fetchUsers();
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again later.');
      setIsLoading(false);
    }
  };

  // Reset notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Calculate pagination
  const paginatedUsers = filteredUsers.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  // Access level badge color
  const getAccessLevelColor = (level: string): string => {
    switch(level) {
      case 'admin': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div>
      <Group mb="md">
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </Group>

      {notification.show && (
        <Notification
          color={notification.type === 'success' ? 'green' : 'red'}
          onClose={() => setNotification({ ...notification, show: false })}
          mb="md"
        >
          {notification.message}
        </Notification>
      )}

      <TextInput
        placeholder="Search users..."
        mb="md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
      />

      {isLoading && !paginatedUsers.length ? (
        <Center p="xl">
          <Loader />
        </Center>
      ) : error ? (
        <Text style={{color:"red", textAlign:"center"}}>{error}</Text>
      ) : (
        <>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Access Level</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>{user.full_name}</Table.Td>
                    <Table.Td>{user.email}</Table.Td>
                    <Table.Td>
                      <Badge color={getAccessLevelColor(user.access_level)}>
                        {user.access_level}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Menu position="bottom-end" withArrow>
                        <Menu.Target>
                          <ActionIcon>
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item 
                            leftSection={<IconEdit size={16} />}
                            onClick={() => handleEditUser(user)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconTrash size={16} />} 
                            color="red"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={5} align="center">
                    No users found
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>

          {filteredUsers.length > itemsPerPage && (
            <Group mt="md">
              <Pagination
                value={activePage}
                onChange={setActivePage}
                total={Math.ceil(filteredUsers.length / itemsPerPage)}
              />
            </Group>
          )}
        </>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={currentUser ? "Edit User" : "Add New User"}
        centered
      >
        <Stack>
          <TextInput
            label="Name"
            placeholder="Enter name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            required
          />
          
          <TextInput
            label="Email"
            placeholder="Enter email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          
          <Select
            label="Access Level"
            placeholder="Select access level"
            name="access_level"
            value={formData.access_level}
            onChange={(value) => handleSelectChange('access_level', value)}
            data={[
              { value: 'admin', label: 'Admin' },
              { value: 'user', label: 'User' },
            ]}
            required
          />
          
          <TextInput
            label="Password"
            placeholder={currentUser ? "Leave blank to keep current password" : "Enter password"}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required={!currentUser}
          />
          
          
          {error && <Text color="red" size="sm">{error}</Text>}
          
          <Group mt="md">
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={handleSubmit} loading={isLoading}>
              {currentUser ? "Update" : "Create"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};


export default UserManagement;