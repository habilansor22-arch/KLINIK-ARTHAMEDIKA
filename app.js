/**
 * SIMRS ATRIA JAYA MEDIKA MASTER ENGINE v33.0
 * SEMUA FITUR LAMA DI PERTAHANKAN + FITUR BARU LENGKAP
 */

// Inisialisasi Database (Nama Baru: Atria Jaya Medika)
let dbPasien = JSON.parse(localStorage.getItem('db_atria_v33')) || [];
let dbObat = JSON.parse(localStorage.getItem('db_obat_v33')) || [
    {id:1, nama:'Paracetamol 500mg', stok:100, harga:5000},
    {id:2, nama:'Amoxicillin 500mg', stok:50, harga:15000},
    {id:3, nama:'Dexamethasone', stok:30, harga:8000}
];
let dbPay = JSON.parse(localStorage.getItem('db_pay_v33')) || ['Tunai', 'Transfer BCA', 'QRIS Mandiri'];

function save() {
    localStorage.setItem('db_atria_v33', JSON.stringify(dbPasien));
    localStorage.setItem('db_obat_v33', JSON.stringify(dbObat));
    localStorage.setItem('db_pay_v33', JSON.stringify(dbPay));
}

function getNewNo() {
    const tgl = new Date().toLocaleDateString();
    return dbPasien.filter(p => p.tgl === tgl).length + 1;
}

// --- FITUR LOGIN (PIN 12345) ---
function prosesLogin() {
    const role = document.getElementById('login-role').value;
    const pin = document.getElementById('login-pass').value;
    const name = document.getElementById('login-role').options[document.getElementById('login-role').selectedIndex].text;

    if (pin === '12345') {
        sessionStorage.setItem('artha_session', JSON.stringify({role, name}));
        loadDashboard(role);
    } else {
        alert("PIN SALAH! Gunakan PIN 12345");
    }
}

// --- DASHBOARD NAVIGASI ---
function loadDashboard(role) {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-dashboard').classList.remove('hidden');
    const user = JSON.parse(sessionStorage.getItem('artha_session'));
    document.getElementById('user-display').innerText = `PETUGAS: ${user.name} | ATRIA JAYA MEDIKA`;
    
    const nav = document.getElementById('sidebar-menu'); nav.innerHTML = '';
    
    const ROLES_MENU = {
        admin: [
            {l:'Pendaftaran', i:'fa-user-plus', r:renderAdmisi}, 
            {l:'Antrean Perawat', i:'fa-clock', r:()=>renderList('Antre Perawat','admin')}, 
            {l:'Database Pasien', i:'fa-database', r:renderRiwayatUmum}
        ],
        perawat: [
            {l:'Poli Perawat', i:'fa-heartbeat', r:()=>renderList('Antre Perawat','perawat')},
            {l:'Riwayat Saya', i:'fa-history', r:()=>renderRiwayatPetugas('Antre Dokter')}
        ],
        dokter: [
            {l:'Poli Dokter', i:'fa-user-md', r:()=>renderList('Antre Dokter','dokter')},
            {l:'Riwayat Diagnosa', i:'fa-notes-medical', r:()=>renderRiwayatPetugas('Antre Farmasi')}
        ],
        farmasi: [
            {l:'Antrean Resep', i:'fa-pills', r:()=>renderList('Antre Farmasi','farmasi')}, 
            {l:'Gudang Obat', i:'fa-boxes', r:renderGudang},
            {l:'Riwayat Resep', i:'fa-clipboard-check', r:()=>renderRiwayatPetugas('Antre Kasir')}
        ],
        kasir: [
            {l:'Billing Kasir', i:'fa-cash-register', r:()=>renderList('Antre Kasir','kasir')},
            {l:'Laporan Omset', i:'fa-chart-pie', r:renderOwner}
        ]
    };

    ROLES_MENU[role].forEach((m, i) => {
        const b = document.createElement('button');
        b.className = "w-full flex items-center p-5 rounded-2xl text-slate-400 font-bold text-[10px] uppercase tracking-widest";
        b.innerHTML = `<i class="fas ${m.i} w-8 text-blue-500"></i> ${m.l}`;
        b.onclick = () => {
            document.querySelectorAll('#sidebar-menu button').forEach(el => el.classList.remove('sidebar-active'));
            b.classList.add('sidebar-active');
            document.getElementById('content-area').innerHTML = m.r();
        };
        nav.appendChild(b); if(i===0) b.click();
    });
}

// --- RENDER LIST (FULL WIDTH - FITUR PATEN) ---
function renderList(s, r) {
    const data = dbPasien.filter(p => p.status === s);
    return `
    <div class="flex flex-col gap-8 w-full animate-fade-in">
        ${data.map(p => `
            <div class="bg-white p-10 rounded-[3rem] shadow-md border border-slate-100 w-full">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div class="flex items-center gap-6">
                        <span class="bg-blue-600 text-white w-20 h-20 flex items-center justify-center rounded-[2rem] font-black text-3xl shadow-lg">#${p.no}</span>
                        <div>
                            <h4 class="text-4xl font-black text-slate-800">${p.nama}</h4>
                            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">${p.poli} | NIK: ${p.nik || '-'} | Umur: ${p.umur || '-'} Thn</p>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="printRM('${p.id}')" class="bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase"><i class="fas fa-file-medical mr-2"></i> RM</button>
                        <button onclick="speak('${p.nama}','${p.no}')" class="bg-orange-50 text-orange-500 px-6 py-4 rounded-2xl font-black text-[10px] uppercase"><i class="fas fa-bullhorn mr-2"></i> PANGGIL</button>
                    </div>
                </div>
                ${r==='perawat'?renderPerawat(p):r==='dokter'?renderDokter(p):r==='farmasi'?renderFarmasi(p):r==='kasir'?renderKasir(p):''}
            </div>
        `).join('') || '<div class="py-32 text-center opacity-10 font-black text-5xl italic">ANTREAN KOSONG</div>'}
    </div>`;
}

// --- FORM PERAWAT (FULL WIDTH) ---
function renderPerawat(p) {
    return `
    <div class="mt-8 pt-8 border-t border-slate-100 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2"><label class="text-[10px] font-black uppercase text-slate-400 ml-2">Tensi (TD)</label>
            <input id="p-tensi-${p.id}" value="${p.medis.tensi||''}" placeholder="120/80" class="w-full p-5 bg-slate-50 rounded-2xl font-bold border outline-none"></div>
            <div class="space-y-2"><label class="text-[10px] font-black uppercase text-slate-400 ml-2">Suhu (°C)</label>
            <input id="p-suhu-${p.id}" value="${p.medis.suhu||''}" placeholder="36.5" class="w-full p-5 bg-slate-50 rounded-2xl font-bold border outline-none"></div>
        </div>
        <div class="space-y-2"><label class="text-[10px] font-black uppercase text-slate-400 ml-2">Riwayat & Keluhan</label>
        <textarea id="p-riwayat-${p.id}" class="w-full p-5 bg-slate-50 rounded-2xl font-bold border h-32 outline-none">${p.medis.riwayat||''}</textarea></div>
        <button onclick="savePerawat('${p.id}')" class="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs shadow-lg">Kirim ke Dokter</button>
    </div>`;
}

function savePerawat(id) {
    const i = dbPasien.findIndex(x => x.id == id);
    dbPasien[i].medis.tensi = document.getElementById(`p-tensi-${id}`).value;
    dbPasien[i].medis.suhu = document.getElementById(`p-suhu-${id}`).value;
    dbPasien[i].medis.riwayat = document.getElementById(`p-riwayat-${id}`).value;
    dbPasien[i].status = 'Antre Dokter'; save(); loadDashboard('perawat');
}

// --- FORM DOKTER (FULL WIDTH + RESEP MANUAL + REVISI) ---
function renderDokter(p) {
    return `
    <div class="mt-8 pt-8 border-t border-slate-100">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="p-4 bg-blue-50 rounded-2xl text-center"><span class="block text-[9px] font-black text-blue-400 uppercase">Tensi</span><span class="font-bold text-blue-800">${p.medis.tensi||'-'}</span></div>
            <div class="p-4 bg-blue-50 rounded-2xl text-center"><span class="block text-[9px] font-black text-blue-400 uppercase">Suhu</span><span class="font-bold text-blue-800">${p.medis.suhu||'-'} °C</span></div>
            <div class="p-4 bg-blue-50 rounded-2xl text-center"><span class="block text-[9px] font-black text-blue-400 uppercase">Keluhan</span><span class="font-bold text-blue-800">${p.medis.riwayat||'-'}</span></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="space-y-2"><label class="text-[10px] font-black uppercase text-slate-400 ml-2">Diagnosa ICD-10</label>
            <input id="d-icd-${p.id}" value="${p.medis.icd||''}" class="w-full p-5 bg-slate-50 rounded-2xl font-bold border outline-none"></div>
            <div class="space-y-2"><label class="text-[10px] font-black uppercase text-slate-400 ml-2">Resep Obat (Ketik Manual)</label>
            <textarea id="d-resep-${p.id}" class="w-full p-5 bg-indigo-50 rounded-2xl font-bold border h-24 outline-none">${p.medis.resep||''}</textarea></div>
        </div>
        <div class="space-y-2 mb-8"><label class="text-[10px] font-black uppercase text-slate-400 ml-2">Analisa Dokter</label>
        <textarea id="d-diag-${p.id}" class="w-full p-5 bg-slate-50 rounded-2xl font-bold border h-40 outline-none">${p.medis.diagnosa||''}</textarea></div>
        <div class="flex flex-wrap gap-4">
            <button onclick="saveDokter('${p.id}')" class="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs">Simpan Pemeriksaan</button>
            <button onclick="revisiStatus('${p.id}', 'Antre Perawat')" class="bg-red-50 text-red-500 px-8 py-5 rounded-2xl font-black uppercase text-[10px]">Revisi Perawat</button>
        </div>
    </div>`;
}

function saveDokter(id) {
    const i = dbPasien.findIndex(x => x.id == id);
    dbPasien[i].medis.icd = document.getElementById(`d-icd-${id}`).value;
    dbPasien[i].medis.resep = document.getElementById(`d-resep-${id}`).value;
    dbPasien[i].medis.diagnosa = document.getElementById(`d-diag-${id}`).value;
    dbPasien[i].status = 'Antre Farmasi'; save(); loadDashboard('dokter');
}

// --- FARMASI & KASIR ---
function renderFarmasi(p) {
    return `
    <div class="mt-8 pt-8 border-t border-slate-100">
        <div class="p-8 bg-emerald-50 rounded-[2rem] mb-6">
            <h5 class="text-[10px] font-black text-emerald-400 uppercase mb-2">Resep Dari Dokter:</h5>
            <p class="text-2xl font-bold text-emerald-900 whitespace-pre-wrap">${p.medis.resep}</p>
        </div>
        <div class="flex gap-4">
            <button onclick="printEtiket('${p.id}')" class="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px]">Cetak Label Obat</button>
            <button onclick="revisiStatus('${p.id}', 'Antre Dokter')" class="bg-red-50 text-red-500 px-8 py-4 rounded-xl font-black uppercase text-[10px]">Revisi Dokter</button>
            <button onclick="updateStat('${p.id}', 'Antre Kasir')" class="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px]">Selesai Obat</button>
        </div>
    </div>`;
}

function renderKasir(p) {
    return `
    <div class="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-end gap-10">
        <div class="w-full md:w-1/2">
            <label class="text-[10px] font-black text-slate-400 uppercase">Metode Pembayaran</label>
            <select id="k-pay-${p.id}" class="w-full p-4 bg-slate-50 rounded-xl font-bold mt-2">${dbPay.map(m => `<option value="${m}">${m}</option>`).join('')}</select>
        </div>
        <div class="text-right">
            <p class="text-xs font-black text-slate-400 uppercase">Total Billing</p>
            <h2 class="text-5xl font-black text-blue-600 mb-6">Rp ${p.billing.toLocaleString()}</h2>
            <button onclick="printInvoice('${p.id}')" class="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs shadow-lg">Bayar & Cetak Struk</button>
        </div>
    </div>`;
}

// --- FITUR CETAK (REKAM MEDIS, LABEL, INVOICE) ---
function printRM(id) {
    const p = dbPasien.find(x => x.id == id);
    const a = document.getElementById('print-area');
    a.innerHTML = `
    <div class="p-10 font-serif border-2 border-black w-full">
        <div class="text-center border-b-4 border-double border-black pb-4 mb-6">
            <h1 class="text-3xl font-black uppercase">ATRIA JAYA MEDIKA</h1>
            <p>Sistem Informasi Rekam Medis Elektronik</p>
        </div>
        <h2 class="text-center font-bold text-xl mb-10 underline uppercase">Data Rekam Medis Pasien</h2>
        <div class="grid grid-cols-2 gap-6 mb-10 text-sm">
            <div>Nama: <strong>${p.nama}</strong></div><div>Umur: ${p.umur} Thn</div>
            <div>Poli: ${p.poli}</div><div>Tanggal Kunjungan: ${p.tgl}</div>
        </div>
        <div class="space-y-6">
            <div class="p-4 border"><strong>Vital Sign:</strong> Tensi ${p.medis.tensi} | Suhu ${p.medis.suhu}°C</div>
            <div class="p-4 border"><strong>Diagnosa:</strong> ${p.medis.diagnosa} (ICD: ${p.medis.icd})</div>
            <div class="p-4 border"><strong>Resep:</strong><br>${p.medis.resep}</div>
        </div>
        <div class="mt-20 text-right text-xs">Dicetak pada: ${new Date().toLocaleString()}</div>
    </div>`;
    window.print();
}

function printEtiket(id) {
    const p = dbPasien.find(x => x.id == id);
    const a = document.getElementById('print-area');
    a.innerHTML = `
    <div class="p-4 border-2 border-blue-600 rounded-lg w-[300px] font-sans text-xs mx-auto">
        <div class="text-center font-bold border-b border-blue-500 pb-1 mb-2">FARMASI ATRIA JAYA MEDIKA</div>
        <div class="flex justify-between font-bold mb-2"><span>#${p.no}</span><span>${p.tgl}</span></div>
        <div class="mb-2">Pasien: <strong>${p.nama}</strong></div>
        <div class="p-3 bg-blue-50 rounded border text-center font-black text-sm my-2">${p.medis.resep}</div>
        <div class="text-[9px] text-center italic mt-2">Semoga Cepat Sembuh</div>
    </div>`;
    window.print();
}

function printInvoice(id) {
    const p = dbPasien.find(x => x.id == id);
    const pay = document.getElementById(`k-pay-${id}`).value;
    const a = document.getElementById('print-area');
    a.innerHTML = `<div class="p-10 border font-mono w-[300px] text-center"><h3>ATRIA JAYA MEDIKA</h3><p>${p.nama}</p><hr><h3>TOTAL: Rp ${p.billing.toLocaleString()}</h3><p>Metode: ${pay}</p><h4>LUNAS</h4></div>`;
    window.print(); updateStat(id, 'Selesai');
}

// --- FITUR MONITOR TV (PATEN) ---
function toggleTV() {
    document.getElementById('tv-monitor').classList.toggle('hidden');
    if(!document.getElementById('tv-monitor').classList.contains('hidden')) renderTV();
}

function renderTV() {
    const units = [
        {l:'Antrean Perawat', s:'Antre Perawat', c:'bg-emerald-500'}, 
        {l:'Antrean Dokter', s:'Antre Dokter', c:'bg-blue-500'}, 
        {l:'Apotek & Kasir', s:'Antre Farmasi', c:'bg-orange-500'}
    ];
    document.getElementById('tv-grid').innerHTML = units.map(u => `
        <div class="bg-white/5 rounded-[3rem] p-8 border border-white/10">
            <h2 class="${u.c} text-white p-4 rounded-2xl text-center font-black mb-8 uppercase text-xl">${u.l}</h2>
            <div class="space-y-4">
                ${dbPasien.filter(p => p.status === u.s).slice(0,3).map(p => `
                    <div class="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/5 shadow-xl">
                        <span class="text-white text-3xl font-black">${p.nama}</span>
                        <span class="text-blue-500 text-5xl font-mono font-black">#${p.no}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// --- SISA FITUR PENDUKUNG ---
function renderAdmisi() {
    return `
    <div class="bg-white p-10 rounded-[3rem] shadow-sm w-full animate-fade-in border border-slate-100">
        <h3 class="text-3xl font-black mb-10 text-blue-600 uppercase italic">Form Pendaftaran</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="space-y-1"><label class="text-[10px] font-black uppercase text-slate-400 ml-2">Nama Pasien</label><input id="a-nama" class="w-full p-4 bg-slate-50 rounded-2xl font-bold border"></div>
            <div class="space-y-1"><label class="text-[10px] font-black uppercase text-slate-400 ml-2">NIK</label><input id="a-nik" type="number" class="w-full p-4 bg-slate-50 rounded-2xl font-bold border"></div>
            <div class="space-y-1"><label class="text-[10px] font-black uppercase text-slate-400 ml-2">Umur</label><input id="a-umur" type="number" class="w-full p-4 bg-slate-50 rounded-2xl font-bold border"></div>
            <div class="space-y-1"><label class="text-[10px] font-black uppercase text-slate-400 ml-2">Jenis Kelamin</label><select id="a-jk" class="w-full p-4 bg-slate-50 rounded-2xl font-bold"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
            <div class="space-y-1"><label class="text-[10px] font-black uppercase text-slate-400 ml-2">Poli Tujuan</label><select id="a-poli" class="w-full p-4 bg-slate-50 rounded-2xl font-bold"><option value="Umum">Poli Umum</option><option value="Gigi">Poli Gigi</option></select></div>
        </div>
        <button onclick="simpanPasien()" class="mt-10 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs shadow-lg">Simpan Pasien</button>
    </div>`;
}

function simpanPasien() {
    const p = {
        id: Date.now(), no: getNewNo(), tgl: new Date().toLocaleDateString(),
        nama: document.getElementById('a-nama').value, nik: document.getElementById('a-nik').value,
        umur: document.getElementById('a-umur').value, jk: document.getElementById('a-jk').value,
        poli: document.getElementById('a-poli').value, status: 'Antre Perawat',
        medis: { tensi:'', suhu:'', riwayat:'', diagnosa:'', icd:'', resep:'' }, billing: 50000
    };
    if(!p.nama) return alert("Nama Wajib Diisi!");
    dbPasien.push(p); save(); loadDashboard('admin');
}

function renderRiwayatPetugas(target) {
    const data = dbPasien.filter(p => p.status === target || (target === 'Selesai' && p.status === 'Selesai'));
    return `<div class="bg-white p-10 rounded-[3rem] shadow-sm"><h3 class="font-black mb-6 uppercase">Riwayat Kerja Saya</h3>${data.map(p => `<div class="flex justify-between p-6 bg-slate-50 rounded-2xl font-bold mb-4"><span>#${p.no} - ${p.nama}</span><button onclick="printRM('${p.id}')" class="text-blue-600">Lihat RM</button></div>`).join('')}</div>`;
}

function renderRiwayatUmum() {
    return `<div class="bg-white rounded-[2rem] overflow-hidden shadow-sm"><table class="w-full text-left text-xs"><thead class="bg-slate-900 text-white"><tr><th class="p-6">No</th><th class="p-6">Nama</th><th class="p-6">Status</th><th class="p-6">Aksi</th></tr></thead><tbody>${dbPasien.map(p => `<tr class="border-b font-bold"><td class="p-6">#${p.no}</td><td class="p-6">${p.nama}</td><td class="p-6 uppercase text-blue-600">${p.status}</td><td class="p-6"><button onclick="printRM('${p.id}')" class="text-blue-500">LIHAT RM</button></td></tr>`).join('')}</tbody></table></div>`;
}

function renderGudang() { return `<div class="bg-white p-10 rounded-3xl shadow-sm"><h3 class="font-black mb-6 uppercase">Stok Obat</h3>${dbObat.map((o,i) => `<div class="flex justify-between items-center p-4 border-b font-bold"><span>${o.nama}</span><input type="number" onchange="dbObat[${i}].stok=this.value;save()" value="${o.stok}" class="w-16 border text-center rounded"></div>`).join('')}</div>`; }
function renderOwner() { const tot = dbPasien.filter(p => p.status === 'Selesai').reduce((a,b) => a + b.billing, 0); return `<div class="bg-blue-600 p-16 rounded-[4rem] text-white"><h4>Omset Klinik</h4><h2 class="text-6xl font-black italic">Rp ${tot.toLocaleString()}</h2></div>`; }
function revisiStatus(id, s) { const i = dbPasien.findIndex(x => x.id == id); dbPasien[i].status = s; save(); loadDashboard(JSON.parse(sessionStorage.getItem('artha_session')).role); }
function updateStat(id, s) { const i = dbPasien.findIndex(x => x.id == id); dbPasien[i].status = s; save(); loadDashboard(JSON.parse(sessionStorage.getItem('artha_session')).role); }
function speak(n, no) { const m = new SpeechSynthesisUtterance(`Nomor antrean ${no}, ${n}, silakan masuk.`); m.lang = 'id-ID'; window.speechSynthesis.speak(m); }
function logout() { sessionStorage.clear(); location.reload(); }
function switchTab(t) { document.getElementById('login-container').classList.toggle('hidden', t==='patient'); document.getElementById('patient-container').classList.toggle('hidden', t==='staff'); }

window.onload = () => { 
    if(sessionStorage.getItem('artha_session')) loadDashboard(JSON.parse(sessionStorage.getItem('artha_session')).role); 
    setInterval(() => { if(document.getElementById('tv-clock')) document.getElementById('tv-clock').innerText = new Date().toLocaleTimeString('id-ID'); }, 1000); 
};