import { Anchor, Button, Container, Group, LoadingOverlay, Paper, PasswordInput, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure, useDocumentTitle } from '@mantine/hooks';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SignInResponse } from '../../@types/auth';
import LoaderComponent from '../../components/LoaderComponent/LoaderComponent';
import appConfig from '../../configs/app.config';
import { AuthService } from '../../services/services/auth.service';
import { setUser } from '../../store/slices/authSlice';
import { showErrorFetching } from '../../utils/errorFetching';
import { showSuccessNotification } from '../../utils/notifications';
import classes from './Login.module.css';

const LoginPage = () => {
  useDocumentTitle(`Login | ${appConfig.appName}`)

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [visible, { open, close }] = useDisclosure(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async () => {
    try {
      open();
      const response : SignInResponse = await AuthService.signIn(email, password) 
      dispatch(setUser(response));
      showSuccessNotification('login-success', response.message, 3000);
      close()
      navigate('/')
    } catch (error) {
      close()
      return showErrorFetching(error);
    }
  };

  return (
    <Container size={420} my={40}>
      <LoadingOverlay
        visible={visible}
        loaderProps={{ children: <LoaderComponent />}}
      />
      <Title ta="center" className={classes.title}>
        Selamat Datang Kembali!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Belum punya akun?{' '}
        <Anchor size="sm" component="button" onClick={() => navigate('/register')}>
          Buat Akun
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form>
          <TextInput 
            label="Email" 
            placeholder="you@gmail.com" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput 
            label="Kata Sandi" 
            placeholder="Kata sandimu" 
            required 
            mt="md" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />
        </form>
        <Group justify="space-between" mt="lg">
          {/* <Anchor component="button" size="sm" onClick={() => navigate('/forgot-password')}>
            Lupa kata sandi?
          </Anchor> */}
        </Group>
        <Button fullWidth mt="xl" onClick={handleLogin}>
          Masuk
        </Button>
      </Paper>
    </Container>
  );
};

export default LoginPage;