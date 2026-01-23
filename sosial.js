function fieldSosial(label, id, value) {
    return `<div>
        <label class="text-[10px] font-bold text-slate-400 uppercase">${label}</label>
        <input type="text" id="${id}" value="${value}" class="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500">
    </div>`;
}

// 2. RENDER FORM DATA SOSIAL (Sesuai Screenshot Registrasi)
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
        nama: f('a-nama'), ttl: f('a-ttl'), umur: f('a-umur'), jk: f('a-jk'),
        agama: f('a-agama'), status_kawin: f('a-status'), pendidikan: f('a-pendidikan'),
        pekerjaan: f('a-pekerjaan'), pj: f('a-pj-nama'), pj_telp: f('a-pj-telp'),
        pj_hub: f('a-pj-hub'), alamat: f('a-alamat'), petugas: f('a-petugas'),
        dokter: f('a-dokter'), bayar: f('a-bayar')
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

// 4. FORMAT CETAK DATA SOSIAL (PERSIS FORMAT KOTAK PDF + LOGO)
function cetakDataSosial(p) {
    const a = document.getElementById('print-area');
    const tgl = new Date().toLocaleDateString('id-ID');
    
    a.innerHTML = `
        <div style="padding:20px; font-family:sans-serif; width:210mm; margin:auto; background:white; color:black; border:2px solid black;">
            <div style="display:grid; grid-template-columns: 100px 1fr 150px; border-bottom:2px solid black; padding-bottom:10px; align-items:center;">
                <img src="Logo Atria.png" style="width:80px; height:auto; margin:auto;">
                <div style="text-align:center;">
                    <h2 style="margin:0; font-size:18px;">DATA SOSIAL PASIEN</h2>
                    <p style="margin:0; font-size:12px; font-weight:bold;">ATRIA JAYA MEDIKA</p>
                </div>
                <div style="font-size:12px; text-align:right;">
                    REG : ${p.reg}<br>TGL : ${tgl}
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1.5fr 1fr; border-bottom:2px solid black;">
                <div style="padding:15px; border-right:2px solid black;">
                    <span style="font-size:10px; color:#666;">Nama Lengkap:</span><br>
                    <span style="font-size:24px; font-weight:bold; text-transform:uppercase;">${p.nama}</span>
                </div>
                <div style="padding:15px; text-align:right;">
                    <span style="font-size:10px; color:#666;">NO. RM :</span><br>
                    <span style="font-size:38px; font-weight:bold;">${p.nik}</span>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; border-bottom:2px solid black; padding:15px; line-height:2.2; font-size:13px;">
                <div style="border-right:1px solid #ddd; padding-right:10px;">
                    TTL : ${p.ttl}<br>Umur/JK : ${p.umur} / ${p.jk}<br>Agama/Status : ${p.agama} / ${p.status_kawin}
                </div>
                <div style="padding-left:15px;">
                    Pendidikan : ${p.pendidikan}<br>Pekerjaan : ${p.pekerjaan}<br>Bayar : ${p.bayar}
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; border-bottom:2px solid black;">
                <div style="padding:15px; border-right:2px solid black; min-height:80px;">
                    <b>Alamat Lengkap:</b><br>${p.alamat}<br><br><b>Telp:</b> ${p.pj_telp}
                </div>
                <div style="padding:15px; font-size:13px;">
                    <b>Penanggung Jawab</b><br>
                    Nama PJ : ${p.pj}<br>
                    Hubungan : ${p.pj_hub}<br>
                    Telp PJ : ${p.pj_telp}
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; height:150px; text-align:center;">
                <div style="padding:20px; border-right:2px solid black; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>Petugas</div>
                    <div style="font-weight:bold; text-decoration:underline;">( ${p.petugas || '...'} )</div>
                </div>
                <div style="padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>Tangerang, ${tgl}<br>Dokter Penanggung Jawab</div>
                    <div style="font-weight:bold; text-decoration:underline;">( ${p.dokter || '...'} )</div>
                </div>
            </div>
        </div>`;
    window.print();
}

// 5. DATABASE MANAGEMENT
function renderRiwayatUmum() { 
    return `
    <div class="bg-white p-10 rounded-3xl shadow-sm">
        <h3 class="font-black mb-6 uppercase">Database Pasien</h3>
        <table class="w-full text-left font-bold">
            <thead class="bg-slate-50 text-[10px] uppercase text-slate-400">
                <tr><th class="p-4">RM</th><th class="p-4">Nama</th><th class="p-4">Status</th><th class="p-4 text-center">Aksi</th></tr>
            </thead>
            <tbody>
                ${dbPasien.map(p => `
                    <tr class="border-b text-sm">
                        <td class="p-4 text-blue-600">${p.nik}</td>
                        <td class="p-4 uppercase">${p.nama}</td>
                        <td class="p-4 text-[10px]">${p.status}</td>
                        <td class="p-4 flex justify-center gap-4 text-lg">
                            <button onclick='cetakDataSosial(${JSON.stringify(p)})' class="text-green-500"><i class="fas fa-print"></i></button>
                            <button onclick="document.getElementById('content-area').innerHTML = renderAdmisi('${p.id}')" class="text-blue-500"><i class="fas fa-edit"></i></button>
                            <button onclick="hapusPasien('${p.id}')" class="text-red-500"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`; 
}

function hapusPasien(id) {
    if(confirm("Hapus data?")) {
        dbPasien = dbPasien.filter(x => x.id != id);
        save(); document.getElementById('content-area').innerHTML = renderRiwayatUmum();
    }
}