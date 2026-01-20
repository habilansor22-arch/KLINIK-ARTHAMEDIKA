// --- INITIAL STATE ---
let dbPasien = JSON.parse(localStorage.getItem('db_artha_v16')) || [];
let dbObat = JSON.parse(localStorage.getItem('db_obat_v16')) || [
    {id: 'B001', nama: 'Paracetamol 500mg', stok: 100, harga: 5000},
    {id: 'B002', nama: 'Amoxicillin 500mg', stok: 50, harga: 15000}
];
const JASA_DOKTER = 25000;

// --- UTILS & SYNC ---
function save() {
    localStorage.setItem('db_artha_v16', JSON.stringify(dbPasien));
    localStorage.setItem('db_obat_v16', JSON.stringify(dbObat));
}

function suaraPanggil(nama, id, tujuan) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(`Nomor antrean ${id.split('-')[1]}, Bapak atau Ibu ${nama}, segera ke ${tujuan}`);
        msg.lang = 'id-ID';
        window.speechSynthesis.speak(msg);
    }
}

// --- AUTH SYSTEM ---
function switchTab(t) {
    document.getElementById('login-form').classList.toggle('hidden', t === 'patient');
    document.getElementById('patient-form').classList.toggle('hidden', t === 'staff');
    document.getElementById('tab-staff').className = t === 'staff' ? 'flex-1 py-4 text-xs font-black rounded-xl transition bg-white text-blue-600 shadow-sm' : 'flex-1 py-4 text-xs font-black rounded-xl transition text-slate-500';
    document.getElementById('tab-patient').className = t === 'patient' ? 'flex-1 py-4 text-xs font-black rounded-xl transition bg-white text-emerald-600 shadow-sm' : 'flex-1 py-4 text-xs font-black rounded-xl transition text-slate-500';
}

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if(document.getElementById('login-pass').value === "12345") {
        const role = document.getElementById('role-select').value;
        sessionStorage.setItem('arthaSession', JSON.stringify({role}));
        loadDashboard(role);
    } else alert("Akses Ditolak!");
});

document.getElementById('patient-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = "RM-" + Math.floor(1000 + Math.random() * 9000);
    dbPasien.push({
        id, nama: document.getElementById('p-nama').value,
        wa: '62' + document.getElementById('p-wa').value,
        poli: document.getElementById('p-poli').value, status: "Antre Perawat", asal: "Online", 
        tgl: new Date().toLocaleString(), biaya: {layan: 50000, obat: 0}, rekamMedis: {}
    });
    save(); alert(`Berhasil! Nomor RM Anda: ${id}`); location.reload();
});

// --- DASHBOARD CORE ---
const roleConfigs = {
    admin: { name: "ADMISI & PENDAFTARAN", menu: [
        { label: "Antrean Masuk", icon: "fa-user-clock", render: () => renderList('Antre Perawat', 'admin') },
        { label: "Data Pasien", icon: "fa-database", render: renderHistory }
    ]},
    perawat: { name: "RUANG PERAWAT", menu: [
        { label: "Pemeriksaan Awal", icon: "fa-heartbeat", render: () => renderList('Antre Perawat', 'perawat') }
    ]},
    dokter: { name: "POLI DOKTER", menu: [
        { label: "Daftar Periksa", icon: "fa-stethoscope", render: () => renderList('Antre Dokter', 'dokter') }
    ]},
    farmasi: { name: "APOTEK", menu: [
        { label: "Antrean Obat", icon: "fa-pills", render: () => renderList('Antre Farmasi', 'farmasi') },
        { label: "Manajemen Obat", icon: "fa-boxes", render: renderInventori }
    ]},
    kasir: { name: "KASIR BILLING", menu: [
        { label: "Pembayaran", icon: "fa-money-bill-wave", render: () => renderList('Antre Kasir', 'kasir') }
    ]},
    owner: { name: "MANAGEMENT", menu: [
        { label: "Analitik Bisnis", icon: "fa-chart-line", render: renderOwnerAnalytics },
        { label: "Payroll Dokter", icon: "fa-hand-holding-usd", render: renderPayroll }
    ]}
};

function loadDashboard(role) {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-dashboard').classList.remove('hidden');
    document.getElementById('user-display').innerText = roleConfigs[role].name;
    const sidebar = document.getElementById('sidebar-menu');
    sidebar.innerHTML = '';
    roleConfigs[role].menu.forEach((m, i) => {
        const b = document.createElement('button');
        b.className = "w-full flex items-center p-5 hover:bg-white/10 rounded-2xl transition text-slate-400 font-bold text-[10px] uppercase mb-1";
        b.innerHTML = `<i class="fas ${m.icon} w-8 text-blue-500"></i> ${m.label}`;
        b.onclick = () => {
            document.querySelectorAll('#sidebar-menu button').forEach(el => el.classList.remove('bg-blue-600', 'text-white'));
            b.classList.add('bg-blue-600', 'text-white');
            document.getElementById('content-area').innerHTML = m.render();
            if(m.label === "Analitik Bisnis") initCharts();
        };
        sidebar.appendChild(b); if(i === 0) b.click();
    });
}

// --- RENDERING FUNCTIONS ---
function renderList(status, role) {
    const data = dbPasien.filter(p => p.status === status);
    return `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${data.map(p => `
            <div class="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 relative group transition-all hover:shadow-xl">
                <div class="flex justify-between mb-6">
                    <span class="text-[9px] font-black bg-blue-100 text-blue-600 px-4 py-2 rounded-full uppercase">${p.id}</span>
                    <button onclick="suaraPanggil('${p.nama}', '${p.id}', 'Poli ${p.poli}')" class="text-orange-500 bg-orange-50 w-12 h-12 rounded-2xl shadow-sm hover:bg-orange-500 hover:text-white transition-all"><i class="fas fa-bullhorn"></i></button>
                </div>
                <h4 class="font-black text-xl mb-1">${p.nama}</h4>
                <p class="text-xs text-slate-400 font-bold uppercase mb-8">${p.poli}</p>
                ${renderRoleActions(role, p)}
            </div>
        `).join('') || '<div class="col-span-full py-20 text-center opacity-20 font-black tracking-widest">TIDAK ADA ANTREAN</div>'}
    </div>`;
}

function renderRoleActions(role, p) {
    if(role === 'admin') return `<button onclick="updateStatus('${p.id}', 'Antre Perawat')" class="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-[10px]">Panggil Pasien</button>`;
    if(role === 'perawat') return `<div class="space-y-3"><input id="t-${p.id}" placeholder="Tensi" class="w-full p-4 bg-slate-50 rounded-2xl border-none text-xs"><button onclick="savePerawat('${p.id}')" class="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase text-[10px]">Kirim ke Dokter</button></div>`;
    if(role === 'dokter') return `<div class="space-y-3"><textarea id="d-${p.id}" placeholder="Diagnosa" class="w-full p-4 bg-slate-50 rounded-2xl border-none text-xs h-20"></textarea><button onclick="saveDokter('${p.id}')" class="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase text-[10px]">Selesai Periksa</button></div>`;
    if(role === 'farmasi') return `<div class="bg-blue-50 p-4 rounded-2xl mb-4 text-xs italic">"${p.rekamMedis.resep || 'Obat Umum'}"</div><button onclick="updateStatus('${p.id}', 'Antre Kasir')" class="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black uppercase text-[10px]">Obat Siap</button>`;
    if(role === 'kasir') return `<div class="mb-6 flex justify-between font-black"><span class="text-slate-400 text-[10px]">TOTAL</span><span class="text-blue-600 text-xl">Rp ${(p.biaya.layan + p.biaya.obat).toLocaleString()}</span></div><button onclick="updateStatus('${p.id}', 'Selesai')" class="w-full bg-orange-600 text-white py-5 rounded-3xl font-black uppercase text-[10px]">Lunas & Selesai</button>`;
}

// --- SYSTEM OPERATIONS ---
function updateStatus(id, s) {
    const i = dbPasien.findIndex(x => x.id === id);
    dbPasien[i].status = s; save(); 
    loadDashboard(JSON.parse(sessionStorage.getItem('arthaSession')).role);
}

function savePerawat(id) {
    const i = dbPasien.findIndex(x => x.id === id);
    dbPasien[i].rekamMedis.tensi = document.getElementById(`t-${id}`).value;
    dbPasien[i].status = 'Antre Dokter'; save(); loadDashboard('perawat');
}

function saveDokter(id) {
    const i = dbPasien.findIndex(x => x.id === id);
    dbPasien[i].rekamMedis.resep = document.getElementById(`d-${id}`).value;
    dbPasien[i].biaya.obat = 35000;
    dbPasien[i].status = 'Antre Farmasi'; save(); loadDashboard('dokter');
}

// --- TV MONITOR DISPLAY ---
function toggleTV() {
    document.getElementById('tv-monitor').classList.toggle('hidden');
    if(!document.getElementById('tv-monitor').classList.contains('hidden')) renderTV();
}

function renderTV() {
    const sections = [
        { title: 'Antrean Perawat', status: 'Antre Perawat', color: 'bg-emerald-500' },
        { title: 'Antrean Dokter', status: 'Antre Dokter', color: 'bg-blue-500' },
        { title: 'Antrean Kasir', status: 'Antre Kasir', color: 'bg-orange-500' }
    ];
    document.getElementById('tv-grid').innerHTML = sections.map(sec => `
        <div class="bg-slate-900 rounded-[3rem] p-10 border border-white/5 flex flex-col shadow-2xl">
            <h3 class="${sec.color} text-white text-center py-5 rounded-2xl font-black mb-10 uppercase tracking-widest text-lg">${sec.title}</h3>
            <div class="space-y-6 flex-grow">
                ${dbPasien.filter(p => p.status === sec.status).slice(0, 4).map(p => `
                    <div class="flex justify-between items-center bg-white/5 p-6 rounded-[2rem] border border-white/5 animate-pulse">
                        <span class="text-white font-black text-2xl">${p.nama}</span>
                        <span class="text-blue-500 font-black text-2xl">#${p.id.split('-')[1]}</span>
                    </div>
                `).join('') || '<div class="opacity-10 text-center py-20"><i class="fas fa-clock text-6xl text-white"></i></div>'}
            </div>
        </div>
    `).join('');
}

// --- EXTRA FEATURES ---
function renderHistory() {
    return `<div class="bg-white rounded-[3rem] shadow-sm border overflow-hidden">
        <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 uppercase font-black text-slate-400"><tr><th class="p-8">Pasien</th><th class="p-8">Poli</th><th class="p-8">Status</th></tr></thead>
            <tbody>${dbPasien.map(p => `<tr class="border-b"><td class="p-8 font-black">${p.nama}</td><td class="p-8">${p.poli}</td><td class="p-8"><span class="px-4 py-1.5 bg-slate-100 rounded-full text-[9px] uppercase font-black">${p.status}</span></td></tr>`).join('')}</tbody>
        </table>
    </div>`;
}

function renderInventori() {
    return `<div class="bg-white p-10 rounded-[3rem] shadow-sm border flex justify-between items-center">
        <h3 class="font-black text-xl tracking-widest uppercase">Gudang Obat</h3>
        <button class="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase">Tambah Item</button>
    </div>`;
}

function renderOwnerAnalytics() {
    const total = dbPasien.filter(p => p.status === 'Selesai').reduce((a,b) => a + (b.biaya.layan + b.biaya.obat), 0);
    return `<div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div class="bg-blue-600 p-12 rounded-[3.5rem] text-white shadow-2xl shadow-blue-200">
            <p class="text-[10px] font-black opacity-60 uppercase tracking-widest mb-4">Total Revenue</p>
            <h2 class="text-5xl font-black">Rp ${total.toLocaleString()}</h2>
        </div>
        <div class="bg-white p-12 rounded-[3.5rem] shadow-sm border"><canvas id="ownerChart"></canvas></div>
    </div>`;
}

function renderPayroll() {
    return `<div class="p-20 text-center bg-blue-50 rounded-[3rem] border-4 border-dashed border-blue-100 text-blue-300 font-black uppercase tracking-widest">Sistem Penggajian v1.0</div>`;
}

function initCharts() {
    const ctx = document.getElementById('ownerChart').getContext('2d');
    new Chart(ctx, { type: 'line', data: { labels: ['H1', 'H2', 'H3', 'H4'], datasets: [{ label: 'Kunjungan', data: [5, 15, 10, 25], borderColor: '#2563eb', fill: true, backgroundColor: 'rgba(37,99,235,0.1)' }] }});
}

function logout() { sessionStorage.clear(); location.reload(); }

// --- AUTO REFRESH CLOCK & TV ---
setInterval(() => {
    const now = new Date().toLocaleTimeString('id-ID');
    const clock = document.getElementById('tv-clock');
    if(clock) clock.innerText = now;
    if(!document.getElementById('tv-monitor').classList.contains('hidden')) renderTV();
}, 1000);

window.onload = () => {
    const session = JSON.parse(sessionStorage.getItem('arthaSession'));
    if(session) loadDashboard(session.role);
};