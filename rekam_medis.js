// ==========================================
// FITUR REKAM MEDIS INTEGRASI - ATRIA JAYA
// ==========================================

// 1. FUNGSI RENDER TABEL UTAMA (DENGAN LOGO & OPSI)
function renderRekamMedis() {
    const dataPasien = JSON.parse(localStorage.getItem('db_pasien')) || [];

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
                <input type="text" id="cari-rm" onkeyup="filterTabelRM()" placeholder="Cari Pasien..." 
                    class="p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-inner text-sm">
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-separate border-spacing-y-2">
                <thead>
                    <tr class="text-[10px] uppercase text-slate-400 font-black tracking-widest">
                        <th class="px-6 py-4">Pasien & Identitas</th>
                        <th class="px-6 py-4">Pemeriksaan Fisik</th>
                        <th class="px-6 py-4">Diagnosa & Tindakan</th>
                        <th class="px-6 py-4 text-center">Opsi</th>
                    </tr>
                </thead>
                <tbody id="tabel-rm-body">
                    ${dataPasien.length === 0 ? '<tr><td colspan="4" class="p-20 text-center text-slate-300 font-bold uppercase">Belum ada data pasien</td></tr>' : 
                      dataPasien.map(p => renderBarisTabel(p)).join('')}
                </tbody>
            </table>
        </div>
    </div>`;
}

// 2. FUNGSI BARIS TABEL (MENGATASI UNDEFINED)
function renderBarisTabel(p) {
    // Sinkronisasi variabel agar tidak undefined
    const nama = p.nama || p.nama_lengkap || "Tanpa Nama";
    const nik = p.nik || p.no_rm || "00-01-01";
    const wa = p.wa || p.telepon || "-";

    return `
    <tr class="bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
        <td class="px-6 py-4 rounded-l-3xl">
            <div class="text-blue-600 font-black text-[10px] mb-1 uppercase"># ${p.antrean || 'N/A'}</div>
            <div class="font-bold uppercase text-slate-800 text-sm">${nama}</div>
            <div class="text-[9px] text-slate-400 font-bold italic">NIK: ${nik} | WA: ${wa}</div>
        </td>
        <td class="px-6 py-4 border-l border-white">
            <div class="text-[11px] leading-relaxed">
                <span class="text-slate-400 uppercase font-black text-[8px]">Vital:</span> 
                <b>${p.medis?.tensi || '-'}</b> mmHg | <b>${p.medis?.suhu || '-'}</b>°C<br>
                <span class="text-blue-500 italic font-medium">"${p.medis?.keluhan || 'Tidak ada keluhan'}"</span>
            </div>
        </td>
        <td class="px-6 py-4 border-l border-white">
            <div class="text-[11px] leading-relaxed">
                <div class="font-bold text-emerald-600 uppercase mb-1">${p.medis?.diagnosa || 'Menunggu Dokter'}</div>
                <div class="text-slate-500 font-medium bg-white/50 p-1 rounded">Tindakan: ${p.medis?.tindakan || '-'}</div>
            </div>
        </td>
        <td class="px-6 py-4 rounded-r-3xl text-center">
            <div class="flex justify-center gap-2">
                <button onclick="bukaFormDokter('${p.id}')" class="w-9 h-9 bg-white text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all"><i class="fas fa-edit"></i></button>
                <button onclick="cetakResumeMedis('${p.id}')" class="w-9 h-9 bg-white text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-600 hover:text-white transition-all"><i class="fas fa-print"></i></button>
                <button onclick="hapusDataRM('${p.id}')" class="w-9 h-9 bg-white text-red-400 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-all"><i class="fas fa-trash"></i></button>
            </div>
        </td>
    </tr>`;
}

// 3. FORM PENGISIAN DOKTER (DENGAN FORM TINDAKAN)
function bukaFormDokter(id) {
    const data = JSON.parse(localStorage.getItem('db_pasien')) || [];
    const p = data.find(x => x.id == id);
    if (!p) return;

    const modal = `
    <div id="modal-dokter" class="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[999] flex items-center justify-center p-6">
        <div class="bg-white w-full max-w-2xl rounded-[3.5rem] p-10 shadow-2xl animate-pop-in">
            <div class="flex justify-between items-center mb-8 border-b pb-6">
                <div class="flex items-center gap-4">
                    <img src="Logo Atria.png" class="w-12 h-12">
                    <h3 class="text-xl font-black uppercase italic text-slate-800">Pemeriksaan Dokter</h3>
                </div>
                <button onclick="document.getElementById('modal-dokter').remove()" class="text-slate-300 hover:text-red-500"><i class="fas fa-times-circle text-3xl"></i></button>
            </div>

            <div class="grid grid-cols-1 gap-5">
                <div class="p-4 bg-blue-50 rounded-3xl border border-blue-100 mb-2">
                    <p class="text-[10px] font-black text-blue-600 uppercase mb-1">Pasien:</p>
                    <p class="font-bold text-slate-800">${p.nama || p.nama_lengkap} (${p.jk}/${p.umur}th)</p>
                </div>
                
                <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Diagnosa Dokter</label>
                    <input type="text" id="d-diagnosa" value="${p.medis?.diagnosa || ''}" class="w-full p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <div class="space-y-1">
                    <label class="text-[10px] font-black text-emerald-600 uppercase ml-4 tracking-widest">Tindakan Medis</label>
                    <textarea id="d-tindakan" class="w-full p-5 bg-emerald-50/50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-emerald-500 h-24">${p.medis?.tindakan || ''}</textarea>
                </div>

                <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Resep Obat</label>
                    <input type="text" id="d-resep" value="${p.medis?.resep || ''}" class="w-full p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none">
                </div>
            </div>

            <button onclick="simpanDataDokter('${p.id}')" class="w-full mt-8 bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all">Update Rekam Medis</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modal);
}

// 4. LOGIKA SIMPAN & CETAK
function simpanDataDokter(id) {
    let data = JSON.parse(localStorage.getItem('db_pasien')) || [];
    const idx = data.findIndex(x => x.id == id);
    if(idx !== -1) {
        data[idx].medis = {
            ...data[idx].medis,
            diagnosa: document.getElementById('d-diagnosa').value,
            tindakan: document.getElementById('d-tindakan').value,
            resep: document.getElementById('d-resep').value
        };
        localStorage.setItem('db_pasien', JSON.stringify(data));
        document.getElementById('modal-dokter').remove();
        document.getElementById('content-area').innerHTML = renderRekamMedis();
        alert("Data Medis Berhasil Disimpan!");
    }
}

function hapusDataRM(id) {
    if(confirm("Hapus data rekam medis pasien ini?")) {
        let data = JSON.parse(localStorage.getItem('db_pasien')) || [];
        data = data.filter(x => x.id != id);
        localStorage.setItem('db_pasien', JSON.stringify(data));
        document.getElementById('content-area').innerHTML = renderRekamMedis();
    }
}

function cetakResumeMedis(id) {
    const data = JSON.parse(localStorage.getItem('db_pasien')) || [];
    const p = data.find(x => x.id == id);
    if(!p) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Cetak Resume Medis</title>
            <style>
                body { font-family: sans-serif; padding: 40px; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                .logo { width: 80px; }
                .box { border: 1px solid #ddd; padding: 15px; margin-top: 20px; border-radius: 10px; }
                table { width: 100%; margin-top: 10px; }
                td { padding: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>ATRIA JAYA MEDIKA</h2>
                <p>Resume Rekam Medis Pasien</p>
            </div>
            <div class="box">
                <h3>Identitas Pasien</h3>
                <table>
                    <tr><td>Nama</td><td>: <b>${p.nama || p.nama_lengkap}</b></td></tr>
                    <tr><td>NIK</td><td>: ${p.nik || '-'}</td></tr>
                    <tr><td>Umur/JK</td><td>: ${p.umur} th / ${p.jk}</td></tr>
                </table>
            </div>
            <div class="box">
                <h3>Hasil Pemeriksaan</h3>
                <p><b>Vital Sign:</b> TD: ${p.medis?.tensi || '-'} | S: ${p.medis?.suhu || '-'}°C</p>
                <p><b>Diagnosa:</b> ${p.medis?.diagnosa || '-'}</p>
                <p><b>Tindakan:</b> ${p.medis?.tindakan || '-'}</p>
                <p><b>Resep:</b> ${p.medis?.resep || '-'}</p>
            </div>
            <p style="margin-top:50px; text-align:right">Dicetak pada: ${new Date().toLocaleString()}</p>
            <script>window.print();</script>
        </body>
        </html>
    `);
}