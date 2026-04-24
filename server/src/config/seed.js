const bcrypt = require('bcryptjs');
const db = require('./database');

const seed = () => {
  seedCategories();
  seedItems();
  seedUsers();
};

const seedCategories = () => {
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (categoryCount.count > 0) return;

  const insertCategory = db.prepare('INSERT INTO categories (name, description, color) VALUES (?, ?, ?)');
  const categories = [
    ['Benih', 'Bibit tanaman untuk ditanam', '#22c55e'],
    ['Pupuk', 'Pupuk untuk kesuburan tanah', '#84cc16'],
    ['Pestisida', 'Pengendali hama tanaman', '#ef4444'],
    ['Alat Pertanian', 'Peralatan bertani dan berkebun', '#f59e0b'],
    ['Hasil Panen', 'Produk pertanian segar', '#10b981'],
    ['Hardware', 'Suku cadang dan perlengkapan', '#6366f1'],
    ['Peternakan', 'Produk dan perlengkapan hewan', '#8b5cf6']
  ];
  categories.forEach(c => insertCategory.run(c[0], c[1], c[2]));
};

const seedItems = () => {
  const itemCount = db.prepare('SELECT COUNT(*) as count FROM items').get();
  if (itemCount.count > 0) return;

  const insertItem = db.prepare(`
    INSERT INTO items (name, quantity, purchase_price, selling_price, unit, category_id, low_stock_threshold, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const items = [
    // Benih Sayuran
    ['Benih Bawang Merah', 200, 45000, 55000, 'pack', 1, 30, 'Benih bawang merah unggul varietas lokal'],
    ['Benih Cabai Rawit', 150, 35000, 45000, 'pack', 1, 25, 'Benih cabai rawit hibrida hasil tinggi'],
    ['Benih Cabai Merah', 150, 40000, 50000, 'pack', 1, 25, 'Benih cabai merah keriting'],
    ['Benih Tomat', 180, 25000, 32000, 'pack', 1, 30, 'Benih tomat cherry hasil tinggi'],
    ['Benih Tomat Hybrid', 120, 55000, 70000, 'pack', 1, 20, 'Benih tomat hibrida抗病品种'],
    ['Benih Kangkung', 250, 18000, 25000, 'pack', 1, 40, 'Benih kangkung dataran tinggi'],
    ['Benih Bayam', 200, 15000, 22000, 'pack', 1, 35, 'Benih bayam hijau'],
    ['Benih Pakcoy', 180, 20000, 28000, 'pack', 1, 30, 'Benih pakcoy suling'],
    ['Benih Brokoli', 100, 65000, 80000, 'pack', 1, 15, 'Benih brokoli hibrida'],
    ['Benih Kol', 120, 45000, 58000, 'pack', 1, 20, 'Benih kol snowball'],
    ['Benih Wortel', 150, 55000, 70000, 'pack', 1, 25, 'Benih wortel nantes'],
    ['Benih Lobak', 130, 40000, 52000, 'pack', 1, 20, 'Benih lobak putih'],
    ['Benih Buncis', 160, 28000, 38000, 'pack', 1, 25, 'Benih buncis tegak'],
    ['Benih Kedelai', 200, 35000, 45000, 'pack', 1, 30, 'Benih kedelai edible'],
    ['Benih Jagung Manis', 180, 28000, 38000, 'pack', 1, 25, 'Benih jagung manis hibrida'],
    ['Benih Semangka', 80, 45000, 60000, 'pack', 1, 15, 'Benih semangka merah tanpa biji'],
    ['Benih Melon', 75, 55000, 72000, 'pack', 1, 12, 'Benih melon golden apollo'],
    ['Benih Timun', 200, 22000, 30000, 'pack', 1, 30, 'Benih timun hybrid'],
    ['Benih Terong', 140, 32000, 42000, 'pack', 1, 20, 'Benih terong panjang'],
    ['Benih Labu Siam', 110, 25000, 35000, 'pack', 1, 18, 'Benih labu siam berkualitas'],

    // Pupuk
    ['Pupuk Urea', 500, 65000, 80000, 'sak', 2, 80, 'Pupuk urea 46% nitrogen untuk pertumbuhan vegetatif'],
    ['Pupuk NPK Phonska', 400, 75000, 92000, 'sak', 2, 60, 'Pupuk NPK 15-15-15 lengkap untuk semua tanaman'],
    ['Pupuk NPK Mutiara', 350, 95000, 115000, 'sak', 2, 50, 'Pupuk NPK 16-16-16 tinggi kualitas'],
    ['Pupuk Organik Petrokompos', 300, 45000, 58000, 'sak', 2, 45, 'Pupuk organik dari limbah pertanian'],
    ['Pupuk Kandang Sapi', 250, 35000, 48000, 'sak', 2, 40, 'Pupuk kotoran sapi matang fermentasi'],
    ['Pupuk Kandang Ayam', 200, 42000, 55000, 'sak', 2, 35, 'Pupuk kotoran ayam tinggi nitrogen'],
    ['Pupuk Kompos Jerami', 280, 32000, 45000, 'sak', 2, 45, 'Kompos jerami padi kaya hara'],
    ['Pupuk Dolomit', 180, 28000, 38000, 'sak', 2, 30, 'Kapur pertanian untuk penetral tanah asam'],
    ['Pupuk Zeolit', 150, 38000, 50000, 'sak', 2, 25, 'Penambat nitrogen dan penyerap air'],
    ['Pupuk KCl Muriate of Potash', 200, 85000, 105000, 'sak', 2, 35, 'Pupuk kalium klorida untuk buah dan bunga'],
    ['Pupuk SP-36 Superphos', 180, 78000, 98000, 'sak', 2, 30, 'Pupuk fosfat tinggi untuk akar'],
    ['Pupuk ZA Zwavelzure Amonium', 220, 58000, 72000, 'sak', 2, 40, 'Pupuk nitrogen bersulfur'],
    ['Pupuk Bokhasi', 250, 40000, 52000, 'sak', 2, 40, 'Pupuk organik fermentasi aktif'],
    ['Pupuk Cair NPK', 120, 120000, 150000, 'liter', 2, 20, 'Pupuk cair lengkap untuk semprot daun'],
    ['Pupuk Гуминовые кислоты', 100, 85000, 110000, 'liter', 2, 15, 'Pupuk asam humat untuk akar'],
    ['Pupuk MKP Monopotassium Phosphate', 90, 95000, 120000, 'kg', 2, 15, 'Pupuk fosfat-kalium untuk pembungaan'],
    ['Pupuk Calcium Nitrate', 110, 88000, 110000, 'sak', 2, 20, 'Pupuk kalsium nitrat untuk buah'],
    ['Pupuk Magnesium Sulfat', 100, 65000, 85000, 'kg', 2, 18, 'Pupuk magnesium untuk klorofil'],
    ['PupukAB Mix Hidroponik', 80, 150000, 185000, 'set', 2, 15, 'Pupuk lengkap untuk sistem hidroponik'],

    // Pestisida
    ['Decis 25 EC', 100, 85000, 110000, 'liter', 3, 15, 'Insektisida untuk ulat dan wereng'],
    ['Dursban 75 SP', 80, 125000, 155000, 'pack', 3, 12, 'Insektisida sistemik spektrum luas'],
    ['Confidor 70 WG', 75, 180000, 220000, 'pack', 3, 10, 'Insektisida untuk hiba penghisap'],
    ['Matador 25 EC', 90, 78000, 100000, 'liter', 3, 15, 'Insektisida piretroid untuk kutu'],
    ['Curacron 500 EC', 85, 145000, 180000, 'liter', 3, 12, 'Insektisida untuk ulat grayak'],
    ['Applaud 40 SC', 70, 165000, 200000, 'liter', 3, 10, 'Insektisida untuk wereng coklat'],
    ['Applaud 25 WP', 65, 135000, 170000, 'pack', 3, 10, 'Insektisida untuk pengganggu tanaman'],
    ['Regent 50 SC', 60, 195000, 240000, 'liter', 3, 8, 'Insektisida sistemik untuk kutu dan thrips'],
    ['Strike 150 EC', 80, 92000, 120000, 'liter', 3, 12, 'Insektisida piretroid kontak cepat'],
    ['Avatar 50 EC', 70, 105000, 135000, 'liter', 3, 10, 'Insektisida untuk hama daun'],
    ['Cypermethrin 100 EC', 90, 65000, 85000, 'liter', 3, 15, 'Insektisida umum untuk berbagai hama'],
    ['Fenitrothion 50 EC', 75, 75000, 95000, 'liter', 3, 12, 'Insektisida untuk ulat dan belalang'],
    ['Monocrotophos 60 SC', 60, 110000, 140000, 'liter', 3, 10, 'Insektisida sistemik untuk wereng'],
    ['Cartap 50 SP', 85, 88000, 115000, 'pack', 3, 12, 'Insektisida untuk penggerek batang'],
    ['Basta 15 SL', 50, 175000, 215000, 'liter', 3, 8, 'Herbisida untuk rumput liar'],
    ['Roundup 480 AS', 60, 125000, 160000, 'liter', 3, 10, 'Herbisida glifosat untuk semua gulma'],
    ['Gramoxone 276 SL', 55, 145000, 180000, 'liter', 3, 8, 'Herbisida kontak cepat untuk gulma'],

    // Fungisida
    ['Antracol 70 WP', 80, 85000, 110000, 'pack', 3, 12, 'Fungisida untuk penyakit layu'],
    ['Rovral 50 WP', 70, 120000, 150000, 'pack', 3, 10, 'Fungisida untuk busuk buah'],
    ['Dithane M-45 80 WP', 90, 78000, 100000, 'pack', 3, 15, 'Fungisida mankozeb untuk pencegahan'],
    ['Kocide 53 WP', 75, 95000, 125000, 'pack', 3, 12, 'Fungisida tembaga untuk bakteri'],
    ['Score 250 EC', 65, 145000, 180000, 'liter', 3, 10, 'Fungisida sistemik untuk penyakit daun'],
    ['Topas 100 EC', 60, 165000, 205000, 'liter', 3, 8, 'Fungisida untuk embun tepung'],
    ['Aliette 80 WP', 55, 185000, 230000, 'pack', 3, 8, 'Fungisida untuk penyakit akar'],
    ['Ridomil Gold 68 WG', 70, 175000, 215000, 'pack', 3, 10, 'Fungisida untuk downy mildew'],
    ['Strobi 50 WG', 50, 220000, 270000, 'pack', 3, 8, 'Fungisida strobilurin untuk berbagai penyakit'],
    ['Calixin 86 EC', 60, 135000, 170000, 'liter', 3, 10, 'Fungisida untuk karat daun'],
    ['Nativo 325 SC', 55, 195000, 240000, 'liter', 3, 8, 'Fungisida kombinasi untuk комплекс penyakit'],
    ['Folicur 250 EC', 65, 155000, 190000, 'liter', 3, 10, 'Fungisida untuk penyakit buah'],

    // Alat Pertanian
    ['Cangkul Besi', 50, 85000, 115000, 'pcs', 4, 10, 'Cangkul untuk pengolahan tanah'],
    ['Sekop Taman', 40, 75000, 98000, 'pcs', 4, 8, 'Sekop untuk mengambil tanah'],
    ['Garpu Tanah', 35, 95000, 125000, 'pcs', 4, 7, 'Garpu untuk menggemburkan tanah'],
    ['Sabit', 60, 35000, 48000, 'pcs', 4, 12, 'Sabit untuk memotong rumput'],
    ['Parang', 45, 55000, 75000, 'pcs', 4, 8, 'Parang untuk membersihkan lahan'],
    ['Gergaji Pohon', 25, 125000, 165000, 'pcs', 4, 5, 'Gergaji untuk memotong dahan'],
    ['Pisau Potong现代农业', 80, 25000, 35000, 'pcs', 4, 15, 'Pisau tajam untuk panen'],
    ['Sprayer Tanaman 16L', 30, 185000, 240000, 'pcs', 4, 5, 'Semprotan punggung 16 liter'],
    ['Sprayer Tanaman 20L', 25, 225000, 290000, 'pcs', 4, 4, 'Semprotan punggung 20 liter'],
    ['Selang Air 30m', 40, 95000, 125000, 'roll', 4, 8, 'Selang PVC 30 meter'],
    ['Selang Watering Can', 50, 45000, 62000, 'pcs', 4, 10, 'Selang dengan nozzle semprot'],
    ['Nozzle Semprot', 100, 15000, 22000, 'pcs', 4, 20, 'Nosel penyemer untuk berbagai pattern'],
    ['Traktor Mini', 5, 8500000, 10500000, 'pcs', 4, 1, 'Traktor kecil untuk sawah 2 ha'],
    ['Mesin Pemotong Rumput', 15, 1200000, 1500000, 'pcs', 4, 2, 'Mesin potong rumput bensin'],
    ['Timba Plastic 20L', 80, 28000, 38000, 'pcs', 4, 15, 'Timba plastik untuk air dan pupuk'],
    ['Gembor Taman', 60, 35000, 48000, 'pcs', 4, 12, 'Gembor untuk menyiram tanaman'],
    ['Handsprayer 5L', 45, 85000, 115000, 'pcs', 4, 8, 'Semprotan tangan 5 liter'],
    ['Plastik Mulsa', 100, 65000, 85000, 'roll', 4, 20, 'Mulsa plastik hitam perak 100m'],
    ['Tali Raffia', 150, 18000, 25000, 'roll', 4, 30, 'Tali raffia untuk mengikat tanaman'],
    ['Kawat Pengikat', 80, 25000, 35000, 'kg', 4, 15, 'Kawat untuk penopang tanaman'],

    // Hasil Panen
    ['Cabai Rawit Segar', 100, 25000, 35000, 'kg', 5, 20, 'Cabai rawit panen sendiri'],
    ['Cabai Merah Keriting', 80, 32000, 45000, 'kg', 5, 15, 'Cabai merah segar berkualitas'],
    ['Tomat Segar', 120, 12000, 18000, 'kg', 5, 25, 'Tomat matang dari kebun'],
    ['Bawang Merah', 90, 28000, 38000, 'kg', 5, 18, 'Bawang merah premium'],
    ['Kangkung Segar', 150, 8000, 12000, 'kg', 5, 30, 'Kangkung dataran tinggi segar'],
    ['Bayam Segar', 140, 7000, 11000, 'kg', 5, 28, 'Bayam hijau segar'],
    ['Wortel Segar', 80, 18000, 25000, 'kg', 5, 16, 'Wortel nantes segar'],
    ['Kentang Segar', 100, 15000, 22000, 'kg', 5, 20, 'Kentang granul segar'],
    ['Jagung Manis', 120, 8000, 12000, 'pcs', 5, 25, 'Jagung manis panen pagi'],
    ['Ubi Jalar', 90, 10000, 15000, 'kg', 5, 18, 'Ubi jalar orange segar'],
    ['Singkong', 100, 6000, 10000, 'kg', 5, 20, 'Singkong segar berkualitas'],
    ['Kedelai Biji', 70, 22000, 30000, 'kg', 5, 14, 'Kedelai edible siap olah'],
    ['Kacang Tanah', 60, 28000, 38000, 'kg', 5, 12, 'Kacang tanah带走壳'],
    ['Semangka', 80, 12000, 18000, 'pcs', 5, 15, 'Semangka merah manis'],
    ['Melon', 50, 18000, 25000, 'pcs', 5, 10, 'Melon golden apollo'],
    ['Timun Segar', 110, 7000, 11000, 'kg', 5, 22, 'Timun segar crispy'],
    ['Terong Ungu', 85, 9000, 14000, 'kg', 5, 17, 'Terong ungu segar'],
    ['Labu Siam', 75, 8000, 12000, 'kg', 5, 15, 'Labu siam muda segar'],
    ['Pakcoy Segar', 100, 10000, 15000, 'kg', 5, 20, 'Pakcoy segar import'],
    ['Brokoli Segar', 60, 25000, 35000, 'kg', 5, 12, 'Brokoli hijau segar'],

    // Hardware
    ['Pipa PVC 3 inci', 50, 45000, 60000, 'batang', 6, 10, 'Pipa air PVC 3 inci 4m'],
    ['Pipa PVC 2 inci', 70, 32000, 45000, 'batang', 6, 15, 'Pipa air PVC 2 inci 4m'],
    ['Sambungan PVC 3 inci', 100, 12000, 18000, 'pcs', 6, 20, 'Sock PVC 3 inci'],
    ['Sambungan PVC 2 inci', 120, 8500, 13000, 'pcs', 6, 25, 'Elbow PVC 2 inci'],
    ['Kran Air 1/2 inci', 80, 15000, 22000, 'pcs', 6, 15, 'Kran air stainless'],
    ['Kran Air 3/4 inci', 60, 18000, 26000, 'pcs', 6, 12, 'Kran air besar 3/4 inci'],
    ['Selang PVC 1/2 inci', 80, 18000, 25000, 'meter', 6, 15, 'Selang air fleksibel 1/2 inci'],
    ['Dop PVC 3 inci', 90, 5000, 8000, 'pcs', 6, 18, 'Dop penutup pipa PVC 3 inci'],
    ['Lem PVC', 60, 22000, 30000, 'kaleng', 6, 12, 'Lem PVC untuk penyambungan'],
    ['Teflon Seal', 150, 5000, 8000, 'roll', 6, 30, 'Pita seal anti bocor'],
    ['Kawat Duri', 40, 85000, 110000, 'roll', 6, 8, 'Kawat duri untuk pagar'],
    ['Paku Besi 5 cm', 100, 15000, 22000, 'kg', 6, 20, 'Paku sayang 5 cm kualitas tinggi'],
    ['Paku Besi 10 cm', 80, 18000, 25000, 'kg', 6, 15, 'Paku 10 cm untuk konstruksi'],
    ['Baut M8', 120, 8000, 12000, 'pcs', 6, 25, 'Baut 8mm untuk besi'],
    ['Baut M10', 100, 12000, 18000, 'pcs', 6, 20, 'Baut 10mm untuk konstruksi'],
    ['Mur M8', 150, 3000, 5000, 'pcs', 6, 30, 'Mur 8mm配套螺栓'],
    ['Ring M8', 150, 2000, 3500, 'pcs', 6, 30, 'Ring datar 8mm'],
    ['Gerinda Potong', 80, 12000, 18000, 'pcs', 6, 15, 'Gerinda potong untuk besi'],
    ['Gerinda Kasar', 60, 15000, 22000, 'pcs', 6, 12, 'Gerinda kasar untuk penghalusan'],

    // Peternakan
    ['Pakan Ayam Broiler 50 kg', 80, 285000, 350000, 'sak', 7, 15, 'Pakan ayam pedaging tinggi protein'],
    ['Pakan Ayam Petelur 50 kg', 70, 265000, 325000, 'sak', 7, 12, 'Pakan ayam petelur lengkap'],
    ['Pakan Bebek 50 kg', 60, 245000, 305000, 'sak', 7, 10, 'Pakan bebek starter-grower'],
    ['Pakan Sapi 50 kg', 50, 320000, 395000, 'sak', 7, 8, 'Pakan konsentrat sapi perah'],
    ['Pakan Kambing 25 kg', 45, 175000, 220000, 'sak', 7, 8, 'Pakan goats lengkap'],
    ['Vitamin Ayam', 100, 35000, 48000, 'pcs', 7, 20, 'Vitamin kompleks untuk ayam'],
    ['Obat Cacing Ternak', 70, 55000, 75000, 'pcs', 7, 15, 'Obat cacing spectrum luas'],
    ['Desinfektan Kandang', 60, 45000, 62000, 'liter', 7, 12, 'Cresil dan désinfektan lainnya'],
    ['Obat Nyamuk Ternak', 80, 28000, 40000, 'liter', 7, 15, 'Obat nyamuk untuk lingkungan peternakan'],
    ['Vaccine Ayam', 90, 42000, 58000, 'pcs', 7, 18, 'Vaccine ND untuk ayam'],
    ['Injectapik Organik', 50, 65000, 85000, 'liter', 7, 10, 'Suplemen organik untuk pencernaan'],
    ['Molases Tetes', 40, 25000, 35000, 'liter', 7, 8, 'Molase untuk energético tambahan'],
    ['Kalsium untuk Ayam', 75, 32000, 45000, 'kg', 7, 15, 'Kalsium untuk kerabang telur'],
    ['Garam Dapur Ternak', 60, 8000, 12000, 'kg', 7, 12, 'Garam dapur untuk elektrolit'],
    ['Sutra Gorden Untuk Kandang', 30, 85000, 115000, 'roll', 7, 5, 'Sutra peneduh untuk kandang']
  ];
  items.forEach(i => insertItem.run(i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7]));
};

const seedUsers = () => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) return;

  const insertUser = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');

  const ownerHash = bcrypt.hashSync('owner123', 10);
  const officerHash = bcrypt.hashSync('officer123', 10);

  insertUser.run('owner', ownerHash, 'owner');
  insertUser.run('officer1', officerHash, 'officer');
  insertUser.run('officer2', officerHash, 'officer');
  insertUser.run('officer3', officerHash, 'officer');
};

module.exports = { seed };