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
    console.log('Peringatan baru:', peringatanBaru);
    console.log('Data:', data);
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
    console.log('Bulan dan tahun terakhir:', bulanTerakhir, tahunTerakhir);
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
        console.log(item)
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
      // 2. Daerah endemis rendah: 2*kasus indigenous
      // 3. Daerah endemis sedang dan tinggi: 2*kasus apapun
      if (tipeAturanEndemis === 'eliminasi' && item.predicted_penularan_indigenus >= 1) {
        peringatanTerdeteksi.push({
          id: `malaria-eliminasi-${item.month}-${item.year}`,
          tipe: 'indigenous',
          lokasi: strLokasi,
          bulan: namaBulan[item.month - 1],
          tahun: item.year,
          metrik: 'Kasus Penularan Lokal',
          nilai: item.predicted_penularan_indigenus,
          mtom: item.predicted_penularan_indigenus_m_to_m_change,
        //   ambang_batas: 1,
        //   tingkat_keparahan: 'tinggi',
          status_endemis:item.status_endemis
        });
      } 
      else if (tipeAturanEndemis === 'endemis_rendah' && item.predicted_penularan_indigenus_m_to_m_change !== null && item.predicted_penularan_indigenus_m_to_m_change >= 100) {
        // Untuk daerah endemis rendah: 2*kasus indigenous
        peringatanTerdeteksi.push({
          id: `malaria-endemis-low-${item.month}-${item.year}`,
          tipe: 'indigenous',
          lokasi: strLokasi,
          bulan: namaBulan[item.month - 1],
          tahun: item.year,
          metrik: 'Kasus Penularan Lokal',
          nilai: item.predicted_penularan_indigenus,
          mtom: item.predicted_penularan_indigenus_m_to_m_change,
        //   ambang_batas: 2,
        //   tingkat_keparahan: 'sedang',
          status_endemis:item.status_endemis
        });
      } 
      else if (tipeAturanEndemis === 'endemis_sedang' && item.predicted_penularan_indigenus >= 2) {
        // Untuk daerah endemis sedang: 2*kasus indigenous
        peringatanTerdeteksi.push({
          id: `malaria-endemis-med-${item.month}-${item.year}`,
          tipe: 'indigenous',
          lokasi: strLokasi,
          bulan: namaBulan[item.month - 1],
          tahun: item.year,
          metrik: 'Kasus Penularan Lokal',
          nilai: item.predicted_penularan_indigenus,
          mtom: item.predicted_penularan_indigenus_m_to_m_change,
        //   ambang_batas: 2,
        //   tingkat_keparahan: 'sedang',
          status_endemis: item.status_endemis
        });
      }
      else if (tipeAturanEndemis === 'endemis_tinggi' && item.predicted_penularan_indigenus >= 2) {
        // Untuk daerah endemis tinggi: 2*kasus indigenous
        peringatanTerdeteksi.push({
          id: `malaria-endemis-high-${item.month}-${item.year}`,
          tipe: 'indigenous',
          lokasi: strLokasi,
          bulan: namaBulan[item.month - 1],
          tahun: item.year,
          metrik: 'Kasus Penularan Lokal',
          nilai: item.predicted_penularan_indigenus,
          mtom: item.predicted_penularan_indigenus_m_to_m_change,
        //   ambang_batas: 2,
        //   tingkat_keparahan: 'sedang',
          status_endemis: item.status_endemis
        });
      }
    });
  
    return peringatanTerdeteksi;
  };

  // Fungsi pembantu untuk mendapatkan string lokasi yang diformat
  

  

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
    } else if (peringatanTerpilih.tipe === 'fatality') {
      itemRekomendasi.push(
        "Segera tinjau protokol manajemen klinis",
        "Audit semua kasus kematian malaria untuk mengidentifikasi potensi masalah sistemik",
        "Pastikan ketersediaan persediaan pengobatan malaria berat (artesunat intravena)"
      );
      itemPemantauan.push(
        "Pantau kepatuhan pengobatan dan tindak lanjut kasus berat",
        "Lacak komorbiditas yang terkait dengan hasil fatal"
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
          <Group key={warning.id} justify="space-between">
            <Group gap="xs">
              <ThemeIcon 
                color={'red'} 
                variant="light"
              >
                <IconAlertTriangle size={16} />
              </ThemeIcon>
              <Text size="sm">
                {warning.bulan} {warning.tahun}: {warning.metrik} di {warning.lokasi}  
                {warning.tipe === 'fatality' 
                  ? ` diprediksi sebesar ${warning.nilai.toFixed(2)} kasus yang mana mengalami peningkatan sebesar ${warning.mtom !== null ? warning.mtom.toFixed(2) : 'N/A'} % dari bulan sebelumnya (Status Endemis: ${warning.status_endemis}%)`
                  : ` diprediksi sebesar ${warning.nilai} kasus yang mana mengalami peningkatan sebesar ${warning.mtom !== null ? warning.mtom.toFixed(2) : 'N/A'} % dari bulan sebelumnya (Status Endemis: ${warning.status_endemis} )`}
              </Text>
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
        
        {/* Tampilkan semua peringatan lainnya jika showAllWarnings = true */}
        {showAllWarnings && peringatan.slice(3).map((warning) => (
          <Group key={warning.id} justify="space-between">
            <Group gap="xs">
              <ThemeIcon 
                color={'red'} 
                variant="light"
              >
                <IconAlertTriangle size={16} />
              </ThemeIcon>
              <Text size="sm">
                {warning.bulan} {warning.tahun}: {warning.metrik} di {warning.lokasi} 
                {warning.tipe === 'fatality' 
                  ? ` diprediksi sebesar ${warning.nilai.toFixed(2)} kasus yang mana mengalami peningkatan sebesar ${warning.mtom !== null ? warning.mtom.toFixed(2) : 'N/A'} % dari bulan sebelumnya (Status Endemis: ${warning.status_endemis}%)`
                  : ` diprediksi sebesar ${warning.nilai} kasus yang mana mengalami peningkatan sebesar ${warning.mtom !== null ? warning.mtom.toFixed(2) : 'N/A'} % dari bulan sebelumnya (Status Endemis: ${warning.status_endemis} )`}
              </Text>
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
            <Text fw={500}>
              {peringatanTerpilih.bulan} {peringatanTerpilih.tahun}: {peringatanTerpilih.metrik} di {peringatanTerpilih.lokasi} 
              {peringatanTerpilih.tipe === 'fatality' 
                  ? ` diprediksi sebesar ${peringatanTerpilih.nilai.toFixed(2)} kasus yang mana mengalami peningkatan sebesar ${peringatanTerpilih.mtom !== null ? peringatanTerpilih.mtom.toFixed(2) : 'N/A'} % dari bulan sebelumnya (Status Endemis: ${peringatanTerpilih.status_endemis}%)`
                  : ` diprediksi sebesar ${peringatanTerpilih.nilai} kasus yang mana mengalami peningkatan sebesar ${peringatanTerpilih.mtom !== null ? peringatanTerpilih.mtom.toFixed(2) : 'N/A'} % dari bulan sebelumnya (Status Endemis: ${peringatanTerpilih.status_endemis} )`}            </Text>
          </Alert>
          
          {renderRekomendasi()}
        </>
      )}
    </Modal>
    </>
  );
};

export default EarlyWarningSystemMalaria;