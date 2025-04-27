import { ActionIcon, Button, Collapse, Group, MultiSelect, Pagination, Paper, Table, Text, TextInput } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconColumns, IconSearch, IconSettings } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { LeptoRawDataItem } from '../../@types/dashboard';

type Props = {
  data: LeptoRawDataItem[];
  rowsPerPage: number;
  monthYear: string;
};

// Define base data metrics for DBD (different from Malaria)
const BASE_METRICS = [
  { value: 'lep_k', label: 'Kasus Lepto' },
  { value: 'lep_m', label: 'Kematian dengan Lepto' }
];

// Generate complete column list with base metrics and their change indicators
const AVAILABLE_COLUMNS = [
  { value: 'nama_faskes', label: 'Nama Faskes' },
  { value: 'province', label: 'Provinsi' },
  { value: 'city', label: 'Kabupaten/Kota' },
  { value: 'kd_prov', label: 'Kode Provinsi' },
  { value: 'kd_kab', label: 'Kode Kabupaten' },
  { value: 'status', label: 'Status' },
  // Add all base metrics
  ...BASE_METRICS,
  // Add month-to-month change columns for all metrics
  ...BASE_METRICS.map(metric => ({
    value: `${metric.value}_m_to_m_change`,
    label: `${metric.label} (M-to-M %)`
  })),
  // Add year-on-year change columns for all metrics
  ...BASE_METRICS.map(metric => ({
    value: `${metric.value}_y_on_y_change`,
    label: `${metric.label} (Y-on-Y %)`
  }))
];

// Helper function to format values properly
const formatValue = (value: any, column: string) => {
  if (value === null || value === undefined) return '-';
  
  // Format percentage columns
  if (column.includes('_change')) {
    return value.toFixed(2).toString() + '%';
  }
  
  // Format numeric columns
  if (typeof value === 'number') {
    return value.toString();
  }
  
  return value;
};

// Helper function to determine cell color for change values
const getCellColor = (value: any, column: string) => {
  if (value === null || value === undefined) return 'inherit';
  
  if (column.includes('_change')) {
    return value > 0 ? 'red' : 'green';
  }
  
  if (column === 'status') {
    return value === 'predicted' ? 'blue' : 'green';
  }
  
  return 'inherit';
};

// Helper function to determine text alignment
const getTextAlignment = (column: string) => {
  if (column.includes('_change') || 
      column === 'lep_k' || 
      column === 'lep_m') {
    return 'right';
  }
  return 'left';
};

const TableRawDataLepto = ({ data, rowsPerPage, monthYear }: Props) => {
  // State for table pagination
  const [activePage, setActivePage] = useState(1);
  
  // State for sorting
  const [sortField, setSortField] = useState<string>('city');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for table expand/collapse
  const [tableOpen, setTableOpen] = useState(true);
  
  // State for column customization
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'province',
    'city',
    'lep_k',
    'lep_m',
    'lep_k_m_to_m_change',
    'lep_m_m_to_m_change',
    'status'
  ]);
  
  // State for showing comparison columns (M-to-M and Y-on-Y)
  const [showComparisons, setShowComparisons] = useState<boolean>(true);
  
  // State for configuration panel
  const [configOpen, setConfigOpen] = useState(false);
  
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Sorting function
  const sortData = (field: string, direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      const valueA = a[field as keyof LeptoRawDataItem] ?? 0; // Default to 0 if null or undefined
      const valueB = b[field as keyof LeptoRawDataItem] ?? 0;

      if (direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  // Search function to filter data across all columns
  const filterData = (dataToFilter: LeptoRawDataItem[], term: string) => {
    if (!term.trim()) return dataToFilter;
    
    return dataToFilter.filter(item => {
      // Check all properties of the item
      return Object.entries(item).some(([key, value]) => {
        // Skip non-displayable properties
        if (key === 'year' || key === 'month') return false;
        
        // Handle null or undefined values
        if (value === null || value === undefined) return false;
        
        // Convert to string regardless of type and search
        const stringValue = String(value).toLowerCase();
        return stringValue.includes(term.toLowerCase());
      });
    });
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    setSortField(field);
  };

  // Reset to first page when data or search term changes
  useEffect(() => {
    setActivePage(1);
  }, [data, searchTerm]);

  // Modified data flow: sort -> filter -> paginate
  const sortedData = sortData(sortField, sortDirection);
  const filteredData = filterData(sortedData, searchTerm);

  // Pagination logic with filtered data
  const startIndex = (activePage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  
  // Column sets for quick selection
  const columnSets = {
    basic: ['province', 'city', 'lep_k', 'lep_m', 'status'],
    cases: ['province', 'city', 'lep_k', 'lep)k_m_to_m_change', 'lep_k_y_on_y_change', 'status'],
    deaths: ['province', 'city', 'lep_m', 'lep_m_m_to_m_change', 'lep_m_y_on_y_change', 'status'],
    all: ['province', 'city', 'lep_k', 'lep_m', 'lep_k_m_to_m_change', 'lep_m_m_to_m_change', 'lep_k_y_on_y_change', 'lep_m_y_on_y_change', 'status'],
    codes: ['kd_prov', 'kd_kab', 'province', 'city', 'lep_k', 'lep_m', 'status']
  };
  
  // Function to apply a column set
  const applyColumnSet = (setName: keyof typeof columnSets) => {
    setVisibleColumns(columnSets[setName]);
  };

  // Clear search handler
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-end" gap={0} mb="md">
        <Text fz="xl" fw={700}>Tabel Data Leptosirosis, {monthYear}</Text>
        <Group>
          <ActionIcon
            variant="light"
            color="red"
            onClick={() => setConfigOpen((prev) => !prev)}
            title="Kustomisasi Tabel"
          >
            <IconSettings size={20} />
          </ActionIcon>
          <Button variant="subtle" onClick={() => setTableOpen((prev) => !prev)}>
            {tableOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </Button>
        </Group>
      </Group>

      {/* Configuration Panel */}
      <Collapse in={configOpen}>
        <Paper withBorder p="md" mb="md" radius="md" bg="red.0">
          <Text fw={600} mb="xs">Kustomisasi Tampilan Tabel</Text>
          
          <Group mb="md">
            <Text size="sm">Set Kolom:</Text>
            <Group>
              <Button variant="outline" size="xs" onClick={() => applyColumnSet('basic')}>
                Dasar
              </Button>
              <Button variant="outline" size="xs" onClick={() => applyColumnSet('cases')}>
                Kasus
              </Button>
              <Button variant="outline" size="xs" onClick={() => applyColumnSet('deaths')}>
                Kematian
              </Button>
              <Button variant="outline" size="xs" onClick={() => applyColumnSet('all')}>
                Semua
              </Button>
              <Button variant="outline" size="xs" onClick={() => applyColumnSet('codes')}>
                Dengan Kode
              </Button>
            </Group>
          </Group>
          
          <Group align="flex-end">
            <MultiSelect
              data={AVAILABLE_COLUMNS.filter(col => 
                !(!showComparisons && (col.value.includes('_m_to_m_change') || col.value.includes('_y_on_y_change')))
              )}
              value={visibleColumns}
              onChange={setVisibleColumns}
              label="Pilih Kolom yang Ditampilkan"
              placeholder="Pilih kolom yang ingin ditampilkan"
              searchable
              clearable
              rightSection={<IconColumns size={16} />}
              style={{ flex: 1 }}
            />
            
            <Button 
              variant={showComparisons ? "filled" : "outline"} 
              color="red" 
              onClick={() => setShowComparisons(!showComparisons)}
              style={{ marginBottom: "5px" }}
            >
              {showComparisons ? "Sembunyikan Perbandingan (%)" : "Tampilkan Perbandingan (%)"}
            </Button>
          </Group>
          
          <Text size="xs" mt="xs" c="dimmed">
            Perbandingan: kolom perubahan M-to-M dan Y-on-Y untuk setiap metrik
          </Text>
        </Paper>
      </Collapse>

      {/* Search input field */}
      <Group mb="md">
        <TextInput
          placeholder="Cari di semua kolom..."
          leftSection={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          style={{ flex: 1 }}
          rightSection={
            searchTerm ? (
              <ActionIcon onClick={handleClearSearch} variant="transparent">
                <IconChevronDown size={16} style={{ transform: 'rotate(45deg)' }} />
              </ActionIcon>
            ) : null
          }
        />
        {searchTerm && (
          <Text size="sm" c="dimmed">
            Menampilkan {filteredData.length} dari {data.length} data
          </Text>
        )}
      </Group>

      <Collapse in={tableOpen}>
        <Table.ScrollContainer minWidth={1000}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                {visibleColumns.map((column) => {
                  const columnConfig = AVAILABLE_COLUMNS.find(c => c.value === column);
                  return (
                    <Table.Th
                      key={column}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort(column)}
                    >
                      {columnConfig?.label || column} {sortField === column && (sortDirection === 'asc' ? '↑' : '↓')}
                    </Table.Th>
                  );
                })}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <Table.Tr key={`${item.kd_prov}-${item.kd_kab}-${item.year}-${item.month}-${index}`}>
                    {visibleColumns.map((column) => (
                      <Table.Td
                        key={`${item.kd_prov}-${item.kd_kab}-${column}-${index}`}
                        style={{
                          color: getCellColor(item[column as keyof LeptoRawDataItem], column),
                          textAlign: getTextAlignment(column) as any
                        }}
                      >
                        {column === 'status' ? (
                          <Text 
                            fz="sm" 
                            tt="capitalize"
                            c={item.status === 'predicted' ? 'blue' : 'green'}
                          >
                            {item.status}
                          </Text>
                        ) : (
                          formatValue(item[column as keyof LeptoRawDataItem], column)
                        )}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={visibleColumns.length} style={{ textAlign: 'center' }}>
                    <Text fz="sm" c="dimmed">
                      {searchTerm ? 'Tidak ada hasil yang cocok dengan pencarian Anda' : 'Tidak ada data yang tersedia'}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {paginatedData.length > 0 && (
          <Pagination
            value={activePage}
            onChange={setActivePage}
            total={totalPages}
            mt="md"
          />
        )}
      </Collapse>
    </Paper>
  );
};

export default TableRawDataLepto;