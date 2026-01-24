// ==========================================
// FITUR REKAM MEDIS TERPADU - ATRIA JAYA
// ==========================================
import { dbPasien, updateDatabase, save } from './app.js';

// Fungsi helper untuk mendapatkan stempel waktu Indonesia yang sangat detail
const getWaktuLengkap = () => {
    const d = new Date();
    const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][d.getDay()];
    const tanggal = d.getDate().toString().padStart(2, '0');
    const bulan = (d.getMonth() + 1).toString().padStart(2, '0');
    const tahun = d.getFullYear();
    const jam = d.getHours().toString().padStart(2, '0');
    const menit = d.getMinutes().toString().padStart(2, '0');
    
    return {
        display: `${hari}, ${tanggal}/${bulan}/${tahun} | ${jam}:${menit} WIB`,
        tglOnly: `${tanggal}/${bulan}/${tahun}`,
        filter: `${tahun}-${bulan}-${tanggal}` // Untuk filter input date
    };
};

// 1. FUNGSI RENDER TABEL UTAMA (FITUR AWAL TETAP DIJAGA)
export function renderRekamMedis() {
    updateDatabase(); 
    return `
    <div class="bg-white p-8 rounded-[3rem] shadow-xl animate-fade-in">
        <div class="flex justify-between items-center mb-10 border-b pb-6">
            <div class="flex items-center gap-4">
                <img src="Logo Atria.png" alt="Logo" class="w-20 h-20 object-contain">
                <div>
                    <h2 class="text-2xl font-black text-slate-800 uppercase italic leading-tight">Atria Jaya Medika</h2>
                    <p class="text-[10px] font-bold text-blue-600 tracking-[0.3em] uppercase">Digital Health Record System</p>
                </div>
            </div>
            <div class="flex gap-3">
                <input type="date" id="filter-tgl-rm" onchange="filterTabelRM()" 
                    class="p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 shadow-inner text-sm">
                
                <input type="text" id="cari-rm" onkeyup="filterTabelRM()" placeholder="Cari Pasien..." 
                    class="p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-inner text-sm">
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-separate border-spacing-y-2">
                <thead>
                    <tr class="text-[10px] uppercase text-slate-400 font-black tracking-widest">
                        <th class="px-6 py-4">Waktu Kunjungan & Pasien</th>
                        <th class="px-6 py-4">Pemeriksaan Fisik (Perawat)</th>
                        <th class="px-6 py-4">Diagnosa & Tindakan (Dokter)</th>
                        <th class="px-6 py-4 text-center">Opsi</th>
                    </tr>
                </thead>
                <tbody id="tabel-rm-body">
                    ${dbPasien.length === 0 ? '<tr><td colspan="4" class="p-20 text-center text-slate-300 font-bold uppercase">Belum ada data pasien</td></tr>' :
                    renderSemuaBarisRiwayat()}
                </tbody>
            </table>
        </div>
    </div>`;
}

// 2. FUNGSI UNTUK MERENDER SETIAP KUNJUNGAN TANPA MENIMPA
function renderSemuaBarisRiwayat() {
    let rows = "";
    dbPasien.forEach(p => {
        if (Array.isArray(p.medis)) {
            p.medis.forEach((m, index) => {
                rows += `
                <tr class="bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group row-rm" data-tgl="${m.tgl_raw || ''}">
                    <td class="px-6 py-4 rounded-l-3xl border-l-4 border-blue-600">
                        <div class="text-blue-600 font-black text-[10px] mb-1 uppercase">
                            ${m.waktu_lengkap || 'Kunjungan Lama'}
                        </div>
                        <div class="font-bold uppercase text-slate-800 text-sm">${p.nama || p.nama_lengkap}</div>
                        <div class="text-[9px] text-slate-400 font-bold italic">RM: ${p.id.toString().slice(-6)} | WA: ${p.wa || p.telepon || '-'}</div>
                    </td>
                    <td class="px-6 py-4 border-l border-white">
                        <div class="text-[11px] leading-relaxed">
                            <span class="text-slate-400 uppercase font-black text-[8px]">Vital Sign:</span> 
                            <b>${m.tensi || '-'}</b> mmHg | <b>${m.suhu || '-'}</b>°C<br>
                            <span class="text-blue-500 italic font-medium">"${m.riwayat || m.keluhan || 'Tidak ada keluhan'}"</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 border-l border-white">
                        <div class="text-[11px] leading-relaxed">
                            <div class="font-bold text-emerald-600 uppercase mb-1">${m.diagnosa || 'MENUNGGU DOKTER...'}</div>
                            <div class="text-slate-500 font-medium bg-white/50 p-1 rounded italic text-[9px]">Tindakan: ${m.tindakan || '-'} | Obat: ${m.resep || '-'}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4 rounded-r-3xl text-center">
                        <div class="flex justify-center gap-2">
                            <button onclick="bukaFormDokter('${p.id}', ${index})" title="Input Medis" class="w-9 h-9 bg-white text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all"><i class="fas fa-edit"></i></button>
                            <button onclick="cetakResumeMedis('${p.id}', ${index})" title="Cetak RM" class="w-9 h-9 bg-white text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-600 hover:text-white transition-all"><i class="fas fa-print"></i></button>
                            <button onclick="hapusRiwayatSpesifik('${p.id}', ${index})" title="Hapus" class="w-9 h-9 bg-white text-red-400 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-all"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
            });
        }
    });
    return rows;
}

// 3. FORM DOKTER (DENGAN IDENTIFIKASI INDEX RIWAYAT)
export function bukaFormDokter(id, index) {
    updateDatabase();
    const p = dbPasien.find(x => x.id == id);
    const m = p.medis[index];

    const modal = `
    <div id="modal-dokter" class="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[999] flex items-center justify-center p-6">
        <div class="bg-white w-full max-w-2xl rounded-[3.5rem] p-10 shadow-2xl animate-pop-in">
            <div class="flex justify-between items-center mb-8 border-b pb-6">
                <div class="flex items-center gap-4">
                    <img src="Logo Atria.png" class="w-12 h-12 object-contain">
                    <div>
                        <h3 class="text-xl font-black uppercase italic text-slate-800">Pemeriksaan Dokter</h3>
                        <p class="text-[10px] text-blue-600 font-bold uppercase">${m.waktu_lengkap}</p>
                    </div>
                </div>
                <button onclick="document.getElementById('modal-dokter').remove()" class="text-slate-300 hover:text-red-500"><i class="fas fa-times-circle text-3xl"></i></button>
            </div>

            <div class="grid grid-cols-1 gap-5">
                <div class="p-4 bg-blue-50 rounded-3xl border border-blue-100 mb-2">
                    <p class="text-[10px] font-black text-blue-600 uppercase mb-1">Identitas Pasien:</p>
                    <p class="font-bold text-slate-800 uppercase">${p.nama || p.nama_lengkap} (${p.jk}/${p.umur}th)</p>
                </div>
                
                <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Diagnosa Dokter</label>
                    <input type="text" id="d-diagnosa" value="${m.diagnosa || ''}" class="w-full p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <div class="space-y-1">
                    <label class="text-[10px] font-black text-emerald-600 uppercase ml-4 tracking-widest">Tindakan Medis</label>
                    <textarea id="d-tindakan" class="w-full p-5 bg-emerald-50/50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-emerald-500 h-24">${m.tindakan || ''}</textarea>
                </div>

                <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Resep Obat</label>
                    <input type="text" id="d-resep" value="${m.resep || ''}" class="w-full p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none">
                </div>
            </div>

            <button onclick="simpanDataDokter('${p.id}', ${index})" class="w-full mt-8 bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all">Update Riwayat Medis</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modal);
}

// 4. LOGIKA SIMPAN & CETAK (MENGGUNAKAN INDEX AGAR DATA LAMA AMAN)
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
        alert("Riwayat Kunjungan Pasien Berhasil Diperbarui!");
    }
}

export function cetakResumeMedis(id, index) {
    updateDatabase();
    const p = dbPasien.find(x => x.id == id);
    const m = p.medis[index];

    const printWindow = window.open('', '', 'width=800,height=900');
    printWindow.document.write(`
        <html>
        <head>
            <title>Cetak RM - ${p.nama}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                .header { display: flex; align-items: center; border-bottom: 4px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { width: 80px; height: 80px; margin-right: 20px; }
                .box { border: 1px solid #000; padding: 20px; margin-top: 20px; border-radius: 10px; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 10px; vertical-align: top; border-bottom: 1px solid #eee; }
                .label { font-weight: bold; text-transform: uppercase; font-size: 10px; color: #666; }
                .val { font-weight: bold; font-size: 14px; color: #000; }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="Logo Atria.png" class="logo">
                <div>
                    <h1 style="margin:0">ATRIA JAYA MEDIKA</h1>
                    <p style="margin:0; font-weight: bold; color: #2563eb;">LAPORAN RESUME REKAM MEDIS DIGITAL</p>
                    <p style="margin:0; font-size: 12px;">Waktu Kunjungan: ${m.waktu_lengkap}</p>
                </div>
            </div>
            
            <table>
                <tr>
                    <td width="50%">
                        <div class="label">Identitas Pasien:</div>
                        <div class="val">${p.nama || p.nama_lengkap}</div>
                        <div>NIK: ${p.nik || '-'} | No. RM: RM-${p.id.toString().slice(-6)}</div>
                        <div>JK: ${p.jk} | Umur: ${p.umur} Tahun</div>
                    </td>
                    <td width="50%" style="text-align: right;">
                        <div class="label">Status Riwayat:</div>
                        <div class="val" style="color: green;">TERVERIFIKASI SISTEM</div>
                    </td>
                </tr>
            </table>

            <div class="box">
                <div class="label" style="margin-bottom:10px; border-bottom: 2px solid #333;">I. PEMERIKSAAN FISIK (ANAMNESA)</div>
                <table>
                    <tr><td width="30%">Tekanan Darah</td><td>: ${m.tensi || '-'} mmHg</td></tr>
                    <tr><td>Suhu Tubuh</td><td>: ${m.suhu || '-'} °C</td></tr>
                    <tr><td>Keluhan Utama</td><td>: <i>"${m.riwayat || m.keluhan || '-'}"</i></td></tr>
                </table>
            </div>

            <div class="box">
                <div class="label" style="margin-bottom:10px; border-bottom: 2px solid #333;">II. DIAGNOSA & TINDAKAN MEDIS</div>
                <table>
                    <tr><td width="30%">Diagnosa Dokter</td><td>: <b style="font-size: 16px;">${m.diagnosa || '-'}</b></td></tr>
                    <tr><td>Tindakan</td><td>: ${m.tindakan || '-'}</td></tr>
                    <tr><td>Resep/Obat</td><td>: ${m.resep || '-'}</td></tr>
                </table>
            </div>

            <div style="margin-top: 50px; text-align: right; font-size: 12px;">
                <p>Dicetak secara sah oleh SIMRS Atria Jaya Medika</p>
                <p>Tanggal Cetak: ${new Date().toLocaleString('id-ID')}</p>
                <br><br><br>
                <p>( __________________________ )</p>
                <p>Tanda Tangan Dokter / Petugas</p>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
        </html>
    `);
}

// 5. FITUR HAPUS RIWAYAT SPESIFIK (TIDAK MENGHAPUS SELURUH DATA PASIEN)
window.hapusRiwayatSpesifik = function(id, index) {
    if (confirm("Hapus riwayat kunjungan pada waktu ini saja?")) {
        const pIdx = dbPasien.findIndex(x => x.id == id);
        if (pIdx !== -1) {
            dbPasien[pIdx].medis.splice(index, 1);
            save();
            document.getElementById('content-area').innerHTML = renderRekamMedis();
        }
    }
}

// 6. FILTER & PENCARIAN
window.filterTabelRM = function () {
    const filterNama = document.getElementById('cari-rm').value.toUpperCase();
    const filterTgl = document.getElementById('filter-tgl-rm').value; // format YYYY-MM-DD
    const rows = document.getElementsByClassName('row-rm');

    for (let i = 0; i < rows.length; i++) {
        const textContent = rows[i].textContent || rows[i].innerText;
        const rowTgl = rows[i].getAttribute('data-tgl'); // YYYY-MM-DD

        const matchesNama = textContent.toUpperCase().indexOf(filterNama) > -1;
        const matchesTgl = filterTgl === "" || rowTgl === filterTgl;

        rows[i].style.display = (matchesNama && matchesTgl) ? "" : "none";
    }
};

// Pastikan semua fungsi tersedia secara global
window.bukaFormDokter = bukaFormDokter;
window.simpanDataDokter = simpanDataDokter;
window.cetakResumeMedis = cetakResumeMedis;
