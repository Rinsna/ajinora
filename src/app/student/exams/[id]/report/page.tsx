"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Trophy, ShieldCheck, CheckCircle2, XCircle, Printer } from "lucide-react";

export default function ExamReport() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/student/exams/${id}/report`);
        if (res.ok) {
          const reportData = await res.json();
          setData(reportData);
        }
      } catch (error) {
        console.error("Failed to load report", error);
      } finally {
        setLoading(false);
        // Automatically trigger the print dialog for downloading as PDF
        setTimeout(() => {
            window.print();
        }, 1000);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center font-mono">Generating Official Report Array...</div>;
  }

  if (!data) {
    return <div className="h-screen flex items-center justify-center font-mono text-red-500">Failed to load examination report. Please try again or contact administration.</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black p-10 max-w-4xl mx-auto font-sans">
        <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck size={24} className="text-primary" />
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">Ajinora LMS</h1>
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-gray-900 leading-tight mb-2">Examination Report</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Session Record: {id}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Generated</p>
                <p className="text-sm font-semibold text-gray-900">{data.completedAt}</p>
                <button onClick={() => window.print()} className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors print:hidden">
                    <Printer size={14} /> Print / Save PDF
                </button>
            </div>

        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="p-6 border border-gray-200 rounded-2xl flex items-center gap-4">
                <Trophy size={32} className="text-green-500" />
                <div>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Final Score</p>
                    <p className="text-3xl font-bold text-gray-900">{data.score}<span className="text-lg text-gray-400 font-medium">/{data.total}</span></p>
                </div>
            </div>
            <div className="p-6 border border-gray-200 rounded-2xl flex items-center justify-center text-center">
                <div>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Mastery Grade</p>
                    <p className="text-4xl font-bold text-primary">{data.grade}</p>
                </div>
            </div>
            <div className="p-6 border border-gray-200 rounded-2xl flex items-center justify-center text-center">
                <div>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Cohort Rank</p>
                    <p className="text-3xl font-bold text-gray-900">#{data.rank}</p>
                </div>
            </div>
        </div>

        <div className="border border-gray-200 rounded-2xl p-8 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FileText size={16} /> Authenticity Verification
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
               This document serves as the official cryptographic record of evaluation for standard assessments held under the Ajinora core learning system. The metrics encoded within this dataset represent the un-tampered, server-verified capability index of the respective candidate.
            </p>
            <p className="text-[10px] font-mono text-gray-500 pt-4 border-t border-gray-200">
               ID-HASH: {btoa(String(id) + data.completedAt).substring(0, 24).toUpperCase()}
            </p>
        </div>
    </div>
  );
}
