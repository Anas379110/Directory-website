'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApproveRejectButtons({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDecision = async (
    decision: 'approved' | 'rejected',
    rejectionReason?: string,
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/queue/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ decision, rejectionReason }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Error: ' + (err.error || err));
      } else {
        router.refresh();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    handleDecision('approved');
  };

  const handleReject = async () => {
    const rejectionReason = window.prompt('سبب الرفض');
    if (!rejectionReason) {
      return;
    }
    await handleDecision('rejected', rejectionReason);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="text-green-700 underline"
      >
        موافقة
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="text-red-700 underline"
      >
        رفض
      </button>
    </div>
  );
}
