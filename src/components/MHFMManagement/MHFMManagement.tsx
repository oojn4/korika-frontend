import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Grid,
  Group,
  Loader,
  Menu,
  Modal,
  Notification,
  NumberInput,
  Pagination,
  Paper,
  Select,
  Stack,
  Stepper,
  Table,
  Tabs,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDotsVertical,
  IconEdit,
  IconFilter,
  IconHospital,
  IconPlus,
  IconTemperature,
  IconTrash,
  IconVirus
} from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { HealthFacilityService } from '../../services/services/healthfacility.service';
import { CreateMalariaData, MalariaDataService, MalariaMonthlyData, PaginationMeta, QueryParams } from '../../services/services/mhfm.service';

// Define types
interface HealthFacility {
  id_faskes: number;
  nama_faskes: string;
}


interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export const MHFMManagement: React.FC = () => {
  // State for malaria data
  const [malariaData, setMalariaData] = useState<MalariaMonthlyData[]>([]);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentData, setCurrentData] = useState<MalariaMonthlyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState>({ show: false, message: '', type: 'success' });
  const [activePage, setActivePage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string | null>('malaria');
  
  // Modal states
  const [opened, { open, close }] = useDisclosure(false);
  const [filterOpened, { toggle: toggleFilter }] = useDisclosure(false);
  
  // Stepper state
  const [activeStep, setActiveStep] = useState<number>(0);
  
  // Filter states
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [searchFacilityId, setSearchFacilityId] = useState<number | null>(null);
  const [filters, setFilters] = useState<QueryParams>({
    sort_by: 'id_mhfm',
    sort_order: 'desc',
    page: 1,
    per_page: 10,
    status: 'actual' // Default status
  });
  // Pagination
  const itemsPerPage = 10;

  // Form data for creating/updating records
  const [formData, setFormData] = useState<CreateMalariaData>({
    id_faskes: 0,
    bulan: 1,
    tahun: new Date().getFullYear(),
    konfirmasi_lab_mikroskop: 0,
    konfirmasi_lab_rdt: 0,
    konfirmasi_lab_pcr: 0,
    pos_0_4: 0,
    pos_5_14: 0,
    pos_15_64: 0,
    pos_diatas_64: 0,
    kematian_malaria: 0,
    hamil_pos: 0,
    p_pf: 0,
    p_pv: 0,
    p_po: 0,
    p_pm: 0,
    p_pk: 0,
    p_mix: 0,
    p_suspek_pk: 0,
    obat_standar: 0,
    obat_nonprogram: 0,
    obat_primaquin: 0,
    kasus_pe: 0,
    penularan_indigenus: 0,
    penularan_impor: 0,
    penularan_induced: 0,
    relaps: 0,
    status: 'actual',
    hujan_hujan_mean: 0,
    hujan_hujan_max: 0,
    hujan_hujan_min: 0,
    tm_tm_mean: 0,
    tm_tm_max: 0,
    tm_tm_min: 0,
    ss_monthly_mean: 0,
    ff_x_monthly_mean: 0,
    ddd_x_monthly_mean: 0,
    ff_avg_monthly_mean: 0,
    pop_penduduk_kab: 0
  });

  // // Load data and facilities on component mount
  // useEffect(() => {
  //   fetchMalariaData();
  //   fetchFacilities();
  // }, []);
  // Fetch monthly data from API
  const fetchMalariaData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MalariaDataService.getPaginatedMalariaData(filters);
      if (response.success) {
        setMalariaData(response.data);
        setPaginationMeta(response.meta);
      } else {
        setError(response.error || 'Failed to load malaria data');
      }
    } catch (err) {
      console.error('Error fetching malaria data:', err);
      setError('Failed to load malaria data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch facilities for dropdowns
  const fetchFacilities = async (): Promise<void> => {
    try {
      const response = await HealthFacilityService.getAllFacilities();
      if (response.success) {
        setFacilities(response.data);
      }
    } catch (err) {
      console.error('Error fetching facilities:', err);
    }
  };
  useEffect(() => {
    fetchMalariaData();
    fetchFacilities();
  }, [filters]);
// Tambahkan useEffect ini untuk search
useEffect(() => {
  // Apply search using facility name when the user types
  if (searchTerm) {
    const facilityMatch = facilities.find(f => 
      f.nama_faskes.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (facilityMatch) {
      setSearchFacilityId(facilityMatch.id_faskes);
    } else {
      setSearchFacilityId(null);
    }
  } else {
    setSearchFacilityId(null);
  }
}, [searchTerm, facilities]);
useEffect(() => {
  const handler = setTimeout(() => {
    const newFilters = { ...filters };
    
    // Update id_faskes filter based on search
    if (searchFacilityId) {
      newFilters.id_faskes = searchFacilityId;
    } else {
      delete newFilters.id_faskes;
    }
    
    // Reset to first page when searching
    newFilters.page = 1;
    
    setFilters(newFilters);
  }, 500);
  
  return () => clearTimeout(handler);
}, [searchFacilityId]);
const handlePageChange = (page: number): void => {
  setFilters({ ...filters, page });
};
const handleFilterChange = (key: keyof QueryParams, value: any): void => {
  const newFilters = { ...filters };
  
  if (value === null || value === '') {
    if (key === 'status') {
      // Default to 'actual' if status is cleared
      newFilters[key] = 'actual';
    } else {
      delete newFilters[key];
    }
  } else {
    newFilters[key] = value;
  }
  
  // Reset to first page when filter changes
  newFilters.page = 1;
  
  setFilters(newFilters);
};
  // Handle number input change
  const handleNumberChange = (name: keyof CreateMalariaData, value: number | undefined): void => {
    setFormData({ ...formData, [name]: value || 0 });
  };

  // Handle select change
  const handleSelectChange = (name: keyof CreateMalariaData, value: string | null): void => {
    if (name === 'id_faskes' || name === 'bulan' || name === 'tahun') {
      setFormData({ ...formData, [name]: value ? parseInt(value) : 0 });
    } else if (name === 'status') {
      setFormData({ ...formData, [name]: value || 'actual' });
    }
  };

  // Get facility name from ID
  const getFacilityName = (id: number): string => {
    const facility = facilities.find(f => f.id_faskes === id);
    return facility ? facility.nama_faskes : `Facility ID: ${id}`;
  };

  // Open modal for creating a new record
  const handleAddRecord = (): void => {
    setCurrentData(null);
    setFormData({
      ...formData,
      id_faskes: 0,
      bulan: 1,
      tahun: new Date().getFullYear(),
      status: 'actual'
    });
    setActiveStep(0);
    open();
  };

  // Open modal for editing an existing record
  const handleEditRecord = (data: MalariaMonthlyData): void => {
    setCurrentData(data);
    setFormData({
      id_faskes: data.id_faskes,
      bulan: data.bulan,
      tahun: data.tahun,
      konfirmasi_lab_mikroskop: data.konfirmasi_lab_mikroskop || 0,
      konfirmasi_lab_rdt: data.konfirmasi_lab_rdt || 0,
      konfirmasi_lab_pcr: data.konfirmasi_lab_pcr || 0,
      pos_0_4: data.pos_0_4 || 0,
      pos_5_14: data.pos_5_14 || 0,
      pos_15_64: data.pos_15_64 || 0,
      pos_diatas_64: data.pos_diatas_64 || 0,
      kematian_malaria: data.kematian_malaria || 0,
      hamil_pos: data.hamil_pos || 0,
      p_pf: data.p_pf || 0,
      p_pv: data.p_pv || 0,
      p_po: data.p_po || 0,
      p_pm: data.p_pm || 0,
      p_pk: data.p_pk || 0,
      p_mix: data.p_mix || 0,
      p_suspek_pk: data.p_suspek_pk || 0,
      obat_standar: data.obat_standar || 0,
      obat_nonprogram: data.obat_nonprogram || 0,
      obat_primaquin: data.obat_primaquin || 0,
      kasus_pe: data.kasus_pe || 0,
      penularan_indigenus: data.penularan_indigenus || 0,
      penularan_impor: data.penularan_impor || 0,
      penularan_induced: data.penularan_induced || 0,
      relaps: data.relaps || 0,
      status: data.status,
      hujan_hujan_mean: data.hujan_hujan_mean || 0,
      hujan_hujan_max: data.hujan_hujan_max || 0,
      hujan_hujan_min: data.hujan_hujan_min || 0,
      tm_tm_mean: data.tm_tm_mean || 0,
      tm_tm_max: data.tm_tm_max || 0,
      tm_tm_min: data.tm_tm_min || 0,
      ss_monthly_mean: data.ss_monthly_mean || 0,
      ff_x_monthly_mean: data.ff_x_monthly_mean || 0,
      ddd_x_monthly_mean: data.ddd_x_monthly_mean || 0,
      ff_avg_monthly_mean: data.ff_avg_monthly_mean || 0,
      pop_penduduk_kab: data.pop_penduduk_kab || 0
    });
    setActiveStep(0);
    open();
  };

  // Submit form data
  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      if (currentData) {
        // Update existing record
        response = await MalariaDataService.updateMalariaData(
          currentData.id_mhfm, 
          formData
        );
      } else {
        // Create new record
        response = await MalariaDataService.createMalariaData(formData);
      }

      if (response.success) {
        setNotification({
          show: true,
          message: currentData ? 'Record updated successfully!' : 'Record created successfully!',
          type: 'success'
        });
        fetchMalariaData();
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

  // Handle record deletion
  const handleDeleteRecord = async (dataId: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    setIsLoading(true);
    try {
      const response = await MalariaDataService.deleteMalariaData(dataId);
      
      if (response.success && response.data.deleted) {
        setNotification({
          show: true,
          message: 'Record deleted successfully!',
          type: 'success'
        });
        fetchMalariaData();
      } else {
        setError(response.error || 'Failed to delete record');
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Failed to delete record. Please try again later.');
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
    setFilters({
      sort_by: 'id_mhfm',
      sort_order: 'desc',
      page: 1,
      per_page: 10,
      status: 'actual'
    });
    setSearchTerm('');
  };

  // Navigate stepper
  const nextStep = (): void => {
    setActiveStep((current) => (current < 3 ? current + 1 : current));
  };

  const prevStep = (): void => {
    setActiveStep((current) => (current > 0 ? current - 1 : current));
  };



  // Generate month options
  const monthOptions = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Marret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => {
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  // Get month name from number
  const getMonthName = (monthNum: number): string => {
    const option = monthOptions.find(m => parseInt(m.value) === monthNum);
    return option ? option.label : `Month ${monthNum}`;
  };

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'actual': return 'blue';
      case 'predicted': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div>
      <Group mb="md">
        <Text size="xl" style={{weight:500}}>Malaria Health Facility Monthly Data</Text>
        <Group>
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={handleAddRecord}
          >
            Add Record
          </Button>
        </Group>
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
          placeholder="Search by facility name or ID..."
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

      {filterOpened && (
  <Paper shadow="xs" p="md" mb="md">
    <Grid>
      <Grid.Col span={4}>
        <Select
          label="Health Facility"
          placeholder="Filter by facility"
          value={filters.id_faskes?.toString()}
          onChange={(value) => handleFilterChange('id_faskes', value ? parseInt(value) : null)}
          data={facilities.map(f => ({ value: f.id_faskes.toString(), label: f.nama_faskes }))}
          searchable
          clearable
        />
      </Grid.Col>
      
      <Grid.Col span={4}>
        <Select
          label="Year"
          placeholder="Filter by year"
          value={filters.year?.toString()}
          onChange={(value) => handleFilterChange('year', value ? parseInt(value) : null)}
          data={yearOptions}
          clearable
        />
      </Grid.Col>
      
      <Grid.Col span={4}>
        <Select
          label="Month"
          placeholder="Filter by month"
          value={filters.month?.toString()}
          onChange={(value) => handleFilterChange('month', value ? parseInt(value) : null)}
          data={monthOptions}
          clearable
        />
      </Grid.Col>
      
      <Grid.Col span={4}>
        <Select
          label="Status"
          placeholder="Filter by status"
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value || 'actual')}
          data={[
            { value: 'actual', label: 'Actual' },
            { value: 'predicted', label: 'Predicted' }
          ]}
        />
      </Grid.Col>
      
      <Grid.Col span={4}>
        <Select
          label="Records per page"
          placeholder="Records per page"
          value={filters.per_page?.toString()}
          onChange={(value) => handleFilterChange('per_page', value ? parseInt(value) : 10)}
          data={[
            { value: '5', label: '5' },
            { value: '10', label: '10' },
            { value: '25', label: '25' },
            { value: '50', label: '50' }
          ]}
        />
      </Grid.Col>
      
      <Grid.Col span={12}>
        <Group>
          <Button variant="subtle" onClick={resetFilters}>
            Reset Filters
          </Button>
        </Group>
      </Grid.Col>
    </Grid>
  </Paper>
)}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="malaria" leftSection={<IconVirus size={16} />}>
            Malaria Data
          </Tabs.Tab>
          <Tabs.Tab value="weather" leftSection={<IconTemperature size={16} />}>
            Weather Data
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="malaria" pt="xs">
          {isLoading && !malariaData.length ? (
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
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Health Facility</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Lab Confirmation</Table.Th>
                    <Table.Th>Age Groups</Table.Th>
                    <Table.Th>Transmission</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {malariaData.length > 0 ? (
                    malariaData.map((data) => (
                      <Table.Tr key={data.id_mhfm}>
                        <Table.Td>{data.id_mhfm}</Table.Td>
                        <Table.Td>
                          <Text size="sm">{getFacilityName(data.id_faskes)}</Text>
                          <Text size="xs" color="dimmed">ID: {data.id_faskes}</Text>
                        </Table.Td>
                        <Table.Td>{getMonthName(data.bulan)} {data.tahun}</Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(data.status)}>
                            {data.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">Microscope: {data.konfirmasi_lab_mikroskop || 0}</Text>
                          <Text size="sm">RDT: {data.konfirmasi_lab_rdt || 0}</Text>
                          <Text size="sm">PCR: {data.konfirmasi_lab_pcr || 0}</Text>
                          <Text size="sm" style={{weight:500}}>Total: {data.total_konfirmasi_lab || 0}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">0-4: {data.pos_0_4 || 0}</Text>
                          <Text size="sm">5-14: {data.pos_5_14 || 0}</Text>
                          <Text size="sm">15-64: {data.pos_15_64 || 0}</Text>
                          <Text size="sm">65+: {data.pos_diatas_64 || 0}</Text>
                          <Text size="sm" style={{weight:500}}>Total: {data.tot_pos || 0}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">Indigenous: {data.penularan_indigenus || 0}</Text>
                          <Text size="sm">Import: {data.penularan_impor || 0}</Text>
                          <Text size="sm">Induced: {data.penularan_induced || 0}</Text>
                          <Text size="sm">Relapse: {data.relaps || 0}</Text>
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
                                onClick={() => handleEditRecord(data)}
                              >
                                Edit
                              </Menu.Item>
                              <Menu.Item 
                                leftSection={<IconTrash size={16} />} 
                                color="red"
                                onClick={() => handleDeleteRecord(data.id_mhfm)}
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
                      <Table.Td colSpan={8} align="center">
                        No records found
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>

              {malariaData.length > itemsPerPage && (
                <Group mt="md">
                  <Pagination
                    value={activePage}
                    onChange={setActivePage}
                    total={Math.ceil(malariaData.length / itemsPerPage)}
                  />
                </Group>
              )}
            </>
          )}
        </Tabs.Panel>
        <Tabs.Panel value="weather" pt="xs">
            {isLoading && !malariaData.length ? (
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
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Health Facility</Table.Th>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Rainfall (mm)</Table.Th>
                        <Table.Th>Temperature (°C)</Table.Th>
                        <Table.Th>Wind & Sunshine</Table.Th>
                        <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                    {malariaData.length > 0 ? (
                        malariaData.map((data) => (
                        <Table.Tr key={data.id_mhfm}>
                            <Table.Td>{data.id_mhfm}</Table.Td>
                            <Table.Td>
                            <Text size="sm">{getFacilityName(data.id_faskes)}</Text>
                            <Text size="xs" color="dimmed">ID: {data.id_faskes}</Text>
                            </Table.Td>
                            <Table.Td>{getMonthName(data.bulan)} {data.tahun}</Table.Td>
                            <Table.Td>
                            <Badge color={getStatusColor(data.status)}>
                                {data.status}
                            </Badge>
                            </Table.Td>
                            <Table.Td>
                            <Text size="sm">Mean: {data.hujan_hujan_mean?.toFixed(1) || 0}</Text>
                            <Text size="sm">Max: {data.hujan_hujan_max?.toFixed(1) || 0}</Text>
                            <Text size="sm">Min: {data.hujan_hujan_min?.toFixed(1) || 0}</Text>
                            </Table.Td>
                            <Table.Td>
                            <Text size="sm">Mean: {data.tm_tm_mean?.toFixed(1) || 0}</Text>
                            <Text size="sm">Max: {data.tm_tm_max?.toFixed(1) || 0}</Text>
                            <Text size="sm">Min: {data.tm_tm_min?.toFixed(1) || 0}</Text>
                            </Table.Td>
                            <Table.Td>
                            <Text size="sm">Sunshine: {data.ss_monthly_mean?.toFixed(1) || 0} hrs</Text>
                            <Text size="sm">Wind Avg: {data.ff_avg_monthly_mean?.toFixed(1) || 0}</Text>
                            <Text size="sm">Wind Max: {data.ff_x_monthly_mean?.toFixed(1) || 0}</Text>
                            <Text size="sm">Wind Dir: {data.ddd_x_monthly_mean?.toFixed(0) || 0}°</Text>
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
                                    onClick={() => handleEditRecord(data)}
                                >
                                    Edit
                                </Menu.Item>
                                <Menu.Item 
                                    leftSection={<IconTrash size={16} />} 
                                    color="red"
                                    onClick={() => handleDeleteRecord(data.id_mhfm)}
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
                        <Table.Td colSpan={8} align="center">
                            No records found
                        </Table.Td>
                        </Table.Tr>
                    )}
                    </Table.Tbody>
                </Table>
                </>
            )}
            </Tabs.Panel>
      </Tabs>
      {paginationMeta && paginationMeta.total_pages > 1 && (
  <Group mt="md">
    <Text size="sm">
      Showing {malariaData.length} of {paginationMeta.total_records} records
      {paginationMeta.month && paginationMeta.year && (
        <> for {getMonthName(paginationMeta.month)} {paginationMeta.year}</>
      )}
      {paginationMeta.status && (
        <> with status <Badge color={getStatusColor(paginationMeta.status)}>{paginationMeta.status}</Badge></>
      )}
    </Text>
    <Pagination
      value={paginationMeta.page}
      onChange={handlePageChange}
      total={paginationMeta.total_pages}
    />
  </Group>
)}

      {/* Add/Edit Modal with Stepper */}
      <Modal
        opened={opened}
        onClose={close}
        title={currentData ? "Edit Malaria Health Facility Monthly Data" : "Add New Malaria Health Facility Monthly Data"}
        size="xl"
        centered
      >
        <Stepper active={activeStep} onStepClick={setActiveStep}>
          <Stepper.Step
            label="Basic Information"
            description="Facility & Date"
            icon={<IconHospital size={18} />}
          >
            <Stack my="md">
              <Select
                label="Health Facility"
                placeholder="Select health facility"
                data={facilities.map(f => ({ value: f.id_faskes.toString(), label: f.nama_faskes }))}
                value={formData.id_faskes?.toString()}
                onChange={(value) => handleSelectChange('id_faskes', value)}
                required
                searchable
              />
              
              <Group grow>
                <Select
                  label="Month"
                  placeholder="Select month"
                  data={monthOptions}
                  value={formData.bulan?.toString()}
                  onChange={(value) => handleSelectChange('bulan', value)}
                  required
                />
                
                <Select
                  label="Year"
                  placeholder="Select year"
                  data={yearOptions}
                  value={formData.tahun?.toString()}
                  onChange={(value) => handleSelectChange('tahun', value)}
                  required
                />
                
                <Select
                  label="Status"
                  placeholder="Select status"
                  data={[
                    { value: 'actual', label: 'Actual' },
                    { value: 'predicted', label: 'Predicted' }
                  ]}
                  value={formData.status}
                  onChange={(value) => handleSelectChange('status', value)}
                  required
                />
              </Group>
            </Stack>
          </Stepper.Step>
          
          <Stepper.Step
            label="Malaria Data"
            description="Cases & Treatments"
            icon={<IconVirus size={18} />}
          >
            <Grid my="md">
              <Grid.Col span={12}>
                <Paper withBorder p="md" radius="md">
                  <Title order={4} mb="md">Lab Confirmation</Title>
                  <Grid>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Microscope"
                        value={formData.konfirmasi_lab_mikroskop}
                        onChange={(value) => handleNumberChange('konfirmasi_lab_mikroskop', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="RDT"
                        value={formData.konfirmasi_lab_rdt}
                        onChange={(value) => handleNumberChange('konfirmasi_lab_rdt', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="PCR"
                        value={formData.konfirmasi_lab_pcr}
                        onChange={(value) => handleNumberChange('konfirmasi_lab_pcr', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Paper withBorder p="md" radius="md">
                  <Title order={4} mb="md">Cases by Age Group</Title>
                  <Grid>
                    <Grid.Col span={3}>
                      <NumberInput
                        label="Age 0-4"
                        value={formData.pos_0_4}
                        onChange={(value) => handleNumberChange('pos_0_4', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <NumberInput
                        label="Age 5-14"
                        value={formData.pos_5_14}
                        onChange={(value) => handleNumberChange('pos_5_14', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <NumberInput
                        label="Age 15-64"
                        value={formData.pos_15_64}
                        onChange={(value) => handleNumberChange('pos_15_64', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <NumberInput
                        label="Age 65+"
                        value={formData.pos_diatas_64}
                        onChange={(value) => handleNumberChange('pos_diatas_64', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Paper withBorder p="md" radius="md">
                  <Title order={4} mb="md">Transmission Types</Title>
                  <Grid>
                    <Grid.Col span={3}>
                      <NumberInput
                        label="Indigenous"
                        value={formData.penularan_indigenus}
                        onChange={(value) => handleNumberChange('penularan_indigenus', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <NumberInput
                        label="Import"
                        value={formData.penularan_impor}
                        onChange={(value) => handleNumberChange('penularan_impor', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <NumberInput
                        label="Induced"
                        value={formData.penularan_induced}
                        onChange={(value) => handleNumberChange('penularan_induced', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <NumberInput
                        label="Relapse"
                        value={formData.relaps}
                        onChange={(value) => handleNumberChange('relaps', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Paper withBorder p="md" radius="md">
                  <Title order={4} mb="md">Case Details</Title>
                  <Grid>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Kematian dengan Malaria"
                        value={formData.kematian_malaria}
                        onChange={(value) => handleNumberChange('kematian_malaria', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Hamil Positif"
                        value={formData.hamil_pos}
                        onChange={(value) => handleNumberChange('hamil_pos', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Kasus PE"
                        value={formData.kasus_pe}
                        onChange={(value) => handleNumberChange('kasus_pe', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stepper.Step>
          
          <Stepper.Step
            label="Parasite Details"
            description="Species & Treatment"
            icon={<IconVirus size={18} />}
          >
            <Grid my="md">
              <Grid.Col span={12}>
                <Paper withBorder p="md" radius="md">
                  <Title order={4} mb="md">Parasites by Species</Title>
                  <Grid>
                    <Grid.Col span={2}>
                      <NumberInput
                        label="P. falciparum"
                        value={formData.p_pf}
                        onChange={(value) => handleNumberChange('p_pf', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <NumberInput
                        label="P. vivax"
                        value={formData.p_pv}
                        onChange={(value) => handleNumberChange('p_pv', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <NumberInput
                        label="P. ovale"
                        value={formData.p_po}
                        onChange={(value) => handleNumberChange('p_po', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <NumberInput
                        label="P. malariae"
                        value={formData.p_pm}
                        onChange={(value) => handleNumberChange('p_pm', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <NumberInput
                        label="P. knowlesi"
                        value={formData.p_pk}
                        onChange={(value) => handleNumberChange('p_pk', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <NumberInput
                        label="Mixed"
                        value={formData.p_mix}
                        onChange={(value) => handleNumberChange('p_mix', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Paper withBorder p="md" radius="md">
                  <Title order={4} mb="md">Treatment</Title>
                  <Grid>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Standard Medication"
                        value={formData.obat_standar}
                        onChange={(value) => handleNumberChange('obat_standar', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Non-program Medication"
                        value={formData.obat_nonprogram}
                        onChange={(value) => handleNumberChange('obat_nonprogram', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Primaquine"
                        value={formData.obat_primaquin}
                        onChange={(value) => handleNumberChange('obat_primaquin', typeof value === 'number' ? value : undefined)}
                        min={0}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stepper.Step>
          
          <Stepper.Step
            label="Weather Data"
            description="Climate information"
            icon={<IconTemperature size={18} />}
          >
            <Grid my="md">
              <Grid.Col span={12}>
                <Paper withBorder p="md" radius="md">
                  <Title order={4} mb="md">Rainfall Data (mm)</Title>
                  <Grid>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Mean Rainfall"
                        value={formData.hujan_hujan_mean}
                        onChange={(value) => handleNumberChange('hujan_hujan_mean', typeof value === 'number' ? value : undefined)}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Max Rainfall"
                        value={formData.hujan_hujan_max}
                        onChange={(value) => handleNumberChange('hujan_hujan_max', typeof value === 'number' ? value : undefined)}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Min Rainfall"
                        value={formData.hujan_hujan_min}
                        onChange={(value) => handleNumberChange('hujan_hujan_min', typeof value === 'number' ? value : undefined)}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Paper withBorder p="md" radius="md">
                  <Title order={4} mb="md">Temperature Data (°C)</Title>
                  <Grid>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Mean Temperature"
                        value={formData.tm_tm_mean}
                        onChange={(value) => handleNumberChange('tm_tm_mean', typeof value === 'number' ? value : undefined)}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Max Temperature"
                        value={formData.tm_tm_max}
                        onChange={(value) => handleNumberChange('tm_tm_max', typeof value === 'number' ? value : undefined)}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Min Temperature"
                        value={formData.tm_tm_min}
                        onChange={(value) => handleNumberChange('tm_tm_min', typeof value === 'number' ? value : undefined)}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Paper withBorder p="md" radius="md">
                  <Title order={4} mb="md">Additional Weather Data</Title>
                  <Grid>
                    <Grid.Col span={3}>
                      <NumberInput
                        label="Sunshine (hours)"
                        value={formData.ss_monthly_mean}
                        onChange={(value) => handleNumberChange('ss_monthly_mean', typeof value === 'number' ? value : undefined)}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <NumberInput
                        label="Max Wind Speed"
                        value={formData.ff_x_monthly_mean}
                        onChange={(value) => handleNumberChange('ff_x_monthly_mean', typeof value === 'number' ? value : undefined)}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <NumberInput
                        label="Wind Direction"
                        value={formData.ddd_x_monthly_mean}
                        onChange={(value) => handleNumberChange('ddd_x_monthly_mean', typeof value === 'number' ? value : undefined)}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <NumberInput
                        label="Avg Wind Speed"
                        value={formData.ff_avg_monthly_mean}
                        onChange={(value) => handleNumberChange('ff_avg_monthly_mean', typeof value === 'number' ? value : undefined)}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Paper withBorder p="md" radius="md">
                  <Title order={4} mb="md">Population Data</Title>
                  <NumberInput
                    label="District/Kabupaten Population"
                    value={formData.pop_penduduk_kab}
                    onChange={(value) => handleNumberChange('pop_penduduk_kab', typeof value === 'number' ? value : undefined)}
                    min={0}
                  />
                </Paper>
              </Grid.Col>
            </Grid>
          </Stepper.Step>
        </Stepper>

        <Group mt="xl">
          {activeStep > 0 ? (
            <Button variant="default" onClick={prevStep}>
              Back
            </Button>
          ) : (
            <Button variant="default" onClick={close}>
              Cancel
            </Button>
          )}

          {activeStep < 3 ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={isLoading}>
              {currentData ? "Update" : "Submit"}
            </Button>
          )}
        </Group>
      </Modal>
    </div>
  );
};