// ===============================
// STRUCK.JS
// Generator Struk Pembayaran
// Klinik Atria Jaya Medika
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  document.body.style.background = "#f0f0f0";
  document.body.style.fontFamily = "Arial, Helvetica, sans-serif";
  document.body.style.padding = "20px";

  document.body.innerHTML = `
  <style>
    .receipt {
      width: 360px;
      background: #fff;
      margin: auto;
      padding: 18px;
      font-size: 13px;
      color: #000;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .logo img {
      width: 55px;
    }

    .clinic h1 {
      font-size: 15px;
      margin: 0;
      font-weight: bold;
      text-transform: uppercase;
    }

    .clinic p {
      font-size: 11.5px;
      margin: 2px 0 0;
      line-height: 1.4;
    }

    .divider {
      border-top: 1px dashed #000;
      margin: 12px 0;
    }

    .info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 10px;
    }

    .info div {
      display: flex;
      justify-content: space-between;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      text-align: left;
      border-bottom: 1px solid #000;
      padding-bottom: 6px;
      font-size: 12px;
    }

    td {
      padding: 6px 0;
    }

    .right {
      text-align: right;
    }

    .total td {
      font-weight: bold;
    }

    .footer {
      text-align: center;
      font-size: 11.5px;
      margin-top: 10px;
    }

    button {
      margin-top: 14px;
      width: 100%;
      padding: 10px;
      cursor: pointer;
    }

    @media print {
      button {
        display: none;
      }
      body {
        background: none;
        padding: 0;
      }
    }
  </style>

  <div class="receipt">

    <div class="header">
      <div class="logo">
        <img src="logo-klinik.png" alt="Logo Klinik">
      </div>
      <div class="clinic">
        <h1>KLINIK ATRIA JAYA MEDIKA</h1>
        <p>
          Jl. Irigasi Jl. Utama Kp. Gn., RT.006/RW.03<br>
          Cipondoh Indah, Kec. Cipondoh<br>
          Kota Tangerang, Banten 15148<br>
          Telp. 0889-0597-5474
        </p>
      </div>
    </div>

    <div class="divider"></div>

    <div class="info">
      <div><strong>No. Struk</strong><span>TRX-001</span></div>
      <div><strong>Tanggal</strong><span>28/01/2026</span></div>
      <div><strong>Nama Pasien</strong><span>Budi Santoso</span></div>
      <div><strong>No. RM</strong><span>RM-001245</span></div>
      <div><strong>Dokter</strong><span>dr. Andi Pratama</span></div>
      <div><strong>Metode</strong><span>Tunai</span></div>
    </div>

    <div class="divider"></div>

    <table>
      <thead>
        <tr>
          <th>Layanan</th>
          <th class="right">Biaya (Rp)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Jasa Dokter</td>
          <td class="right">-</td>
        </tr>
        <tr>
          <td>Tindakan Medis</td>
          <td class="right">-</td>
        </tr>
        <tr>
          <td>Farmasi / Obat</td>
          <td class="right">-</td>
        </tr>
      </tbody>
    </table>

    <div class="divider"></div>

    <table class="total">
      <tr>
        <td>Total</td>
        <td class="right">157.000</td>
      </tr>
      <tr>
        <td>Dibayar</td>
        <td class="right">200.000</td>
      </tr>
      <tr>
        <td>Kembali</td>
        <td class="right">43.000</td>
      </tr>
    </table>

    <div class="divider"></div>

    <div class="footer">
      <p>Terima kasih atas kunjungan Anda</p>
      <p>Semoga lekas sembuh</p>
    </div>

    <button onclick="window.print()">Cetak Struk</button>
  </div>
  `;
});
