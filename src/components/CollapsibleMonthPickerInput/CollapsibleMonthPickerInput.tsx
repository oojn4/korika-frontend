import { Button, Collapse, Stack } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useState } from 'react';

function CollapsibleMonthPicker({ startDate, endDate }: { startDate?: Date; endDate?: Date }) {
  const [filterMonth, setFilterMonth] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <Stack gap="xs">
      <Button 
        onClick={toggleCollapse}
        variant="subtle"
        color="gray"
        w="auto"
      >
        
        {filterMonth ? new Date(filterMonth).toLocaleDateString('id', { month: 'long', year: 'numeric' }) : 'Filter Bulan/Tahun'}
      </Button>

      <Collapse in={isOpen}>
        <MonthPickerInput
          label="Filter Bulan/Tahun"
          placeholder="YYYY-MM"
          value={filterMonth}
          onChange={setFilterMonth}
          clearable
          w="auto"
          minDate={startDate || new Date(2019, 0, 1)}
          maxDate={endDate || undefined}
        />
      </Collapse>
    </Stack>
  );
}

export default CollapsibleMonthPicker;