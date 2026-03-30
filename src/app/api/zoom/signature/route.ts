import { NextResponse } from 'next/server';
import { KJUR } from 'jsrsasign';

export async function POST(req: Request) {
  try {
    const { meetingNumber, role } = await req.json();

    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2; // Expire in 2 hours

    const sdkKey = process.env.ZOOM_SDK_KEY;
    const sdkSecret = process.env.ZOOM_SDK_SECRET;

    if (!sdkKey || !sdkSecret) {
      return NextResponse.json({ error: 'Zoom SDK Credentials Undefined' }, { status: 500 });
    }

    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sdkKey: sdkKey,
      mn: meetingNumber,
      role: role,
      iat: iat,
      exp: exp,
      appKey: sdkKey,
      tokenExp: iat + 60 * 60 * 2
    };

    const sHeader = JSON.stringify(header);
    const sPayload = JSON.stringify(payload);
    const sdkSignature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, sdkSecret);

    return NextResponse.json({ signature: sdkSignature });
  } catch (err) {
    return NextResponse.json({ error: 'Signature Matrix Offline' }, { status: 500 });
  }
}
