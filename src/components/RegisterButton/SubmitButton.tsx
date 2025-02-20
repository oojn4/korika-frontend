import { Button } from '@mantine/core';
import React from 'react';

type SubmitButtonProps = {
  onClick: () => void;
};

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick }) => {
  return (
    <Button type="button" onClick={onClick} >
      Submit
    </Button>
  );
};

export default SubmitButton;

