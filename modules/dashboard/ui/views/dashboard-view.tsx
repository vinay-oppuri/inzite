'use client';

import { useState } from 'react';

import { toast } from 'sonner';
import { DashboardLoading } from '../../components/dashboard-loading';
import { DashboardEmptyState } from '../../components/dashboard-empty-state';
import { DetailedReport, Report } from '../../components/detailed-report';
import { motion, AnimatePresence } from "motion/react";
import LoadingState from '@/components/common/loading-state';
import ErrorState from '@/components/common/error-state';

export default function DashboardView() {
  const [idea, setIdea] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("Initializing...");

  const runPipeline = async () => {
    if (!idea.trim()) return toast('Please enter an idea..');
    setLoading(true);
    setCurrentStep("Initializing Research Workflow...");

    try {
      const startRes = await fetch('/api/start-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: idea })
      });

      if (!startRes.ok) throw new Error("Failed to start research");

      const startData = await startRes.json();
      const sessionId = startData.sessionId;

      if (!sessionId) {
        throw new Error("No session ID returned");
      }

      let attempts = 0;
      const maxAttempts = 100;

      const poll = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await fetch(`/api/get-session-status?sessionId=${sessionId}`);
          if (!statusRes.ok) return;
          const statusData = await statusRes.json();
          console.log("Status Polling:", statusData);

          if (statusData) {
            const { status, currentStep, resultId } = statusData;
            setCurrentStep(currentStep || "Processing...");

            if (status === 'completed' && resultId) {
              setTimeout(async () => {
                const reportRes = await fetch('/api/get-latest-report');

                if (reportRes.ok) {
                  const reportData = await reportRes.json();
                  if (reportData) {
                    setReport(reportData);
                    setLoading(false);
                    clearInterval(poll);
                    toast.success('Report generated successfully!');
                  }
                }
              }, 1000);
              return;
            }

            if (status === 'failed') {
              clearInterval(poll);
              setLoading(false);
              toast.error('Research failed. Please try again.');
              return;
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setLoading(false);
          toast.error('Research is taking longer than expected. Please check "Saved Reports" later.');
        }
      }, 3000);

    } catch (err) {
      console.error('Pipeline error:', err);
      toast.error('Failed to start research.');
      setLoading(false);
    }
  };

  if (report) {
    return <DetailedReport report={report} />;
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-[calc(100vh-4rem)] gap-8 p-4 md:p-8 max-w-[1600px] mx-auto overflow-hidden">
      <DashboardEmptyState
        idea={idea}
        setIdea={setIdea}
        runPipeline={runPipeline}
        loading={loading}
      />

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, x: 50, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: 20, width: 0 }}
            className="shrink-0 w-full max-w-md"
          >
            <DashboardLoading currentStep={currentStep} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const DashboardLoadingState = () => {
  return (
    <LoadingState
      title="Loading Dashboard"
      description="Please wait while we load your dashboard."
    />
  )
}

export const DashboardErrorState = () => {
  return (
    <ErrorState
      title="Error Loading Dashboard"
      description="Please try again later."
    />
  )
}