// EarlyWarningSystemDBD.tsx
import {
  Accordion,
  Alert,
  Box,
  Button,
  Divider,
  Group,
  List,
  Modal,
  Stack,
  Text,
  ThemeIcon,
  Title
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconInfoCircle
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { DataDBD, EarlyWarningSystemDBDProps, Peringatan } from '../../@types/dashboard';
  
  export const EarlyWarningSystemDBD = ({ 
    data, latestActualMonthYear
  }: EarlyWarningSystemDBDProps) => {
    const [peringatan, setPeringatan] = useState<Peringatan[]>([]);
    const [isRekomendasiTerbuka, setIsRekomendasiTerbuka] = useState(false);
    const [peringatanTerpilih, setPeringatanTerpilih] = useState<Peringatan | null>(null);
    const [showAllWarnings, setShowAllWarnings] = useState(false);
    
    // Fungsi untuk membuka modal daftar semua peringatan
    const toggleSemuaPeringatan = () => {
      setShowAllWarnings(!showAllWarnings);
    };
    
    // Fungsi untuk membuka modal rekomendasi untuk peringatan tertentu
    const bukaRekomendasi = (warning: Peringatan) => {
      setPeringatanTerpilih(warning);
      setIsRekomendasiTerbuka(true);
    };
    
    useEffect(() => {
      // Memeriksa peringatan berdasarkan data yang disediakan
      const peringatanBaru = deteksiPeringatan(data, latestActualMonthYear);
      setPeringatan(peringatanBaru);
    }, [data]);
  
    const deteksiPeringatan = (
      data: DataDBD[],
      latestActualMonthYear: string
    ): Peringatan[] => {
      const peringatanTerdeteksi: Peringatan[] = [];
      
      // Hanya proses jika kita memiliki data
      if (!data || data.length === 0 || !latestActualMonthYear) {
        return [];
      }
    
      // Parse latest actual month/year
      const [bulanTerakhir, tahunTerakhir] = latestActualMonthYear.split('-').map(Number);
      // Buat tanggal referensi dari bulan/tahun data aktual terakhir
      const tanggalReferensi = new Date(tahunTerakhir, bulanTerakhir - 1, 1); // bulan adalah 0-indexed dalam JS Date
      
      // Buat tanggal 6 bulan ke depan dari tanggal referensi
      const enamBulanDariReferensi = new Date(tanggalReferensi);
      enamBulanDariReferensi.setMonth(tanggalReferensi.getMonth() + 6);
      
      // Filter untuk hanya menyertakan data prediksi untuk 6 bulan ke depan dari tanggal referensi
      const dataPrediksi = data.filter(item => {
        // Periksa apakah ini adalah titik data prediksi
        if (item.status !== 'predicted') {
          return false;
        }
    
        // Hitung apakah tanggal berada di masa depan dari tanggal referensi dan dalam 6 bulan
        const tanggalItem = new Date(item.year, item.month - 1, 1);
        
        return tanggalItem > tanggalReferensi && tanggalItem <= enamBulanDariReferensi;
      });
    
      // Terapkan aturan peringatan DBD: CFR > 0.5%
      dataPrediksi.forEach(item => {
        const namaBulan = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        
        // String lokasi untuk ditampilkan
        const strLokasi = item.city + ', ' + item.province;
        
        // Hitung CFR (Case Fatality Rate): kematian/total kasus * 100
        const cfr = item.predicted_dbd_m > 0 && item.predicted_dbd_p > 0 
          ? (item.predicted_dbd_m / item.predicted_dbd_p) * 100 
          : 0;
        
        // Aturan: CFR > 0.5%
        if (cfr > 0.5) {
          peringatanTerdeteksi.push({
            id: `dbd-fatality-${item.month}-${item.year}-${item.city}`,
            tipe: 'fatality',
            lokasi: strLokasi,
            bulan: namaBulan[item.month - 1],
            tahun: item.year,
            metrik: 'Tingkat Kematian DBD (CFR)',
            nilai: cfr,
            tingkat: null,
            status_kenaikan: "",
            status_endemis: item.status_endemis
          });
        }
      });
    
      return peringatanTerdeteksi;
    };
    
    // Render pesan peringatan yang diformat untuk DBD
    const renderWarningMessage = (warning: Peringatan) => {
      return (
        <Text fw={500}>
          {warning.bulan} {warning.tahun}: {warning.metrik} di {warning.lokasi} mencapai {warning.nilai.toFixed(2)}% (melebihi ambang batas 0.5%)
        </Text>
      );
    };
  
    // Render rekomendasi penanganan berdasarkan peringatan
    const renderRekomendasi = () => {
      if (!peringatanTerpilih) return null;
  
      // Rekomendasi untuk DBD dengan CFR tinggi
      
      
      const itemPencegahan = [
        "Tingkatkan upaya pemberantasan sarang nyamuk dengan '3M Plus' (Menguras, Menutup, Mendaur ulang + langkah tambahan)",
        "Lakukan fogging fokus di daerah dengan kasus tinggi",
        "Mobilisasi jumantik (pemantau jentik) untuk pemeriksaan rutin di rumah-rumah",
        "Lakukan kampanye kesadaran masyarakat tentang tanda-tanda peringatan DBD"
      ];
      
      const itemPemantauan = [
        "Lakukan penyelidikan epidemiologi (PE) untuk setiap kasus kematian",
        "Tingkatkan surveilans aktif di daerah dengan CFR tinggi",
        "Siapkan fasilitas kesehatan dengan protokol manajemen dengue terkini",
        "Pantau ketersediaan produk darah untuk antisipasi kasus berat"
      ];
  
      return (
        <Stack gap={16}>
          <Accordion defaultValue="prevention">
            {/* <Accordion.Item value="treatment">
              <Accordion.Control>
                <Group>
                  <ThemeIcon color="red" variant="light" size="lg">
                    <IconAlertTriangle size={20} />
                  </ThemeIcon>
                  <Text fw={600}>Rekomendasi Penanganan Kasus</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <List
                  spacing="xs"
                  icon={
                    <ThemeIcon color="red" size={20} radius="xl">
                      <IconCheck size={14} />
                    </ThemeIcon>
                  }
                >
                  {itemPengobatan.map((item, index) => (
                    <List.Item key={index}>{item}</List.Item>
                  ))}
                </List>
              </Accordion.Panel>
            </Accordion.Item> */}
  
            <Accordion.Item value="prevention">
              <Accordion.Control>
                <Group>
                  <ThemeIcon color="blue" variant="light" size="lg">
                    <IconInfoCircle size={20} />
                  </ThemeIcon>
                  <Text fw={600}>Tindakan Pencegahan</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <List
                  spacing="xs"
                  icon={
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <IconCheck size={14} />
                    </ThemeIcon>
                  }
                >
                  {itemPencegahan.map((item, index) => (
                    <List.Item key={index}>{item}</List.Item>
                  ))}
                </List>
              </Accordion.Panel>
            </Accordion.Item>
  
            <Accordion.Item value="monitoring">
              <Accordion.Control>
                <Group>
                  <ThemeIcon color="orange" variant="light" size="lg">
                    <IconAlertTriangle size={20} />
                  </ThemeIcon>
                  <Text fw={600}>Surveilans & Pemantauan</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <List
                  spacing="xs"
                  icon={
                    <ThemeIcon color="orange" size={20} radius="xl">
                      <IconCheck size={14} />
                    </ThemeIcon>
                  }
                >
                  {itemPemantauan.map((item, index) => (
                    <List.Item key={index}>{item}</List.Item>
                  ))}
                </List>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          
          <Box mt="md">
            <Divider my="sm" />
            <Text size="sm" style={{ fontStyle: 'italic' }} color="dimmed">
              Catatan: Rekomendasi ini adalah panduan umum untuk area dengan tingkat kematian DBD yang tinggi. 
              Silakan konsultasikan dengan otoritas kesehatan setempat untuk protokol spesifik yang berlaku di wilayah Anda.
            </Text>
          </Box>
        </Stack>
      );
    };
  
    // Jika tidak ada peringatan yang terdeteksi, jangan render apa pun
    if (peringatan.length === 0) {
      return null;
    }
  
    return (
      <>
        {/* Peringatan utama */}
        <Alert 
          icon={<IconAlertTriangle size={24} />}
          title="Sistem Peringatan Dini DBD"
          color="red"
          radius="md"
          withCloseButton={false}
          mb="md"
        >
          <Text mb="xs">
            {peringatan.length} potensi {peringatan.length === 1 ? 'risiko DBD telah ' : 'risiko DBD telah '} 
            terdeteksi untuk 6 bulan ke depan berdasarkan model prediksi kami:
          </Text>
          
          <Stack gap="xs" mb="md">
            {/* Tampilkan 3 peringatan pertama */}
            {peringatan.slice(0, 3).map((warning) => (
              <Group key={warning.id} justify="space-between" align="flex-start" wrap="nowrap">
                <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
                  <ThemeIcon 
                    color={'red'} 
                    variant="light"
                  >
                    <IconAlertTriangle size={16} />
                  </ThemeIcon>
                  {renderWarningMessage(warning)}
                </Group>
                
                <Button 
                  variant="subtle" 
                  onClick={() => bukaRekomendasi(warning)}
                  style={{ flexShrink: 0, minWidth: '120px' }}
                >
                  <IconArrowRight size={16} />
                  Rekomendasi
                </Button>
              </Group>
            ))}
            
            {/* Tampilkan semua peringatan lainnya jika showAllWarnings = true */}
            {showAllWarnings && peringatan.slice(3).map((warning) => (
              <Group key={warning.id} justify="space-between">
                <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
                  <ThemeIcon 
                    color={'red'} 
                    variant="light"
                  >
                    <IconAlertTriangle size={16} />
                  </ThemeIcon>
                  {renderWarningMessage(warning)}
                </Group>
                
                <Button 
                  variant="subtle" 
                  onClick={() => bukaRekomendasi(warning)}
                >
                  <IconArrowRight size={16} />
                  Rekomendasi
                </Button>
              </Group>
            ))}
          </Stack>
          
          {peringatan.length > 3 && (
            <Button 
              color="red" 
              variant="outline"
              onClick={toggleSemuaPeringatan}
            >
              {showAllWarnings ? 'Tampilkan Lebih Sedikit' : `Lihat Semua ${peringatan.length} Peringatan`}
            </Button>
          )}
        </Alert>
  
        {/* Modal rekomendasi */}
        <Modal
          opened={isRekomendasiTerbuka}
          onClose={() => setIsRekomendasiTerbuka(false)}
          title={
            <Title order={4}>
              Rekomendasi Penanganan Demam Berdarah Dengue
            </Title>
          }
          size="lg"
        >
          {peringatanTerpilih && (
            <>
              <Alert 
                icon={<IconAlertTriangle size={20} />}
                color={'red'}
                mb="md"
              >
                {renderWarningMessage(peringatanTerpilih)}
              </Alert>
              
              {renderRekomendasi()}
            </>
          )}
        </Modal>
      </>
    );
  };
  
  export default EarlyWarningSystemDBD;