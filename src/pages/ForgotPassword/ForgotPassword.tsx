import {
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Group,
  Paper,
  rem,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import appConfig from '../../configs/app.config';
import { showWarningNotification } from '../../utils/notifications';
import classes from './ForgotPassword.module.css';

const ForgotPasswordPage = () => {
  useDocumentTitle(`Lupa Password | ${appConfig.appName}`)
  const navigate = useNavigate();

  const handleClickedReset = (event: any) => {
    event.preventDefault();
    showWarningNotification('reset-password', 'Fitur sedang dalam tahap pengembangan', 3000)
  }

  return (
    <Container size={460} my={30}>
      <Title className={classes.title} ta="center">
        Forgot your password?
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        Enter your email to get a reset link
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <form>
        <TextInput label="Your email" placeholder="me@gmail.com" required />
        <Group justify="space-between" mt="lg" className={classes.controls} onClick={() => navigate('/login')}>
          <Anchor c="dimmed" size="sm" className={classes.control}>
            <Center inline>
              <IconArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
              <Box ml={5}>Back to the login page</Box>
            </Center>
          </Anchor>
          <Button className={classes.control} onClick={(event) => handleClickedReset(event)}>Reset password</Button>
        </Group>
        </form>
      </Paper>
    </Container>
  )
}

export default ForgotPasswordPage