/**
 * SIMRS ATRIA JAYA MEDIKA - PASIEN_LAMA.JS
 */

function renderCariPasienLama() {
    return `
    <div class="bg-white p-10 rounded-[3rem] shadow-sm animate-fade-in">
        <div class="flex items-center gap-4 mb-8">
            <div class="bg-blue-600 text-white p-4 rounded-2xl shadow-lg"><i class="fas fa-history text-2xl"></i></div>
            <h2 class="text-3xl font-black text-slate-800 italic uppercase">Pendaftaran Pasien Lama</h2>
        </div>
        <div class="bg-slate-900 p-8 rounded-[2.5rem] text-white mb-8 shadow-xl">
            <div class="flex gap-4 mt-2">
                <input type="text" id="input-keyword-lama" placeholder="Ketik Nama atau NIK Pasien..." class="flex-grow p-5 bg-white/10 rounded-2xl font-bold border-none outline-none text-white">
                <button onclick="eksekusiCariPasien()" class="bg-blue-600 px-10 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-blue-700 transition-all">Cari Data</button>
            </div>
        </div>
        <div id="hasil-pencarian-lama" class="min-h-[200px]"></div>
    </div>`;
}

function eksekusiCariPasien() {
    updateDatabase();
    const key = document.getElementById('input-keyword-lama').value.toLowerCase();
    const wadah = document.getElementById('hasil-pencarian-lama');
    if(key.length < 3) return alert("Minimal 3 karakter untuk pencarian.");

    const matches = dbPasien.filter(p => p.nama.toLowerCase().includes(key) || p.nik.includes(key));

    if(matches.length === 0) {
        wadah.innerHTML = `<div class="p-20 text-center opacity-30 font-black italic uppercase">Pasien Tidak Ditemukan</div>`;
        return;
    }

    wadah.innerHTML = `
    <div class="overflow-hidden border border-slate-100 rounded-[2.5rem] bg-white">
        <table class="w-full text-left">
            <thead class="bg-slate-50 text-[10px] uppercase text-slate-400 font-black">
                <tr><th class="p-6">Identitas Pasien</th><th class="p-6 text-center">Tindakan</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                ${matches.map(p => `
                    <tr class="hover:bg-blue-50/50 transition-all">
                        <td class="p-6">
                            <div class="font-black text-slate-800 uppercase text-sm">${p.nama}</div>
                            <div class="text-[10px] text-slate-400 font-bold uppercase">NIK: ${p.nik} | UMUR: ${p.umur} THN</div>
                        </td>
                        <td class="p-6 text-center">
                            <button onclick="daftarkanLamaLagi('${p.id}')" 
                                class="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-blue-600 transition-all">
                                Daftar Ke Perawat
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
}

function daftarkanLamaLagi(id) {
    updateDatabase();
    const i = dbPasien.findIndex(x => x.id == id);
    if(i !== -1) {
        // Migrasi data medis lama ke format array jika perlu
        if (!Array.isArray(dbPasien[i].medis)) {
            dbPasien[i].medis = dbPasien[i].medis ? [dbPasien[i].medis] : [];
        }

        // TAMBAHKAN PEMERIKSAAN BARU (Agar riwayat sebelumnya tidak terhapus)
        dbPasien[i].medis.push({
            tgl: new Date().toLocaleDateString('id-ID'),
            tensi: '', suhu: '', riwayat: '', diagnosa: '', icd: '', resep: ''
        });

        // SET STATUS KE ANTRE PERAWAT AGAR TERBACA DI DASHBOARD PERAWAT
        dbPasien[i].no = getNewNo(); 
        dbPasien[i].tgl_kunjungan = new Date().toLocaleDateString();
        dbPasien[i].status = 'Antre Perawat'; 
        
        save();
        alert(`BERHASIL!\nPasien: ${dbPasien[i].nama}\nNomor Antrean: #${dbPasien[i].no}\nSilakan arahkan ke Perawat.`);
        loadDashboard('admin'); 
    }
}