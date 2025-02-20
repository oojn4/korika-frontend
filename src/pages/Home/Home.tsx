import { useDocumentTitle } from '@mantine/hooks';
import Footer from '../../components/Footer/Footer';
import IntroDashboard from '../../components/IntroDashboard/IntroDashboard';

const HomePage = () => {
  useDocumentTitle('Monitoring Malaria')
  return (
    <>
      <IntroDashboard />
      <Footer />
    </>
  );
}

export default HomePage;