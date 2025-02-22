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
    IconFilter,
    IconPlus,
    IconTrash
} from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { HealthFacilityService } from '../../services/services/healthfacility.service';

// Define types
interface HealthFacility {
  id_faskes: number;
  nama_faskes: string;
  tipe_faskes: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  address?: string;
}

interface LocationFilter {
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
}

interface FacilityFormData {
  nama_faskes: string;
  tipe_faskes: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  address?: string;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export const HealthFacilityManagement: React.FC = () => {
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<HealthFacility[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentFacility, setCurrentFacility] = useState<HealthFacility | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState>({ show: false, message: '', type: 'success' });
  const [activePage, setActivePage] = useState<number>(1);
  const [opened, { open, close }] = useDisclosure(false);
  const [filterOpen, { toggle: toggleFilter }] = useDisclosure(false);
  const [locationFilter, setLocationFilter] = useState<LocationFilter>({
    provinsi: '',
    kabupaten: '',
    kecamatan: ''
  });
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>('');
  const itemsPerPage = 10;

  // Form data for creating/updating facilities
  const [formData, setFormData] = useState<FacilityFormData>({
    nama_faskes: '',
    tipe_faskes: '',
    provinsi: '',
    kabupaten: '',
    kecamatan: '',
    address: '',
  });

  // Load facilities on component mount
  useEffect(() => {
    fetchFacilities();
  }, []);

  // Filter facilities based on search term and filters
  useEffect(() => {
    let result = facilities;
    
    // Apply search term filter
    if (searchTerm) {
      result = result.filter(facility => 
        facility.nama_faskes?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        facility.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply location filters
    if (locationFilter.provinsi) {
      result = result.filter(facility => 
        facility.provinsi?.toLowerCase() === locationFilter.provinsi.toLowerCase()
      );
    }
    
    if (locationFilter.kabupaten) {
      result = result.filter(facility => 
        facility.kabupaten?.toLowerCase() === locationFilter.kabupaten.toLowerCase()
      );
    }
    
    if (locationFilter.kecamatan) {
      result = result.filter(facility => 
        facility.kecamatan?.toLowerCase() === locationFilter.kecamatan.toLowerCase()
      );
    }
    
    // Apply facility type filter
    if (facilityTypeFilter) {
      result = result.filter(facility => 
        facility.tipe_faskes === facilityTypeFilter
      );
    }
    
    setFilteredFacilities(result);
  }, [searchTerm, facilities, locationFilter, facilityTypeFilter]);

  // Fetch facilities from API
  const fetchFacilities = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await HealthFacilityService.getAllFacilities();
      if (response.success) {
        setFacilities(response.data);
        setFilteredFacilities(response.data);
      } else {
        setError(response.error || 'Failed to load facilities');
      }
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Failed to load facilities. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string | null): void => {
    setFormData({ ...formData, [name]: value || '' });
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
    });
    open();
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
    });
    open();
  };

  // Handle form submission
  const handleSubmit = async (): Promise<void> => {
    console.log('Form data:', formData);
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
  const resetFilters = (): void => {
    setLocationFilter({
      provinsi: '',
      kabupaten: '',
      kecamatan: ''
    });
    setFacilityTypeFilter('');
  };

  // Calculate pagination
  const paginatedFacilities = filteredFacilities.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  // Facility type badge color
  const getFacilityTypeColor = (type: string): string => {
    switch(type) {
      case 'Rumah Sakit': return 'blue';
      case 'Puskesmas': return 'green';
      case 'Klinik': return 'yellow';
      default: return 'gray';
    }
  };

  // Get unique provinces for filter
  const uniqueProvinces = [...new Set(facilities.map(f => f.provinsi).filter(Boolean))];
  
  // Get unique kabupatens for selected province
  const uniqueKabupatens = [...new Set(
    facilities
      .filter(f => !locationFilter.provinsi || f.provinsi === locationFilter.provinsi)
      .map(f => f.kabupaten)
      .filter(Boolean)
  )];
  
  // Get unique kecamatans for selected kabupaten
  const uniqueKecamatans = [...new Set(
    facilities
      .filter(f => 
        (!locationFilter.provinsi || f.provinsi === locationFilter.provinsi) &&
        (!locationFilter.kabupaten || f.kabupaten === locationFilter.kabupaten)
      )
      .map(f => f.kecamatan)
      .filter(Boolean)
  )];
  
  // Get unique facility types
  const uniqueFacilityTypes = [...new Set(facilities.map(f => f.tipe_faskes).filter(Boolean))];

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
        <Button
          variant="outline"
          leftSection={<IconFilter size={16} />}
          onClick={toggleFilter}
        >
          Filters
        </Button>
      </Group>

      {filterOpen && (
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
                    value={locationFilter.provinsi}
                    onChange={(value) => setLocationFilter({
                      ...locationFilter,
                      provinsi: value || '',
                      kabupaten: '',
                      kecamatan: ''
                    })}
                    data={uniqueProvinces.map(p => ({ value: p, label: p }))}
                    clearable
                  />
                  
                  <Select
                    label="District"
                    placeholder="Filter by district"
                    value={locationFilter.kabupaten}
                    onChange={(value) => setLocationFilter({
                      ...locationFilter,
                      kabupaten: value || '',
                      kecamatan: ''
                    })}
                    data={uniqueKabupatens.map(k => ({ value: k, label: k }))}
                    disabled={!locationFilter.provinsi}
                    clearable
                  />
                  
                  <Select
                    label="Sub-district"
                    placeholder="Filter by sub-district"
                    value={locationFilter.kecamatan}
                    onChange={(value) => setLocationFilter({
                      ...locationFilter,
                      kecamatan: value || ''
                    })}
                    data={uniqueKecamatans.map(k => ({ value: k, label: k }))}
                    disabled={!locationFilter.kabupaten}
                    clearable
                  />
                </Group>
                
                <Group grow>
                  <Select
                    label="Facility Type"
                    placeholder="Filter by facility type"
                    value={facilityTypeFilter}
                    onChange={(value) => setFacilityTypeFilter(value || '')}
                    data={uniqueFacilityTypes.map(t => ({ value: t, label: t }))}
                    clearable
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
      )}

      {isLoading && !paginatedFacilities.length ? (
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
              {paginatedFacilities.length > 0 ? (
                paginatedFacilities.map((facility) => (
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

          {filteredFacilities.length > itemsPerPage && (
            <Group mt="md">
              <Pagination
                value={activePage}
                onChange={setActivePage}
                total={Math.ceil(filteredFacilities.length / itemsPerPage)}
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
              { value: 'Klinik', label: 'Klinik' }
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