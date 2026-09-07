import React, { useState, useEffect, useCallback } from 'react';
import { ActivityLog } from '../types';
import { useFestival } from '../context/FestivalContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Activity } from 'lucide-react';

export const ActivityLogsPage: React.FC = () => {
  const { activeFestival } = useFestival();
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!activeFestival || !isAdmin) return;
    setLoading(true);
    try {
      const res = await api.get<ActivityLog[]>(`/activity-logs?festivalId=${activeFestival._id}`);
      setLogs(res);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFestival, isAdmin]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (!isAdmin) {
    return <div className="p-12 text-center text-slate-500 font-bold">Access Restricted to Admins</div>;
  }

  return (
    <div className="space-y-6 pb-12 text-left max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-3">
        <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Activity Logs</h1>
          <p className="text-xs text-slate-500">Audit trail of logins, contributions added, expenses logged, and records modified</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading activity trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No activity logs recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log._id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <div className="font-extrabold text-slate-900">{log.description}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    By <span className="font-bold text-slate-700">{log.userName}</span> • Action: {log.action}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
