import { Button, Collapse, Group, Pagination, Paper, Table, Text } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { RawData } from '../../@types/dashboard';

type Props = {
  data: RawData[];
  rowsPerPage: number;
};

const TableUserApproval = ({ data, rowsPerPage }: Props) => {
  const [activePage, setActivePage] = useState(1);
  const [sortField, setSortField] = useState<'nama_faskes' | 'tot_pos' | 'tot_pos_m_to_m_change' | 'tot_pos_y_on_y_change' | 'province'>('nama_faskes');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [tableOpen, setTableOpen] = useState(true); // State for table visibility

  useEffect(() => {
    console.log('data:', data);
  }, [data]);

  // Sorting function
  const sortData = (
    field: 'nama_faskes' | 'tot_pos' | 'tot_pos_m_to_m_change' | 'tot_pos_y_on_y_change' | 'province',
    direction: 'asc' | 'desc'
  ) => {
    return [...data].sort((a, b) => {
      const valueA = a[field] ?? 0; // Default to 0 if null or undefined
      const valueB = b[field] ?? 0;

      if (direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  const handleSort = (
    field: 'nama_faskes' | 'tot_pos' | 'tot_pos_m_to_m_change' | 'tot_pos_y_on_y_change' | 'province'
  ) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    setSortField(field);
  };

  const sortedData = sortData(sortField, sortDirection);

  // Pagination logic
  const startIndex = (activePage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <>
    <Paper withBorder p="md" radius="md">
        
      <Group justify="space-between" align="flex-end" gap={0} mb="md">
        <Text fz="xl" fw={700}>Tabel Prediksi Jumlah Kasus Malaria Berdasarkan Faskes</Text>
        <Button variant="subtle" onClick={() => setTableOpen((prev) => !prev)}>
          {tableOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </Button>
      </Group>

      <Collapse in={tableOpen}>
        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('nama_faskes')}
                >
                  Nama Faskes {sortField === 'nama_faskes' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Table.Th>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('province')}
                >
                  Provinsi {sortField === 'province' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Table.Th>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('tot_pos')}
                >
                  Jumlah Kasus {sortField === 'tot_pos' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Table.Th>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('tot_pos_m_to_m_change')}
                >
                  Perubahan M-to-M {sortField === 'tot_pos_m_to_m_change' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Table.Th>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('tot_pos_y_on_y_change')}
                >
                  Perubahan Y-on-Y {sortField === 'tot_pos_y_on_y_change' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedData.map((item) => (
                <Table.Tr key={item.id_faskes}>
                  <Table.Td>
                    <Text fz="sm" fw={500}>
                      {item.nama_faskes}
                    </Text>
                  </Table.Td>
                  <Table.Td>{item.province}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>{item.tot_pos}</Table.Td>
                  <Table.Td
                    style={{
                      color:
                        item.tot_pos_m_to_m_change != null && item.tot_pos_m_to_m_change > 0
                          ? 'red' // Red for positive values
                          : 'green', // Green for null or non-positive values
                      textAlign: 'right',
                    }}
                  >
                    {item.tot_pos_m_to_m_change != null
                      ? item.tot_pos_m_to_m_change.toFixed(2).toString() + '%'
                      : '-'}
                  </Table.Td>
                  <Table.Td
                    style={{
                      color:
                        item.tot_pos_y_on_y_change != null && item.tot_pos_y_on_y_change > 0
                          ? 'red'
                          : 'green',
                      textAlign: 'right',
                    }}
                  >
                    {item.tot_pos_y_on_y_change != null
                      ? item.tot_pos_y_on_y_change.toFixed(2).toString() + '%'
                      : '-'}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Pagination
          value={activePage}
          onChange={setActivePage}
          total={totalPages}
          mt="md"
        />
      </Collapse>
      
    </Paper>
    </>
  );
};

export default TableUserApproval;
