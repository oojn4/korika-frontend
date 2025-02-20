import { ActionIcon, Anchor, Container, Group, rem, Text, Title } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconPointFilled } from '@tabler/icons-react';
import React from 'react';
import classes from './Footer.module.css';

const Footer = () => {
  
  return (
    <footer className={classes.footer} id="about">
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Title>Kementerian Kesehatan</Title>
          <Text size="xs" c="dimmed" className={classes.description}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora omnis eos ex, totam voluptatem id quo saepe non nam itaque ratione suscipit! Quae officia neque amet, facere accusamus nemo enim?
          </Text>
        </div>

        <Group gap={0} className={classes.social} justify="flex-end" wrap="nowrap">
          {/* @ts-ignore */}
          <ActionIcon size="lg" color="gray" variant="subtle" component={Anchor} href="https://www.facebook.com" target="_blank">
            <IconBrandFacebook style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
          {/* @ts-ignore */}
          <ActionIcon size="lg" color="gray" variant="subtle" component={Anchor} href="https://www.instagram.com/" target="_blank">
            <IconBrandInstagram style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
          <Text c="dimmed" size="sm">
            +62 xxx <IconPointFilled size={14}/> kemenkes@yahoo.co.id
          </Text>

        </Group>
      </Container>
    </footer>
  );
}

export default React.memo(Footer)
