/**
 * SIMRS ATRIA JAYA MEDIKA - MASTER ENGINE v2.0
 * PENGGABUNGAN TOTAL: FITUR LAMA + FITUR BARU + PASIEN LAMA
 * STATUS: FIXED SEARCH & DATA PERSISTENCE
 */

// 1. INISIALISASI DATABASE
export let dbPasien = JSON.parse(localStorage.getItem('db_atria_v35')) || [];
export let dbObat = JSON.parse(localStorage.getItem('db_obat_v35')) || [
    { id: 1, nama: 'Paracetamol 500mg', stok: 100 },
    { id: 2, nama: 'Amoxicillin 500mg', stok: 50 }
];

export function updateDatabase() {
    dbPasien = JSON.parse(localStorage.getItem('db_atria_v35')) || [];
}

export function save() {
    localStorage.setItem('db_atria_v35', JSON.stringify(dbPasien));
    localStorage.setItem('db_obat_v35', JSON.stringify(dbObat));
}

export function getNewNo() {
    updateDatabase();
    const tgl = new Date().toLocaleDateString();
    return dbPasien.filter(p => p.tgl_kunjungan === tgl).length + 1;
}

// 2. SISTEM LOGIN (PIN 12345)
export function prosesLogin() {
    const role = document.getElementById('login-role').value;
    const pin = document.getElementById('login-pass').value;
    const name = document.getElementById('login-role').options[document.getElementById('login-role').selectedIndex].text;
    if (pin === '12345') {
        sessionStorage.setItem('artha_session', JSON.stringify({ role, name }));
        loadDashboard(role);
    } else { alert("PIN SALAH!"); }
}

// 3. FITUR DAFTAR MANDIRI
export function simpanMandiri() {
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
        medis: [{ tgl: new Date().toLocaleDateString('id-ID'), tensi: '', suhu: '', riwayat: '', diagnosa: '', icd: '', resep: '' }],
        billing: 50000
    };
    if (!p.nama || !p.nik || !p.wa) return alert("Mohon lengkapi Nama, NIK, dan WhatsApp!");
    dbPasien.push(p); save();
    alert(`Berhasil! Nomor Antrean Anda: #${p.no}. Silakan tunggu.`);
    location.reload();
}

// =========================================================================
// IMPORTS FOR SUB-MODULES (To resolve circular dependencies or split code)
// =========================================================================
import { renderCariPasienLama } from './pasien_lama.js';
import { renderAdmisi, renderRiwayatUmum as renderDBPasien } from './sosial.js';
import { renderRekamMedis } from './rekam_medis.js';

// 4. CORE DASHBOARD & NAVIGASI
export function loadDashboard(role) {
    updateDatabase();
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-dashboard').classList.remove('hidden');
    const user = JSON.parse(sessionStorage.getItem('artha_session'));
    document.getElementById('user-display').innerText = `USER: ${user.name} | ATRIA JAYA MEDIKA`;

    const nav = document.getElementById('sidebar-menu'); nav.innerHTML = '';
    const menus = {
        admin: [
            { l: 'Pendaftaran Internal', i: 'fa-user-plus', r: renderAdmisi },
            { l: 'Pasien Lama', i: 'fa-history', r: renderCariPasienLama },
            { l: 'Antrean Perawat', i: 'fa-clock', r: () => renderList('Antre Perawat', 'admin') },
            { l: 'Database Pasien', i: 'fa-database', r: renderDBPasien },
            { l: 'Rekam Medis (RM)', i: 'fa-file-medical', r: renderRekamMedis } // Added New Module
        ],
        perawat: [
            { l: 'Pemeriksaan Fisik', i: 'fa-stethoscope', r: () => renderList('Antre Perawat', 'perawat') },
            { l: 'Riwayat Kerja Saya', i: 'fa-history', r: () => renderRiwayatPetugas('Antre Dokter') }
        ],
        dokter: [
            { l: 'Diagnosa & Resep', i: 'fa-user-md', r: () => renderList('Antre Dokter', 'dokter') },
            { l: 'Riwayat Diagnosa Saya', i: 'fa-notes-medical', r: () => renderRiwayatPetugas('Antre Farmasi') }
        ],
        farmasi: [
            { l: 'Antrean Resep', i: 'fa-pills', r: () => renderList('Antre Farmasi', 'farmasi') },
            { l: 'Riwayat Penyerahan', i: 'fa-clipboard-check', r: () => renderRiwayatPetugas('Antre Kasir') }
        ],
        kasir: [
            { l: 'Billing Kasir', i: 'fa-cash-register', r: () => renderList('Antre Kasir', 'kasir') },
            { l: 'Laporan Omset', i: 'fa-chart-line', r: renderOwner }
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
        nav.appendChild(b); if (i === 0) b.click();
    });
}

// 6. RENDER LIST & FORMS
export function renderList(s, r) {
    updateDatabase();
    const data = dbPasien.filter(p => p.status === s);
    return `<div class="flex flex-col gap-8 w-full animate-fade-in">
        ${data.map(p => {
        const m = p.medis[p.medis.length - 1] || p.medis; // Handle legacy object structure if needed
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
                ${r === 'perawat' ? renderPerawat(p, m) : r === 'dokter' ? renderDokter(p, m) : r === 'farmasi' ? renderFarmasi(p, m) : r === 'kasir' ? renderKasir(p) : ''}
            </div>`;
    }).join('') || '<div class="py-32 text-center opacity-10 font-black text-5xl italic uppercase">Kosong</div>'}
    </div>`;
}

function renderPerawat(p, m) {
    return `<div class="mt-8 pt-8 border-t space-y-6">
        <div class="grid grid-cols-2 gap-6">
            <input id="p-tensi-${p.id}" value="${m.tensi || ''}" placeholder="Tensi (TD)" class="p-5 bg-slate-50 border rounded-2xl font-bold">
            <input id="p-suhu-${p.id}" value="${m.suhu || ''}" placeholder="Suhu (°C)" class="p-5 bg-slate-50 border rounded-2xl font-bold">
        </div>
        <textarea id="p-riwayat-${p.id}" placeholder="Keluhan Pasien" class="w-full p-5 bg-slate-50 border rounded-2xl font-bold h-24">${m.riwayat || ''}</textarea>
        <button onclick="savePerawat('${p.id}')" class="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs">Kirim Ke Dokter</button>
    </div>`;
}

function renderDokter(p, m) {
    return `<div class="mt-8 pt-8 border-t space-y-6">
        <div class="grid grid-cols-2 gap-6">
            <input id="d-icd-${p.id}" value="${m.icd || ''}" placeholder="Kode ICD-10" class="p-5 bg-slate-50 border rounded-2xl font-bold">
            <textarea id="d-resep-${p.id}" placeholder="Resep Obat" class="p-5 bg-indigo-50 border rounded-2xl font-bold h-24">${m.resep || ''}</textarea>
        </div>
        <textarea id="d-diag-${p.id}" placeholder="Analisa Diagnosa Dokter" class="w-full p-5 bg-slate-50 border rounded-2xl font-bold h-32">${m.diagnosa || ''}</textarea>
        <button onclick="saveDokter('${p.id}')" class="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs">Selesai Periksa</button>
    </div>`;
}

function renderFarmasi(p, m) {
    return `<div class="mt-8 pt-8 border-t">
        <div class="p-8 bg-emerald-50 rounded-3xl mb-6 font-bold text-emerald-800 text-2xl italic">${m.resep || 'Tidak ada resep'}</div>
        <button onclick="updateStat('${p.id}', 'Antre Kasir')" class="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase">Selesai & Kasir</button>
    </div>`;
}

function renderKasir(p) {
    return `<div class="mt-8 pt-8 border-t flex justify-between items-center">
        <h2 class="text-5xl font-black text-blue-600">Rp ${(p.billing || 0).toLocaleString()}</h2>
        <button onclick="printInvoice('${p.id}')" class="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs">Lunas & Struk</button>
    </div>`;
}

// 7. CETAKAN & UPDATE DATA
export function savePerawat(id) {
    updateDatabase();
    const i = dbPasien.findIndex(x => x.id == id);
    let m = Array.isArray(dbPasien[i].medis) ? dbPasien[i].medis[dbPasien[i].medis.length - 1] : dbPasien[i].medis;
    m.tensi = document.getElementById(`p-tensi-${id}`).value;
    m.suhu = document.getElementById(`p-suhu-${id}`).value;
    m.riwayat = document.getElementById(`p-riwayat-${id}`).value;
    dbPasien[i].status = 'Antre Dokter';
    save(); loadDashboard('perawat');
}

export function saveDokter(id) {
    updateDatabase();
    const i = dbPasien.findIndex(x => x.id == id);
    let m = Array.isArray(dbPasien[i].medis) ? dbPasien[i].medis[dbPasien[i].medis.length - 1] : dbPasien[i].medis;
    m.icd = document.getElementById(`d-icd-${id}`).value;
    m.resep = document.getElementById(`d-resep-${id}`).value;
    m.diagnosa = document.getElementById(`d-diag-${id}`).value;
    dbPasien[i].status = 'Antre Farmasi';
    save(); loadDashboard('dokter');
}

export function printRM(id) {
    updateDatabase();
    const p = dbPasien.find(x => x.id == id);
    const m = Array.isArray(p.medis) ? p.medis[p.medis.length - 1] : p.medis;
    const a = document.getElementById('print-area');
    a.innerHTML = `<div class="p-10 border-4 border-black font-serif">
        <h1 class="text-center text-2xl font-black uppercase">Atria Jaya Medika</h1><hr class="border-black my-4">
        <h3>REKAM MEDIS PASIEN</h3>
        <p>Nama: ${p.nama} | RM: 00-${p.no}</p>
        <p>NIK: ${p.nik} | Tgl: ${m.tgl || new Date().toLocaleDateString()}</p><br>
        <p><b>Pemeriksaan Fisik:</b> TD: ${m.tensi} | Suhu: ${m.suhu}</p>
        <p><b>Keluhan:</b> ${m.riwayat}</p>
        <p><b>Diagnosa:</b> ${m.diagnosa} (${m.icd})</p>
        <p><b>Terapi/Obat:</b> ${m.resep}</p>
    </div>`;
    window.print();
}

export function updateStat(id, s) {
    const i = dbPasien.findIndex(x => x.id == id);
    dbPasien[i].status = s; save();
    loadDashboard(JSON.parse(sessionStorage.getItem('artha_session')).role);
}

export function printInvoice(id) {
    const p = dbPasien.find(x => x.id == id);
    const a = document.getElementById('print-area');
    a.innerHTML = `<div class="p-6 border font-mono"><h3>STRUK ATRIA JAYA</h3><p>${p.nama}</p><h3>TOTAL: Rp ${(p.billing || 0).toLocaleString()}</h3></div>`;
    window.print(); updateStat(id, 'Selesai');
}

// 8. MONITOR TV
export function toggleTV() {
    document.getElementById('tv-monitor').classList.toggle('hidden');
    if (!document.getElementById('tv-monitor').classList.contains('hidden')) renderTV();
}

export function renderTV() {
    const u = [
        { l: 'Antrean Perawat', s: 'Antre Perawat', c: 'bg-emerald-500' },
        { l: 'Antrean Dokter', s: 'Antre Dokter', c: 'bg-blue-500' },
        { l: 'Farmasi & Kasir', s: 'Antre Farmasi', c: 'bg-orange-500' }
    ];
    document.getElementById('tv-grid').innerHTML = u.map(x => `
        <div class="bg-white/5 rounded-[3rem] p-8 border border-white/10">
            <h2 class="${x.c} text-white p-4 rounded-2xl text-center font-black mb-8 uppercase">${x.l}</h2>
            <div class="space-y-4">
                ${dbPasien.filter(p => p.status === x.s).slice(0, 3).map(p => `
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

function renderOwner() {
    const tot = dbPasien.filter(p => p.status === 'Selesai').reduce((a, b) => a + (b.billing || 0), 0);
    return `<div class="bg-blue-600 p-16 rounded-[4rem] text-white"><h2>Omset Hari Ini: Rp ${tot.toLocaleString()}</h2></div>`;
}

export function speak(n, no) { const m = new SpeechSynthesisUtterance(`Antrean nomor ${no}, ${n}.`); m.lang = 'id-ID'; window.speechSynthesis.speak(m); }
export function logout() { sessionStorage.clear(); location.reload(); }
export function switchTab(t) {
    document.getElementById('login-container').classList.toggle('hidden', t === 'patient');
    document.getElementById('patient-container').classList.toggle('hidden', t === 'staff');
    document.getElementById('tab-staff').classList.toggle('bg-white', t === 'staff');
    document.getElementById('tab-patient').classList.toggle('bg-white', t === 'patient');
}

// 10. EXPOSE TO WINDOW (FOR HTML ONCLICK HANDLERS)
window.prosesLogin = prosesLogin;
window.simpanMandiri = simpanMandiri;
window.switchTab = switchTab;
window.toggleTV = toggleTV;
window.logout = logout;
window.printRM = printRM;
window.savePerawat = savePerawat;
window.saveDokter = saveDokter;
window.updateStat = updateStat;
window.printInvoice = printInvoice;
window.speak = speak;

// Window onload handler
window.onload = () => {
    if (sessionStorage.getItem('artha_session')) loadDashboard(JSON.parse(sessionStorage.getItem('artha_session')).role);
    setInterval(() => { if (document.getElementById('tv-clock')) document.getElementById('tv-clock').innerText = new Date().toLocaleTimeString('id-ID'); }, 1000);
};
