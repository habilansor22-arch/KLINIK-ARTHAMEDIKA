/**
 * SIMRS ATRIA JAYA MEDIKA - MASTER ENGINE v2.0
 * PENGGABUNGAN TOTAL: FITUR LAMA + FITUR BARU + PASIEN LAMA
 * STATUS: MULTI-RIWAYAT (ARRAY) & SINKRONISASI PASIEN LAMA
 */

// 1. INISIALISASI DATABASE
let dbPasien = JSON.parse(localStorage.getItem('db_atria_v35')) || [];
let dbObat = JSON.parse(localStorage.getItem('db_obat_v35')) || [
    {id:1, nama:'Paracetamol 500mg', stok:100},
    {id:2, nama:'Amoxicillin 500mg', stok:50}
];

// Sinkronisasi data terbaru sebelum setiap proses penting
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
        // Medis menggunakan Array untuk riwayat abadi
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

// 5. RENDER LIST (DENGAN REKAM MEDIS & PANGGIL)
function renderList(s, r) {
    updateDatabase();
    const data = dbPasien.filter(p => p.status === s);
    return `<div class="flex flex-col gap-8 w-full animate-fade-in">
        ${data.map(p => `
            <div class="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 w-full">
                <div class="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div class="flex items-center gap-6">
                        <span class="bg-blue-600 text-white w-20 h-20 flex items-center justify-center rounded-[2rem] font-black text-3xl">#${p.no}</span>
                        <div>
                            <h4 class="text-4xl font-black text-slate-800">${p.nama}</h4>
                            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">${p.poli} | NIK: ${p.nik} | WA: ${p.wa}</p>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="printRM('${p.id}')" class="bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase"><i class="fas fa-print mr-2"></i> Rekam Medis</button>
                        <button onclick="speak('${p.nama}','${p.no}')" class="bg-orange-50 text-orange-500 px-6 py-4 rounded-2xl font-black text-[10px] uppercase"><i class="fas fa-bullhorn"></i> Panggil</button>
                    </div>
                </div>
                ${r==='perawat'?renderPerawat(p):r==='dokter'?renderDokter(p):r==='farmasi'?renderFarmasi(p):r==='kasir'?renderKasir(p):''}
            </div>
        `).join('') || '<div class="py-32 text-center opacity-10 font-black text-5xl italic uppercase">Kosong</div>'}
    </div>`;
}

// 6. FORM PERAWAT, DOKTER, FARMASI, KASIR
function renderPerawat(p) {
    const cur = Array.isArray(p.medis) ? p.medis[p.medis.length - 1] : p.medis;
    return `<div class="mt-8 pt-8 border-t space-y-6">
        <div class="grid grid-cols-2 gap-6">
            <input id="p-tensi-${p.id}" value="${cur.tensi || ''}" placeholder="Tensi (TD)" class="p-5 bg-slate-50 border rounded-2xl font-bold">
            <input id="p-suhu-${p.id}" value="${cur.suhu || ''}" placeholder="Suhu (°C)" class="p-5 bg-slate-50 border rounded-2xl font-bold">
        </div>
        <textarea id="p-riwayat-${p.id}" placeholder="Keluhan Pasien" class="w-full p-5 bg-slate-50 border rounded-2xl font-bold h-24">${cur.riwayat || ''}</textarea>
        <button onclick="savePerawat('${p.id}')" class="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs">Kirim Ke Dokter</button>
    </div>`;
}

function renderDokter(p) {
    const cur = Array.isArray(p.medis) ? p.medis[p.medis.length - 1] : p.medis;
    // Tampilan Riwayat untuk Dokter
    const history = Array.isArray(p.medis) ? p.medis.slice(0, -1).reverse().map(m => `
        <div class="p-4 bg-slate-50 rounded-2xl mb-3 border border-slate-100 text-[10px]">
            <span class="font-black text-blue-600">TGL: ${m.tgl}</span><br>
            <b>Dx:</b> ${m.diagnosa || '-'} | <b>Terapi:</b> ${m.resep || '-'}
        </div>
    `).join('') : '';

    return `<div class="mt-8 pt-8 border-t space-y-6">
        <div class="bg-blue-50/50 p-6 rounded-[2rem]">
            <h5 class="text-[10px] font-black uppercase text-blue-600 mb-3 italic">Riwayat Kunjungan Sebelumnya:</h5>
            ${history || '<p class="text-[10px] italic">Belum ada riwayat.</p>'}
        </div>
        <div class="grid grid-cols-2 gap-6">
            <input id="d-icd-${p.id}" value="${cur.icd || ''}" placeholder="Kode ICD-10" class="p-5 bg-slate-50 border rounded-2xl font-bold">
            <textarea id="d-resep-${p.id}" placeholder="Resep Obat" class="p-5 bg-indigo-50 border rounded-2xl font-bold h-24">${cur.resep || ''}</textarea>
        </div>
        <textarea id="d-diag-${p.id}" placeholder="Analisa Diagnosa Dokter" class="w-full p-5 bg-slate-50 border rounded-2xl font-bold h-32">${cur.diagnosa || ''}</textarea>
        <div class="flex gap-4">
            <button onclick="saveDokter('${p.id}')" class="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs">Selesai Periksa</button>
            <button onclick="revisi('${p.id}', 'Antre Perawat')" class="bg-red-50 text-red-500 px-8 py-5 rounded-2xl font-black text-[10px] uppercase">Balik ke Perawat</button>
        </div>
    </div>`;
}

function renderFarmasi(p) {
    const cur = Array.isArray(p.medis) ? p.medis[p.medis.length - 1] : p.medis;
    return `<div class="mt-8 pt-8 border-t">
        <div class="p-8 bg-emerald-50 rounded-3xl mb-6 font-bold text-emerald-800 text-2xl italic">${cur.resep || 'Tidak ada resep'}</div>
        <div class="flex gap-4">
            <button onclick="printEtiket('${p.id}')" class="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase">Cetak Label Obat</button>
            <button onclick="updateStat('${p.id}', 'Antre Kasir')" class="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase">Selesai & Kasir</button>
        </div>
    </div>`;
}

function renderKasir(p) {
    return `<div class="mt-8 pt-8 border-t flex justify-between items-center">
        <h2 class="text-5xl font-black text-blue-600">Rp ${p.billing.toLocaleString()}</h2>
        <button onclick="printInvoice('${p.id}')" class="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs shadow-lg">Lunas & Struk</button>
    </div>`;
}

// 7. CETAKAN DENGAN RIWAYAT BERDASARKAN TANGGAL
function printRM(id) {
    updateDatabase();
    const p = dbPasien.find(x => x.id == id);
    const a = document.getElementById('print-area');
    
    const riwayatHTML = (Array.isArray(p.medis) ? p.medis : [p.medis]).map((m, i) => `
        <div class="mb-6 border-b pb-4">
            <p class="bg-slate-100 p-2 text-[10px] font-black uppercase">Kunjungan ${i+1} | Tgl: ${m.tgl || p.tgl_kunjungan}</p>
            <div class="grid grid-cols-2 gap-4 mt-2 text-[11px]">
                <div><b>Perawat:</b> TD: ${m.tensi || '-'} | S: ${m.suhu || '-'}°C <br><i>Keluhan: ${m.riwayat || '-'}</i></div>
                <div><b>Dokter:</b> Dx: ${m.diagnosa || '-'} (${m.icd || '-'}) <br><b>Obat:</b> ${m.resep || '-'}</div>
            </div>
        </div>
    `).join('');

    a.innerHTML = `<div class="p-10 border-4 border-black font-serif">
        <h1 class="text-center text-2xl font-black uppercase">Atria Jaya Medika</h1>
        <p class="text-center text-[10px] font-bold">REKAM MEDIS PASIEN TERPADU</p>
        <hr class="border-black my-4">
        <div class="grid grid-cols-2 text-xs mb-6">
            <div><p>Nama: ${p.nama}</p><p>NIK: ${p.nik}</p></div>
            <div class="text-right"><p>Umur: ${p.umur}</p><p>Poli: ${p.poli}</p></div>
        </div>
        ${riwayatHTML}
    </div>`;
    window.print();
}

function printEtiket(id) {
    const p = dbPasien.find(x => x.id == id);
    const cur = Array.isArray(p.medis) ? p.medis[p.medis.length - 1] : p.medis;
    const a = document.getElementById('print-area');
    a.innerHTML = `<div class="p-6 border-2 border-blue-600 rounded-xl w-[300px] text-xs font-bold text-center">
        <p class="border-b border-blue-600 pb-2 mb-2 uppercase">ATRIA JAYA MEDIKA - FARMASI</p>
        <p class="text-left">Nama: ${p.nama}</p>
        <div class="bg-blue-50 p-4 my-2 text-lg font-black border border-blue-200">${cur.resep}</div>
        <p class="italic">Semoga Cepat Sembuh</p>
    </div>`;
    window.print();
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

// 9. RIWAYAT KERJA
function renderRiwayatPetugas(target) {
    updateDatabase();
    const data = dbPasien.filter(p => p.status === target || (target === 'Selesai' && p.status === 'Selesai'));
    return `<div class="bg-white p-10 rounded-[3rem] shadow-sm">
        <h3 class="font-black mb-6 uppercase italic text-blue-600">Riwayat Kerja Hari Ini</h3>
        ${data.map(p => `<div class="flex justify-between p-6 bg-slate-50 rounded-2xl font-bold mb-4">
            <span>#${p.no} - ${p.nama}</span>
            <button onclick="printRM('${p.id}')" class="text-blue-600 uppercase text-[10px] font-black">Detail RM</button>
        </div>`).join('') || '<p class="opacity-30 italic uppercase text-center py-10">Belum ada data</p>'}
    </div>`;
}

// 10. ADMISI & UPDATE STATUS
function renderAdmisi() { 
    return `<div class="bg-white p-10 rounded-[3rem] shadow-sm animate-fade-in"><h3 class="text-2xl font-black mb-8 text-blue-600 uppercase italic">Pendaftaran Admisi Internal</h3>
    <div class="grid grid-cols-2 gap-6">
        <input id="a-nama" placeholder="Nama Pasien" class="p-4 bg-slate-50 border rounded-xl font-bold uppercase">
        <input id="a-nik" placeholder="NIK" class="p-4 bg-slate-50 border rounded-xl font-bold">
        <input id="a-wa" placeholder="WhatsApp" class="p-4 bg-slate-50 border rounded-xl font-bold">
        <input id="a-umur" placeholder="Umur" class="p-4 bg-slate-50 border rounded-xl font-bold">
        <select id="a-poli" class="p-4 bg-slate-50 border rounded-xl font-bold"><option>Umum</option><option>Gigi</option></select>
    </div>
    <button onclick="simpanAdmisi()" class="mt-6 w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-lg">Daftarkan ke Perawat</button></div>`; 
}

function simpanAdmisi() {
    updateDatabase();
    const p = { id: Date.now(), no: getNewNo(), tgl_kunjungan: new Date().toLocaleDateString(), nama: document.getElementById('a-nama').value, nik: document.getElementById('a-nik').value, wa: document.getElementById('a-wa').value, umur: document.getElementById('a-umur').value, poli: document.getElementById('a-poli').value, status: 'Antre Perawat', medis: [{ tgl: new Date().toLocaleDateString('id-ID'), tensi:'', suhu:'', riwayat:'', diagnosa:'', icd:'', resep:'' }], billing: 50000 };
    dbPasien.push(p); save(); loadDashboard('admin');
}

function savePerawat(id) { 
    updateDatabase();
    const i=dbPasien.findIndex(x=>x.id==id); 
    const cur = dbPasien[i].medis[dbPasien[i].medis.length - 1];
    cur.tensi=document.getElementById(`p-tensi-${id}`).value; 
    cur.suhu=document.getElementById(`p-suhu-${id}`).value; 
    cur.riwayat=document.getElementById(`p-riwayat-${id}`).value; 
    dbPasien[i].status='Antre Dokter'; save(); loadDashboard('perawat'); 
}

function saveDokter(id) { 
    updateDatabase();
    const i=dbPasien.findIndex(x=>x.id==id); 
    const cur = dbPasien[i].medis[dbPasien[i].medis.length - 1];
    cur.icd=document.getElementById(`d-icd-${id}`).value; 
    cur.resep=document.getElementById(`d-resep-${id}`).value; 
    cur.diagnosa=document.getElementById(`d-diag-${id}`).value; 
    dbPasien[i].status='Antre Farmasi'; save(); loadDashboard('dokter'); 
}

function printInvoice(id) { 
    const p=dbPasien.find(x=>x.id==id); 
    const a=document.getElementById('print-area'); 
    a.innerHTML=`<div class="p-6 border font-mono"><h3>STRUK ATRIA JAYA</h3><p>${p.nama}</p><h3>TOTAL: Rp ${p.billing.toLocaleString()}</h3></div>`; 
    window.print(); updateStat(id, 'Selesai'); 
}

function updateStat(id, s) { 
    const i=dbPasien.findIndex(x=>x.id==id); 
    dbPasien[i].status=s; save(); 
    loadDashboard(JSON.parse(sessionStorage.getItem('artha_session')).role); 
}

function revisi(id, s) { 
    const i=dbPasien.findIndex(x=>x.id==id); 
    dbPasien[i].status=s; save(); 
    loadDashboard(JSON.parse(sessionStorage.getItem('artha_session')).role); 
}

function speak(n, no) { 
    const m = new SpeechSynthesisUtterance(`Antrean nomor ${no}, ${n}.`); 
    m.lang = 'id-ID'; window.speechSynthesis.speak(m); 
}

function logout() { sessionStorage.clear(); location.reload(); }

function switchTab(t) { 
    document.getElementById('login-container').classList.toggle('hidden', t==='patient'); 
    document.getElementById('patient-container').classList.toggle('hidden', t==='staff'); 
    document.getElementById('tab-staff').classList.toggle('bg-white', t==='staff');
    document.getElementById('tab-patient').classList.toggle('bg-white', t==='patient');
}

function renderRiwayatUmum() { 
    updateDatabase();
    return `<div class="bg-white p-10 rounded-3xl overflow-hidden"><h3 class="font-black mb-6 uppercase text-blue-600 italic">Database Pasien Keseluruhan</h3><table class="w-full text-left">${dbPasien.map(p=>`<tr class="border-b p-4"><td>#${p.no}</td><td class="font-bold uppercase">${p.nama}</td><td class="text-xs italic">${p.status}</td></tr>`).join('')}</table></div>`; 
}

function renderOwner() { 
    const tot=dbPasien.filter(p=>p.status==='Selesai').reduce((a,b)=>a+b.billing,0); 
    return `<div class="bg-blue-600 p-16 rounded-[4rem] text-white shadow-2xl">
        <h4 class="font-black uppercase tracking-widest opacity-50 mb-4">Laporan Keuangan Clinic</h4>
        <h2 class="text-6xl font-black uppercase italic">Rp ${tot.toLocaleString()}</h2>
        <p class="mt-4 font-bold opacity-75 uppercase text-xs">Total Pendapatan Selesai Hari Ini</p>
    </div>`; 
}

window.onload = () => { 
    if(sessionStorage.getItem('artha_session')) loadDashboard(JSON.parse(sessionStorage.getItem('artha_session')).role); 
    setInterval(() => { if(document.getElementById('tv-clock')) document.getElementById('tv-clock').innerText = new Date().toLocaleTimeString('id-ID'); }, 1000); 
};