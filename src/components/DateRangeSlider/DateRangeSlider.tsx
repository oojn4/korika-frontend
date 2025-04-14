import { Group, RangeSlider, Text, Box, Button, Tooltip } from '@mantine/core';
import { useEffect, useState } from 'react';

interface DateRangeSliderProps {
  data: any[];
  dataKey: string;
  onChange: (range: [number, number]) => void;
  applyToAll?: boolean;
}

/**
 * A slider component for filtering data by date range
 */
const DateRangeSlider = ({ data, dataKey, onChange, applyToAll = false }: DateRangeSliderProps) => {
  // Extract all unique dates from data
  const [allDates, setAllDates] = useState<{ value: number; label: string }[]>([]);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  
  useEffect(() => {
    if (data.length > 0) {
      // Get all unique month_year values
      const uniqueDates = Array.from(
        new Set(data.map((d) => d[dataKey]))
      ).sort((a, b) => {
        const [aMonth, aYear] = a.split('-').map(Number);
        const [bMonth, bYear] = b.split('-').map(Number);
        return aYear === bYear ? aMonth - bMonth : aYear - bYear;
      });
      
      // Convert to slider marks
      const dateMarks = uniqueDates.map((date, index) => ({
        value: index,
        label: formatDateLabel(date),
        date
      }));
      
      setAllDates(dateMarks);
      // Initialize slider with full range
      setRange([0, dateMarks.length - 1]);
    }
  }, [data, dataKey]);
  
  // Format date for display (e.g., "1-2023" to "Jan '23")
  const formatDateLabel = (dateString: string) => {
    const [month, year] = dateString.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} '${year.slice(2)}`;
  };
  
  // Get label for current selection
  const getSelectionLabel = () => {
    if (allDates.length === 0 || range[0] === undefined || range[1] === undefined) return '';
    
    const startDate = allDates[range[0]]?.label || '';
    const endDate = allDates[range[1]]?.label || '';
    
    return `${startDate} to ${endDate}`;
  };
  
  const handleRangeChange = (newRange: [number, number]) => {
    setRange(newRange);
  };
  
  const applyRange = () => {
    onChange(range);
  };
  
  // Render marks based on data density
  const getMarks = () => {
    if (allDates.length <= 6) {
      // Show all dates when there are few
      return allDates;
    } else {
      // For many dates, show only some markers
      const step = Math.ceil(allDates.length / 6);
      return allDates.filter((_, index) => index % step === 0 || index === allDates.length - 1);
    }
  };
  
  return (
    <Box mb={applyToAll ? "md" : "xs"} mt={applyToAll ? "md" : "xs"}>
      <Group mb={5}>
        <Text size={applyToAll ? "md" : "sm"}>
          {applyToAll ? "Global Date Range Filter" : "Date Range"} 
        </Text>
        <Tooltip label="Current selection">
          <Text size="xs" color="dimmed">{getSelectionLabel()}</Text>
        </Tooltip>
      </Group>
      
      <Group align="flex-end">
        <Box style={{ flex: 1 }}>
          <RangeSlider
            min={0}
            max={allDates.length - 1}
            step={1}
            minRange={0}
            marks={getMarks()}
            value={range}
            onChange={handleRangeChange}
            size={applyToAll ? "md" : "sm"}
            label={null}
          />
        </Box>
        <Button 
          size="xs" 
          variant="light" 
          onClick={applyRange}
        //   compact={!applyToAll}
        >
          Apply
        </Button>
      </Group>
    </Box>
  );
};

export default DateRangeSlider;