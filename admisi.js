import { dbPasien, save, initDashboard } from './app.js';
import { printDataSosial } from './print.js';

export function generateNextRM() {
    if (dbPasien.length === 0) return "00-01-01";
    const lastRM = dbPasien[dbPasien.length - 1].no_rm.replace(/-/g, "");
    let nextNum = parseInt(lastRM) + 1;
    let s = nextNum.toString().padStart(6, '0');
    return `${s.substring(0,2)}-${s.substring(2,4)}-${s.substring(4,6)}`;
}

export function renderAdmisi(dataEdit = null) {
    const isEdit = dataEdit !== null;
    const field = (label, id, value = '') => `
        <div class="mb-5">
            <label class="block text-[11px] font-black text-slate-500 uppercase mb-2 ml-1">${label}</label>
            <input type="text" id="${id}" value="${value}" class="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 focus:outline-none">
        </div>`;

    window.prosesSimpan = () => {
        const f = (id) => document.getElementById(id).value;
        const payload = {
            nama: f('a-nama'), ttl: f('a-ttl'), umur: f('a-umur'), jk: f('a-jk'),
            wa: f('a-wa'), alamat: f('a-alamat'), dokter_pj: f('a-dokter'), poli: f('a-poli'),
            pj_nama: f('pj-nama'), pj_wa: f('pj-wa'), petugas: f('a-petugas')
        };

        if (isEdit) {
            const idx = dbPasien.findIndex(x => x.id == dataEdit.id);
            dbPasien[idx] = { ...dbPasien[idx], ...payload };
        } else {
            dbPasien.push({
                id: Date.now(),
                no_rm: generateNextRM(),
                waktu_masuk: new Date().toLocaleString('id-ID'),
                ...payload
            });
        }
        save(); initDashboard();
    };

    return `
    <div class="max-w-5xl mx-auto animate-fade-in">
        <div class="flex justify-between items-center mb-8 bg-white p-8 rounded-[2.5rem] shadow-sm">
            <h2 class="text-3xl font-black italic uppercase text-slate-800">Pendaftaran Pasien</h2>
            <div class="bg-blue-600 text-white p-4 rounded-3xl text-right">
                <p class="text-[10px] font-bold opacity-70">NOMOR RM</p>
                <p class="text-3xl font-black">${isEdit ? dataEdit.no_rm : generateNextRM()}</p>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-white p-8 rounded-[3rem] shadow-sm">
                <p class="text-blue-600 font-black text-xs uppercase mb-6 border-b pb-2">Identitas Pasien</p>
                ${field('Nama Lengkap', 'a-nama', isEdit ? dataEdit.nama : '')}
                ${field('Tempat Tanggal Lahir', 'a-ttl', isEdit ? dataEdit.ttl : '')}
                <div class="grid grid-cols-2 gap-4">
                    ${field('Umur', 'a-umur', isEdit ? dataEdit.umur : '')}
                    ${field('Gender (L/P)', 'a-jk', isEdit ? dataEdit.jk : '')}
                </div>
                ${field('Alamat Lengkap', 'a-alamat', isEdit ? dataEdit.alamat : '')}
                ${field('No Telp / WA', 'a-wa', isEdit ? dataEdit.wa : '')}
            </div>
            <div class="bg-white p-8 rounded-[3rem] shadow-sm flex flex-col justify-between">
                <div>
                    <p class="text-green-600 font-black text-xs uppercase mb-6 border-b pb-2">Unit & Penanggung Jawab</p>
                    ${field('Nama Penanggung Jawab', 'pj-nama', isEdit ? dataEdit.pj_nama : '')}
                    ${field('WA Penanggung Jawab', 'pj-wa', isEdit ? dataEdit.pj_wa : '')}
                    ${field('Dokter Pemeriksa', 'a-dokter', isEdit ? dataEdit.dokter_pj : 'dr. H. Ahmad Fauzi')}
                    ${field('Poli Tujuan', 'a-poli', isEdit ? dataEdit.poli : 'POLI UMUM')}
                    ${field('Petugas Pendaftar', 'a-petugas', isEdit ? dataEdit.petugas : 'ADMISI')}
                </div>
                <button onclick="prosesSimpan()" class="w-full mt-6 bg-slate-900 text-white py-6 rounded-3xl font-black uppercase hover:bg-blue-600 transition-all shadow-xl">Simpan Data Pasien</button>
            </div>
        </div>
    </div>`;
}

export function renderRiwayat() {
    window.hapusPasien = (id) => { if(confirm("Hapus?")) { const idx = dbPasien.findIndex(x=>x.id == id); dbPasien.splice(idx,1); save(); initDashboard(); } };
    window.editPasien = (id) => { const p = dbPasien.find(x=>x.id == id); document.getElementById('content-area').innerHTML = renderAdmisi(p); };
    window.panggilCetak = (id) => { printDataSosial(id); };

    return `
    <div class="bg-white p-10 rounded-[3rem] shadow-sm animate-fade-in">
        <table class="w-full text-left">
            <thead><tr class="text-[10px] font-black text-slate-400 uppercase border-b"><th class="pb-4">Data Pasien</th><th class="pb-4 text-right">Aksi</th></tr></thead>
            <tbody>
                ${dbPasien.map(p => `
                <tr class="border-b hover:bg-slate-50 transition-all">
                    <td class="py-6">
                        <p class="font-black text-slate-800 text-lg">${p.nama.toUpperCase()}</p>
                        <p class="text-xs font-bold text-blue-500 uppercase">RM: ${p.no_rm} | ${p.poli} | ${p.wa}</p>
                    </td>
                    <td class="py-6 text-right space-x-2">
                        <button onclick="editPasien('${p.id}')" class="bg-amber-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase">Edit</button>
                        <button onclick="hapusPasien('${p.id}')" class="bg-red-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase">Hapus</button>
                        <button onclick="panggilCetak('${p.id}')" class="bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase">Cetak</button>
                    </td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}