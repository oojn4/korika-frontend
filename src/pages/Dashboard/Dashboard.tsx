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
  const mapData = [
    { lat: -7.250445, lng: 112.768845, value: 50, locationName: 'Surabaya' },
    { lat: -6.917464, lng: 107.619125, value: 75, locationName: 'Bandung' },
    { lat: -7.795580, lng: 110.369490, value: 30, locationName: 'Yogyakarta' },
    { lat: -8.340539, lng: 115.092061, value: 90, locationName: 'Denpasar' },
  ];
  
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
    console.log(response.data)
    if (response.success === true) {
      // Add month_year column to each item
      const updatedData = response.data.map((item) => ({
        ...item,
        month_year: `${item.month}-${item.year}`, // Format the month_year column
      }));
      console.log(updatedData)
      setRawData(updatedData);
    }else{
      console.log('failed')
    }
  };
  
  // Panggil fetchProvinces pada useEffect
  useEffect(() => {
    handleFetchProvinces();
    console.log(mapData);
  }, []);
  
  // Perbarui data ketika provinsi berubah
  useEffect(() => {
    handleFetchAggregateData();
  }, [province, year, month]);

  useEffect(() => {
    console.log('handlingfetchrawdata')
    console.log(textStatbox)
    handleFetchRawData();

  }, [province]);


  useEffect(() => {
    if (aggregateData?.length) {
      // Filter data actual saja
      // Step 1: Filter actual and predicted data
      const actualData = aggregateData.filter((item) => item.status === 'actual');
      const predictedData = aggregateData.filter(
        (item) =>
          item.status === 'predicted' && // Only include "predicted" items
          !actualData.some((actual) => actual.month_year === item.month_year) // Exclude overlapping month_year
      );

      // Step 2: Map actual and predicted data with prefixed keys
      const actualDataWithPrefix = actualData.map((item) => {
        const newItem: { [key: string]: any } = {};
        Object.keys(item).forEach((key) => {
          newItem[`actual_${key}`] = item[key]; // Add "actual_" prefix
        });
        return newItem;
      });

      const predictedDataWithPrefix = predictedData.map((item) => {
        const newItem: { [key: string]: any } = {};
        Object.keys(item).forEach((key) => {
          newItem[`predicted_${key}`] = item[key]; // Add "predicted_" prefix
        });
        return newItem;
      });

      // Step 3: Merge data by the shared key (e.g., "month_year")
      const mergedData = Array.from(new Set([...actualData, ...predictedData].map((d) => d.month_year)))
        .map((month_year) => {
          const actualRow = actualDataWithPrefix.find((item) => item.actual_month_year === month_year) || {};
          const predictedRow = predictedDataWithPrefix.find((item) => item.predicted_month_year === month_year) || {};
          return { month_year,...actualRow, ...predictedRow }; // Merge rows
        });

      setMergedData(mergedData)
  
      // Cari maxItem dari data actual
      const maxItem = actualData.reduce<AggregateData | null>((maxItem, currentItem) => {
        if (
          maxItem === null || // Tangani kondisi awal
          currentItem.year > maxItem.year ||
          (currentItem.year === maxItem.year && currentItem.month > maxItem.month)
        ) {
          return currentItem;
        }
        return maxItem;
      }, null);
  
      const monthYearTemp = maxItem ? `${maxItem.month.toString()}-${maxItem.year.toString()}` : '';
      setMonthYear(monthYearTemp);
  
      if (maxItem) {
        // Filter predicted data untuk bulan berikutnya
        const nextMonth = maxItem.month === 12 ? 1 : maxItem.month + 1;
        const nextYear = maxItem.month === 12 ? maxItem.year + 1 : maxItem.year;
        const nextMonthPredictedData = aggregateData.filter(
          (item) => item.status === 'predicted' && item.year === nextYear && item.month === nextMonth
        );
        console.log("data bulan selanjutnya (predicted)")
        console.log(nextMonthPredictedData)
        const predictedMonthYearTemp = nextMonthPredictedData ? `${nextMonthPredictedData[0].month.toString()}-${nextMonthPredictedData[0].year.toString()}` : '';
        setPredictedMonthYear(predictedMonthYearTemp);
  

        // Mapping data bulan berikutnya
        const mappedData = nextMonthPredictedData.map((predictedItem) => {
          return Object.keys(predictedItem)
            .filter((key) => typeof predictedItem[key] === 'number') // Hanya properti numerik
            .map((attribute) => {
              // attribute = `predicted_${attribute}`
              // console.log(predictedItem)
              // Cari nilai `_y_on_y_change` dan `_m_to_m_change` untuk setiap atribut
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
      
      <Text>Actual Data Updated at: {monthYear}</Text>
      <Text>Predicted Data on Description Ready for: {predictedMonthYear}</Text>
      
      <Space h="md" />
      <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
      <Statbox
        title="Konfirmasi Lab"
        icon={IconArticle}
        data={mergedData}
        textStatbox={textStatbox}
        dataKey="month_year"
        series={[
          { name: 'actual_konfirmasi_lab_mikroskop', color: 'indigo.6' },
          { name: 'predicted_konfirmasi_lab_mikroskop', color: 'grey' },
          { name: 'actual_konfirmasi_lab_rdt', color: 'blue.6' },
          { name: 'predicted_konfirmasi_lab_rdt', color: 'grey' },
          { name: 'actual_konfirmasi_lab_pcr', color: 'teal.6' },
          { name: 'predicted_konfirmasi_lab_pcr', color: 'grey' },
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
          { name: 'actual_pos_0_4', color: '#FFC1CC' }, // Pastel Pink
          { name: 'actual_pos_5_14', color: '#87CEEB' }, // Sky Blue
          { name: 'actual_pos_15_64', color: '#50C878' }, // Emerald Green
          { name: 'actual_pos_diatas_64', color: '#E6E6FA' }, // Lavender
          { name: 'predicted_pos_0_4', color: 'grey' }, // Pastel Pink
          { name: 'predicted_pos_5_14', color: 'grey' }, // Sky Blue
          { name: 'predicted_pos_15_64', color: 'grey' }, // Emerald Green
          { name: 'predicted_pos_diatas_64', color: 'grey' }, // Lavender
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
          { name: 'actual_hamil_pos', color: 'blue.6' },
          { name: 'actual_kematian_malaria', color: 'teal.6' },
          
          { name: 'predicted_hamil_pos', color: 'grey' },
          { name: 'predicted_kematian_malaria', color: 'grey' },
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
          { name: 'actual_obat_standar', color: 'indigo.6' },
          { name: 'actual_obat_nonprogram', color: 'blue.6' },
          { name: 'actual_obat_primaquin', color: 'teal.6' },
          { name: 'predicted_obat_standar', color: 'grey' },
          { name: 'predicted_obat_nonprogram', color: 'grey' },
          { name: 'predicted_obat_primaquin', color: 'grey' },
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
          { name: 'actual_p_pf', color: 'blue.6' },
          { name: 'actual_p_pv', color: 'cyan.6' },
          { name: 'actual_p_po', color: 'green.6' },
          { name: 'actual_p_pm', color: 'lime.6' },
          { name: 'actual_p_pk', color: 'orange.6' },
          { name: 'actual_p_mix', color: 'teal.6' },
          { name: 'actual_p_suspek_pk', color: 'red.6' },
          
          { name: 'predicted_p_pf', color: 'grey' },
          { name: 'predicted_p_pv', color: 'grey' },
          { name: 'predicted_p_po', color: 'grey' },
          { name: 'predicted_p_pm', color: 'grey' },
          { name: 'predicted_p_pk', color: 'grey' },
          { name: 'predicted_p_mix', color: 'grey' },
          { name: 'predicted_p_suspek_pk', color: 'grey' }

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
          { name: 'actual_penularan_indigenus', color: 'indigo.6' },
          { name: 'actual_penularan_impor', color: 'blue.6' },
          { name: 'actual_penularan_induced', color: 'teal.6' },
          
          { name: 'predicted_penularan_indigenus', color: 'grey' },
          { name: 'predicted_penularan_impor', color: 'grey' },
          { name: 'predicted_penularan_induced', color: 'grey' },
        ]}
        isCollapsible
      />
      </SimpleGrid>
      <Space h="lg" />
      <SimpleGrid cols={{ base: 1, xs: 1, md: 1 }}>
        <TableRawData
          data={rawData}
          rowsPerPage={10} // Set rows per page
        />
      </SimpleGrid>
      <Space h="lg" />
      <SimpleGrid cols={{ base: 1, xs: 1, md: 1 }}>
        <MapVisualization data={rawData} />
      </SimpleGrid>
      
      
    </div>
  );
};
export default DashboardPage;
