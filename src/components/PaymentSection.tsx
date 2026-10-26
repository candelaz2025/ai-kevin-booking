'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  CheckCircle, 
  ShieldCheck, 
  Upload, 
  Loader2, 
  Download,
  Copy,
  Check,
  Smartphone,
  Building2,
  UserCheck,
  RefreshCw,
  Sparkles,
  FileImage,
  Trash2,
  Info,
  ExternalLink,
  Gift
} from 'lucide-react';
import { PaymentMethod } from '@/lib/types';
import { formatGoogleDriveImageUrl } from '@/lib/image-utils';

interface PaymentSectionProps {
  amount: number;
  isFree?: boolean;
  isSubmitting?: boolean;
  onPaymentSuccess: (method: PaymentMethod, slipUrl?: string, stripeId?: string) => void;
  bookingSummary: {
    className: string;
    date: string;
    timeSlot: string;
    userName: string;
  };
}

export default function PaymentSection({
  amount,
  isFree = false,
  isSubmitting = false,
  onPaymentSuccess,
  bookingSummary
}: PaymentSectionProps) {
  const method: PaymentMethod = 'promptpay_qr';
  const [slipPreview, setSlipPreview] = useState<string>('');
  const [hasUploadedSlip, setHasUploadedSlip] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic PromptPay settings from Admin CMS
  const [qrImageUrl, setQrImageUrl] = useState<string>('/assets/payment-qr.webp');
  const [accountName, setAccountName] = useState<string>('นาย สรเชษฐ์ (อ. เควิน)');
  const [showAccountName, setShowAccountName] = useState<boolean>(true);
  const [promptpayNumber, setPromptpayNumber] = useState<string>('091-746-2444');
  const [showPromptpayNumber, setShowPromptpayNumber] = useState<boolean>(true);
  const [bankName, setBankName] = useState<string>('ธนาคารกสิกรไทย (KBANK)');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
  const [showBankTransferDetails, setShowBankTransferDetails] = useState<boolean>(true);

  // Copy states
  const [copiedPromptpay, setCopiedPromptpay] = useState<boolean>(false);
  const [copiedBank, setCopiedBank] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          if (data.data.promptpayQrImage) {
            setQrImageUrl(formatGoogleDriveImageUrl(data.data.promptpayQrImage));
          }
          if (data.data.promptpayAccountName) {
            setAccountName(data.data.promptpayAccountName);
          }
          if (data.data.promptpayNumber) {
            setPromptpayNumber(data.data.promptpayNumber);
          }
          if (data.data.bankName) {
            setBankName(data.data.bankName);
          }
          if (data.data.bankAccountNumber) {
            setBankAccountNumber(data.data.bankAccountNumber);
          }
          if (data.data.showAccountName !== undefined) {
            setShowAccountName(Boolean(data.data.showAccountName));
          }
          if (data.data.showPromptpayNumber !== undefined) {
            setShowPromptpayNumber(Boolean(data.data.showPromptpayNumber));
          }
          if (data.data.showBankTransferDetails !== undefined) {
            setShowBankTransferDetails(Boolean(data.data.showBankTransferDetails));
          }
        }
      })
      .catch(() => {});
  }, []);

  // Download QR state
  const [isDownloadingQR, setIsDownloadingQR] = useState<boolean>(false);

  if (isFree || amount === 0) {
    return (
      <div className="bg-[#101c2d] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  คอร์สเรียนฟรี 100%
                </span>
                <span className="text-[11px] text-slate-400">ขั้นตอนที่ 3: ยืนยันการลงทะเบียน</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                ลงทะเบียนรับสิทธิ์เข้าเรียนฟรี
              </h2>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl px-5 py-3 flex sm:flex-col items-center justify-between sm:items-end shadow-inner">
            <span className="text-[11px] text-slate-400 font-medium">ยอดชำระสุทธิ</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-400 tracking-tight">
                0
              </span>
              <span className="text-xs text-slate-400 font-semibold">บาท (FREE)</span>
            </div>
          </div>
        </div>

        {/* Content Box */}
        <div className="py-6 space-y-4 relative z-10">
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200 flex items-start gap-3.5">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-white text-sm">
                ไม่ต้องชำระเงินและไม่ต้องแนบสลิปโอนเงิน 🎉
              </p>
              <p className="text-emerald-300/90 leading-relaxed text-xs">
                คุณสามารถกดยืนยันเพื่อรับสิทธิ์เข้าห้องเรียนได้ทันที ระบบจะยืนยันการลงทะเบียนแบบอัตโนมัติ (Confirmed) และส่งอีเมลพร้อมลิงก์และเอกสารเรียนให้คุณทันที
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-2.5 text-xs">
            <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
              สรุปข้อมูลการลงทะเบียนเรียน:
            </span>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">คลาสเรียน</span>
              <span className="text-white font-semibold text-right max-w-[60%] line-clamp-1">{bookingSummary.className}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">ผู้ลงทะเบียน</span>
              <span className="text-white font-medium">{bookingSummary.userName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">วันที่เรียน</span>
              <span className="text-amber-300 font-mono font-medium">{bookingSummary.date}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">รอบเวลา</span>
              <span className="text-amber-300 font-mono font-medium">{bookingSummary.timeSlot}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">ค่าใช้จ่าย</span>
              <span className="text-emerald-400 font-bold text-sm">ฟรี 0 บาท (Free Enrollment)</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-white/10 relative z-10">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onPaymentSuccess('promptpay_qr', 'FREE_ENROLLMENT')}
            className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>กำลังดำเนินการลงทะเบียนฟรี...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>ยืนยันการลงทะเบียนเรียนฟรีทันที</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }


  const handleDownloadQR = async () => {
    setIsDownloadingQR(true);
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `PromptPay-QR-${amount.toLocaleString()}THB.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrImageUrl, '_blank');
    } finally {
      setIsDownloadingQR(false);
    }
  };

  // Copy PromptPay Number
  const handleCopyPromptpay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (promptpayNumber) {
      const cleanNum = promptpayNumber.replace(/[^0-9]/g, '');
      navigator.clipboard.writeText(cleanNum || promptpayNumber);
      setCopiedPromptpay(true);
      setTimeout(() => setCopiedPromptpay(false), 2000);
    }
  };

  // Copy Bank Account Number
  const handleCopyBank = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bankAccountNumber) {
      const cleanNum = bankAccountNumber.replace(/[^0-9]/g, '');
      navigator.clipboard.writeText(cleanNum || bankAccountNumber);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  // Process File
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WEBP) เท่านั้น');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSlipPreview(event.target.result as string);
        setHasUploadedSlip(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveSlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlipPreview('');
    setHasUploadedSlip(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isSubmittingPromptPay = isSubmitting;
  const [hasPromptPayClicked, setHasPromptPayClicked] = useState(false);

  const handleConfirmPromptPay = () => {
    if (isSubmitting || hasPromptPayClicked) return;
    
    // If no slip uploaded, confirm with the user
    if (!hasUploadedSlip) {
      const proceed = window.confirm('คุณยังไม่ได้แนบรูปสลิปหลักฐานการโอนเงิน ต้องการดำเนินการต่อและส่งสลิปให้แอดมินภายหลังหรือไม่?');
      if (!proceed) {
        fileInputRef.current?.click();
        return;
      }
    }

    setHasPromptPayClicked(true);
    onPaymentSuccess('promptpay_qr', slipPreview || undefined);
    setTimeout(() => setHasPromptPayClicked(false), 3000);
  };

  return (
    <div className="bg-gradient-to-b from-[#131f33] to-[#0c1424] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Top golden accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-purple-500 to-amber-400 opacity-80" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
              OFFICIAL PAYMENT
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ความปลอดภัยสูงสุด</span>
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>ชำระเงินผ่าน PromptPay / Thai QR Payment</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            สแกนชำระเงินผ่าน Mobile Banking ทุกธนาคาร ไม่มีค่าธรรมเนียม
          </p>
        </div>

        {/* Amount Pill */}
        <div className="bg-slate-950/80 border border-amber-400/30 rounded-2xl px-5 py-3 flex sm:flex-col items-center justify-between sm:items-end shadow-inner">
          <span className="text-[11px] text-slate-400 font-medium">ยอดชำระสุทธิ</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-400 tracking-tight">
              ฿{amount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-semibold">THB</span>
          </div>
        </div>
      </div>

      {/* Standard 2-Column Balanced Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mb-6">
        
        {/* Left Column: Official Thai QR & PromptPay Card */}
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden border border-slate-200">
          
          {/* Official Thai QR Header Banner */}
          <div className="bg-[#003868] text-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                <QrCode className="w-6 h-6 text-[#003868]" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-cyan-200 leading-none">
                  THAI QR PAYMENT
                </div>
                <div className="text-sm font-extrabold tracking-wide leading-tight">
                  พร้อมเพย์ (PromptPay)
                </div>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-white/10 px-2.5 py-1 rounded-full text-slate-200">
              ทุกธนาคาร
            </span>
          </div>

          {/* QR Display Container */}
          <div className="p-5 flex flex-col items-center text-center space-y-4">
            
            {/* The QR Box with bank targeting frame */}
            <div className="relative p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center">
              {/* Corner Targeting Accents */}
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#003868] rounded-tl-sm pointer-events-none" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#003868] rounded-tr-sm pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#003868] rounded-bl-sm pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#003868] rounded-br-sm pointer-events-none" />

              <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-xl overflow-hidden flex items-center justify-center">
                <img
                  src={qrImageUrl}
                  alt="PromptPay Thai QR Payment Code"
                  className="w-full h-full object-contain p-1"
                />
              </div>
            </div>

            {/* Price highlight */}
            <div className="text-xs text-slate-600 font-medium">
              ยอดเงิน: <strong className="text-emerald-600 font-extrabold text-base">฿{amount.toLocaleString()}</strong> บาท
            </div>

            {/* Account Details Box (Conditioned by Admin CMS) */}
            <div className="w-full space-y-2 text-left">
              
              {/* Account Name (Show/Hide controlled by Admin CMS) */}
              {showAccountName && accountName && (
                <div className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ชื่อบัญชี:</span>
                  </div>
                  <div className="font-bold text-slate-900 text-right truncate max-w-[190px] sm:max-w-[210px]" title={accountName}>
                    {accountName}
                  </div>
                </div>
              )}

              {/* PromptPay Number (Show/Hide controlled by Admin CMS) */}
              {showPromptpayNumber && promptpayNumber && (
                <div className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Smartphone className="w-3.5 h-3.5 text-[#003868] shrink-0" />
                    <span>PromptPay:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{promptpayNumber}</span>
                    <button
                      type="button"
                      onClick={handleCopyPromptpay}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
                      title="คัดลอกเบอร์พร้อมเพย์"
                    >
                      {copiedPromptpay ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">คัดลอกแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-600" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Bank Transfer Details (Show/Hide controlled by Admin CMS) */}
              {showBankTransferDetails && bankAccountNumber && (
                <div className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate max-w-[120px]">{bankName || 'ธนาคาร'}:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{bankAccountNumber}</span>
                    <button
                      type="button"
                      onClick={handleCopyBank}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
                      title="คัดลอกเลขบัญชี"
                    >
                      {copiedBank ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">คัดลอกแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-600" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Download Action Footer */}
          <div className="p-4 bg-slate-100 border-t border-slate-200">
            <button
              type="button"
              onClick={handleDownloadQR}
              disabled={isDownloadingQR}
              className="w-full py-3 px-4 rounded-xl bg-[#003868] hover:bg-[#00284d] active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isDownloadingQR ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <Download className="w-4 h-4 text-amber-400" />
              )}
              <span>ดาวน์โหลด QR Code (บันทึกลงมือถือ)</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-2">
              💡 บันทึกรูปภาพแล้วเปิดแอปธนาคาร เลือก "สแกน QR" และเลือกรูปจากคลังภาพ
            </p>
          </div>
        </div>

        {/* Right Column: Slip Upload & Verification Card */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          
          {/* Header Step 2 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ขั้นตอนที่ 2
              </span>
              <span className="text-[11px] text-slate-400">
                {hasUploadedSlip ? 'พร้อมส่งหลักฐาน' : 'รอแนบสลิป'}
              </span>
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>แนบสลิปหลักฐานการโอนเงิน</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              เมื่อโอนเงินเรียบร้อยแล้ว กรุณาแนบภาพสลิปเพื่อยืนยันการจองและรับสิทธิ์เข้าเรียน
            </p>
          </div>

          {/* Upload Dropzone */}
          <div className="my-5 flex-1 flex flex-col justify-center">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[240px] ${
                hasUploadedSlip
                  ? 'border-emerald-500/50 bg-emerald-950/20'
                  : isDragging
                  ? 'border-amber-400 bg-amber-400/10 scale-[1.01]'
                  : 'border-slate-700 hover:border-amber-400/60 bg-slate-950/50 hover:bg-slate-950/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {hasUploadedSlip && slipPreview ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <div className="relative max-w-[200px] max-h-[190px] rounded-xl overflow-hidden border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10 bg-slate-950">
                    <img
                      src={slipPreview}
                      alt="Uploaded Slip Preview"
                      className="w-full h-full object-contain max-h-[190px]"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5 mb-1">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      แนบภาพสลิปเรียบร้อยแล้ว
                    </span>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 border border-white/10 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-amber-400" />
                        เปลี่ยนรูปใหม่
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveSlip}
                        className="px-3 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-[11px] font-semibold flex items-center gap-1 border border-red-500/30 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        ลบสลิป
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner group-hover:scale-105 transition">
                    <Upload className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-sm text-slate-200 font-bold block mb-1">
                      คลิกเพื่อเลือกไฟล์ หรือ ลากรูปสลิปมาวางที่นี่
                    </span>
                    <span className="text-xs text-slate-400 block max-w-xs mx-auto">
                      ระบบจะจัดเก็บสลิปลงระบบคลาวด์ความปลอดภัยสูง และแจ้งเตือนอาจารย์ทันที
                    </span>
                    <span className="inline-block mt-2.5 px-3 py-1 rounded-full text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10">
                      รองรับไฟล์ JPG, PNG, WEBP (สูงสุด 10MB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security & Reassurance note */}
          <div className="p-3.5 bg-slate-950/70 border border-white/5 rounded-xl text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>การยืนยันและการเปิดสิทธิ์คอร์สเรียน:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 pl-5">
              หลังกดยืนยัน ระบบจะส่งอีเมลสรุปข้อมูลการจอง พร้อมแนบหลักฐานให้แอดมินอนุมัติสิทธิ์เข้าเรียนทันที
            </p>
          </div>
        </div>

      </div>

      {/* Confirmation & Submission CTA Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSubmittingPromptPay}
          onClick={handleConfirmPromptPay}
          className="w-full py-4 px-6 rounded-2xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 shadow-xl shadow-amber-400/20 hover:scale-[1.005] active:scale-[0.995] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          {isSubmittingPromptPay ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>กำลังตรวจสอบและบันทึกการจอง...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-slate-950" />
              <span className="text-base">ยืนยันการจองและส่งหลักฐานการชำระเงิน</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
