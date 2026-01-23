import { dbPasien } from './app.js';

export function printDataSosial(id) {
    const p = dbPasien.find(x => x.id == id);
    const a = document.getElementById('print-area');
    const row = (l, v) => `<tr><td style="width:105px; padding:4px 0;">${l}</td><td style="width:15px; text-align:center;">:</td><td style="font-weight:bold; padding:4px 0;">${v}</td></tr>`;

    a.innerHTML = `
    <style>
        @media print { @page { size: A4; margin: 0; } body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; } }
        .box { width: 190mm; padding: 10mm; font-family: Arial, sans-serif; font-size: 11px; }
        .tbl { width: 100%; border-collapse: collapse; border: 1.5px solid black; }
        .td-b { border: 1px solid black; padding: 10px; }
    </style>
    <div class="box">
        <table class="tbl">
            <tr>
                <td class="td-b" style="width:40%; text-align:center; font-size:16px; font-weight:bold;">DATA SOSIAL PASIEN</td>
                <td class="td-b" style="width:10%; text-align:center;">IMG</td>
                <td class="td-b" style="width:50%;"><b>WAKTU:</b> ${p.waktu_masuk}<br><b>UNIT:</b> ${p.poli}</td>
            </tr>
            <tr>
                <td colspan="2" class="td-b" style="padding:20px;"><span style="font-size:10px;">Nama Lengkap:</span><br><span style="font-size:22px; font-weight:bold;">${p.nama.toUpperCase()}</span></td>
                <td class="td-b" style="text-align:right;"><b>NO. RM :</b><br><span style="font-size:32px; font-weight:bold;">${p.no_rm}</span></td>
            </tr>
            <tr>
                <td colspan="3" class="td-b">
                    <table style="width:100%">${row('TTL', p.ttl)}${row('Alamat', p.alamat)}${row('Telp', p.wa)}${row('Dokter', p.dokter_pj)}</table>
                </td>
            </tr>
            <tr>
                <td class="td-b" style="text-align:center; padding:30px;">Petugas<br><br><br><b>( ${p.petugas} )</b></td>
                <td colspan="2" class="td-b" style="text-align:center; padding:30px;">Tangerang, ${p.waktu_masuk.split(' ')[0]}<br>Hormat Kami,<br><br><br><b>( ________________ )</b></td>
            </tr>
        </table>
    </div>`;
    window.print();
}