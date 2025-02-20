import { Button, Container, Group, Image, Text, ThemeIcon, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './IntroDashboard.module.css';
import image from './image.svg';


const IntroDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className={classes.wrapper} id="home">
    <Container size="md">
      <div className={classes.inner}>
        <div className={classes.content}>
          <Title className={classes.title}>
            Dashboard Monitoring Malaria
          </Title>
          <Text c="dimmed" mt="md">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maxime adipisci eligendi ad, porro vitae sequi obcaecati praesentium fugit consequatur nisi ipsam repellendus consequuntur laboriosam, sit vel aut voluptas rem aspernatur.
          </Text>

          <Group my="md">
            <Button variant="transparent" radius="xl" size="md" className={classes.control}
              leftSection={
                <ThemeIcon bg='blue' radius={50}>
                  <IconArrowRight color='white' />
                </ThemeIcon>} 
              onClick={() => navigate('/login')}>
              Selengkapnya
            </Button>
          </Group>

          
        </div>
        <Image src={image} className={classes.image} />
      </div>
    </Container>
    </div>
  );
}

export default React.memo(IntroDashboard)
