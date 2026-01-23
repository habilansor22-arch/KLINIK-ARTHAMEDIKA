/**
 * SIMRS ATRIA JAYA - DATABASE ENGINE
 * Fungsi: Mengelola penyimpanan lokal dan penomoran RM
 */

export let dbPasien = JSON.parse(localStorage.getItem('db_atria_v68')) || [];

export function saveDB() {
    localStorage.setItem('db_atria_v68', JSON.stringify(dbPasien));
}

export function generateNextRM() {
    if (dbPasien.length === 0) return "00-01-01";
    // Mengambil RM terakhir dan menambah +1
    const lastRM = dbPasien[dbPasien.length - 1].no_rm.replace(/-/g, "");
    let nextNum = parseInt(lastRM) + 1;
    let s = nextNum.toString().padStart(6, '0');
    return `${s.substring(0,2)}-${s.substring(2,4)}-${s.substring(4,6)}`;
}

export function updatePasien(id, newData) {
    const idx = dbPasien.findIndex(x => x.id == id);
    if (idx !== -1) {
        dbPasien[idx] = { ...dbPasien[idx], ...newData };
        saveDB();
    }
}

export function tambahPasien(data) {
    dbPasien.push(data);
    saveDB();
}