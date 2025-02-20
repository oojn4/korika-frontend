import { Button } from '@mantine/core';
import React from 'react';
import classes from './ResetButton.module.css';

type ResetButtonProps = {
  onClick: () => void;
};

const ResetButton: React.FC<ResetButtonProps> = ({ onClick }) => {
  const handleClick = () => {
    onClick(); // Call the external handler passed via props
    // window.location.reload(); // Reload the entire page
  };

  return (
    <Button type="button" onClick={handleClick} className={classes.resetButton}>
      Reset
    </Button>
  );
};

export default ResetButton;
