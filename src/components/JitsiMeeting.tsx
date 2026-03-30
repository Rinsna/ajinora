"use client";

import { useEffect, useRef } from "react";
import { GraduationCap } from "lucide-react";

// Add TypeScript declaration for window object
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetingProps {
  url: string;
  onLeave: () => void;
}

export default function JitsiMeeting({ url, onLeave }: JitsiMeetingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic extraction to get the meeting room name
    const rawUrl = typeof url === "string" ? url : (url as any).link || "";
    if (!rawUrl) return;

    // Check if it's actually a Jitsi link
    if (!rawUrl.includes("meet.jit.si")) {
      // Fallback to standard iframe for non-Jitsi links
      if (containerRef.current) {
        containerRef.current.innerHTML = `<iframe src="${rawUrl}" allow="camera; microphone; fullscreen; display-capture" class="w-full h-full border-0"></iframe>`;
      }
      return;
    }

    const roomName = rawUrl.split('/').pop()?.split('?')[0]?.split('#')[0] || 'Ajinora_Session';

    let api: any = null;

    const loadJitsi = () => {
      if (!window.JitsiMeetExternalAPI || !containerRef.current) return;
      
      api = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        configOverwrite: {
          disableDeepLinking: true,
          prejoinConfig: { enabled: false },
          startWithAudioMuted: false,
          startWithVideoMuted: false
        },
      });

      api.addListener('videoConferenceLeft', () => {
        onLeave();
      });
      
      api.addListener('readyToClose', () => {
        onLeave();
      });
    };

    // Load external script if not present
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = loadJitsi;
      document.body.appendChild(script);
    } else {
      loadJitsi();
    }

    return () => {
      if (api) {
        api.dispose();
      }
    };
  }, [url, onLeave]);

  return (
    <div className="w-full h-full relative bg-black">
      {/* Absolute Header Overlay to Cover Jitsi Logo */}
      <div 
        className="absolute top-[20px] left-[20px] z-[50] bg-[#1a1a1a] flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl border border-white/10 shadow-lg pointer-events-none"
        style={{ minWidth: '180px', height: '50px' }}
      >
        <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center shadow-inner">
          <GraduationCap size={16} className="text-white" />
        </div>
        <span className="text-white font-black uppercase tracking-[0.2em] text-sm">Ajinora</span>
      </div>

      {/* Jitsi SDK Mount Point */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
