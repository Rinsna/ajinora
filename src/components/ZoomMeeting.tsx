"use client";

import { useEffect, useRef } from 'react';
import { ZoomMtg } from '@zoom/meetingsdk';

interface ZoomMeetingProps {
  meetingNumber: string;
  passWord: string;
  userName: string;
  userEmail: string;
  signature: string;
  sdkKey: string;
  onLeave: () => void;
}

export default function ZoomMeeting({
  meetingNumber,
  passWord,
  userName,
  userEmail,
  signature,
  sdkKey,
  onLeave
}: ZoomMeetingProps) {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initZoom = async () => {
      // Zoom SDK setup
      ZoomMtg.setZoomJSLib('https://source.zoom.us/2.15.0/lib', '/av');
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();
      
      ZoomMtg.init({
        leaveUrl: window.location.origin + '/student/sessions',
        success: (success: any) => {
          ZoomMtg.join({
            meetingNumber,
            signature,
            sdkKey,
            userName,
            userEmail,
            passWord,
            tk: '',
            success: (success: any) => {
              console.log('Classroom Synchronized Successfully.');
            },
            error: (error: any) => {
              console.error('Join Error:', error);
            }
          });
        },
        error: (error: any) => {
          console.error('Init Error:', error);
        }
      });
    };

    initZoom();

    return () => {
        // Cleanup if needed
        const element = document.getElementById('zmmtg-root');
        if (element) element.style.display = 'none';
    };
  }, [meetingNumber, passWord, userName, userEmail, signature, sdkKey]);

  return (
    <div id="zmmtg-root" className="fixed inset-0 z-[200] bg-black">
        {/* The Zoom SDK will populate this root element */}
    </div>
  );
}
