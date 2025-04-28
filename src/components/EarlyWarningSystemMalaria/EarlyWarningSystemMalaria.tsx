// EarlyWarningSystemMalaria.tsx
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
import { DataMalaria, EarlyWarningSystemMalariaProps, Peringatan } from '../../@types/dashboard';

// Mendefinisikan struktur untuk pesan peringatan


export const EarlyWarningSystemMalaria = ({ 
  data,latestActualMonthYear
}: EarlyWarningSystemMalariaProps) => {
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
    const peringatanBaru = deteksiPeringatan(data,latestActualMonthYear);
    setPeringatan(peringatanBaru);
  }, [data]);

  // Fungsi untuk memetakan status endemis ke tipe aturan
  const dapatkanTipeAturanEndemis = (statusEndemis: string): 'eliminasi' | 'endemis_rendah' | 'endemis_sedang' | 'endemis_tinggi' => {
    if (statusEndemis.includes('Eliminasi')) {
      return 'eliminasi';
    } else if (statusEndemis.includes('Endemis Rendah')) {
      return 'endemis_rendah';
    } else if (statusEndemis.includes('Endemis Sedang')) {
      return 'endemis_sedang';
    } else if (statusEndemis.includes('Endemis Tinggi')) {
      return 'endemis_tinggi';
    }
    
    // Kasus default jika tidak ada yang cocok
    return 'endemis_sedang';
  };

  const deteksiPeringatan = (
    data: DataMalaria[],
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
  
    // Terapkan aturan peringatan malaria berdasarkan status endemis
    dataPrediksi.forEach(item => {
      const namaBulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      
      // Dapatkan tipe aturan endemis untuk item
      const tipeAturanEndemis = dapatkanTipeAturanEndemis(item.status_endemis);
      
      // String lokasi untuk ditampilkan
      const strLokasi = item.city +', '+ item.province;
      
      // Hitung ambang batas berdasarkan aturan yang baru:
      // 1. Daerah Eliminasi: minimal 1 kasus indigenous
      // 2. Daerah endemis rendah: 2*kasus indigenous dari bulan sebelumnya atau bulan yang sama tahun lalu (100% mtom atau yony)
      // 3. Daerah endemis sedang dan tinggi: 2*kasus apapun (100% mtom atau yony)
      if (tipeAturanEndemis === 'eliminasi' && item.predicted_penularan_indigenus >= 1) {
        peringatanTerdeteksi.push({
          id: `malaria-eliminasi-${item.month}-${item.year}`,
          tipe: 'indigenous',
          lokasi: strLokasi,
          bulan: namaBulan[item.month - 1],
          tahun: item.year,
          metrik: 'Kasus Penularan Lokal',
          nilai: item.predicted_penularan_indigenus,
          tingkat: item.predicted_penularan_indigenus_m_to_m_change,
          status_kenaikan: "",
        //   ambang_batas: 1,
        //   tingkat_keparahan: 'tinggi',
          status_endemis:item.status_endemis
        });
      } 
      else if (tipeAturanEndemis === 'endemis_rendah' && (item.predicted_penularan_indigenus_m_to_m_change !== null && item.predicted_penularan_indigenus_m_to_m_change >= 100)) {
        // Untuk daerah endemis rendah: 2*kasus indigenous
        peringatanTerdeteksi.push({
          id: `malaria-endemis-low-${item.month}-${item.year}`,
          tipe: 'indigenous',
          lokasi: strLokasi,
          bulan: namaBulan[item.month - 1],
          tahun: item.year,
          metrik: 'Kasus Penularan Lokal',
          nilai: item.predicted_penularan_indigenus,
          tingkat: item.predicted_penularan_indigenus_m_to_m_change,
          status_kenaikan: "dari bulan sebelumnya",
        //   tingkat_keparahan: 'sedang',
          status_endemis:item.status_endemis
        });
      }
      else if (tipeAturanEndemis === 'endemis_rendah' && (item.predicted_penularan_indigenus_y_on_y_change !== null && item.predicted_penularan_indigenus_y_on_y_change >= 100)) {
        // Untuk daerah endemis rendah: 2*kasus indigenous
        peringatanTerdeteksi.push({
          id: `malaria-endemis-low-${item.month}-${item.year}`,
          tipe: 'indigenous',
          lokasi: strLokasi,
          bulan: namaBulan[item.month - 1],
          tahun: item.year,
          metrik: 'Kasus Penularan Lokal',
          nilai: item.predicted_penularan_indigenus,
          tingkat: item.predicted_penularan_indigenus_y_on_y_change,
          status_kenaikan: "dari bulan yang sama di tahun sebelumnya",
        //   tingkat_keparahan: 'sedang',
          status_endemis:item.status_endemis
        });
      } 
      else if ((tipeAturanEndemis === 'endemis_sedang' || tipeAturanEndemis === 'endemis_tinggi') && (item.predicted_tot_pos_m_to_m_change !== null && item.predicted_tot_pos_m_to_m_change >= 100)) {
        // Untuk daerah endemis rendah: 2*kasus indigenous
        peringatanTerdeteksi.push({
          id: `malaria-endemis-low-${item.month}-${item.year}`,
          tipe: 'indigenous',
          lokasi: strLokasi,
          bulan: namaBulan[item.month - 1],
          tahun: item.year,
          metrik: 'Kasus Penularan Lokal',
          nilai: item.predicted_tot_pos_m_to_m_change,
          tingkat: item.predicted_tot_pos_m_to_m_change,
          status_kenaikan: "dari bulan sebelumnya",
        //   tingkat_keparahan: 'sedang',
          status_endemis:item.status_endemis
        });
      }
      else if ((tipeAturanEndemis === 'endemis_sedang' || tipeAturanEndemis === 'endemis_tinggi') && (item.predicted_tot_pos_y_on_y_change !== null && item.predicted_tot_pos_y_on_y_change >= 100)) {
        // Untuk daerah endemis rendah: 2*kasus indigenous
        peringatanTerdeteksi.push({
          id: `malaria-endemis-low-${item.month}-${item.year}`,
          tipe: 'indigenous',
          lokasi: strLokasi,
          bulan: namaBulan[item.month - 1],
          tahun: item.year,
          metrik: 'Kasus Penularan Lokal',
          nilai: item.predicted_penularan_indigenus,
          tingkat: item.predicted_tot_pos_y_on_y_change,
          status_kenaikan: "dari bulan yang sama di tahun sebelumnya",
        //   tingkat_keparahan: 'sedang',
          status_endemis:item.status_endemis
        });
      } 
    });
  
    return peringatanTerdeteksi;
  };

  // Render pesan peringatan yang diformat berdasarkan status endemis
  const renderWarningMessage = (warning: Peringatan) => {
    const tipeAturanEndemis = dapatkanTipeAturanEndemis(warning.status_endemis);
    
    // Format pesan untuk daerah eliminasi
    if (tipeAturanEndemis === 'eliminasi') {
      return (
        <Text fw={500}>
          {warning.bulan} {warning.tahun}: Terdeteksi {warning.nilai !== null ? (warning.nilai % 1 === 0 ? Math.floor(warning.nilai) : warning.nilai.toFixed(1)) : 'N/A'} kasus penularan lokal di {warning.lokasi} (Daerah {warning.status_endemis})
        </Text>
      );
    }
    
    // Format pesan untuk daerah endemis rendah (month-to-month)
    else if (tipeAturanEndemis === 'endemis_rendah' && warning.status_kenaikan.includes('bulan sebelumnya')) {
      return (
        <Text fw={500}>
          {warning.bulan} {warning.tahun}: Penularan lokal di {warning.lokasi} meningkat {warning.tingkat !== null ? (warning.tingkat % 1 === 0 ? Math.floor(warning.tingkat) : warning.tingkat.toFixed(1)) : 'N/A'}% dari bulan sebelumnya (Daerah {warning.status_endemis})
        </Text>
      );
    }
    
    // Format pesan untuk daerah endemis rendah (year-on-year)
    else if (tipeAturanEndemis === 'endemis_rendah' && warning.status_kenaikan.includes('tahun sebelumnya')) {
      return (
        <Text fw={500}>
          {warning.bulan} {warning.tahun}: Penularan lokal di {warning.lokasi} meningkat {warning.tingkat !== null ? (warning.tingkat % 1 === 0 ? Math.floor(warning.tingkat) : warning.tingkat.toFixed(1)) : 'N/A'}% dibanding periode yang sama tahun lalu (Daerah {warning.status_endemis})
        </Text>
      );
    }
    
    // Format pesan untuk daerah endemis sedang/tinggi (month-to-month)
    else if ((tipeAturanEndemis === 'endemis_sedang' || tipeAturanEndemis === 'endemis_tinggi') && warning.status_kenaikan.includes('bulan sebelumnya')) {
      return (
        <Text fw={500}>
          {warning.bulan} {warning.tahun}: Total kasus malaria di {warning.lokasi} meningkat {warning.tingkat !== null ? (warning.tingkat % 1 === 0 ? Math.floor(warning.tingkat) : warning.tingkat.toFixed(1)) : 'N/A'}% dari bulan sebelumnya (Daerah {warning.status_endemis})
        </Text>
      );
    }
    
    // Format pesan untuk daerah endemis sedang/tinggi (year-on-year)
    else if ((tipeAturanEndemis === 'endemis_sedang' || tipeAturanEndemis === 'endemis_tinggi') && warning.status_kenaikan.includes('tahun sebelumnya')) {
      return (
        <Text fw={500}>
          {warning.bulan} {warning.tahun}: Total kasus malaria di {warning.lokasi} meningkat {warning.tingkat !== null ? (warning.tingkat % 1 === 0 ? Math.floor(warning.tingkat) : warning.tingkat.toFixed(1)) : 'N/A'}% dibanding periode yang sama tahun lalu (Daerah {warning.status_endemis})
        </Text>
      );
    }
    
    // Format default jika tidak ada yang cocok
    return (
      <Text fw={500}>
        {warning.bulan} {warning.tahun}: {warning.metrik} di {warning.lokasi} 
        {warning.status_endemis.includes('Eliminasi') 
            ? ` terjadi penularan indigenous sebesar ${warning.nilai !== null ? (warning.nilai % 1 === 0 ? Math.floor(warning.nilai) : warning.nilai.toFixed(1)) : 'N/A'}% (${warning.status_endemis})`
            : ` mengalami peningkatan sebesar ${warning.tingkat !== null ? (warning.tingkat % 1 === 0 ? Math.floor(warning.tingkat) : warning.tingkat.toFixed(1)) : 'N/A'}% ${warning.status_kenaikan} (${warning.status_endemis})`}
      </Text>
    );
  };

  // Render rekomendasi pengobatan berdasarkan peringatan
  const renderRekomendasi = () => {
    if (!peringatanTerpilih) return null;

    // Dapatkan rekomendasi yang sesuai berdasarkan tipe peringatan
    let itemRekomendasi = [];
    let itemPencegahan = [];
    let itemPemantauan = [];

    // Rekomendasi untuk malaria
    itemRekomendasi = [
      "Segera mulai terapi kombinasi berbasis artemisinin (ACT) untuk semua kasus yang terkonfirmasi",
      "Berikan primakuin untuk Plasmodium vivax dan P. ovale untuk mencegah kambuh",
      "Pastikan kursus pengobatan lengkap 14 hari untuk penyembuhan radikal",
      "Skrining ibu hamil untuk malaria dan berikan pengobatan yang sesuai berdasarkan trimester"
    ];
    
    itemPencegahan = [
      "Distribusikan kelambu berinsektisida (ITN) kepada populasi berisiko tinggi",
      "Lakukan penyemprotan residual dalam ruangan (IRS) di daerah yang terkena dampak",
      "Bersihkan genangan air dan lokasi potensi perkembangbiakan nyamuk",
      "Implementasikan program edukasi masyarakat tentang pencegahan malaria"
    ];
    
    itemPemantauan = [
      "Siapkan deteksi kasus aktif di area tersebut",
      "Tingkatkan pengawasan untuk penularan lokal",
      "Pantau pola resistensi obat",
      "Lacak kepadatan dan perilaku vektor"
    ];

    // Tambahkan rekomendasi khusus untuk tipe
    if (peringatanTerpilih.tipe === 'indigenous') {
      itemRekomendasi.push(
        "Fokus pada identifikasi dan pengobatan semua individu di komunitas lokal yang terkena dampak",
        "Implementasikan administrasi obat massal jika beberapa kasus terdeteksi dalam satu komunitas"
      );
      itemPemantauan.push(
        "Tingkatkan surveilans entomologi di daerah penularan lokal",
        "Lakukan pemetaan tempat perkembangbiakan di komunitas yang terkena dampak"
      );
    }

    return (
      <Stack gap={16}>
        <Accordion defaultValue="monitoring">
          {/* <Accordion.Item value="treatment">
            <Accordion.Control>
              <Group>
                <ThemeIcon color="red" variant="light" size="lg">
                  <IconAlertOctagon size={20} />
                </ThemeIcon>
                <Text fw={600}>Rekomendasi Pengobatan</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <List
                spacing="xs"
                icon={
                  <ThemeIcon color="green" size={20} radius="xl">
                    <IconCheck size={14} />
                  </ThemeIcon>
                }
              >
                {itemRekomendasi.map((item, index) => (
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
            Catatan: Rekomendasi ini adalah panduan umum. Silakan konsultasikan dengan otoritas kesehatan setempat 
            untuk protokol spesifik yang berlaku di wilayah Anda.
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
      title="Sistem Peringatan Dini"
      color="red"
      radius="md"
      withCloseButton={false}
      mb="md"
    >
      <Text mb="xs">
        {peringatan.length} potensi {peringatan.length === 1 ? 'risiko telah ' : 'risiko telah '} 
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

    {/* Modal rekomendasi tetap sama seperti sebelumnya */}
    <Modal
      opened={isRekomendasiTerbuka}
      onClose={() => setIsRekomendasiTerbuka(false)}
      title={
        <Title order={4}>
          Rekomendasi Penanganan Malaria
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

export default EarlyWarningSystemMalaria;