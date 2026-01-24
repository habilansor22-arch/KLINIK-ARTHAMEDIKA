/**
 * SIMRS ATRIA JAYA MEDIKA - SOSIAL.JS (FINAL VERSION)
 * Fitur: No. RM Otomatis, Telp Pasien & PJ, Cetak Medis Terpadu, Format Rapi.
 */

import { dbPasien, updateDatabase, save, loadDashboard, getNewNo } from './app.js';

// 1. HELPER FIELD (INPUT STYLING)
function fieldSosial(label, id, value) {
    return `<div>
        <label class="text-[10px] font-bold text-slate-400 uppercase">${label}</label>
        <input type="text" id="${id}" value="${value}" class="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500">
    </div>`;
}

// 2. RENDER FORM ADMISI (NOMOR RM OTOMATIS BERGANTI)
export function renderAdmisi(editId = null) {
    updateDatabase(); // Ensure we have latest data
    const p = editId ? dbPasien.find(x => x.id == editId) : null;

    // LOGIKA GENERATE NOMOR RM BARU (OTOMATIS BERGANTI)
    const total = dbPasien.length + 1;
    const rmBaru = `${Math.floor(total / 10000).toString().padStart(2, '0')}-${Math.floor((total % 10000) / 100).toString().padStart(2, '0')}-${(total % 100).toString().padStart(2, '0')}`;
    const displayRM = p ? p.nik : rmBaru;

    return `
    <div class="bg-white p-10 rounded-[3rem] shadow-sm animate-fade-in">
        <div class="flex justify-between items-center mb-10">
            <div class="flex items-center gap-4">
                <img src="Logo Atria.png" class="w-16 h-16 object-contain">
                <h2 class="text-3xl font-black text-slate-800 italic uppercase">Registrasi Pasien Baru</h2>
            </div>
            <div class="text-right">
                <p class="text-[10px] font-bold text-slate-400 uppercase">NO. RM BERIKUTNYA</p>
                <p id="rm-display" class="text-4xl font-black text-blue-600">${displayRM}</p>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div class="space-y-4">
                <p class="text-blue-600 font-black text-xs uppercase border-l-4 border-blue-600 pl-3">I. Identitas Pasien</p>
                ${fieldSosial("Nama Lengkap", "a-nama", p?.nama || "")}
                ${fieldSosial("No. Telp Pasien", "a-telp", p?.telp || "")}
                ${fieldSosial("Tempat, Tanggal Lahir", "a-ttl", p?.ttl || "")}
                <div class="grid grid-cols-2 gap-4">
                    ${fieldSosial("Umur", "a-umur", p?.umur || "")}
                    ${fieldSosial("Gender (L/P)", "a-jk", p?.jk || "")}
                </div>
                ${fieldSosial("Agama", "a-agama", p?.agama || "")}
                ${fieldSosial("Status Kawin", "a-status", p?.status_kawin || "")}
            </div>
            <div class="space-y-4">
                <p class="text-green-600 font-black text-xs uppercase border-l-4 border-green-600 pl-3">II. Penanggung Jawab (PJ)</p>
                ${fieldSosial("Nama PJ", "a-pj-nama", p?.pj || "")}
                ${fieldSosial("No. HP PJ", "a-pj-telp", p?.pj_telp || "")}
                ${fieldSosial("Hubungan", "a-pj-hub", p?.pj_hub || "")}
                <label class="text-[10px] font-bold text-slate-400 uppercase">Alamat Lengkap</label>
                <textarea id="a-alamat" class="w-full p-4 bg-slate-50 rounded-2xl font-bold h-24 border-none outline-none focus:ring-2 focus:ring-blue-500">${p?.alamat || ""}</textarea>
            </div>
            <div class="space-y-4">
                <p class="text-amber-600 font-black text-xs uppercase border-l-4 border-amber-600 pl-3">III. Administrasi Klinik</p>
                ${fieldSosial("Pendidikan", "a-pendidikan", p?.pendidikan || "")}
                ${fieldSosial("Pekerjaan", "a-pekerjaan", p?.pekerjaan || "")}
                ${fieldSosial("Cara Bayar", "a-bayar", p?.bayar || "")}
                <button onclick="prosesSimpanSosial('${editId || ''}')" class="w-full bg-slate-900 text-white p-6 rounded-3xl font-black uppercase text-xs mt-4 shadow-xl hover:bg-blue-600 transition-all">
                    SIMPAN & CETAK REKAM MEDIS
                </button>
            </div>
        </div>
    </div>`;
}

// 3. LOGIKA SIMPAN (DENGAN RE-GENERATE RM UNTUK KEAMANAN)
export function prosesSimpanSosial(editId = null) {
    updateDatabase();
    const f = (id) => document.getElementById(id).value;

    // Pastikan nomor RM selalu yang terbaru jika pendaftaran baru
    const total = dbPasien.length + 1;
    const rmGenerated = `${Math.floor(total / 10000).toString().padStart(2, '0')}-${Math.floor((total % 10000) / 100).toString().padStart(2, '0')}-${(total % 100).toString().padStart(2, '0')}`;

    const dataInp = {
        nama: f('a-nama'), telp: f('a-telp'), ttl: f('a-ttl'),
        umur: f('a-umur'), jk: f('a-jk'), agama: f('a-agama'),
        status_kawin: f('a-status'), pendidikan: f('a-pendidikan'),
        pekerjaan: f('a-pekerjaan'), pj: f('a-pj-nama'),
        pj_telp: f('a-pj-telp'), pj_hub: f('a-pj-hub'),
        alamat: f('a-alamat'), bayar: f('a-bayar')
    };

    if (editId && editId !== '') {
        const i = dbPasien.findIndex(x => x.id == editId);
        dbPasien[i] = { ...dbPasien[i], ...dataInp };
    } else {
        const p = {
            id: Date.now(), no: getNewNo(),
            reg: "REG" + new Date().getFullYear() + Math.floor(Math.random() * 1000),
            nik: rmGenerated,
            tgl_kunjungan: new Date().toLocaleDateString(),
            status: 'Antre Perawat',
            medis: { tensi: '', suhu: '', riwayat: '', diagnosa: '', icd: '', resep: '' },
            billing: 50000, ...dataInp
        };
        dbPasien.push(p);
        setTimeout(() => cetakDataSosial(p), 500);
    }
    save();
    loadDashboard('admin');
}

// 4. FORMAT CETAK (VERTICAL-ALIGN TOP & REKAM MEDIS TERPADU)
export function cetakDataSosial(p) {
    const a = document.getElementById('print-area');
    const tgl = new Date().toLocaleDateString('id-ID');
    const m = p.medis || { tensi: '-', suhu: '-', riwayat: '-', diagnosa: '-', resep: '-' };

    a.innerHTML = `
        <div style="padding:20px; font-family:sans-serif; width:210mm; margin:auto; background:white; color:black;">
            <table style="width:100%; border-collapse: collapse; border: 2px solid black; table-layout: fixed;">
                <tr>
                    <td style="border: 2px solid black; padding: 10px; width: 20%; text-align: center; vertical-align: top;">
                        <img src="Logo Atria.png" style="width:70px; height:auto;">
                    </td>
                    <td style="border: 2px solid black; padding: 10px; width: 50%; text-align: center; vertical-align: top;">
                        <h2 style="margin:0; font-size:18px;">DATA REKAM MEDIS TERPADU</h2>
                        <p style="margin:0; font-size:12px; font-weight:bold;">ATRIA JAYA MEDIKA</p>
                    </td>
                    <td style="border: 2px solid black; padding: 10px; width: 30%; text-align: right; font-size: 11px; vertical-align: top;">
                        REG : ${p.reg}<br>TGL : ${p.tgl_kunjungan || tgl}
                    </td>
                </tr>
                
                <tr>
                    <td colspan="2" style="border: 2px solid black; padding: 15px; vertical-align: top;">
                        <span style="font-size:10px; color:#666;">NAMA PASIEN:</span><br>
                        <span style="font-size:24px; font-weight:bold; text-transform:uppercase;">${p.nama}</span>
                    </td>
                    <td style="border: 2px solid black; padding: 15px; text-align: right; vertical-align: top;">
                        <span style="font-size:10px; color:#666;">NO. REKAM MEDIS:</span><br>
                        <span style="font-size:32px; font-weight:bold;">${p.nik}</span>
                    </td>
                </tr>

                <tr>
                    <td colspan="2" style="border: 2px solid black; padding: 15px; font-size: 13px; vertical-align: top;">
                        <table style="width:100%; border-collapse: collapse; line-height: 1.6;">
                            <tr><td style="width:110px; vertical-align: top;">TTL</td><td>: ${p.ttl}</td></tr>
                            <tr><td style="vertical-align: top;">Umur / JK</td><td>: ${p.umur} Thn / ${p.jk}</td></tr>
                            <tr><td style="vertical-align: top;">No. Telp</td><td>: <b>${p.telp || '-'}</b></td></tr>
                            <tr><td style="vertical-align: top;">Alamat</td><td>: ${p.alamat}</td></tr>
                        </table>
                    </td>
                    <td style="border: 2px solid black; padding: 15px; font-size: 13px; vertical-align: top;">
                        <table style="width:100%; border-collapse: collapse; line-height: 1.6;">
                            <tr><td style="width:110px; vertical-align: top;">Cara Bayar</td><td>: ${p.bayar}</td></tr>
                            <tr><td style="vertical-align: top;">Penanggung Jawab</td><td>: ${p.pj} (${p.pj_hub})</td></tr>
                            <tr><td style="vertical-align: top;">HP Penanggung</td><td>: <b>${p.pj_telp || '-'}</b></td></tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td colspan="3" style="border: 2px solid black; padding: 10px; background-color: #f0f0f0; font-weight: bold; font-size: 13px; text-align: center;">HASIL PEMERIKSAAN KLINIS</td>
                </tr>
                <tr>
                    <td colspan="3" style="border: 2px solid black; padding: 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 50%; padding: 15px; border-right: 2px solid black; vertical-align: top; font-size: 12px;">
                                    <b style="color: blue;">PEMERIKSAAN FISIK (PERAWAT):</b><br><br>
                                    TD: ${m.tensi || '-'} mmHg | S: ${m.suhu || '-'} °C<br>
                                    Anamnesa/Keluhan:<br>
                                    <i>${m.riwayat || '-'}</i>
                                </td>
                                <td style="width: 50%; padding: 15px; vertical-align: top; font-size: 12px;">
                                    <b style="color: red;">DIAGNOSA & TERAPI (DOKTER):</b><br><br>
                                    Diagnosa: <b>${m.diagnosa || '-'}</b> (${m.icd || '-'})<br>
                                    Resep/Tindakan:<br>
                                    <div style="border: 1px dashed black; padding: 8px; margin-top: 5px;">${m.resep || '-'}</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr style="text-align: center;">
                    <td colspan="2" style="border: 2px solid black; padding: 20px; height: 120px; vertical-align: bottom;">
                        <div style="margin-bottom: 50px;">Petugas Admisi / Perawat</div>
                        <b>( ............................. )</b>
                    </td>
                    <td style="border: 2px solid black; padding: 20px; height: 120px; vertical-align: bottom;">
                        <div style="margin-bottom: 40px;">Tangerang, ${tgl}<br>Dokter Pemeriksa</div>
                        <b>( ............................. )</b>
                    </td>
                </tr>
            </table>
        </div>`;

    setTimeout(() => { window.print(); }, 500);
}

// 5. DATABASE VIEW (UNTUK ADMIN)
export function renderRiwayatUmum() {
    updateDatabase();
    return `
    <div class="bg-white p-10 rounded-3xl shadow-sm">
        <h3 class="font-black mb-6 uppercase text-slate-700">Database Pasien</h3>
        <table class="w-full text-left font-bold border-collapse">
            <thead class="bg-slate-50 text-[10px] uppercase text-slate-400">
                <tr class="border-b">
                    <th class="p-4">RM</th>
                    <th class="p-4">Nama Pasien</th>
                    <th class="p-4">Telepon</th>
                    <th class="p-4 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                ${dbPasien.map(p => `
                    <tr class="border-b text-sm hover:bg-slate-50 transition-all">
                        <td class="p-4 text-blue-600 font-black">${p.nik}</td>
                        <td class="p-4 uppercase">${p.nama}</td>
                        <td class="p-4 font-normal text-slate-500">${p.telp || '-'}</td>
                        <td class="p-4">
                            <div class="flex justify-center gap-3">
                                <!-- Pass ID instead of object to avoid quoting issues -->
                                <button onclick='cetakDataSosialById("${p.id}")' class="text-green-500 hover:scale-110"><i class="fas fa-print"></i></button>
                                <button onclick="document.getElementById('content-area').innerHTML = renderAdmisi('${p.id}')" class="text-blue-500 hover:scale-110"><i class="fas fa-edit"></i></button>
                                <button onclick="hapusPasien('${p.id}')" class="text-red-500 hover:scale-110"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
}

export function cetakDataSosialById(id) {
    updateDatabase();
    const p = dbPasien.find(x => x.id == id);
    if (p) cetakDataSosial(p);
}

export function hapusPasien(id) {
    updateDatabase();
    if (confirm("Hapus data secara permanen?")) {
        const idx = dbPasien.findIndex(x => x.id == id);
        if (idx > -1) {
            dbPasien.splice(idx, 1);
            save();
            loadDashboard('admin');
        }
    }
}


window.prosesSimpanSosial = prosesSimpanSosial;
window.cetakDataSosial = cetakDataSosial;
window.cetakDataSosialById = cetakDataSosialById;
window.hapusPasien = hapusPasien;
window.renderAdmisi = renderAdmisi;
