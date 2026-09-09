import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index.js';
import { Button, Input, CheckCircleIcon, CloseIcon, CameraIcon } from '../../components/ui/index.js';

export default function TasksView() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isWorker = user?.roles?.includes('WORKER');

  const [tasks, setTasks] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState<any | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [dueDate, setDueDate] = useState('');
  const [assigneeName, setAssigneeName] = useState('Suresh Patil (Worker)');
  const [wageAmount, setWageAmount] = useState('450');

  // Evidence state
  const [completionNotes, setCompletionNotes] = useState('');

  const loadTasks = () => {
    fetch('http://localhost:8000/api/v1/tasks', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTasks(d.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) loadTasks();
    } catch {}
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          dueDate,
          assigneeName,
          wageAmount: Number(wageAmount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        loadTasks();
      }
    } catch {}
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEvidenceModal) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/tasks/${showEvidenceModal.id}/evidence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          photoUrl: '/logo/sample-produce.png',
          completionNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowEvidenceModal(null);
        setCompletionNotes('');
        loadTasks();
      }
    } catch {}
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Field Task & Work Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isWorker
              ? 'View tasks assigned to you, update operational status, and upload proof of completion.'
              : 'Assign field tasks to farm workers/managers. Tasks track labour wage into crop cycle cost.'}
          </p>
        </div>
        {!isWorker && (
          <Button onClick={() => setShowCreateModal(true)} className="text-xs">
            + Assign New Task
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              filterStatus === st
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-800 leading-snug">{task.title}</h3>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                    task.priority === 'HIGH'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              {task.description && (
                <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>
              )}

              <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Assigned To:</span>
                  <strong className="text-slate-700">{task.assigneeName || 'Worker'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <span className="text-slate-700">{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                {task.wageAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Wage Cost:</span>
                    <span>₹{task.wageAmount}</span>
                  </div>
                )}
              </div>

              {/* Completion Evidence if present */}
              {task.evidencePhotoUrl && (
                <div className="p-2.5 bg-emerald-50/60 rounded-md border border-emerald-200 text-xs space-y-1">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-700" />
                    Verified Completion Proof
                  </span>
                  {task.completionNotes && (
                    <p className="text-[11px] text-emerald-800 italic">"{task.completionNotes}"</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase ${
                  task.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : task.status === 'IN_PROGRESS'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {task.status}
              </span>

              <div className="flex items-center gap-1.5">
                {task.status === 'TODO' && (
                  <Button
                    variant="outline"
                    className="text-[11px] px-2.5 py-1"
                    onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                  >
                    Start Task
                  </Button>
                )}

                {task.status === 'IN_PROGRESS' && (
                  <Button
                    className="text-[11px] px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800"
                    onClick={() => setShowEvidenceModal(task)}
                  >
                    Upload Proof & Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Assign Field Task</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <Input label="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Cluster thinning on Plot A" id="title" />
              <Input label="Operational Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Inspect bunches and prune small berries" id="description" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md">
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required id="dueDate" />
              </div>
              <Input label="Assign To" value={assigneeName} onChange={(e) => setAssigneeName(e.target.value)} placeholder="e.g. Suresh Patil (Worker)" id="assigneeName" />
              <Input label="Labour Wage (₹)" type="number" value={wageAmount} onChange={(e) => setWageAmount(e.target.value)} placeholder="e.g. 450" id="wageAmount" />
              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit">Assign Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence & Complete Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Complete Task: {showEvidenceModal.title}</h3>
              <button onClick={() => setShowEvidenceModal(null)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitEvidence} className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Worker Evidence Attachment:</p>
                <p className="text-[11px] text-slate-500">Camera / Photo verification will be attached to the task record for farm manager review.</p>
                <div className="mt-2 h-20 bg-white border border-dashed border-slate-300 rounded flex items-center justify-center text-xs text-emerald-700 font-semibold cursor-pointer gap-2">
                  <CameraIcon className="w-4 h-4" />
                  <span>Photo proof: sample-field-work.jpg (Ready)</span>
                </div>
              </div>

              <Input
                label="Completion Notes"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                required
                placeholder="e.g. Sprayed 10 rows completely. Emitters working smoothly."
                id="completionNotes"
              />

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowEvidenceModal(null)}>Cancel</Button>
                <Button type="submit">Confirm & Mark Completed</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
