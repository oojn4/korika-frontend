import { Select, SimpleGrid, Space, Text, Title } from '@mantine/core';
import { IconArticle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { AggregateData, AggregateDataResponse, RawDataResponse } from '../../@types/dashboard';
import MapVisualization from '../../components/MapVisualization/MapVisualization';
import Statbox from '../../components/Statbox/Statbox';
import TableRawData from '../../components/TableRawData/TableRawData';
import { DashboardService } from '../../services/services/dashboard.service';
import { showErrorFetching } from '../../utils/errorFetching';
import classes from './Dashboard.module.css';
type ComboboxItem = {
  value: String; // Use lowercase 'string'
  label: String; // Use lowercase 'string'
};
type TextStatBox = {
  label: string;
  count: number | null;
  color: string;
  y_on_y : number | null;
  m_to_m : number | null;
  color_y_on_y: string;
  color_m_to_m: string;
};

const DashboardPage = () => {
  const [aggregateData, setAggregateData] = useState<any[]>([]);
  const [mergedData, setMergedData] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  
  const [province, setProvince] = useState<string>('TOTAL');
  const [year, ] = useState<string>('');
  const [month, ] = useState<string>('');
  const [monthYear, setMonthYear] = useState<string>('');
  const [predictedMonthYear, setPredictedMonthYear] = useState<string>('');
  const [textStatbox, setTextStatbox] = useState<TextStatBox[]>([]);
  
  // Tambahkan state untuk daftar provinsi
  const [provinces, setProvinces] = useState<any[]>([]);

  
  // Fetch daftar provinsi
  const handleFetchProvinces = async () => {
    try {
      // Fetch the provinces
      const response = await DashboardService.fetchProvinces();
      // Map the response data to match ComboboxItem type
      const arrayProvinces: ComboboxItem[] = [
        { value: 'TOTAL', label: 'TOTAL' }, // Add TOTAL as the first option
        ...response.data.map((item: String) => ({
          value: item, // Use the string as the value
          label: item, // Use the string as the label
        })),
      ];
      
      setProvinces(arrayProvinces); // Update the state with correctly formatted data
    } catch (error) {
      return showErrorFetching(error); // Handle errors appropriately
    }
  };
  
  
  // Modifikasi fungsi handleFetchAggregateData untuk memperhatikan provinsi yang dipilih
  const handleFetchAggregateData = async () => {
    const response: AggregateDataResponse = await DashboardService.indexAggregateData(
      province || 'TOTAL',
      year,
      month
    );
    if (response.success === true) {
      // Add month_year column to each item
      const updatedData = response.data.map((item) => ({
        ...item,
        month_year: `${item.month}-${item.year}`, // Format the month_year column
      }));
      setAggregateData(updatedData);
    }
  };
  // Modifikasi fungsi handleFetchAggregateData untuk memperhatikan provinsi yang dipilih
  const handleFetchRawData = async () => {
    const response: RawDataResponse = await DashboardService.indexRawData(
      province || '',
    );
    if (response.success === true) {
      // Add month_year column to each item
      const updatedData = response.data.map((item) => ({
        ...item,
        month_year: `${item.month}-${item.year}`, // Format the month_year column
      }));
      setRawData(updatedData);
    }
  };
  // Function to convert "1-2023" format to "January-2023" format
  function convertDateFormat(dateString:string) {
    // Split the string by hyphen
    const parts = dateString.split('-');
    
    // Check if the format is valid
    if (parts.length !== 2) {
      return "Invalid date format. Please use format like '1-2023'";
    }
    
    // Get the month number and year
    const monthNum = parseInt(parts[0], 10);
    const year = parts[1];
    
    // Array of month names
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    // Check if month number is valid (1-12)
    if (monthNum < 1 || monthNum > 12) {
      return "Invalid month number. Month should be between 1 and 12";
    }
    
    // Convert month number to month name (array is 0-indexed, so subtract 1)
    const monthName = monthNames[monthNum - 1];
    
    // Return the formatted date string
    return `${monthName}-${year}`;
  }

  // Panggil fetchProvinces pada useEffect
  useEffect(() => {
    handleFetchProvinces();
  }, []);
  
  // Perbarui data ketika provinsi berubah
  useEffect(() => {
    handleFetchAggregateData();
  }, [province, year, month]);

  useEffect(() => {
    handleFetchRawData();

  }, [province]);


  // Replace this section in your DashboardPage.tsx file
// Inside the useEffect that processes aggregateData

  useEffect(() => {

    if (aggregateData?.length) {
      // Filter actual and predicted data
      const actualData = aggregateData.filter((item) => item.status === 'actual');
      const predictedData = aggregateData.filter((item) => item.status === 'predicted');
      
      // Find the latest actual data point - this is important for connecting the lines
      const maxActualItem = actualData.reduce<AggregateData | null>((maxItem, currentItem) => {
        if (
          maxItem === null ||
          currentItem.year > maxItem.year ||
          (currentItem.year === maxItem.year && currentItem.month > maxItem.month)
        ) {
          return currentItem;
        }
        return maxItem;
      }, null);
      
      // Store latest actual month/year
      const monthYearTemp = maxActualItem ? `${maxActualItem.month.toString()}-${maxActualItem.year.toString()}` : '';
      setMonthYear(monthYearTemp);
      
      // Create data structure for prefixed items
      // const dataWithPrefixes = [...actualData, ...predictedData].map(item => {
      //   const result: any = { month_year: item.month_year };
        
      //   // Add all keys with proper prefixes
      //   Object.keys(item).forEach(key => {
      //     const prefix = item.status === 'actual' ? 'actual_' : 'predicted_';
      //     result[`${prefix}${key}`] = item[key];
      //   });
        
      //   return result;
      // });
      
      // Get all unique month_year values, sorted chronologically
      const allMonthYears = Array.from(
        new Set([...actualData, ...predictedData].map((d) => d.month_year))
      ).sort((a, b) => {
        const [aMonth, aYear] = a.split('-').map(Number);
        const [bMonth, bYear] = b.split('-').map(Number);
        return aYear === bYear ? aMonth - bMonth : aYear - bYear;
      });
      
      // Create the merged data structure
      const mergedData = allMonthYears.map((month_year) => {
        // Find the items for this month_year
        const actualItem = actualData.find((item) => item.month_year === month_year);
        const predictedItem = predictedData.find((item) => item.month_year === month_year);
        
        // Create base object with month_year
        const result: any = { month_year };
        
        // For actual data
        if (actualItem) {
          Object.keys(actualItem).forEach(key => {
            if (key !== 'month_year') {
              // Add with actual_ prefix
              result[`actual_${key}`] = actualItem[key];
            }
          });
        }
        
        // For predicted data
        if (predictedItem) {
          Object.keys(predictedItem).forEach(key => {
            if (key !== 'month_year') {
              // Add with predicted_ prefix
              result[`predicted_${key}`] = predictedItem[key];
            }
          });
        }
        
        return result;
      });
      
      // KEY IMPROVEMENT: If the last actual month is the same as the first predicted month,
      // copy the actual values to the predicted series for that month to create visual continuity
      if (maxActualItem) {
        const latestActualMonthYear = `${maxActualItem.month}-${maxActualItem.year}`;
        
        // Find the entry for the latest actual month
        const latestActualEntry = mergedData.find(item => item.month_year === latestActualMonthYear);
        
        if (latestActualEntry) {
          // Copy actual values to predicted for metrics that should connect
          Object.keys(latestActualEntry).forEach(key => {
            if (key.startsWith('actual_') && !key.includes('status') && !key.includes('month_year')) {
              // Get the base metric name (without prefix)
              const metricName = key.replace('actual_', '');
              
              // Create the predicted key name
              const predictedKey = `predicted_${metricName}`;
              
              // Copy the value to create the connection point
              latestActualEntry[predictedKey] = latestActualEntry[key];
            }
          });
        }
      }
      
      setMergedData(mergedData);
      
      // Find the predicted data for the next month after the latest actual
      if (maxActualItem) {
        const nextMonth = maxActualItem.month === 12 ? 1 : maxActualItem.month + 1;
        const nextYear = maxActualItem.month === 12 ? maxActualItem.year + 1 : maxActualItem.year;
        
        const nextMonthPredictedData = predictedData.filter(
          (item) => item.status === 'predicted' && item?.year === nextYear && item?.month === nextMonth
        );
        
        const predictedMonthYearTemp = nextMonthPredictedData.length > 0 
          ? `${nextMonthPredictedData[0]?.month.toString()}-${nextMonthPredictedData[0]?.year.toString()}` 
          : '';
        
        setPredictedMonthYear(predictedMonthYearTemp);
        
        // Continue with your existing code for textStatbox generation...
        // (textStatbox doesn't need to change for this approach)
         // Mapping data bulan berikutnya
         const mappedData = nextMonthPredictedData.map((predictedItem) => {
          return Object.keys(predictedItem)
            .filter((key) => typeof predictedItem[key] === 'number') // Hanya properti numerik
            .map((attribute) => {
              const yonyKey = `${attribute}_y_on_y_change`;
              const mtomKey = `${attribute}_m_to_m_change`;
              return {
                label: `predicted_${attribute}`,
                count: predictedItem[attribute] ?? null, // Total nilai
                y_on_y: predictedItem[yonyKey as keyof AggregateData] ?? null, // Nilai y_on_y_change jika ada
                m_to_m: predictedItem[mtomKey as keyof AggregateData] ?? null, // Nilai m_to_m_change jika ada
                color: (predictedItem[attribute] ?? 0) >= 0 ? 'green' : 'red', // Warna berdasarkan total nilai
                color_y_on_y: (predictedItem[yonyKey as keyof AggregateData] ?? 0) <= 0 ? 'green' : 'red', // Warna y_on_y_change
                color_m_to_m: (predictedItem[mtomKey as keyof AggregateData] ?? 0) <= 0 ? 'green' : 'red', // Warna m_to_m_change
              };
            });
        });
  
        // Flatten array jika ada banyak item predicted
        const flattenedMappedData = mappedData.flat();
  
        // Set ke textStatbox
        setTextStatbox(flattenedMappedData);
      }
    }
  }, [aggregateData]);

  return (
    <div className={classes.root}>
      <Title order={1}>Welcome to Dashboard Panel</Title>
      <Space h="lg" />

      {/* Tambahkan Select untuk memilih provinsi */}
      <SimpleGrid cols={{ base: 1, xs: 5, md: 5 }}>
      <Select
        label="Provinsi"
        name="province"
        value={province}
        onChange={(value) => setProvince(value || '')}
        placeholder="Pilih Provinsi"
        data={provinces}
        required
        allowDeselect
        searchable
        defaultValue='TOTAL'
      />
      </SimpleGrid>
      <Space h="md" />
      
      <Text>Actual Data Updated at: {convertDateFormat(monthYear)}</Text>
      <Text>Predicted Data Ready for: {convertDateFormat(predictedMonthYear)}</Text>
      
      <Space h="md" />
      {/* Replace the first set of Statbox components with these */}

      {/* Replace the first set of Statbox components with these */}

      <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
        <Statbox
          title="Konfirmasi Lab"
          icon={IconArticle}
          data={mergedData}
          textStatbox={textStatbox}
          dataKey="month_year"
          series={[
            // Keep separate series with distinct colors,
            { name: 'predicted_konfirmasi_lab_mikroskop', color: 'grey' },
            { name: 'actual_konfirmasi_lab_mikroskop', color: 'indigo.6' },
            { name: 'predicted_konfirmasi_lab_rdt', color: 'grey' },
            { name: 'actual_konfirmasi_lab_rdt', color: 'blue.6' },
            { name: 'predicted_konfirmasi_lab_pcr', color: 'grey' },
            { name: 'actual_konfirmasi_lab_pcr', color: 'teal.6' },
          ]}
          isCollapsible
        />
        <Statbox
          title="Kelompok Umur"
          icon={IconArticle}
          data={mergedData}
          textStatbox={textStatbox}
          dataKey="month_year"
          series={[
            
            // Predicted series all in grey
            { name: 'predicted_pos_0_4', color: 'grey' },
            { name: 'predicted_pos_5_14', color: 'grey' },
            { name: 'predicted_pos_15_64', color: 'grey' },
            { name: 'predicted_pos_diatas_64', color: 'grey' },
            // Actual series with colors
            { name: 'actual_pos_0_4', color: '#FFC1CC' },
            { name: 'actual_pos_5_14', color: '#87CEEB' },
            { name: 'actual_pos_15_64', color: '#50C878' },
            { name: 'actual_pos_diatas_64', color: '#E6E6FA' },
            
          ]}
          isCollapsible
        />
      </SimpleGrid>
      <Space h="lg" />
      <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
        <Statbox
          title="Ibu Hamil dan Kematian"
          icon={IconArticle}
          data={mergedData}
          textStatbox={textStatbox}
          dataKey="month_year"
          series={[
            
            { name: 'predicted_hamil_pos', color: 'grey' },
            { name: 'predicted_kematian_malaria', color: 'grey' },
            
            { name: 'actual_hamil_pos', color: 'blue.6' },
            { name: 'actual_kematian_malaria', color: 'teal.6' },
          ]}
          isCollapsible
        />
        
        <Statbox
          title="Penggunaan Obat"
          icon={IconArticle}
          data={mergedData}
          textStatbox={textStatbox}
          dataKey="month_year"
          series={[
            
            { name: 'predicted_obat_standar', color: 'grey' },
            { name: 'predicted_obat_nonprogram', color: 'grey' },
            { name: 'predicted_obat_primaquin', color: 'grey' },
            
            { name: 'actual_obat_standar', color: 'indigo.6' },
            { name: 'actual_obat_nonprogram', color: 'blue.6' },
            { name: 'actual_obat_primaquin', color: 'teal.6' },
          ]}
          isCollapsible
        />
      </SimpleGrid>
      <Space h="lg" />
      <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
        <Statbox
          title="Tipe Parasit"
          icon={IconArticle}
          data={mergedData}
          textStatbox={textStatbox}
          dataKey="month_year"
          series={[
            { name: 'predicted_p_pf', color: 'grey' },
            { name: 'predicted_p_pv', color: 'grey' },
            { name: 'predicted_p_po', color: 'grey' },
            { name: 'predicted_p_pm', color: 'grey' },
            { name: 'predicted_p_pk', color: 'grey' },
            { name: 'predicted_p_mix', color: 'grey' },
            { name: 'predicted_p_suspek_pk', color: 'grey' },
            
            { name: 'actual_p_pf', color: 'blue.6' },
            { name: 'actual_p_pv', color: 'cyan.6' },
            { name: 'actual_p_po', color: 'green.6' },
            { name: 'actual_p_pm', color: 'lime.6' },
            { name: 'actual_p_pk', color: 'orange.6' },
            { name: 'actual_p_mix', color: 'teal.6' },
            { name: 'actual_p_suspek_pk', color: 'red.6' },
          ]}
          isCollapsible
        />
        
        <Statbox
          title="Origin"
          icon={IconArticle}
          data={mergedData}
          textStatbox={textStatbox}
          dataKey="month_year"
          series={[
            { name: 'predicted_penularan_indigenus', color: 'grey' },
            { name: 'predicted_penularan_impor', color: 'grey' },
            { name: 'predicted_penularan_induced', color: 'grey' },
            
            { name: 'actual_penularan_indigenus', color: 'indigo.6' },
            { name: 'actual_penularan_impor', color: 'blue.6' },
            { name: 'actual_penularan_induced', color: 'teal.6' },
          ]}
          isCollapsible
        />
      </SimpleGrid>
      <Space h="lg" />
      <SimpleGrid cols={{ base: 1, xs: 1, md: 1 }}>
        <TableRawData
          data={rawData}
          rowsPerPage={10} // Set rows per page
          predictedMonthYear={convertDateFormat(predictedMonthYear)}
        />
      </SimpleGrid>
      <Space h="lg" />
      <SimpleGrid cols={{ base: 1, xs: 1, md: 1 }}>
        <MapVisualization data={rawData} predictedMonthYear={convertDateFormat(predictedMonthYear)} />
      </SimpleGrid>
      
      
    </div>
  );
};
export default DashboardPage;
