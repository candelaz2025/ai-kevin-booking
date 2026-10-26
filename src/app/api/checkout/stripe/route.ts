import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'ระบบชำระเงินด้วยบัตรเครดิต (Stripe) ปิดให้บริการชั่วคราว กรุณาชำระผ่านช่องทาง PromptPay QR Code' 
    }, 
    { status: 403 }
  );
}
