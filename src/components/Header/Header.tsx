import {
  Burger,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  Title,
  rem
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import { checkAdminAccess } from '../../utils/checkAccess';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import UserToggle from '../UserToggle/UserToggle';
import classes from './Header.module.css';

const HeaderComponent = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleClickedLogo = () => {
    navigate('/');
  }

  return (
    <>
      <header className={classes.header}>
        <Group justify="space-between" h="100%" gap={0}>
          <Title
            order={3}
            onClick={handleClickedLogo}
            style={{ cursor: 'pointer'}}>
            {t('app-name')}
          </Title>

          <Group h="100%" gap={0} visibleFrom="sm">
            <a href="/#" className={classes.link}>
              {t('header.home')}
            </a>
            {checkAdminAccess(user?.access_level || []) &&
              <a href="/admin" className={classes.link}>
                {t('header.admin')}
              </a>
            }
            <a href="/dashboard" className={classes.link}>
              {t('header.dashboard')}
            </a>
          </Group>

          <Group visibleFrom="sm" gap={5}>
            {/* <LocaleToggle /> */}
            <ThemeToggle />
            <UserToggle />
          </Group>

          <Group hiddenFrom="sm" gap={5}>
            {/* <LocaleToggle /> */}
            <ThemeToggle />
            <Burger opened={drawerOpened} onClick={toggleDrawer} />
          </Group>
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title={t('app-name')}
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />

          <a href="/#" className={classes.link}>
            {t('header.home')}
          </a>
          {checkAdminAccess(user?.roles || []) &&
            <a href="/dashboard" className={classes.link}>
              {t('header.admin')}
            </a>
          }
          <a href="/dashboard" className={classes.link}>
            {t('header.dashboard')}
          </a>

          <Divider my="sm" />

          <Group grow pb="xl" px="md">
            <UserToggle />
          </Group>
        </ScrollArea>
      </Drawer>
    </>
  );
}

export default React.memo(HeaderComponent)
