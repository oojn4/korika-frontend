import {
    Accordion,
    Alert,
    Button,
    Card,
    Flex,
    Group,
    Loader,
    Pagination,
    Paper,
    Progress,
    Select,
    SimpleGrid,
    Space,
    Table,
    Tabs,
    Text,
    TextInput,
    Title
} from '@mantine/core';
import { IconBrain, IconChartLine, IconSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { DashboardService } from '../../services/services/dashboard.service';
import { Prediction, PredictionService } from '../../services/services/prediction.service';
  
const TrainingModel = () => {
  // State variables for provinces and UI state
  const [provinces, setProvinces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for batch prediction results
  const [predictAllLoading, setPredictAllLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[] | null>(null);
  const [summaryFilename, setSummaryFilename] = useState<string | null>(null);
  const [predictAllSummary, setPredictAllSummary] = useState<{
    total_facilities?: number;
    successful_predictions?: number;
    failed_predictions?: number;
    failed_facilities?: number[];
  } | null>(null);

  // Pagination state
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState<string | null>(null);
  const [resultTabValue, setResultTabValue] = useState('main');

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await DashboardService.fetchProvinces();
        if (response.success) {
          setProvinces(response.data);
        }
      } catch (error: any) {
        setError('Error fetching provinces: ' + (error.response?.data?.error || error.message));
      }
    };
    
    fetchProvinces();
  }, []);

  // Filter predictions when search query or facility filter changes
  useEffect(() => {
    if (!predictions) return;
    
    let filtered = [...predictions];
    
    // Apply facility filter if selected
    if (facilityFilter) {
      filtered = filtered.filter(pred => 
        pred.id_faskes === parseInt(facilityFilter)
      );
    }
    
    // Apply search filter if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pred => 
        pred.id_faskes.toString().includes(query) || 
        `${pred.bulan}/${pred.tahun}`.includes(query) ||
        pred.tot_pos.toString().includes(query)
      );
    }
    
    setFilteredPredictions(filtered);
    setActivePage(1); // Reset to first page when filters change
  }, [searchQuery, facilityFilter, predictions]);

  // Train model
  const handleTrainModel = async () => {
    try {
      setTrainingLoading(true);
      setError(null);
      
      const response = await PredictionService.trainModel();
      
      if (response.success) {
        alert(response.message);
      } else {
        setError(response.message || 'Unknown error occurred during training');
      }
    } catch (error: any) {
      setError('Error training model: ' + (error.response?.data?.error || error.message));
    } finally {
      setTrainingLoading(false);
    }
  };

  // Download summary
  const handleDownloadSummary = async () => {
    if (!summaryFilename) return;
    
    try {
      const blob = await PredictionService.downloadPrediction(summaryFilename);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', summaryFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      setError('Error downloading summary: ' + error.message);
    }
  };

  // Make predictions for all facilities
  const handlePredictAll = async () => {
    try {
      setPredictAllLoading(true);
      setError(null);
      setPredictAllSummary(null);
      setSummaryFilename(null);
      setPredictions(null);
      setFilteredPredictions(null);
      setSearchQuery('');
      setFacilityFilter(null);
      
      const response = await PredictionService.predictAllFacilities();
      
      if (response.success) {
        setPredictAllSummary({
          total_facilities: response.total_facilities,
          successful_predictions: response.successful_predictions,
          failed_predictions: response.failed_predictions,
          failed_facilities: response.failed_facilities
        });
        setSummaryFilename(response.summary_filename);
        if (response.predictions && response.predictions.length > 0) {
          setPredictions(response.predictions);
          setFilteredPredictions(response.predictions);
        }
      } else {
        setError(response.message || 'Unknown error occurred during batch prediction');
      }
    } catch (error: any) {
      setError('Error processing batch predictions: ' + (error.response?.data?.error || error.message));
    } finally {
      setPredictAllLoading(false);
    }
  };

  // Get unique facility IDs for the dropdown filter
  const getUniqueFacilityIds = () => {
    if (!predictions) return [];
    
    const uniqueIds = Array.from(new Set(predictions.map(p => p.id_faskes)));
    return uniqueIds.map(id => ({
      value: id.toString(),
      label: `Facility ${id}`
    }));
  };

  // Calculate pagination
  const getPaginatedData = () => {
    if (!filteredPredictions) return [];
    
    const startIndex = (activePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return filteredPredictions.slice(startIndex, endIndex);
  };

  // Total pages for pagination
  const totalPages = filteredPredictions ? 
    Math.ceil(filteredPredictions.length / itemsPerPage) : 1;

  return (
    <div>
      <Title order={1}>Malaria Prediction Model</Title>
      <Text size="md" c="dimmed" mb="lg">
        Train and run predictions for malaria cases over the next 6 months
      </Text>
      <Space h="lg" />
      
      <Tabs defaultValue="predict">
        <Tabs.List>
          <Tabs.Tab value="predict" leftSection={<IconChartLine size={16} />}>Run Predictions</Tabs.Tab>
          <Tabs.Tab value="train" leftSection={<IconBrain size={16} />}>Train Model</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="predict" pt="md">
          <Paper withBorder p="md" radius="md">
            <Title order={3} mb="md">Generate Predictions for All Facilities</Title>
            
            <Text mb="lg">
              This will run predictions for all health facilities in the database. The process may take 
              several minutes to complete.
            </Text>
            
            {error && (
              <Alert title="Error" color="red" mb="md">
                {error}
              </Alert>
            )}
            
            <Group justify="center" mt="lg">
              <Button 
                onClick={handlePredictAll} 
                leftSection={<IconChartLine size={16} />}
                loading={predictAllLoading}
                color="blue"
                size="md"
              >
                Generate Predictions for All Facilities
              </Button>
            </Group>
            
            {predictAllLoading && (
              <Card withBorder mt="xl">
                <Title order={4} mb="md">Processing Batch Predictions</Title>
                <Loader size="xl" mb="md" mx="auto" />
                <Text ta="center" mb="md">This process may take several minutes to complete...</Text>
                <Progress value={100} animated striped />
              </Card>
            )}
            
            {predictAllSummary && (
              <Card withBorder mt="xl">
                <Title order={4} mb="md">Batch Prediction Results</Title>
                
                <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
                  <Card withBorder p="md" radius="md">
                    <Text c="dimmed" size="sm">Total Facilities</Text>
                    <Title order={2}>{predictAllSummary.total_facilities}</Title>
                  </Card>
                  
                  <Card withBorder p="md" radius="md">
                    <Text c="dimmed" size="sm">Successful Predictions</Text>
                    <Title order={2} c="green">{predictAllSummary.successful_predictions}</Title>
                  </Card>
                  
                  <Card withBorder p="md" radius="md">
                    <Text c="dimmed" size="sm">Failed Predictions</Text>
                    <Title order={2} c="red">{predictAllSummary.failed_predictions}</Title>
                  </Card>
                </SimpleGrid>
{/*                 
                <Group justify="center" mt="md" mb="lg">
                  <Button 
                    leftSection={<IconDownload size={16} />}
                    onClick={handleDownloadSummary}
                    disabled={!summaryFilename}
                  >
                    Download Summary Report
                  </Button>
                </Group> */}
                
                {filteredPredictions && filteredPredictions.length > 0 && (
                  <>
                    <Title order={5} mb="md" mt="xl">Prediction Data</Title>
                    
                    <Flex mb="md" gap="md" direction={{ base: 'column', sm: 'row' }}>
                      <TextInput
                        placeholder="Search by facility ID, date, or values"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftSection={<IconSearch size={16} />}
                        style={{ flex: 2 }}
                      />
                      
                      <Select
                        placeholder="Filter by facility"
                        value={facilityFilter}
                        onChange={setFacilityFilter}
                        data={getUniqueFacilityIds()}
                        clearable
                        style={{ flex: 1 }}
                      />
                      
                      <Select
                        placeholder="Items per page"
                        value={itemsPerPage.toString()}
                        onChange={(value) => setItemsPerPage(parseInt(value || "10"))}
                        data={["5", "10", "20", "50", "100"].map(num => ({ 
                          value: num, 
                          label: `${num} per page` 
                        }))}
                        style={{ flex: 1 }}
                      />
                    </Flex>
                    
                    <Tabs value={resultTabValue} onChange={(value) => setResultTabValue(value || 'main')} mb="md">
                      <Tabs.List>
                        <Tabs.Tab value="main">Main Indicators</Tabs.Tab>
                        <Tabs.Tab value="age">Age Groups & Medication</Tabs.Tab>
                        <Tabs.Tab value="plasmodium">Plasmodium Types</Tabs.Tab>
                        <Tabs.Tab value="other">Other Indicators</Tabs.Tab>
                      </Tabs.List>
                      
                      <Tabs.Panel value="main" pt="md">
                        <Table striped highlightOnHover>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Facility ID</Table.Th>
                              <Table.Th>Date</Table.Th>
                              <Table.Th>PCR Confirmation</Table.Th>
                              <Table.Th>Microscope Confirmation</Table.Th>
                              <Table.Th>RDT Confirmation</Table.Th>
                              <Table.Th>Total Lab Confirmation</Table.Th>
                              <Table.Th>Total Positive</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {getPaginatedData().map((pred, index) => (
                              <Table.Tr key={index}>
                                <Table.Td>{pred.id_faskes}</Table.Td>
                                <Table.Td>{pred.bulan}/{pred.tahun}</Table.Td>
                                <Table.Td>{Math.round(pred.konfirmasi_lab_pcr)}</Table.Td>
                                <Table.Td>{Math.round(pred.konfirmasi_lab_mikroskop)}</Table.Td>
                                <Table.Td>{Math.round(pred.konfirmasi_lab_rdt)}</Table.Td>
                                <Table.Td>{Math.round(pred.total_konfirmasi_lab)}</Table.Td>
                                <Table.Td>{Math.round(pred.tot_pos)}</Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Tabs.Panel>
                      
                      <Tabs.Panel value="age" pt="md">
                        <Table striped highlightOnHover>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Facility ID</Table.Th>
                              <Table.Th>Date</Table.Th>
                              <Table.Th>Age 5-14</Table.Th>
                              <Table.Th>Age 15-64</Table.Th>
                              <Table.Th>Age 64+</Table.Th>
                              <Table.Th>Standard Medicine</Table.Th>
                              <Table.Th>Non-Program Medicine</Table.Th>
                              <Table.Th>Primaquin</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {getPaginatedData().map((pred, index) => (
                              <Table.Tr key={index}>
                                <Table.Td>{pred.id_faskes}</Table.Td>
                                <Table.Td>{pred.bulan}/{pred.tahun}</Table.Td>
                                <Table.Td>{Math.round(pred.pos_5_14)}</Table.Td>
                                <Table.Td>{Math.round(pred.pos_15_64)}</Table.Td>
                                <Table.Td>{Math.round(pred.pos_diatas_64)}</Table.Td>
                                <Table.Td>{Math.round(pred.obat_standar)}</Table.Td>
                                <Table.Td>{Math.round(pred.obat_nonprogram)}</Table.Td>
                                <Table.Td>{Math.round(pred.obat_primaquin)}</Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Tabs.Panel>
                      
                      <Tabs.Panel value="plasmodium" pt="md">
                        <Table striped highlightOnHover>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Facility ID</Table.Th>
                              <Table.Th>Date</Table.Th>
                              <Table.Th>P. falciparum</Table.Th>
                              <Table.Th>P. vivax</Table.Th>
                              <Table.Th>P. ovale</Table.Th>
                              <Table.Th>P. malariae</Table.Th>
                              <Table.Th>P. knowlesi</Table.Th>
                              <Table.Th>Mixed</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {getPaginatedData().map((pred, index) => (
                              <Table.Tr key={index}>
                                <Table.Td>{pred.id_faskes}</Table.Td>
                                <Table.Td>{pred.bulan}/{pred.tahun}</Table.Td>
                                <Table.Td>{Math.round(pred.p_pf)}</Table.Td>
                                <Table.Td>{Math.round(pred.p_pv)}</Table.Td>
                                <Table.Td>{Math.round(pred.p_po)}</Table.Td>
                                <Table.Td>{Math.round(pred.p_pm)}</Table.Td>
                                <Table.Td>{Math.round(pred.p_pk)}</Table.Td>
                                <Table.Td>{Math.round(pred.p_mix)}</Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Tabs.Panel>
                      
                      <Tabs.Panel value="other" pt="md">
                        <Table striped highlightOnHover>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Facility ID</Table.Th>
                              <Table.Th>Date</Table.Th>
                              <Table.Th>Mortality</Table.Th>
                              <Table.Th>Pregnant Positive</Table.Th>
                              <Table.Th>PE Cases</Table.Th>
                              <Table.Th>Indigenous</Table.Th>
                              <Table.Th>Imported</Table.Th>
                              <Table.Th>Induced</Table.Th>
                              <Table.Th>Relapse</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {getPaginatedData().map((pred, index) => (
                              <Table.Tr key={index}>
                                <Table.Td>{pred.id_faskes}</Table.Td>
                                <Table.Td>{pred.bulan}/{pred.tahun}</Table.Td>
                                <Table.Td>{Math.round(pred.kematian_malaria)}</Table.Td>
                                <Table.Td>{Math.round(pred.hamil_pos)}</Table.Td>
                                <Table.Td>{Math.round(pred.kasus_pe)}</Table.Td>
                                <Table.Td>{Math.round(pred.penularan_indigenus)}</Table.Td>
                                <Table.Td>{Math.round(pred.penularan_impor)}</Table.Td>
                                <Table.Td>{Math.round(pred.penularan_induced)}</Table.Td>
                                <Table.Td>{Math.round(pred.relaps)}</Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Tabs.Panel>
                    </Tabs>
                    
                    <Group justify="center" mt="lg">
                      <Pagination 
                        total={totalPages} 
                        value={activePage} 
                        onChange={setActivePage} 
                        size="md"
                      />
                    </Group>
                    
                    <Text size="xs" c="dimmed" ta="center" mt="sm">
                      Showing {filteredPredictions.length > 0 ? 
                        `${(activePage - 1) * itemsPerPage + 1} - ${Math.min(activePage * itemsPerPage, filteredPredictions.length)}` : 0} 
                      of {filteredPredictions.length} results
                    </Text>
                  </>
                )}
                
                {predictAllSummary.failed_facilities && predictAllSummary.failed_facilities.length > 0 && (
                  <>
                    <Title order={5} mb="md" mt="xl">Failed Facilities</Title>
                    <Text size="sm" mb="md" c="dimmed">
                      The following facilities could not be processed. This may be due to insufficient historical data.
                    </Text>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Facility ID</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {predictAllSummary.failed_facilities.map((facilityId, index) => (
                          <Table.Tr key={index}>
                            <Table.Td>{facilityId}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </>
                )}
              </Card>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="train" pt="md">
          <Paper withBorder p="md" radius="md">
            <Title order={3} mb="md">Train Prediction Model</Title>
            <Text mb="lg">
              The model training process will use historical malaria data to create a prediction
              model for future cases. This may take several minutes to complete.
            </Text>
            
            <Accordion>
              <Accordion.Item value="info">
                <Accordion.Control>
                  <Title order={5}>About the Model</Title>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text mb="md">
                    This model uses a deep learning LSTM (Long Short-Term Memory) neural network 
                    algorithm to analyze historical malaria data and predict future trends. The model
                    takes into account:
                  </Text>
                  <ul>
                    <li>Confirmed microscope and RDT cases</li>
                    <li>Age group distribution of cases</li>
                    <li>Medication usage patterns</li>
                    <li>Weather data (rainfall, temperature)</li>
                    <li>Population data at kabupaten and kecamatan levels</li>
                  </ul>
                  <Text mt="md">
                    After training, the model can predict these metrics for any health facility 
                    for the next 6 months.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
            
            <Group justify="center" mt="xl">
              <Button 
                onClick={handleTrainModel} 
                leftSection={<IconBrain size={16} />}
                loading={trainingLoading}
                color="green"
              >
                Train Model
              </Button>
            </Group>
            
            {trainingLoading && (
              <Group justify="center" mt="md">
                <Loader size="md" />
                <Text>Training in progress... This may take several minutes.</Text>
              </Group>
            )}
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default TrainingModel;