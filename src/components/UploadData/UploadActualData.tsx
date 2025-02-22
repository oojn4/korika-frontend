import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  List,
  Progress,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  rem
} from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconFile, IconUpload, IconX } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { MalariaDataRow, UploadResult, UploadService } from '../../services/services/upload.service';

const UploadActualData: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const openRef = useRef<() => void>(null);

  const handleDrop = async (files: FileWithPath[]) => {
    if (files.length === 0) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Read the Excel file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON
          const excelData = XLSX.utils.sheet_to_json<MalariaDataRow>(worksheet);
          
          // Validate required columns
          const requiredColumns = ['id_faskes', 'bulan', 'tahun', 'provinsi', 'kabupaten', 'kecamatan'];
          const firstRow = excelData[0] || {};
          const missingColumns = requiredColumns.filter(col => !(col in firstRow));
          
          if (missingColumns.length > 0) {
            throw new Error(`Required columns missing: ${missingColumns.join(', ')}`);
          }
          
          // Process the data on frontend and send to backend
          const response = await UploadService.uploadMalariaData(excelData);
          
          setResult(response.result);
          notifications.show({
            title: 'Success',
            message: response.message || 'Data uploaded successfully',
            color: 'green',
            icon: <IconCheck size="1.1rem" />
          });
        } catch (error) {
          console.error('Processing error:', error);
          const errorMsg = error instanceof Error ? error.message : 'Failed to process Excel file';
          setError(errorMsg);
          notifications.show({
            title: 'Error',
            message: errorMsg,
            color: 'red',
            icon: <IconX size="1.1rem" />
          });
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read file');
        setLoading(false);
        notifications.show({
          title: 'Error',
          message: 'Failed to read file',
          color: 'red',
          icon: <IconX size="1.1rem" />
        });
      };
      
      reader.readAsArrayBuffer(files[0]);
      
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMsg);
      setLoading(false);
      notifications.show({
        title: 'Error',
        message: errorMsg,
        color: 'red',
        icon: <IconX size="1.1rem" />
      });
    }
  };
  
  const downloadTemplate = () => {
    // Access template directly from public folder
    const templateUrl = '/template_upload_malaria_data.xlsx';
    
    // Create and click a download link
    const link = document.createElement('a');
    link.href = templateUrl;
    link.setAttribute('download', 'template_upload_malaria_data.xlsx');
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
  };

  return (
    <Stack>
      <Group align="center">
        <Button 
          variant="outline" 
          onClick={downloadTemplate}
        >
          Download Template
        </Button>
      </Group>
      
      <Card withBorder p="md" radius="md">
        <Stack>
          <Text size="sm" color="dimmed">
            Upload Excel file containing malaria data. The file must follow the template format with required columns: 
            id_faskes, bulan, tahun, provinsi, kabupaten, and kecamatan.
          </Text>
          
          <Group>
            <Box>
              <Text size="sm">Upload rules:</Text>
              <List size="sm" spacing="xs">
                <List.Item>Data will be stored in two tables</List.Item>
                <List.Item>No duplicates for id_faskes, bulan, tahun, status</List.Item>
                <List.Item>By default, Status will always be set to "actual", but can be set to "predicted"</List.Item>
              </List>
            </Box>
          </Group>
        </Stack>
      </Card>
      
      <Dropzone
        onDrop={handleDrop}
        onReject={() => {
          notifications.show({
            title: 'File rejected',
            message: 'Only Excel files (.xlsx, .xls) are allowed',
            color: 'red',
            icon: <IconX size="1.1rem" />
          });
        }}
        maxSize={5 * 1024 * 1024}
        accept={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']}
        loading={loading}
        openRef={openRef}
      >
        <Group style={{ minHeight: 180, pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload
              size={50}
              stroke={1.5}
              color="var(--mantine-color-blue-6)"
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              size={50}
              stroke={1.5}
              color="var(--mantine-color-red-6)"
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFile size={50} stroke={1.5} />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag Excel file here or click to select
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
              Upload one file (max 5MB) - only Excel files (.xlsx, .xls) are accepted
            </Text>
          </div>
        </Group>
      </Dropzone>
      
      {loading && (
        <Card withBorder p="md">
          <Text mb="sm">Processing data...</Text>
          <Progress value={100} animated />
        </Card>
      )}
      
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Upload Error" color="red">
          {error}
        </Alert>
      )}
      
      {result && (
        <Card withBorder p="md" radius="md">
          <Title order={3} mb="md">Upload Results</Title>
          
          <Group grow mb="md">
            <Card withBorder p="sm" radius="md">
              <Title order={4}>Health Facilities</Title>
              <Group mt="xs">
                <Text>Added:</Text>
                <Badge size="lg" color="green">{result.health_facility_added}</Badge>
              </Group>
              <Group mt="xs">
                <Text>Already existed:</Text>
                <Badge size="lg" color="gray">{result.health_facility_existed}</Badge>
              </Group>
            </Card>
            
            <Card withBorder p="sm" radius="md">
              <Title order={4}>Malaria Data</Title>
              <Group mt="xs">
                <Text>Added:</Text>
                <Badge size="lg" color="green">{result.malaria_data_added}</Badge>
              </Group>
              <Group mt="xs">
                <Text>Updated:</Text>
                <Badge size="lg" color="blue">{result.malaria_data_updated}</Badge>
              </Group>
            </Card>
          </Group>
          
          {result.errors && result.errors.length > 0 && (
            <>
              <Divider my="md" label="Errors" labelPosition="center" />
              <Box style={{ maxHeight: '200px', overflow: 'auto' }}>
                <Table highlightOnHover>
                  <thead>
                    <tr>
                      <th>Error Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((error:any, index:any) => (
                      <tr key={index}>
                        <td>
                          <Group>
                            <ThemeIcon color="red" size={24} radius="xl">
                              <IconX size={rem(16)} />
                            </ThemeIcon>
                            <Text size="sm">{error}</Text>
                          </Group>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Box>
            </>
          )}
        </Card>
      )}
      
      <Group>
        <Button onClick={() => openRef.current?.()}>
          Select Excel File
        </Button>
      </Group>
    </Stack>
  );
}

export default UploadActualData;