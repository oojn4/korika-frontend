import { Carousel } from '@mantine/carousel';
import { Button, Container, Flex, Group, Image, Text, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './LandingPage.module.css';

const heroImage = '/logo_maskot-removebg-preview.png';
// Dummy logos - replace with actual logos later
const dummyLogos = {
  korika: '/korika-merah.png',
  kemenkes: '/kemenkes.png',
  bmkg: '/bmkg.png',
  imacs: '/imacs.png',
};

// Dummy dashboard previews - replace with actual previews later
const dashboardPreviews = [
  {
    id: 1,
    title: 'Malaria',
    description: 'Penyakit yang ditularkan melalui gigitan nyamuk Anopheles. Perubahan suhu dan tingkat curah hujan mempengaruhi perkembangbiakan nyamuk dan memperluas wilayah penyebaran parasit Plasmodium.',
    image: '/mala.png',
    path: '/dashboard/malaria'
  },
  {
    id: 2,
    title: 'Leptospirosis',
    description: 'Infeksi bakteri yang menyebar melalui air yang terkontaminasi urin hewan. Banjir dan peningkatan curah hujan meningkatkan risiko penyebaran bakteri Leptospira dari hewan ke manusia.',
    image: '/leptospirosis.png',
    path: '/dashboard/lepto'
  },
  {
    id: 3,
    title: 'Demam Berdarah',
    description: 'Penyakit virus yang ditularkan oleh nyamuk Aedes aegypti. Kenaikan suhu dan perubahan pola hujan menciptakan kondisi ideal bagi perkembangbiakan nyamuk dan mempercepat replikasi virus.',
    image: '/DBD.png',
    path: '/dashboard/dbd'
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [showCarousel, setShowCarousel] = useState(false);
  const [activeSlide, setActiveSlide] = useState(1);
  
  const handleAccessDashboard = () => {
    setShowCarousel(true);
    // Scroll to carousel section after it's shown
    setTimeout(() => {
      document.getElementById('carouselSection')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className={classes.wrapper} id="home">
      <Container size="lg" className={classes.container}>
        {/* Logo section with reduced margin bottom */}
        <div className={classes.header}>
          <Flex 
            align="center" 
            justify="flex-start" 
            wrap="wrap" 
            className={classes.logoContainer}
            gap="sm"
          >
            {Object.entries(dummyLogos).map(([key, src]) => (
              <Image 
                key={key} 
                src={src} 
                alt={`${key} logo`} 
                className={classes.partnerLogo} 
                mx="xs"
              />
            ))}
          </Flex>
        </div>
        
        {/* Hero section - reduced top margin */}
        <div className={classes.hero}>
          <div className={classes.heroContent}>
            <Title className={classes.title}>
              ClimateSmart Indonesia
            </Title>
            <Title order={2} className={classes.subtitle}>
              Dashboard Monitoring Penyakit berdasarkan Perubahan Iklim
            </Title>
            <Text c="dimmed" mt="md" className={classes.description}>
              Platform pemantauan dan analisis dampak perubahan iklim terhadap penyebaran penyakit di Indonesia. 
              Kami menyediakan data real-time dan insight untuk pengambilan keputusan berbasis data.
            </Text>

            <Group mt="xl">
              <Button 
                variant="filled" 
                radius="xl" 
                size="md" 
                color="blue"
                rightSection={<IconArrowRight size={18} />}
                onClick={handleAccessDashboard}
                className={classes.ctaButton}
              >
                Akses Dashboard
              </Button>
            </Group>
          </div>
          
          <Image src={heroImage} alt="ClimateSmart Indonesia" className={classes.heroImage} width={50} />
        </div>
        
        {showCarousel && (
          <div className={classes.carouselSection} id="carouselSection">
            <Title order={3} className={classes.carouselTitle}>
              Pilih Dashboard Monitoring
            </Title>
            
            <Carousel
              slideSize="30%"
              height={450}
              slideGap="xs"
              loop
              initialSlide={activeSlide}
              onSlideChange={setActiveSlide}
              className={classes.carousel}
            >
              {dashboardPreviews.map((dashboard) => (
                <Carousel.Slide key={dashboard.id} className={classes.carouselSlide}>
                  <div className={classes.dashboardCard} onClick={() => navigate(dashboard.path)}>
                    <Image src={dashboard.image} alt={dashboard.title} height={200} />
                    <div className={classes.dashboardInfo}>
                      <Title order={3}>{dashboard.title}</Title>
                      <Text mt="xs">{dashboard.description}</Text>
                      <Button 
                        variant="subtle" 
                        color="blue" 
                        mt="md"
                        rightSection={<IconArrowRight size={16} />}
                      >
                        Lihat Dashboard
                      </Button>
                    </div>
                  </div>
                </Carousel.Slide>
              ))}
            </Carousel>
          </div>
        )}
        
        <div className={classes.footer}>
          <Text c="dimmed" size="sm">
            © {new Date().getFullYear()} ClimateSmart Indonesia. All rights reserved.
          </Text>
        </div>
      </Container>
    </div>
  );
}

export default React.memo(LandingPage);