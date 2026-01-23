/**
 * SIMRS ATRIA JAYA MEDIKA - MASTER ENGINE v2.0
 * PENGGABUNGAN TOTAL: FITUR LAMA + FITUR BARU + PASIEN LAMA
 * STATUS: FIXED SEARCH & DATA PERSISTENCE
 */

// 1. INISIALISASI DATABASE
let dbPasien = JSON.parse(localStorage.getItem('db_atria_v35')) || [];
let dbObat = JSON.parse(localStorage.getItem('db_obat_v35')) || [
    {id:1, nama:'Paracetamol 500mg', stok:100},
    {id:2, nama:'Amoxicillin 500mg', stok:50}
];

function updateDatabase() {
    dbPasien = JSON.parse(localStorage.getItem('db_atria_v35')) || [];
}

function save() {
    localStorage.setItem('db_atria_v35', JSON.stringify(dbPasien));
    localStorage.setItem('db_obat_v35', JSON.stringify(dbObat));
}

function getNewNo() {
    updateDatabase();
    const tgl = new Date().toLocaleDateString();
    return dbPasien.filter(p => p.tgl_kunjungan === tgl).length + 1;
}

// 2. SISTEM LOGIN (PIN 12345)
function prosesLogin() {
    const role = document.getElementById('login-role').value;
    const pin = document.getElementById('login-pass').value;
    const name = document.getElementById('login-role').options[document.getElementById('login-role').selectedIndex].text;
    if (pin === '12345') {
        sessionStorage.setItem('artha_session', JSON.stringify({role, name}));
        loadDashboard(role);
    } else { alert("PIN SALAH!"); }
}

// 3. FITUR DAFTAR MANDIRI
function simpanMandiri() {
    const p = {
        id: Date.now(),
        no: getNewNo(),
        nama: document.getElementById('p-nama-m').value,
        nik: document.getElementById('p-nik-m').value,
        wa: document.getElementById('p-wa-m').value,
        umur: document.getElementById('p-umur-m').value,
        jk: document.getElementById('p-jk-m').value,
        poli: document.getElementById('p-poli-m').value,
        tgl_kunjungan: new Date(document.getElementById('p-tgl-m').value).toLocaleDateString(),
        status: 'Antre Perawat',
        medis: [{ tgl: new Date().toLocaleDateString('id-ID'), tensi:'', suhu:'', riwayat:'', diagnosa:'', icd:'', resep:'' }],
        billing: 50000
    };
    if(!p.nama || !p.nik || !p.wa) return alert("Mohon lengkapi Nama, NIK, dan WhatsApp!");
    dbPasien.push(p); save();
    alert(`Berhasil! Nomor Antrean Anda: #${p.no}. Silakan tunggu.`);
    location.reload();
}

// 4. CORE DASHBOARD & NAVIGASI
function loadDashboard(role) {
    updateDatabase();
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-dashboard').classList.remove('hidden');
    const user = JSON.parse(sessionStorage.getItem('artha_session'));
    document.getElementById('user-display').innerText = `USER: ${user.name} | ATRIA JAYA MEDIKA`;
    
    const nav = document.getElementById('sidebar-menu'); nav.innerHTML = '';
    const menus = {
        admin: [
            {l:'Pendaftaran Internal', i:'fa-user-plus', r:renderAdmisi}, 
            {l:'Pasien Lama', i:'fa-history', r:renderCariPasienLama}, 
            {l:'Antrean Perawat', i:'fa-clock', r:()=>renderList('Antre Perawat','admin')},
            {l:'Database Pasien', i:'fa-database', r:renderRiwayatUmum}
        ],
        perawat: [
            {l:'Pemeriksaan Fisik', i:'fa-stethoscope', r:()=>renderList('Antre Perawat','perawat')},
            {l:'Riwayat Kerja Saya', i:'fa-history', r:()=>renderRiwayatPetugas('Antre Dokter')}
        ],
        dokter: [
            {l:'Diagnosa & Resep', i:'fa-user-md', r:()=>renderList('Antre Dokter','dokter')},
            {l:'Riwayat Diagnosa Saya', i:'fa-notes-medical', r:()=>renderRiwayatPetugas('Antre Farmasi')}
        ],
        farmasi: [
            {l:'Antrean Resep', i:'fa-pills', r:()=>renderList('Antre Farmasi','farmasi')},
            {l:'Riwayat Penyerahan', i:'fa-clipboard-check', r:()=>renderRiwayatPetugas('Antre Kasir')}
        ],
        kasir: [
            {l:'Billing Kasir', i:'fa-cash-register', r:()=>renderList('Antre Kasir','kasir')},
            {l:'Laporan Omset', i:'fa-chart-line', r:renderOwner}
        ]
    };

    menus[role].forEach((m, i) => {
        const b = document.createElement('button');
        b.className = "w-full flex items-center p-5 rounded-2xl text-slate-400 font-bold text-[10px] uppercase tracking-widest";
        b.innerHTML = `<i class="fas ${m.i} w-8 text-blue-500"></i> ${m.l}`;
        b.onclick = () => {
            document.querySelectorAll('#sidebar-menu button').forEach(el => el.classList.remove('sidebar-active'));
            b.classList.add('sidebar-active');
            updateDatabase();
            document.getElementById('content-area').innerHTML = m.r();
        };
        nav.appendChild(b); if(i===0) b.click();
    });
}

// 5. FITUR PASIEN LAMA (FIXED SEARCH BUTTON)
function renderCariPasienLama() {
    return `
    <div class="bg-white p-10 rounded-[3rem] shadow-sm animate-fade-in">
        <h3 class="text-2xl font-black mb-8 text-blue-600 uppercase italic">Pendaftaran Pasien Lama</h3>
        <div class="flex gap-4 bg-slate-900 p-8 rounded-[2rem]">
            <input id="cari-input" placeholder="Ketik Nama atau NIK Pasien..." class="flex-1 p-5 bg-slate-800 border-none rounded-2xl text-white font-bold">
            <button onclick="prosesCariPasien()" class="bg-blue-600 text-white px-10 rounded-2xl font-black uppercase text-[10px]">Cari Data</button>
        </div>
        <div id="hasil-cari" class="mt-10 space-y-4"></div>
    </div>`;
}

function prosesCariPasien() {
    updateDatabase();
    const keyword = document.getElementById('cari-input').value.toLowerCase();
    const hasilArea = document.getElementById('hasil-cari');
    if (!keyword) return alert("Masukkan nama atau NIK!");

    const temuan = dbPasien.filter(p => p.nama.toLowerCase().includes(keyword) || p.nik.includes(keyword));

    if (temuan.length > 0) {
        hasilArea.innerHTML = temuan.map(p => `
            <div class="flex justify-between items-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div>
                    <h5 class="font-black text-xl text-slate-800 uppercase">${p.nama}</h5>
                    <p class="text-xs font-bold text-slate-400">NIK: ${p.nik} | No.RM: 00-${p.no}</p>
                </div>
                <button onclick="daftarkanLagi('${p.id}')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase">Daftar Lagi</button>
            </div>
        `).join('');
    } else {
        hasilArea.innerHTML = `<p class="text-center opacity-30 italic font-bold py-10">Data tidak ditemukan.</p>`;
    }
}

function daftarkanLagi(id) {
    updateDatabase();
    const i = dbPasien.findIndex(x => x.id == id);
    dbPasien[i].medis.push({ tgl: new Date().toLocaleDateString('id-ID'), tensi:'', suhu:'', riwayat:'', diagnosa:'', icd:'', resep:'' });
    dbPasien[i].status = 'Antre Perawat';
    dbPasien[i].no = getNewNo();
    dbPasien[i].tgl_kunjungan = new Date().toLocaleDateString();
    save();
    alert(`Pasien ${dbPasien[i].nama} berhasil didaftarkan ulang! Antrean: #${dbPasien[i].no}`);
    loadDashboard('admin');
}

// 6. RENDER LIST & FORMS
function renderList(s, r) {
    updateDatabase();
    const data = dbPasien.filter(p => p.status === s);
    return `<div class="flex flex-col gap-8 w-full animate-fade-in">
        ${data.map(p => {
            const m = p.medis[p.medis.length - 1];
            return `
            <div class="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 w-full">
                <div class="flex justify-between items-center mb-8">
                    <div class="flex items-center gap-6">
                        <span class="bg-blue-600 text-white w-20 h-20 flex items-center justify-center rounded-[2rem] font-black text-3xl">#${p.no}</span>
                        <div>
                            <h4 class="text-4xl font-black text-slate-800 uppercase">${p.nama}</h4>
                            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">${p.poli} | NIK: ${p.nik}</p>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="printRM('${p.id}')" class="bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase">Rekam Medis</button>
                        <button onclick="speak('${p.nama}','${p.no}')" class="bg-orange-50 text-orange-500 px-6 py-4 rounded-2xl font-black text-[10px] uppercase">Panggil</button>
                    </div>
                </div>
                ${r==='perawat'?renderPerawat(p, m):r==='dokter'?renderDokter(p, m):r==='farmasi'?renderFarmasi(p, m):r==='kasir'?renderKasir(p):''}
            </div>`;
        }).join('') || '<div class="py-32 text-center opacity-10 font-black text-5xl italic uppercase">Kosong</div>'}
    </div>`;
}

function renderPerawat(p, m) {
    return `<div class="mt-8 pt-8 border-t space-y-6">
        <div class="grid grid-cols-2 gap-6">
            <input id="p-tensi-${p.id}" value="${m.tensi}" placeholder="Tensi (TD)" class="p-5 bg-slate-50 border rounded-2xl font-bold">
            <input id="p-suhu-${p.id}" value="${m.suhu}" placeholder="Suhu (°C)" class="p-5 bg-slate-50 border rounded-2xl font-bold">
        </div>
        <textarea id="p-riwayat-${p.id}" placeholder="Keluhan Pasien" class="w-full p-5 bg-slate-50 border rounded-2xl font-bold h-24">${m.riwayat}</textarea>
        <button onclick="savePerawat('${p.id}')" class="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs">Kirim Ke Dokter</button>
    </div>`;
}

function renderDokter(p, m) {
    return `<div class="mt-8 pt-8 border-t space-y-6">
        <div class="grid grid-cols-2 gap-6">
            <input id="d-icd-${p.id}" value="${m.icd}" placeholder="Kode ICD-10" class="p-5 bg-slate-50 border rounded-2xl font-bold">
            <textarea id="d-resep-${p.id}" placeholder="Resep Obat" class="p-5 bg-indigo-50 border rounded-2xl font-bold h-24">${m.resep}</textarea>
        </div>
        <textarea id="d-diag-${p.id}" placeholder="Analisa Diagnosa Dokter" class="w-full p-5 bg-slate-50 border rounded-2xl font-bold h-32">${m.diagnosa}</textarea>
        <button onclick="saveDokter('${p.id}')" class="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs">Selesai Periksa</button>
    </div>`;
}

function renderFarmasi(p, m) {
    return `<div class="mt-8 pt-8 border-t">
        <div class="p-8 bg-emerald-50 rounded-3xl mb-6 font-bold text-emerald-800 text-2xl italic">${m.resep}</div>
        <button onclick="updateStat('${p.id}', 'Antre Kasir')" class="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase">Selesai & Kasir</button>
    </div>`;
}

function renderKasir(p) {
    return `<div class="mt-8 pt-8 border-t flex justify-between items-center">
        <h2 class="text-5xl font-black text-blue-600">Rp ${p.billing.toLocaleString()}</h2>
        <button onclick="printInvoice('${p.id}')" class="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs">Lunas & Struk</button>
    </div>`;
}

// 7. CETAKAN & UPDATE DATA
function savePerawat(id) {
    updateDatabase();
    const i = dbPasien.findIndex(x => x.id == id);
    const m = dbPasien[i].medis[dbPasien[i].medis.length - 1];
    m.tensi = document.getElementById(`p-tensi-${id}`).value;
    m.suhu = document.getElementById(`p-suhu-${id}`).value;
    m.riwayat = document.getElementById(`p-riwayat-${id}`).value;
    dbPasien[i].status = 'Antre Dokter';
    save(); loadDashboard('perawat');
}

function saveDokter(id) {
    updateDatabase();
    const i = dbPasien.findIndex(x => x.id == id);
    const m = dbPasien[i].medis[dbPasien[i].medis.length - 1];
    m.icd = document.getElementById(`d-icd-${id}`).value;
    m.resep = document.getElementById(`d-resep-${id}`).value;
    m.diagnosa = document.getElementById(`d-diag-${id}`).value;
    dbPasien[i].status = 'Antre Farmasi';
    save(); loadDashboard('dokter');
}

function printRM(id) {
    updateDatabase();
    const p = dbPasien.find(x => x.id == id);
    const m = p.medis[p.medis.length - 1];
    const a = document.getElementById('print-area');
    a.innerHTML = `<div class="p-10 border-4 border-black font-serif">
        <h1 class="text-center text-2xl font-black uppercase">Atria Jaya Medika</h1><hr class="border-black my-4">
        <h3>REKAM MEDIS PASIEN</h3>
        <p>Nama: ${p.nama} | RM: 00-${p.no}</p>
        <p>NIK: ${p.nik} | Tgl: ${m.tgl}</p><br>
        <p><b>Pemeriksaan Fisik:</b> TD: ${m.tensi} | Suhu: ${m.suhu}</p>
        <p><b>Keluhan:</b> ${m.riwayat}</p>
        <p><b>Diagnosa:</b> ${m.diagnosa} (${m.icd})</p>
        <p><b>Terapi/Obat:</b> ${m.resep}</p>
    </div>`;
    window.print();
}

function updateStat(id, s) { 
    const i=dbPasien.findIndex(x=>x.id==id); 
    dbPasien[i].status=s; save(); 
    loadDashboard(JSON.parse(sessionStorage.getItem('artha_session')).role); 
}

function printInvoice(id) { 
    const p=dbPasien.find(x=>x.id==id); 
    const a=document.getElementById('print-area'); 
    a.innerHTML=`<div class="p-6 border font-mono"><h3>STRUK ATRIA JAYA</h3><p>${p.nama}</p><h3>TOTAL: Rp ${p.billing.toLocaleString()}</h3></div>`; 
    window.print(); updateStat(id, 'Selesai'); 
}

// 8. MONITOR TV
function toggleTV() { 
    document.getElementById('tv-monitor').classList.toggle('hidden'); 
    if(!document.getElementById('tv-monitor').classList.contains('hidden')) renderTV(); 
}

function renderTV() {
    const u = [
        {l:'Antrean Perawat', s:'Antre Perawat', c:'bg-emerald-500'}, 
        {l:'Antrean Dokter', s:'Antre Dokter', c:'bg-blue-500'}, 
        {l:'Farmasi & Kasir', s:'Antre Farmasi', c:'bg-orange-500'}
    ];
    document.getElementById('tv-grid').innerHTML = u.map(x => `
        <div class="bg-white/5 rounded-[3rem] p-8 border border-white/10">
            <h2 class="${x.c} text-white p-4 rounded-2xl text-center font-black mb-8 uppercase">${x.l}</h2>
            <div class="space-y-4">
                ${dbPasien.filter(p => p.status === x.s).slice(0,3).map(p => `
                    <div class="flex justify-between items-center bg-white/5 p-6 rounded-2xl">
                        <span class="text-white text-2xl font-black">${p.nama}</span>
                        <span class="text-blue-500 text-4xl font-black">#${p.no}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// 9. RIWAYAT & ADMISI
function renderRiwayatPetugas(target) {
    const data = dbPasien.filter(p => p.status === target || (target === 'Selesai' && p.status === 'Selesai'));
    return `<div class="bg-white p-10 rounded-[3rem] shadow-sm">
        <h3 class="font-black mb-6 uppercase">Riwayat Kerja Hari Ini</h3>
        ${data.map(p => `<div class="flex justify-between p-6 bg-slate-50 rounded-2xl font-bold mb-4">
            <span>#${p.no} - ${p.nama}</span>
            <button onclick="printRM('${p.id}')" class="text-blue-600 uppercase text-[10px]">Lihat RM</button>
        </div>`).join('') || '<p class="text-center italic opacity-20">Belum ada data.</p>'}
    </div>`;
}

function renderAdmisi() { 
    return `<div class="bg-white p-10 rounded-[3rem] shadow-sm"><h3 class="text-2xl font-black mb-8 text-blue-600 uppercase italic">Pendaftaran Admisi Internal</h3>
    <div class="grid grid-cols-2 gap-6">
        <input id="a-nama" placeholder="Nama Pasien" class="p-4 bg-slate-50 border rounded-xl font-bold uppercase">
        <input id="a-nik" placeholder="NIK" class="p-4 bg-slate-50 border rounded-xl font-bold">
        <input id="a-wa" placeholder="WhatsApp" class="p-4 bg-slate-50 border rounded-xl font-bold">
        <input id="a-umur" placeholder="Umur" class="p-4 bg-slate-50 border rounded-xl font-bold">
        <select id="a-poli" class="p-4 bg-slate-50 border rounded-xl font-bold"><option>Umum</option><option>Gigi</option></select>
    </div>
    <button onclick="simpanAdmisi()" class="mt-6 w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs">Daftarkan Pasien</button></div>`; 
}

function simpanAdmisi() {
    updateDatabase();
    const p = { id: Date.now(), no: getNewNo(), tgl_kunjungan: new Date().toLocaleDateString(), nama: document.getElementById('a-nama').value, nik: document.getElementById('a-nik').value, wa: document.getElementById('a-wa').value, umur: document.getElementById('a-umur').value, poli: document.getElementById('a-poli').value, status: 'Antre Perawat', medis: [{ tgl: new Date().toLocaleDateString('id-ID'), tensi:'', suhu:'', riwayat:'', diagnosa:'', icd:'', resep:'' }], billing: 50000 };
    dbPasien.push(p); save(); loadDashboard('admin');
}

function renderRiwayatUmum() { 
    updateDatabase();
    return `<div class="bg-white p-10 rounded-3xl overflow-hidden"><table class="w-full text-left">${dbPasien.map(p=>`<tr class="border-b p-4"><td>#${p.no}</td><td class="font-bold uppercase">${p.nama}</td><td class="text-xs">${p.status}</td></tr>`).join('')}</table></div>`; 
}

function renderOwner() { 
    const tot=dbPasien.filter(p=>p.status==='Selesai').reduce((a,b)=>a+b.billing,0); 
    return `<div class="bg-blue-600 p-16 rounded-[4rem] text-white"><h2>Omset Hari Ini: Rp ${tot.toLocaleString()}</h2></div>`; 
}

function speak(n, no) { const m = new SpeechSynthesisUtterance(`Antrean nomor ${no}, ${n}.`); m.lang = 'id-ID'; window.speechSynthesis.speak(m); }
function logout() { sessionStorage.clear(); location.reload(); }
function switchTab(t) { 
    document.getElementById('login-container').classList.toggle('hidden', t==='patient'); 
    document.getElementById('patient-container').classList.toggle('hidden', t==='staff'); 
    document.getElementById('tab-staff').classList.toggle('bg-white', t==='staff');
    document.getElementById('tab-patient').classList.toggle('bg-white', t==='patient');
}

window.onload = () => { 
    if(sessionStorage.getItem('artha_session')) loadDashboard(JSON.parse(sessionStorage.getItem('artha_session')).role); 
    setInterval(() => { if(document.getElementById('tv-clock')) document.getElementById('tv-clock').innerText = new Date().toLocaleTimeString('id-ID'); }, 1000); 
};
