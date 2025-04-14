import { useDocumentTitle } from '@mantine/hooks';
import Footer from '../../components/Footer/Footer';
import IntroDashboard from '../../components/IntroDashboard/IntroDashboard';

const HomePage = () => {
  useDocumentTitle('Climate Smart Indonesia')
  return (
    <>
      <IntroDashboard />
      <Footer />
    </>
  );
}

export default HomePage;