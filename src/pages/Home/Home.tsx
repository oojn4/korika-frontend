import { useDocumentTitle } from '@mantine/hooks';
import LandingPage from '../../components/LandingPage/LandingPage';

const HomePage = () => {
  useDocumentTitle('ClimateSmart Indonesia')
  return (
    <>
      <LandingPage />
    </>
  );
}

export default HomePage;