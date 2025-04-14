import { Group, Button, Box, Text } from '@mantine/core';
import { MonthPicker } from '@mantine/dates';
import { useEffect, useState } from 'react';

interface MonthRangePickerProps {
  data: any[];
  dataKey: string;
  onChange: (range: [number, number]) => void;
  applyToAll?: boolean;
}

const MonthRangePicker = ({ data, dataKey, onChange }: MonthRangePickerProps) => {
  // Get unique month-year values sorted chronologically
  const uniqueDates = Array.from(
    new Set(data.map((d) => d[dataKey]))
  ).sort((a, b) => {
    const [aMonth, aYear] = a.split('-').map(Number);
    const [bMonth, bYear] = b.split('-').map(Number);
    return aYear === bYear ? aMonth - bMonth : aYear - bYear;
  });

  // Create date objects for the picker
  const dateMap = uniqueDates.map((dateStr, index) => {
    const [month, year] = dateStr.split('-').map(Number);
    // Create a date object (months are 0-indexed in JS Date)
    return { 
      date: new Date(year, month - 1, 1),
      index
    };
  });

  // State for selected start and end dates
  const [startDate, setStartDate] = useState<Date | null>(
    dateMap.length > 0 ? dateMap[0].date : null
  );
  
  const [endDate, setEndDate] = useState<Date | null>(
    dateMap.length > 0 ? dateMap[dateMap.length - 1].date : null
  );

  // Apply date filter
  const applyFilter = () => {
    if (!startDate || !endDate) return;
    
    // Find the indices in the uniqueDates array that correspond to these dates
    const startIndex = dateMap.find(
      item => item.date.getMonth() === startDate.getMonth() && 
              item.date.getFullYear() === startDate.getFullYear()
    )?.index || 0;
    
    const endIndex = dateMap.find(
      item => item.date.getMonth() === endDate.getMonth() && 
              item.date.getFullYear() === endDate.getFullYear()
    )?.index || (dateMap.length - 1);
    
    onChange([startIndex, endIndex]);
  };

  // Set default values when data changes
  useEffect(() => {
    if (dateMap.length > 0) {
      setStartDate(dateMap[0].date);
      setEndDate(dateMap[dateMap.length - 1].date);
      // Initial filter application
      onChange([0, dateMap.length - 1]);
    }
  }, [data.length, uniqueDates.length]);

  // Get min and max dates for the pickers
  const minDate = dateMap.length > 0 ? dateMap[0].date : new Date();
  const maxDate = dateMap.length > 0 ? dateMap[dateMap.length - 1].date : new Date();

  return (
    <Box>
      <Group align="start" grow mb="sm">
        <Box>
          <Text size="sm" mb={5}>Start Date</Text>
          <MonthPicker 
            value={startDate} 
            onChange={setStartDate}
            minDate={minDate}
            maxDate={endDate || maxDate}
          />
        </Box>
        <Box>
          <Text size="sm" mb={5}>End Date</Text>
          <MonthPicker 
            value={endDate} 
            onChange={setEndDate}
            minDate={startDate || minDate}
            maxDate={maxDate}
          />
        </Box>
      </Group>
      <Button onClick={applyFilter} fullWidth mt="md">Apply Filter</Button>
    </Box>
  );
};

export default MonthRangePicker;