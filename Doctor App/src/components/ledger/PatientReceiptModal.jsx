import React, { useRef } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Clock, 
  CreditCard, 
  User, 
  FileText,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function PatientReceiptModal({
  isOpen,
  onClose,
  transaction,
  doctor
}) {
  const printRef = useRef(null);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCashIn = transaction.entry_type === 'cash_in';
  const qrVerificationUrl = `${window.location.origin}/verify/txn-${transaction.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Official Payment Receipt / Voucher</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 print:p-6 print:text-black">
          
          {/* Header with DocCare Branding & Clinic Info */}
          <div className="flex items-start justify-between border-b-2 border-teal-600 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-sm">
                  +
                </div>
                <span className="text-lg font-black tracking-tight text-teal-800 dark:text-teal-400">
                  DocCare
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Medical Receipt
                </span>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white mt-1">
                {doctor?.name || "Dr. Ayesha Siddiqui"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {doctor?.specialization || "Consultant Physician"} • PMDC #{doctor?.pmdcNumber || "49821-P"}
              </p>
              <p className="text-[11px] text-slate-500">
                {doctor?.clinicName || "Shifa Executive Clinic & Diagnostic Center"}
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {transaction.transaction_id}
              </span>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Date: <strong>{transaction.transaction_date}</strong>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Time: {transaction.transaction_time || "10:30 AM"}
              </p>
            </div>
          </div>

          {/* Patient Details & Transaction Reference */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Billed To (Patient)
              </span>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                {transaction.patient_name || "General Walk-in Patient"}
              </p>
              {transaction.patient_code && (
                <p className="text-xs text-teal-700 dark:text-teal-400 font-mono font-bold mt-0.5">
                  {transaction.patient_code}
                </p>
              )}
              {transaction.patient_phone && (
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {transaction.patient_phone}
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Payment Particulars
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                Mode: <strong>{transaction.payment_method || "Cash"}</strong>
              </p>
              {transaction.reference && (
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Ref: {transaction.reference}
                </p>
              )}
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Status: Completed / Paid
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Description & Clinical Service</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3">
                    <p className="font-bold text-slate-900 dark:text-white">{transaction.type}</p>
                    {transaction.remarks && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{transaction.remarks}</p>
                    )}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">
                    {transaction.category || "Consultation"}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white font-mono text-sm">
                    PKR {Number(transaction.amount).toLocaleString()}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-teal-50/70 dark:bg-teal-950/40 border-t-2 border-teal-600 font-black">
                <tr>
                  <td colSpan="2" className="p-3.5 text-xs text-teal-900 dark:text-teal-200 uppercase tracking-wider">
                    Total Amount {isCashIn ? "Paid" : "Disbursed"}
                  </td>
                  <td className="p-3.5 text-right text-base text-teal-900 dark:text-teal-200 font-mono">
                    PKR {Number(transaction.amount).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer & QR Verification */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <QRCodeSVG value={qrVerificationUrl} size={48} className="p-1 bg-white rounded-lg border border-slate-200" />
              <div className="text-[10px] text-slate-400 leading-tight">
                <span className="font-bold text-slate-600 dark:text-slate-300 block">Digitally Verified Record</span>
                Scan QR to verify official clinic transaction receipt.
              </div>
            </div>

            <div className="text-right">
              <div className="h-8 border-b border-dashed border-slate-300 dark:border-slate-700 w-36 mb-1"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Authorized Signature
              </span>
            </div>
          </div>

          {/* Branding Footer */}
          <div className="text-center pt-2 text-[10px] font-bold text-slate-400 tracking-wider">
            POWERED BY DOCCARE — CLINICAL PRACTICE & PRESCRIPTION OS
          </div>

        </div>

      </div>
    </div>
  );
}
