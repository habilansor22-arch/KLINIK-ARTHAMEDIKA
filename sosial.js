function fieldSosial(label, id, value) {
    return `<div>
        <label class="text-[10px] font-bold text-slate-400 uppercase">${label}</label>
        <input type="text" id="${id}" value="${value}" class="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500">
    </div>`;
}

// 2. RENDER FORM DATA SOSIAL
function renderAdmisi(editId = null) {
    const p = editId ? dbPasien.find(x => x.id == editId) : null;
    return `
    <div class="bg-white p-10 rounded-[3rem] shadow-sm animate-fade-in">
        <div class="flex justify-between items-center mb-10">
            <div class="flex items-center gap-4">
                <img src="Logo Atria.png" class="w-16 h-16 object-contain">
                <h2 class="text-3xl font-black text-slate-800 italic uppercase">Registrasi Pasien Baru</h2>
            </div>
            <div class="text-right">
                <p class="text-[10px] font-bold text-slate-400 uppercase">NO. RM</p>
                <p class="text-3xl font-black text-blue-600">${p ? p.nik : '00-01-01'}</p>
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
                ${fieldSosial("Pendidikan", "a-pendidikan", p?.pendidikan || "")}
                ${fieldSosial("Pekerjaan", "a-pekerjaan", p?.pekerjaan || "")}
            </div>
            <div class="space-y-4">
                <p class="text-green-600 font-black text-xs uppercase border-l-4 border-green-600 pl-3">II. Penanggung Jawab (PJ)</p>
                ${fieldSosial("Nama PJ", "a-pj-nama", p?.pj || "")}
                ${fieldSosial("No. HP PJ", "a-pj-telp", p?.pj_telp || "")}
                ${fieldSosial("Hubungan", "a-pj-hub", p?.pj_hub || "")}
                <label class="text-[10px] font-bold text-slate-400 uppercase">Alamat Pasien</label>
                <textarea id="a-alamat" class="w-full p-4 bg-slate-50 rounded-2xl font-bold h-24 border-none outline-none">${p?.alamat || ""}</textarea>
            </div>
            <div class="space-y-4">
                <p class="text-amber-600 font-black text-xs uppercase border-l-4 border-amber-600 pl-3">III. Administrasi Klinik</p>
                ${fieldSosial("Petugas (Admisi)", "a-petugas", p?.petugas || "")}
                ${fieldSosial("Dokter PJ", "a-dokter", p?.dokter || "")}
                ${fieldSosial("Cara Bayar", "a-bayar", p?.bayar || "")}
                <button onclick="prosesSimpanSosial(${editId})" class="w-full bg-slate-900 text-white p-6 rounded-3xl font-black uppercase text-xs mt-4 shadow-xl">
                    SIMPAN & CETAK DATA SOSIAL
                </button>
            </div>
        </div>
    </div>`;
}

// 3. LOGIKA SIMPAN & GENERATE RM
function prosesSimpanSosial(editId = null) {
    const f = (id) => document.getElementById(id).value;
    const total = dbPasien.length + 1;
    const rm = `${Math.floor(total/10000).toString().padStart(2,'0')}-${Math.floor((total%10000)/100).toString().padStart(2,'0')}-${(total%100).toString().padStart(2,'0')}`;

    const dataInp = {
        nama: f('a-nama'), 
        telp: f('a-telp'),
        ttl: f('a-ttl'), 
        umur: f('a-umur'), 
        jk: f('a-jk'),
        agama: f('a-agama'), 
        status_kawin: f('a-status'), 
        pendidikan: f('a-pendidikan'),
        pekerjaan: f('a-pekerjaan'), 
        pj: f('a-pj-nama'), 
        pj_telp: f('a-pj-telp'),
        pj_hub: f('a-pj-hub'), 
        alamat: f('a-alamat'), 
        petugas: f('a-petugas'),
        dokter: f('a-dokter'), 
        bayar: f('a-bayar')
    };

    if(editId) {
        const i = dbPasien.findIndex(x => x.id == editId);
        dbPasien[i] = {...dbPasien[i], ...dataInp};
    } else {
        const p = { 
            id: Date.now(), no: getNewNo(), 
            reg: "REG" + new Date().getFullYear() + Math.floor(Math.random()*1000),
            nik: rm, tgl_kunjungan: new Date().toLocaleDateString(), 
            status: 'Antre Perawat', medis: {tensi:'', suhu:'', riwayat:'', diagnosa:'', icd:'', resep:''}, 
            billing: 50000, ...dataInp 
        };
        dbPasien.push(p);
        cetakDataSosial(p);
    }
    save(); loadDashboard('admin');
}

// 4. FORMAT CETAK DATA SOSIAL (Pembaruan: Garis Tengah 50:50 & Titik Dua Rapi)
function cetakDataSosial(p) {
    const a = document.getElementById('print-area');
    const tgl = new Date().toLocaleDateString('id-ID');
    
    a.innerHTML = `
        <div style="padding:20px; font-family:sans-serif; width:210mm; margin:auto; background:white; color:black;">
            <table style="width:100%; border-collapse: collapse; border: 2px solid black; table-layout: fixed;">
                <tr>
                    <td style="border: 2px solid black; padding: 10px; width: 20%; text-align: center;">
                        <img src="Logo Atria.png" style="width:70px; height:auto;">
                    </td>
                    <td style="border: 2px solid black; padding: 10px; width: 50%; text-align: center;">
                        <h2 style="margin:0; font-size:18px;">DATA SOSIAL PASIEN</h2>
                        <p style="margin:0; font-size:12px; font-weight:bold;">ATRIA JAYA MEDIKA</p>
                    </td>
                    <td style="border: 2px solid black; padding: 10px; width: 30%; text-align: right; font-size: 11px;">
                        REG : ${p.reg}<br>TGL : ${tgl}
                    </td>
                </tr>
                
                <tr>
                    <td colspan="2" style="border: 2px solid black; padding: 15px; width: 50%; vertical-align: top;">
                        <span style="font-size:10px;">Nama Lengkap:</span><br>
                        <span style="font-size:22px; font-weight:bold; text-transform:uppercase;">${p.nama}</span>
                    </td>
                    <td style="border: 2px solid black; padding: 15px; width: 50%; text-align: right; vertical-align: top;">
                        <span style="font-size:10px;">NO. RM :</span><br>
                        <span style="font-size:32px; font-weight:bold;">${p.nik}</span>
                    </td>
                </tr>

                <tr>
                    <td colspan="2" style="border: 2px solid black; padding: 15px; font-size: 13px; vertical-align: top;">
                        <table style="width:100%; border-collapse: collapse; line-height: 1.8;">
                            <tr><td style="width:100px;">TTL</td><td>: ${p.ttl}</td></tr>
                            <tr><td>Umur/JK</td><td>: ${p.umur} / ${p.jk}</td></tr>
                            <tr><td>No. Telp</td><td>: <b>${p.telp || '-'}</b></td></tr>
                            <tr><td>Agama/Status</td><td>: ${p.agama} / ${p.status_kawin}</td></tr>
                        </table>
                    </td>
                    <td style="border: 2px solid black; padding: 15px; font-size: 13px; vertical-align: top;">
                        <table style="width:100%; border-collapse: collapse; line-height: 1.8;">
                            <tr><td style="width:100px;">Pendidikan</td><td>: ${p.pendidikan}</td></tr>
                            <tr><td>Pekerjaan</td><td>: ${p.pekerjaan}</td></tr>
                            <tr><td>Cara Bayar</td><td>: ${p.bayar}</td></tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td colspan="2" style="border: 2px solid black; padding: 15px; height: 100px; vertical-align: top;">
                        <b>Alamat Lengkap:</b><br>
                        <div style="margin-top:5px;">${p.alamat}</div>
                    </td>
                    <td style="border: 2px solid black; padding: 15px; font-size: 13px; vertical-align: top;">
                        <b>Penanggung Jawab (PJ)</b>
                        <table style="width:100%; border-collapse: collapse; margin-top:5px;">
                            <tr><td style="width:80px;">Nama PJ</td><td>: ${p.pj}</td></tr>
                            <tr><td>Hubungan</td><td>: ${p.pj_hub}</td></tr>
                            <tr><td>Telp PJ</td><td>: ${p.pj_telp}</td></tr>
                        </table>
                    </td>
                </tr>

                <tr style="text-align: center;">
                    <td colspan="2" style="border: 2px solid black; padding: 20px; height: 160px; vertical-align: bottom;">
                        <div style="margin-bottom: 70px;">Petugas Admisi</div>
                        <b>( ${p.petugas || '....................'} )</b>
                    </td>
                    <td style="border: 2px solid black; padding: 20px; height: 160px; vertical-align: bottom;">
                        <div style="margin-bottom: 50px;">Tangerang, ${tgl}<br>Dokter Penanggung Jawab</div>
                        <b>( ${p.dokter || '....................'} )</b>
                    </td>
                </tr>
            </table>
        </div>`;
    
    setTimeout(() => { window.print(); }, 500);
}

// 5. DATABASE MANAGEMENT
function renderRiwayatUmum() { 
    return `
    <div class="bg-white p-10 rounded-3xl shadow-sm">
        <h3 class="font-black mb-6 uppercase text-slate-700">Database Pasien</h3>
        <table class="w-full text-left font-bold border-collapse">
            <thead class="bg-slate-50 text-[10px] uppercase text-slate-400">
                <tr class="border-b border-slate-200">
                    <th class="p-4">RM</th>
                    <th class="p-4">Nama</th>
                    <th class="p-4">No. Telp</th>
                    <th class="p-4">Status</th>
                    <th class="p-4 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                ${dbPasien.map(p => `
                    <tr class="border-b border-slate-100 text-sm hover:bg-slate-50 transition-all">
                        <td class="p-4 text-blue-600">${p.nik}</td>
                        <td class="p-4">
                            <div class="uppercase">${p.nama}</div>
                            <div class="text-[9px] text-slate-400 font-normal italic">${p.jk} / ${p.umur} Thn</div>
                        </td>
                        <td class="p-4 text-slate-600 font-medium">${p.telp || '-'}</td>
                        <td class="p-4">
                            <span class="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] uppercase">${p.status}</span>
                        </td>
                        <td class="p-4">
                            <div class="flex justify-center gap-3">
                                <button onclick='cetakDataSosial(${JSON.stringify(p)})' class="text-green-500 hover:text-green-700 transition-all"><i class="fas fa-print"></i></button>
                                <button onclick="document.getElementById('content-area').innerHTML = renderAdmisi('${p.id}')" class="text-blue-500 hover:text-blue-700 transition-all"><i class="fas fa-edit"></i></button>
                                <button onclick="hapusPasien('${p.id}')" class="text-red-500 hover:text-red-700 transition-all"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`; 
}

function hapusPasien(id) {
    if(confirm("Hapus data secara permanen?")) {
        dbPasien = dbPasien.filter(x => x.id != id);
        save(); document.getElementById('content-area').innerHTML = renderRiwayatUmum();
    }
}