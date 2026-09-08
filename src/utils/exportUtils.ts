import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { FinalReportData } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ----------------------------------------------------
// PDF EXPORT FOR FINAL REPORT (Printable A4)
// ----------------------------------------------------
export function exportFinalReportPDF(data: FinalReportData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Title Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(230, 81, 0); // Saffron
  doc.text(data.header.apartmentName.toUpperCase(), 105, 15, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(180, 83, 9);
  doc.text(`${data.header.festivalName.toUpperCase()} ${data.header.year}`, 105, 22, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('STATEMENT OF ACCOUNTS', 105, 27, { align: 'center' });
  doc.line(15, 30, 195, 30);

  let currentY = 35;

  // Amount Received Table (Left Side) & Payments Made Table (Right Side)
  // Prepare data rows
  const maxRows = Math.max(data.amountReceived.length, data.paymentsMade.length);
  const combinedRows: any[] = [];

  for (let i = 0; i < maxRows; i++) {
    const recv = data.amountReceived[i];
    const pay = data.paymentsMade[i];

    combinedRows.push([
      recv ? recv.flatNumber : '',
      recv ? recv.residentName : '',
      recv ? formatCurrency(recv.totalAmount) : '',
      pay ? pay.particular : '',
      pay ? formatCurrency(pay.totalAmount) : '',
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: 'AMOUNT RECEIVED', colSpan: 3, styles: { halign: 'center', fillColor: [230, 81, 0] } },
        { content: 'PAYMENTS MADE', colSpan: 2, styles: { halign: 'center', fillColor: [153, 27, 27] } },
      ],
      ['Flat', 'Resident Name', 'Amount', 'Particulars', 'Amount'],
    ],
    body: combinedRows,
    foot: [
      [
        'TOTAL RECEIVED',
        '',
        formatCurrency(data.totals.totalFundsReceived),
        'TOTAL PAYMENTS',
        formatCurrency(data.totals.totalPaymentsMade),
      ],
    ],
    theme: 'grid',
    headStyles: { textColor: 255, fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 45 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 55 },
      4: { cellWidth: 35, halign: 'right' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // EVENT CONTRIBUTIONS SECTION
  if (data.eventContributions.length > 0) {
    if (currentY > 240) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(230, 81, 0);
    doc.text('EVENT CONTRIBUTIONS (SPONSORSHIPS RECOGNITION)', 15, currentY);
    currentY += 4;

    const eventRows = data.eventContributions.map((ev) => [
      ev.flatNumber,
      ev.residentName,
      ev.sponsoredItem,
      formatCurrency(ev.recognitionAmount || ev.amount),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Flat No', 'Resident Name', 'Sponsored For', 'Amount']],
      body: eventRows,
      theme: 'plain',
      headStyles: { fillColor: [254, 243, 199], textColor: 180, fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 1.5 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 70 },
        2: { cellWidth: 55 },
        3: { cellWidth: 35, halign: 'right' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // SUMMARY & REMAINING BALANCE
  if (currentY > 240) {
    doc.addPage();
    currentY = 15;
  }

  doc.setFillColor(255, 248, 240);
  doc.rect(15, currentY, 180, 22, 'F');
  doc.setDrawColor(230, 81, 0);
  doc.rect(15, currentY, 180, 22, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Regular Contributions: ${formatCurrency(data.totals.totalRegular)}`, 20, currentY + 7);
  doc.text(`Total Sponsorship Contributions: ${formatCurrency(data.totals.totalSponsorship)}`, 20, currentY + 14);

  doc.text(`Total Funds Received: ${formatCurrency(data.totals.totalFundsReceived)}`, 110, currentY + 7);
  doc.text(`Total Expenses: ${formatCurrency(data.totals.totalPaymentsMade)}`, 110, currentY + 14);

  doc.setFontSize(11);
  doc.setTextColor(230, 81, 0);
  doc.text(`REMAINING BALANCE: ${formatCurrency(data.totals.remainingBalance)}`, 20, currentY + 20);

  currentY += 30;

  // COMMITTEE MEMBERS SECTION
  if (data.committeeMembers.length > 0) {
    if (currentY > 260) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('COMMITTEE MEMBERS', 105, currentY, { align: 'center' });
    currentY += 6;

    const names = data.committeeMembers.map((m) => m.position ? `${m.name} (${m.position})` : m.name).join('   |   ');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(names, 105, currentY, { align: 'center' });
  }

  doc.save(`${data.header.apartmentName}_Ganesh_Utsav_${data.header.year}_Final_Report.pdf`);
}

// ----------------------------------------------------
// EXCEL EXPORT
// ----------------------------------------------------
export function exportToExcel(filename: string, sheets: { name: string; data: any[] }[]) {
  const wb = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const ws = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ----------------------------------------------------
// CSV EXPORT
// ----------------------------------------------------
export function exportToCSV(filename: string, data: any[]) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
