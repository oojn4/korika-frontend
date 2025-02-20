import { Button } from '@mantine/core';
import React from 'react';

type SimpanButtonProps = {
  onClick: () => void;
};

const SimpanButton: React.FC<SimpanButtonProps> = ({ onClick }) => {
  return (
    <Button type="button" onClick={onClick} >
      Simpan
    </Button>
  );
};

export default SimpanButton;

