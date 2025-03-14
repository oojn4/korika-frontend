import {
    Accordion,
    ActionIcon,
    Badge,
    Box,
    Button,
    Center,
    Group,
    Loader,
    Menu,
    Modal,
    Notification,
    NumberInput,
    Pagination,
    Select,
    Stack,
    Table,
    Text,
    TextInput
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconDotsVertical,
    IconEdit,
    IconPlus,
    IconTrash
} from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { HealthFacilityService, FacilityQueryParams, HealthFacilityMetadata } from '../../services/services/healthfacility.service';

// Define types
interface HealthFacility {
  id_faskes: number;
  nama_faskes: string;
  tipe_faskes: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  address?: string;
  lat:number;
  lon:number;
  url:string;
  owner:string;

}



interface FacilityFormData {
  nama_faskes: string;
  tipe_faskes: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  address?: string;
  lat:number;
  lon:number;
  url:string;
  owner:string;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export const HealthFacilityManagement: React.FC = () => {
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentFacility, setCurrentFacility] = useState<HealthFacility | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState>({ show: false, message: '', type: 'success' });
  const [opened, { open, close }] = useDisclosure(false);
  const [paginationMeta, setPaginationMeta] = useState<HealthFacilityMetadata | null>(null);
  const [filters, setFilters] = useState<FacilityQueryParams>({
    page: 1,
    per_page: 10,
    sort_by: 'id_faskes',
    sort_order: 'asc'
  });
  // Form data for creating/updating facilities
  const [formData, setFormData] = useState<FacilityFormData>({
    nama_faskes: '',
    tipe_faskes: '',
    provinsi: '',
    kabupaten: '',
    kecamatan: '',
    address: '',
    lat:0,
    lon:0,
    url:'',
    owner:''
  });

  // Load facilities on component mount
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev: any) => ({
        ...prev,
        nama_faskes: searchTerm,
        page: 1 // Reset halaman saat pencarian berubah
      }));
    }, 500);
    
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchFacilities();
  }, [filters]);
  const fetchFacilities = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await HealthFacilityService.getPaginatedFacilities(filters);
      if (response.success) {
        setFacilities(response.data);
        setPaginationMeta(response.meta);
      } else {
        setError(response.error || 'Failed to load facilities');
      }
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Failed to load facilities. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
     
    setFormData({ ...formData, [name]: value });
    
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string | null): void => {
    setFormData({ ...formData, [name]: value || '' });
  };
const handleNumberChange = (name: keyof HealthFacility, value: number | undefined): void => {
    setFormData({ ...formData, [name]: value || 0 });
  };
  // Open modal for creating a new facility
  const handleAddFacility = (): void => {
    setCurrentFacility(null);
    setFormData({
      nama_faskes: '',
      tipe_faskes: '',
      provinsi: '',
      kabupaten: '',
      kecamatan: '',
      address: '',
      lat:0,
      lon:0,
      url:'',
      owner:''
    });
    open();
  };
  const handlePageChange = (page: number): void => {
    setFilters((prev: any) => ({ ...prev, page }));
  };
  
  const handleFilterChange = (key: keyof FacilityQueryParams, value: any): void => {
    const newFilters = { ...filters };
    
    if (value === null || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    // Reset to first page when filter changes
    newFilters.page = 1;
    
    setFilters(newFilters);
  };
  const resetFilters = (): void => {
    setSearchTerm('');
    setFilters({
      page: 1,
      per_page: 10,
      sort_by: 'id_faskes',
      sort_order: 'asc'
    });
  };

  // Open modal for editing an existing facility
  const handleEditFacility = (facility: HealthFacility): void => {
    setCurrentFacility(facility);
    setFormData({
      nama_faskes: facility.nama_faskes || '',
      tipe_faskes: facility.tipe_faskes || '',
      provinsi: facility.provinsi || '',
      kabupaten: facility.kabupaten || '',
      kecamatan: facility.kecamatan || '',
      address: facility.address || '',
      lat:facility.lat || 0,
      lon:facility.lon || 0,
      url:facility.url || '',
      owner:facility.owner || ''      
    });
    open();
  };

  // Handle form submission
  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      if (currentFacility) {
        // Update existing facility
        response = await HealthFacilityService.updateFacility(
          currentFacility.id_faskes, 
          formData
        );
      } else {
        // Create new facility
        response = await HealthFacilityService.createFacility(formData);
      }

      if (response.success) {
        setNotification({
          show: true,
          message: currentFacility ? 'Facility updated successfully!' : 'Facility created successfully!',
          type: 'success'
        });
        fetchFacilities();
        close();
      } else {
        setError(response.error || 'Operation failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle facility deletion
  const handleDeleteFacility = async (facilityId: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    
    setIsLoading(true);
    try {
      const response = await HealthFacilityService.deleteFacility(facilityId);
      
      if (response.success && response.data.deleted) {
        setNotification({
          show: true,
          message: 'Facility deleted successfully!',
          type: 'success'
        });
        fetchFacilities();
      } else {
        setError(response.error || 'Failed to delete facility');
      }
    } catch (err) {
      console.error('Error deleting facility:', err);
      setError('Failed to delete facility. Please try again later.');
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

  // Reset filters
  

  // Calculate pagination
  

  // Facility type badge color
  const getFacilityTypeColor = (type: string): string => {
    switch(type) {
      case 'Rumah Sakit': return 'blue';
      case 'Puskesmas': return 'green';
      case 'Klinik': return 'yellow';
      default: return 'gray';
    }
  };

 
  return (
    <div>
      <Group mb="md">
        <Text size="xl" style={{weight:500}}>Health Facility Management</Text>
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={handleAddFacility}
        >
          Add Facility
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

      <Group mb="md">
        <TextInput
          placeholder="Search facilities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
      </Group>

      <Accordion mb="md">
  <Accordion.Item value="filters">
    <Accordion.Control>
      <Text size="sm">Location and Type Filters</Text>
    </Accordion.Control>
    <Accordion.Panel>
      <Stack>
        <Group grow>
          <Select
            label="Province"
            placeholder="Filter by province"
            value={filters.provinsi || ''}
            onChange={(value) => {
              handleFilterChange('provinsi', value);
              if (!value) {
                // Clear dependent filters
                handleFilterChange('kabupaten', null);
                handleFilterChange('kecamatan', null);
              }
            }}
            data={paginationMeta?.distinct_values.provinces.map((p: any) => ({ value: p, label: p })) || []}
            clearable
          />
          
          <Select
            label="District"
            placeholder="Filter by district"
            value={filters.kabupaten || ''}
            onChange={(value) => {
              handleFilterChange('kabupaten', value);
              if (!value) {
                // Clear dependent filter
                handleFilterChange('kecamatan', null);
              }
            }}
            data={paginationMeta?.distinct_values.districts.map((k: any) => ({ value: k, label: k })) || []}
            disabled={!filters.provinsi}
            clearable
          />
          
          <Select
            label="Sub-district"
            placeholder="Filter by sub-district"
            value={filters.kecamatan || ''}
            onChange={(value) => handleFilterChange('kecamatan', value)}
            data={paginationMeta?.distinct_values.subdistricts.map((k: any) => ({ value: k, label: k })) || []}
            disabled={!filters.kabupaten}
            clearable
          />
        </Group>
        
        <Group grow>
          <Select
            label="Facility Type"
            placeholder="Filter by facility type"
            value={filters.tipe_faskes || ''}
            onChange={(value) => handleFilterChange('tipe_faskes', value)}
            data={paginationMeta?.distinct_values.facility_types.map((t: any) => ({ value: t, label: t })) || []}
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
          
          <Box style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button variant="subtle" onClick={resetFilters}>
              Reset Filters
            </Button>
          </Box>
        </Group>
      </Stack>
    </Accordion.Panel>
  </Accordion.Item>
</Accordion>

      {isLoading && !facilities.length ? (
        <Center p="xl">
          <Loader />
        </Center>
      ) : error ? (
        <Text style={{color:"red"}}>{error}</Text>
      ) : (
        <>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Location</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {facilities.length > 0 ? (
                facilities.map((facility) => (
                  <Table.Tr key={facility.id_faskes}>
                    <Table.Td>{facility.nama_faskes}</Table.Td>
                    <Table.Td>
                      <Badge color={getFacilityTypeColor(facility.tipe_faskes)}>
                        {facility.tipe_faskes}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {facility.kecamatan}, {facility.kabupaten}, {facility.provinsi}
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
                            onClick={() => handleEditFacility(facility)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconTrash size={16} />} 
                            color="red"
                            onClick={() => handleDeleteFacility(facility.id_faskes)}
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
                    No facilities found
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>

          {paginationMeta && paginationMeta.total_pages > 1 && (
  <Group mt="md" >
    <Text size="sm">
      Showing {facilities.length} of {paginationMeta.total_records} facilities
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
        title={currentFacility ? "Edit Health Facility" : "Add New Health Facility"}
        size="lg"
        centered
      >
        <Stack>
          <TextInput
            label="Facility Name"
            placeholder="Enter facility name"
            name="nama_faskes"
            value={formData.nama_faskes}
            onChange={handleInputChange}
            required
          />
          
          <Select
            label="Facility Type"
            placeholder="Select facility type"
            name="tipe_faskes"
            value={formData.tipe_faskes}
            onChange={(value) => handleSelectChange('tipe_faskes', value)}
            data={[
              { value: 'Rumah Sakit', label: 'Rumah Sakit' },
              { value: 'Puskesmas', label: 'Puskesmas' },
              { value: 'Klinik', label: 'Klinik' },
              { value: 'Praktek Swasta', label: 'Praktek Swasta' },
              { value: 'BP4/BBKPM/BKPM', label: 'BP4/BBKPM/BKPM' },
              { value: 'RS TNI/Polri', label: 'RS TNI/Polri' },
            ]}
            required
          />
          <Select
            label="Facility Owner"
            placeholder="Select facility owner"
            name="owner"
            value={formData.owner}
            onChange={(value) => handleSelectChange('owner', value)}
            data={[
              { value: 'PEMERINTAH', label: 'Pemerintah' },
              { value: 'SWASTA', label: 'Swasta' },
              { value: 'TNI', label: 'TNI' },
              { value: 'POLRI', label: 'POLRI' }
            ]}
            required
          />
          
          <Group grow>
            <TextInput
              label="Province"
              placeholder="Enter province"
              name="provinsi"
              value={formData.provinsi}
              onChange={handleInputChange}
              required
            />
            
            <TextInput
              label="District"
              placeholder="Enter district/kabupaten"
              name="kabupaten"
              value={formData.kabupaten}
              onChange={handleInputChange}
              required
            />
            
            <TextInput
              label="Sub-district"
              placeholder="Enter sub-district/kecamatan"
              name="kecamatan"
              value={formData.kecamatan}
              onChange={handleInputChange}
              required
            />
          </Group>
          
          <TextInput
            label="Address"
            placeholder="Enter complete address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
          <Group grow>
              <NumberInput 
              label="Latitude" 
              placeholder="Enter latitude"
              name="lat"
              value={formData.lat}
              onChange={(value) => handleNumberChange('lat', typeof value === 'number' ? value : undefined)}
              />
              <NumberInput
              label="Longitude"
              placeholder="Enter longitude"
              name="lon"
              value={formData.lon}
              onChange={(value) => handleNumberChange('lon', typeof value === 'number' ? value : undefined)}
              />
            </Group>

          
          
          {error && <Text color="red" size="sm">{error}</Text>}
          
          <Group mt="md">
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={handleSubmit} loading={isLoading}>
              {currentFacility ? "Update" : "Create"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};