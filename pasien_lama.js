// ==========================================
// FITUR REKAM MEDIS INTEGRASI - ATRIA JAYA
// ==========================================

import { dbPasien, updateDatabase, save, loadDashboard } from './app.js';

// 1. RENDER TABEL UTAMA (TIDAK BERUBAH - MENJAGA KONSISTENSI)
export function renderRekamMedis() {
    updateDatabase(); 
    return `
    <div class="bg-white p-8 rounded-[3rem] shadow-xl animate-fade-in">
        <div class="flex justify-between items-center mb-10 border-b pb-6">
            <div class="flex items-center gap-4">
                <img src="Logo Atria.png" alt="Logo" class="w-16 h-16 object-contain">
                <div>
                    <h2 class="text-2xl font-black text-slate-800 uppercase italic leading-tight">Atria Jaya Medika</h2>
                    <p class="text-[10px] font-bold text-blue-600 tracking-[0.3em] uppercase">Digital Health Record System</p>
                </div>
            </div>
            <div class="flex gap-3">
                <input type="date" id="filter-tgl" onchange="filterTabelRM()" class="p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none shadow-inner text-sm">
                <input type="text" id="cari-rm" onkeyup="filterTabelRM()" placeholder="Cari Pasien..." class="p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none w-64 shadow-inner text-sm">
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-separate border-spacing-y-2">
                <thead>
                    <tr class="text-[10px] uppercase text-slate-400 font-black tracking-widest">
                        <th class="px-6 py-4">Waktu & Identitas</th>
                        <th class="px-6 py-4">Pemeriksaan Perawat</th>
                        <th class="px-6 py-4">Diagnosa Dokter</th>
                        <th class="px-6 py-4 text-center">Opsi</th>
                    </tr>
                </thead>
                <tbody id="tabel-rm-body">
                    ${dbPasien.length === 0 ? '<tr><td colspan="4" class="p-20 text-center text-slate-300 font-bold uppercase">Belum ada data</td></tr>' :
                    renderSeluruhRiwayat()}
                </tbody>
            </table>
        </div>
    </div>`;
}

// 2. LOGIKA ANTI-TIMPA: MERENDER SEMUA PEMERIKSAAN DARI LAMA KE BARU
function renderSeluruhRiwayat() {
    let html = "";
    dbPasien.forEach(p => {
        if (p.medis && Array.isArray(p.medis)) {
            // Me-looping setiap pemeriksaan di dalam array medis agar tidak tertimpa
            p.medis.forEach((m, index) => {
                html += `
                <tr class="bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group row-rm" data-tgl="${m.tgl || ''}">
                    <td class="px-6 py-4 rounded-l-3xl border-l-4 border-blue-600">
                        <div class="text-blue-600 font-black text-[10px] mb-1 uppercase">${m.hari || 'Kunjungan'}, ${m.tgl || '-'} ${m.jam || ''}</div>
                        <div class="font-bold uppercase text-slate-800 text-sm">${p.nama}</div>
                        <div class="text-[9px] text-slate-400 font-bold italic">RM: ${p.id.toString().slice(-6)}</div>
                    </td>
                    <td class="px-6 py-4 border-l border-white">
                        <div class="text-[11px] leading-relaxed italic text-blue-500">"${m.riwayat || 'Tidak ada keluhan'}"</div>
                        <div class="text-[10px] text-slate-400 mt-1">TD: <b>${m.tensi || '-'}</b> | S: <b>${m.suhu || '-'}</b>°C</div>
                    </td>
                    <td class="px-6 py-4 border-l border-white">
                        <div class="font-bold text-emerald-600 uppercase text-[11px]">${m.diagnosa || 'Menunggu Dokter'}</div>
                        <div class="text-slate-500 text-[9px] mt-1 italic">${m.resep || '-'}</div>
                    </td>
                    <td class="px-6 py-4 rounded-r-3xl text-center">
                        <div class="flex justify-center gap-2">
                            <button onclick="bukaFormDokter('${p.id}', ${index})" class="w-9 h-9 bg-white text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all"><i class="fas fa-edit"></i></button>
                            <button onclick="cetakResumeMedis('${p.id}', ${index})" class="w-9 h-9 bg-white text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-600 hover:text-white transition-all"><i class="fas fa-print"></i></button>
                        </div>
                    </td>
                </tr>`;
            });
        }
    });
    return html;
}

// 3. DESAIN CETAK PROFESIONAL (BOX STYLING & LOGO)
export function cetakResumeMedis(id, index) {
    updateDatabase();
    const p = dbPasien.find(x => x.id == id);
    const m = p.medis[index];

    const printWindow = window.open('', '', 'width=850,height=950');
    printWindow.document.write(`
        <html>
        <head>
            <title>Resume Medis - ${p.nama}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
                .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 4px solid #1e293b; padding-bottom: 15px; margin-bottom: 25px; }
                .hospital-brand { display: flex; align-items: center; gap: 15px; }
                .logo-img { width: 65px; height: 65px; object-fit: contain; }
                .hospital-name { font-size: 24px; font-weight: 800; text-transform: uppercase; margin: 0; color: #0f172a; }
                .box { border: 2px solid #e2e8f0; border-radius: 15px; padding: 20px; margin-bottom: 20px; background: #f8fafc; }
                .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #3b82f6; margin-bottom: 10px; display: block; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
                .value { font-size: 14px; font-weight: 700; color: #1e293b; }
                .diagnosa-highlight { font-size: 18px; font-weight: 800; color: #059669; }
                .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; display: flex; justify-content: space-between; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="hospital-brand">
                    <img src="Logo Atria.png" class="logo-img">
                    <div>
                        <h1 class="hospital-name">Atria Jaya Medika</h1>
                        <p style="margin:0; font-weight: 600; font-size: 12px; color: #3b82f6;">Laporan Rekam Medis Pasien</p>
                    </div>
                </div>
                <div style="text-align: right">
                    <div class="label">Tanggal Cetak</div>
                    <div class="value">${new Date().toLocaleDateString('id-ID')}</div>
                </div>
            </div>

            <div class="box">
                <span class="section-title">I. Identitas Pasien</span>
                <div class="grid">
                    <div><span class="label">Nama Pasien</span><div class="value">${p.nama}</div></div>
                    <div><span class="label">No. Rekam Medis</span><div class="value">RM-${p.id.toString().slice(-6)}</div></div>
                    <div><span class="label">NIK</span><div class="value">${p.nik || '-'}</div></div>
                    <div><span class="label">Waktu Kunjungan</span><div class="value">${m.hari}, ${m.tgl} | ${m.jam || ''}</div></div>
                </div>
            </div>

            <div class="box">
                <span class="section-title">II. Hasil Pemeriksaan Fisik</span>
                <div class="grid">
                    <div><span class="label">Vital Sign</span><div class="value">TD: ${m.tensi} | S: ${m.suhu}°C</div></div>
                    <div><span class="label">Keluhan Utama</span><div class="value italic">"${m.riwayat || '-'}"</div></div>
                </div>
            </div>

            <div class="box" style="border-left: 5px solid #10b981;">
                <span class="section-title">III. Diagnosa & Terapi Dokter</span>
                <div style="margin-bottom:15px;"><span class="label">Diagnosa</span><div class="diagnosa-highlight">${m.diagnosa || '-'}</div></div>
                <div class="grid">
                    <div><span class="label">Tindakan</span><div class="value">${m.tindakan || '-'}</div></div>
                    <div><span class="label">Resep Obat</span><div class="value">${m.resep || '-'}</div></div>
                </div>
            </div>

            <div class="footer">
                <div>Dokumen ini sah dikeluarkan oleh sistem SIMRS Atria Jaya Medika</div>
                <div style="text-align:center">
                    <p class="label">Tanda Tangan Dokter</p>
                    <br><br><br>
                    <p class="value">( ____________________ )</p>
                </div>
            </div>
            <script>window.print(); window.close();</script>
        </body>
        </html>
    `);
}

// 4. FUNGSI SIMPAN SPESIFIK KE INDEX (TETAP MENJAGA DATA LAMA)
export function simpanDataDokter(id, index) {
    updateDatabase();
    const pIdx = dbPasien.findIndex(x => x.id == id);
    if (pIdx !== -1) {
        dbPasien[pIdx].medis[index].diagnosa = document.getElementById('d-diagnosa').value;
        dbPasien[pIdx].medis[index].tindakan = document.getElementById('d-tindakan').value;
        dbPasien[pIdx].medis[index].resep = document.getElementById('d-resep').value;
        save();
        document.getElementById('modal-dokter').remove();
        document.getElementById('content-area').innerHTML = renderRekamMedis();
        alert("Data Kunjungan Berhasil Disimpan!");
    }
}

// Global Handlers (Agar bisa dipanggil onclick)
window.bukaFormDokter = bukaFormDokter;
window.simpanDataDokter = simpanDataDokter;
window.cetakResumeMedis = cetakResumeMedis;
window.filterTabelRM = function() {
    const val = document.getElementById('cari-rm').value.toUpperCase();
    const tgl = document.getElementById('filter-tgl').value;
    const rows = document.getElementsByClassName('row-rm');
    for (let row of rows) {
        const text = row.textContent.toUpperCase();
        const rowTgl = row.getAttribute('data-tgl');
        row.style.display = (text.includes(val) && (tgl === "" || rowTgl === tgl)) ? "" : "none";
    }
};