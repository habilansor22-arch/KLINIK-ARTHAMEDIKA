/**
 * SIMRS ATRIA JAYA MEDIKA - OWNER PRO COMPLETE
 * Version: 12.1 - Commission Updated to 30%
 */

// 1. DEPENDENSI & INITIAL STATE
if (!document.getElementById('chart-js-script')) {
    const script = document.createElement('script');
    script.id = 'chart-js-script';
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(script);
}

if (!localStorage.getItem('target_klinik')) localStorage.setItem('target_klinik', "50000000");
if (!window.selectedDateFocus) window.selectedDateFocus = new Date().toLocaleDateString('id-ID');

// 2. RENDERER UTAMA
window.renderOwnerDashboard = function(subTab = 'laporan') {
    const dbPasien = JSON.parse(localStorage.getItem('db_atria_v35')) || [];
    const dbStaff = JSON.parse(localStorage.getItem('db_staff_v1')) || [];
    
    setTimeout(() => { 
        if(subTab === 'laporan') window.initTargetChart(dbPasien);
        if(subTab === 'kinerja') window.initKinerjaChart(dbPasien, dbStaff);
    }, 250);

    return `
    <div class="animate-fade-in space-y-8 pb-24 no-print">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <div>
                <h2 class="text-3xl font-black italic uppercase text-slate-800 tracking-tighter">
                    ${subTab === 'sdm' ? 'Manajemen SDM' : subTab === 'kinerja' ? 'Kinerja Staf' : 'Laporan Keuangan'}
                </h2>
                <div class="flex items-center gap-2 mt-1">
                    <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Fokus Data: ${window.selectedDateFocus}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <div class="flex gap-1 bg-slate-100 p-1 rounded-2xl mr-4">
                    <button onclick="window.renderSubOwner('laporan')" class="px-4 py-3 rounded-xl font-black text-[9px] uppercase ${subTab === 'laporan' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}">Keuangan</button>
                    <button onclick="window.renderSubOwner('sdm')" class="px-4 py-3 rounded-xl font-black text-[9px] uppercase ${subTab === 'sdm' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}">SDM</button>
                    <button onclick="window.renderSubOwner('kinerja')" class="px-4 py-3 rounded-xl font-black text-[9px] uppercase ${subTab === 'kinerja' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}">Kinerja</button>
                </div>

                ${subTab === 'laporan' ? `
                    <select id="filter-cetak" class="p-4 bg-slate-50 rounded-2xl font-bold text-[10px] uppercase outline-none border-none">
                        <option value="semua">Cetak Semua Riwayat</option>
                        <option value="hari">Cetak Hari Fokus (${window.selectedDateFocus})</option>
                        <option value="bulan">Cetak Bulan Ini</option>
                    </select>
                    <button onclick="window.printPendapatanFiltered()" class="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-emerald-700 transition-all">
                        <i class="fas fa-print mr-2"></i> Cetak Laporan
                    </button>
                ` : subTab === 'sdm' ? `
                    <button onclick="window.formTambahSDM()" class="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-slate-800 transition-all">
                        + Tambah Pegawai Baru
                    </button>
                ` : `
                    <div class="flex gap-2">
                         <button onclick="window.renderSubOwner('kinerja', 'harian')" class="bg-slate-800 text-white px-4 py-4 rounded-2xl font-black text-[9px] uppercase">Harian</button>
                         <button onclick="window.renderSubOwner('kinerja', 'bulanan')" class="bg-white border border-slate-200 text-slate-400 px-4 py-4 rounded-2xl font-black text-[9px] uppercase">Bulanan</button>
                    </div>
                `}
            </div>
        </div>

        <div id="form-sdm-area" class="hidden animate-fade-in"></div>

        ${subTab === 'sdm' ? renderHalamanSDM(dbStaff) : 
          subTab === 'kinerja' ? renderHalamanKinerja(dbPasien, dbStaff) : 
          renderHalamanFinansial(dbPasien)}
    </div>
    <div id="print-area" class="print-only"></div>`;
};

// 3. HALAMAN FINANSIAL
function renderHalamanFinansial(dbPasien) {
    const lunas = dbPasien.filter(p => p.status === 'Selesai');
    const target = parseFloat(localStorage.getItem('target_klinik'));
    const dataTglDipilih = lunas.filter(p => p.tgl === window.selectedDateFocus);
    const omsetFokus = dataTglDipilih.reduce((s, p) => s + p.billing, 0);
    const [fD, fM, fY] = window.selectedDateFocus.split('/');
    const omsetBulanFokus = lunas.filter(p => {
        const [pd, pm, py] = p.tgl.split('/');
        return pm === fM && py === fY;
    }).reduce((s, p) => s + p.billing, 0);
    const totalAkumulasi = lunas.reduce((s, p) => s + p.billing, 0);
    const persenTarget = ((omsetBulanFokus / target) * 100).toFixed(1);

    return `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <div class="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[3rem] text-white shadow-xl shadow-blue-100">
            <p class="text-[10px] font-black uppercase opacity-60 italic mb-1">Omset Tgl ${window.selectedDateFocus}</p>
            <h2 class="text-3xl font-black italic">Rp ${omsetFokus.toLocaleString()}</h2>
            <div class="mt-4 text-[9px] font-bold py-1 px-3 bg-white/20 rounded-lg inline-block italic">Data Fokus</div>
        </div>
        <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-100">
            <p class="text-[10px] font-black uppercase opacity-60 italic mb-1">Omset Bulan ${fM}/${fY}</p>
            <h2 class="text-3xl font-black italic">Rp ${omsetBulanFokus.toLocaleString()}</h2>
            <div class="mt-4 text-[9px] font-bold py-1 px-3 bg-white/20 rounded-lg inline-block italic">${persenTarget}% Dari Target</div>
        </div>
        <div class="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[3rem] text-white shadow-xl shadow-slate-200">
            <p class="text-[10px] font-black uppercase opacity-60 italic mb-1">Total Akumulasi</p>
            <h2 class="text-3xl font-black italic">Rp ${totalAkumulasi.toLocaleString()}</h2>
            <div class="mt-4 text-[9px] font-bold py-1 px-3 bg-white/20 rounded-lg inline-block italic">Revenue</div>
        </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div class="space-y-8">
            <div class="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm text-center">
                <h3 class="font-black uppercase text-[10px] italic mb-6 text-slate-400 tracking-[0.2em]">Pencapaian Target</h3>
                <div class="relative flex justify-center items-center">
                    <canvas id="targetChart" width="220" height="220"></canvas>
                    <div class="absolute flex flex-col items-center">
                        <span class="text-2xl font-black text-blue-600 italic">${persenTarget}%</span>
                    </div>
                </div>
                <button onclick="window.ubahTarget()" class="mt-6 text-[9px] font-black text-blue-500 uppercase underline decoration-2 underline-offset-4">Sesuaikan Target Klinik</button>
            </div>
            <div class="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <h3 class="font-black uppercase text-sm italic mb-4">Pilih Tanggal Fokus</h3>
                <input type="date" onchange="window.updateDateFocus(this.value)" class="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none">
            </div>
        </div>
        <div class="lg:col-span-2 bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden animate-slide-up">
            <h3 class="font-black uppercase italic text-xl mb-8 tracking-tighter text-slate-800">Riwayat Pendapatan Selesai</h3>
            <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scroll">
                ${lunas.reverse().map(p => `
                    <div class="flex justify-between items-center p-6 ${p.tgl === window.selectedDateFocus ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'} rounded-[2.5rem] border transition-all duration-500">
                        <div>
                            <p class="font-black text-slate-800 uppercase italic text-sm">${p.nama}</p>
                            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${p.tgl} | Dr. ${p.dokter}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xl font-black text-blue-600 italic">Rp ${p.billing.toLocaleString()}</p>
                        </div>
                    </div>`).join('') || '<p class="text-center py-20 opacity-20 font-black italic">BELUM ADA DATA</p>'}
            </div>
        </div>
    </div>`;
}

// 4. HALAMAN KINERJA (KOMISI DIRUBAH KE 30%)
function renderHalamanKinerja(dbPasien, dbStaff) {
    const mode = window.performanceMode || 'harian';
    const lunas = dbPasien.filter(p => p.status === 'Selesai');
    
    const filteredLunas = mode === 'harian' 
        ? lunas.filter(p => p.tgl === window.selectedDateFocus)
        : lunas.filter(p => {
            const [, m, y] = p.tgl.split('/');
            const [, fm, fy] = window.selectedDateFocus.split('/');
            return m === fm && y === fy;
        });

    return `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        <div class="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <h3 class="font-black uppercase text-[10px] italic mb-6 text-slate-400 tracking-widest text-center">Volume Pasien (${mode})</h3>
            <canvas id="kinerjaChart" width="400" height="400"></canvas>
        </div>
        <div class="lg:col-span-2 bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm">
            <h3 class="font-black uppercase italic text-xl mb-8 tracking-tighter text-slate-800">Analitik Kontribusi & Komisi</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="text-[9px] font-black text-slate-400 uppercase border-b">
                            <th class="pb-4">Staf/Dokter</th>
                            <th class="pb-4">Total Pasien</th>
                            <th class="pb-4">Omset Bruto</th>
                            <th class="pb-4 text-right">Estimasi Komisi (30%)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        ${dbStaff.map(s => {
                            const pStaf = filteredLunas.filter(p => p.dokter === s.nama || (p.dokter && p.dokter.includes(s.nama)));
                            const omset = pStaf.reduce((sum, p) => sum + (p.billing || 0), 0);
                            const komisi = omset * 0.3; // PERUBAHAN: 0.05 MENJADI 0.3 (30%)
                            return `
                            <tr class="hover:bg-slate-50 transition-all">
                                <td class="py-4">
                                    <p class="font-black text-slate-800 text-xs uppercase">${s.nama}</p>
                                    <p class="text-[8px] font-bold text-blue-500 uppercase">${s.role}</p>
                                </td>
                                <td class="py-4 font-black text-xs text-slate-600">${pStaf.length}</td>
                                <td class="py-4 font-black text-xs text-slate-800">Rp ${omset.toLocaleString()}</td>
                                <td class="py-4 text-right">
                                    <p class="font-black text-emerald-600 text-xs italic">Rp ${komisi.toLocaleString()}</p>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}

// 5. HALAMAN MANAJEMEN SDM
function renderHalamanSDM(staff) {
    return `
    <div class="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100 animate-fade-in">
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="text-[10px] font-black text-slate-400 uppercase border-b">
                        <th class="pb-6 px-4">Informasi Pegawai</th>
                        <th>Kategori</th>
                        <th>Spesialisasi</th>
                        <th>Jadwal Kerja</th>
                        <th class="text-right px-4">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    ${staff.map(s => `
                        <tr class="hover:bg-slate-50 transition-all">
                            <td class="py-6 px-4">
                                <p class="font-black text-slate-800 uppercase italic text-sm">${s.nama}</p>
                                <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">ID: ${s.id}</p>
                            </td>
                            <td class="py-6">
                                <span class="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase italic">${s.role}</span>
                            </td>
                            <td class="py-6">
                                <span class="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase">${s.spesialis || '-'}</span>
                            </td>
                            <td class="py-6 text-[9px] font-black text-slate-400 uppercase leading-relaxed max-w-[200px]">${s.jadwal || 'Belum diatur'}</td>
                            <td class="py-6 text-right px-4">
                                <button onclick="window.hapusSDM(${s.id})" class="text-red-300 hover:text-red-600 p-2 transition-all">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>`).join('') || '<tr><td colspan="5" class="text-center py-24 italic opacity-20">Database Kosong</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>`;
}

// 6. LOGIKA OPERASIONAL
window.renderSubOwner = (tab, mode = 'harian') => {
    window.performanceMode = mode;
    document.getElementById('content-area').innerHTML = window.renderOwnerDashboard(tab);
};

window.initKinerjaChart = function(dbPasien, dbStaff) {
    const ctx = document.getElementById('kinerjaChart');
    if(!ctx) return;
    const mode = window.performanceMode || 'harian';
    const lunas = dbPasien.filter(p => p.status === 'Selesai');
    
    const filtered = mode === 'harian' 
        ? lunas.filter(p => p.tgl === window.selectedDateFocus)
        : lunas.filter(p => {
            const [, m, y] = p.tgl.split('/');
            const [, fm, fy] = window.selectedDateFocus.split('/');
            return m === fm && y === fy;
        });

    const labels = dbStaff.map(s => s.nama.split(' ')[0]);
    const dataPasien = dbStaff.map(s => filtered.filter(p => p.dokter === s.nama || (p.dokter && p.dokter.includes(s.nama))).length);
    
    if (window.kinerjaChartObj) window.kinerjaChartObj.destroy();
    window.kinerjaChartObj = new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: 'Pasien', data: dataPasien, backgroundColor: '#3b82f6', borderRadius: 8 }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
};

window.initTargetChart = function(dbPasien) {
    const ctx = document.getElementById('targetChart');
    if(!ctx) return;
    const lunas = dbPasien.filter(p => p.status === 'Selesai');
    const target = parseFloat(localStorage.getItem('target_klinik'));
    const [, m, y] = window.selectedDateFocus.split('/');
    const omsetBulanIni = lunas.filter(p => {
        const [, pm, py] = p.tgl.split('/');
        return pm === m && py === y;
    }).reduce((s, p) => s + p.billing, 0);
    const sisa = Math.max(0, target - omsetBulanIni);
    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Terpenuhi', 'Sisa'], datasets: [{ data: [omsetBulanIni, sisa], backgroundColor: ['#2563eb', '#f1f5f9'], borderWidth: 0, cutout: '80%' }] },
        options: { plugins: { legend: { display: false } } }
    });
};

window.updateDateFocus = function(val) {
    if(!val) return;
    const d = new Date(val);
    window.selectedDateFocus = d.toLocaleDateString('id-ID');
    window.renderSubOwner('laporan');
};

window.formTambahSDM = () => {
    const el = document.getElementById('form-sdm-area');
    el.classList.toggle('hidden');
    const hari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    el.innerHTML = `
        <div class="p-10 bg-blue-50 rounded-[3.5rem] border-2 border-blue-100 mb-8 shadow-inner animate-slide-up">
            <h3 class="font-black uppercase italic mb-8 text-blue-800 tracking-tighter text-xl">Input Pegawai Baru</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div class="space-y-4">
                    <input id="n-nama" placeholder="Nama Lengkap" class="w-full p-5 rounded-2xl border-none font-bold outline-none shadow-sm">
                    <select id="n-role" class="w-full p-5 rounded-2xl border-none font-bold outline-none shadow-sm cursor-pointer">
                        <option value="Dokter">Dokter</option><option value="Perawat/Bidan">Perawat/Bidan</option>
                        <option value="Admin/Kasir">Admin/Kasir</option><option value="Farmasi">Farmasi</option>
                    </select>
                    <input id="n-spec" placeholder="Spesialis / Tugas" class="w-full p-5 rounded-2xl border-none font-bold outline-none shadow-sm">
                </div>
                <div>
                    <div class="grid grid-cols-2 gap-3 mt-2">${hari.map(h => `<label class="flex items-center gap-3 bg-white p-4 rounded-2xl cursor-pointer"><input type="checkbox" name="hari-kerja" value="${h}"><span class="text-[10px] font-black uppercase">${h}</span></label>`).join('')}</div>
                </div>
                <button onclick="window.simpanSDM()" class="md:col-span-2 bg-slate-800 text-white p-6 rounded-[2rem] font-black uppercase tracking-[0.3em]">Konfirmasi Simpan Data</button>
            </div>
        </div>`;
};

window.simpanSDM = () => {
    const nama = document.getElementById('n-nama').value;
    const role = document.getElementById('n-role').value;
    const spec = document.getElementById('n-spec').value;
    const checkedHari = Array.from(document.querySelectorAll('input[name="hari-kerja"]:checked')).map(c => c.value);
    if(!nama) return alert("Mohon lengkapi Nama Pegawai!");
    let db = JSON.parse(localStorage.getItem('db_staff_v1')) || [];
    db.push({ id: Date.now(), nama, role, spesialis: spec, jadwal: checkedHari.join(', ') });
    localStorage.setItem('db_staff_v1', JSON.stringify(db));
    window.renderSubOwner('sdm');
};

window.printPendapatanFiltered = function() {
    const filter = document.getElementById('filter-cetak').value;
    const lunasAll = (JSON.parse(localStorage.getItem('db_atria_v35')) || []).filter(p => p.status === 'Selesai');
    let dataCetak = lunasAll;
    if(filter === 'hari') dataCetak = lunasAll.filter(p => p.tgl === window.selectedDateFocus);
    const total = dataCetak.reduce((s, p) => s + p.billing, 0);
    const html = `<div style="padding: 50px; font-family: sans-serif;"><h1>Laporan Keuangan</h1><h2>TOTAL: Rp ${total.toLocaleString()}</h2></div>`;
    document.getElementById('print-area').innerHTML = html;
    window.print();
};

window.ubahTarget = () => { const b = prompt("Target Baru:", localStorage.getItem('target_klinik')); if(b) { localStorage.setItem('target_klinik', b); window.renderSubOwner('laporan'); }};
window.hapusSDM = (id) => { if(confirm("Hapus?")) { let db = JSON.parse(localStorage.getItem('db_staff_v1')); localStorage.setItem('db_staff_v1', JSON.stringify(db.filter(x => x.id !== id))); window.renderSubOwner('sdm'); }};