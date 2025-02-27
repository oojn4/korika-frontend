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
  PasswordInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDotsVertical, IconEdit, IconFilter, IconPlus, IconTrash } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { 
  UserService, 
  User, 
  UserMetadata, 
  UserQueryParams
} from '../../services/services/user.service';

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
  const [paginationMeta, setPaginationMeta] = useState<UserMetadata | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchTimeout, setSearchTimeout] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState>({ 
    show: false, 
    message: '', 
    type: 'success' 
  });
  const [opened, { open, close }] = useDisclosure(false);
  const [filterOpened, { toggle: toggleFilter }] = useDisclosure(false);
  
  // Query params for server-side filtering and pagination
  const [filters, setFilters] = useState<UserQueryParams>({
    page: 1,
    per_page: 10,
    sort_by: 'id',
    sort_order: 'asc'
  });

  // Form data for creating/updating users
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    access_level: '',
    password: ''
  });

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, [filters]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setFilters({
        ...filters,
        full_name: searchTerm,
        page: 1 // Reset to first page on new search
      });
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm]);

  // Fetch users with pagination and filters
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await UserService.getPaginatedUsers(filters);
      
      if (response.success) {
        setUsers(response.data);
        setPaginationMeta(response.meta);
      } else {
        setError(response.error || 'Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters({
      ...filters,
      page
    });
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof UserQueryParams, value: any) => {
    const newFilters = { ...filters };
    
    if (value === null || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    // Reset to first page when filters change
    newFilters.page = 1;
    
    setFilters(newFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      page: 1,
      per_page: 10,
      sort_by: 'id',
      sort_order: 'asc'
    });
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
      if (currentUser) {
        await UserService.updateUser(currentUser.id, formData);
      } else {
        await UserService.createUser(formData);
      }

      setNotification({
        show: true,
        message: currentUser ? 'User updated successfully!' : 'User created successfully!',
        type: 'success'
      });
      fetchUsers();
      close();
    } catch (err) {
      console.error('Error:', err);
      setError('Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setIsLoading(true);
    try {
      const response = await UserService.deleteUser(userId);
      
      if (response.success) {
        setNotification({
          show: true,
          message: 'User deleted successfully!',
          type: 'success'
        });
        fetchUsers();
      } else {
        setError(response.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again later.');
    } finally {
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
        <Text size="xl" style={{weight:500}}>User Management</Text>
        {/* <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={handleAddUser}
        >
          Add User
        </Button> */}
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

      <Group mb="md">
        <TextInput
          placeholder="Search users by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          style={{ flex: 1 }}
          autoComplete="off"
        />
        <Button
          variant="outline"
          leftSection={<IconFilter size={16} />}
          onClick={toggleFilter}
        >
          Filters
        </Button>
      </Group>

      {filterOpened && (
        <Stack mb="md" p="md" style={{ border: '1px solid #eee', borderRadius: '8px' }}>
          <Group grow>
            <TextInput
              label="Email"
              placeholder="Filter by email"
              value={filters.email || ''}
              onChange={(e) => handleFilterChange('email', e.currentTarget.value)}
            />
            
            <Select
              label="Access Level"
              placeholder="Filter by access level"
              value={filters.access_level || ''}
              onChange={(value) => handleFilterChange('access_level', value)}
              data={paginationMeta?.distinct_values.access_levels.map(level => ({ 
                value: level, 
                label: level 
              })) || [
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'User' },
              ]}
              clearable
            />
            
            <Select
              label="Items per page"
              placeholder="Items per page"
              value={filters.per_page?.toString()}
              onChange={(value) => handleFilterChange('per_page', value ? parseInt(value) : 10)}
              data={[
                { value: '5', label: '5' },
                { value: '10', label: '10' },
                { value: '25', label: '25' },
                { value: '50', label: '50' }
              ]}
            />
          </Group>
          
          <Group >
            <Button variant="subtle" onClick={resetFilters}>
              Reset Filters
            </Button>
          </Group>
        </Stack>
      )}

      {isLoading && !users.length ? (
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
              {users.length > 0 ? (
                users.map((user) => (
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

          {paginationMeta && paginationMeta.total_pages > 1 && (
            <Group mt="md" >
              <Text size="sm">
                Showing {users.length} of {paginationMeta.total_records} users
              </Text>
              <Pagination
                value={paginationMeta.page}
                onChange={handlePageChange}
                total={paginationMeta.total_pages}
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
          
          <PasswordInput
            label="Password"
            placeholder={currentUser ? "Leave blank to keep current password" : "Enter password"}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required={!currentUser}
            autoComplete="new-password"
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