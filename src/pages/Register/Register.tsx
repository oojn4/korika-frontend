import { Anchor, Button, Container, Group, LoadingOverlay, Paper, PasswordInput, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure, useDocumentTitle } from '@mantine/hooks';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SignInResponse } from '../../@types/auth';
import LoaderComponent from '../../components/LoaderComponent/LoaderComponent';
import appConfig from '../../configs/app.config';
import { UserService } from '../../services/services/user.service';
import { setUser } from '../../store/slices/authSlice';
import { showErrorFetching } from '../../utils/errorFetching';
import { showSuccessNotification } from '../../utils/notifications';
import classes from './Register.module.css';

const RegisterPage = () => {
  useDocumentTitle(`Register | ${appConfig.appName}`);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [visible, { open, close }] = useDisclosure(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');

  const handleRegister = async () => {
    try {
      open();
      const payload = {
        email,
        password,
        full_name: fullName,
        phone_number: phoneNumber,
        address_1: address1,
        address_2: address2,
        access_level: 'user', // Default value
      };
      const response : SignInResponse = await UserService.register(payload);
      showSuccessNotification('register-success', 'Anda berhasil mendaftar', 3000);
      dispatch(setUser(response));
      close();
      navigate('/');
    } catch (error) {
      close();
      return showErrorFetching(error);
    }
  };

  return (
    <Container size={420} my={40}>
      <LoadingOverlay visible={visible} loaderProps={{ children: <LoaderComponent /> }} />

      <Title ta="center" className={classes.title}>
        Selamat Datang Kembali!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Sudah memiliki akun?{' '}
        <Anchor size="sm" component="button" onClick={() => navigate('/login')}>
          Masuk
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form>
          <TextInput
            label="Nama Lengkap"
            placeholder="Nama Lengkap"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextInput
            label="Email"
            placeholder="you@example.com"
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
          <TextInput
            label="Nomor Telepon"
            placeholder="0812xxxxxxx"
            required
            mt="md"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <TextInput
            label="Alamat Baris 1"
            placeholder="Alamat Baris 1"
            required
            mt="md"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
          />
          <TextInput
            label="Alamat Baris 2"
            placeholder="Alamat Baris 2"
            mt="md"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
          />
        </form>
        <Group justify="space-between" mt="lg">
          {/* <Anchor component="button" size="sm" onClick={() => navigate('/forgot-password')}>
            Lupa kata sandi?
          </Anchor> */}
        </Group>
        <Button fullWidth mt="xl" onClick={handleRegister}>
          Daftar
        </Button>
      </Paper>
    </Container>
  );
};

export default RegisterPage;