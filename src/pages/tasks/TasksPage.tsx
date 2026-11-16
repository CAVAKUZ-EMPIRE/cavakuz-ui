import { useEffect, useState, type FormEvent } from 'react'
import { tasksApi } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import AppShell from '../../components/AppShell'
import { EmptyState, LoadingState } from '../../components/PageState'
import StatusPill from '../../components/StatusPill'
import { getErrorMessage } from '../../lib/http'
import { confirmDelete, errorToast, successToast } from '../../lib/swal'
import type { Task } from '../../types'

const PROGRESS_BY_STATUS: Record<string, number> = {
  pending: 0,
  in_progress: 50,
  completed: 100,
}

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [name, setName] = useState('')
  const [status, setStatus] = useState('pending')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setTasks(await tasksApi.list())
    } catch (err) {
      errorToast(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const resetForm = () => {
    setName('')
    setStatus('pending')
    setEditingId(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    const payload = {
      name,
      status,
      user_id: user?.id,
    }
    try {
      if (editingId) {
        await tasksApi.update(editingId, payload)
        successToast('Task updated.')
      } else {
        await tasksApi.create(payload)
        successToast('Task created.')
      }
      resetForm()
      await load()
    } catch (err) {
      errorToast(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingId(task.id)
    setName(task.name)
    setStatus(task.status)
  }

  const handleDelete = async (task: Task) => {
    const confirmed = await confirmDelete(`Delete "${task.name}"? This action cannot be undone.`)
    if (!confirmed) return
    try {
      await tasksApi.remove(task.id)
      setTasks((current) => current.filter((item) => item.id !== task.id))
    } catch (err) {
      errorToast(getErrorMessage(err))
    }
  }

  return (
    <AppShell pageTitle="Tasks" pageSubtitle="Track job progress from pending through completion.">
      <section className="module-grid two-column">
        <div className="panel module-panel">
          <form className="field-form" onSubmit={(event) => void handleSubmit(event)}>
            <div className="field-grid">
              <label style={{ gridColumn: '1 / -1' }}>
                <span>Task name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label>
                <span>Status</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <div style={{ gridColumn: '1 / -1' }}>
                <small>Progress</small>
                <div className="progress-line" style={{ marginTop: 6 }}>
                  <div className="progress">
                    <div className={`progress-bar ${status === 'completed' ? 'complete' : ''}`} style={{ width: `${PROGRESS_BY_STATUS[status]}%` }} />
                  </div>
                  <small>{PROGRESS_BY_STATUS[status]}%</small>
                </div>
              </div>
            </div>
            <div className="action-row">
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update task' : 'Create task'}
              </button>
              {editingId && <button className="secondary-button" type="button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </div>
        <div className="panel module-panel">
          {loading ? <LoadingState /> : (
            <div className="task-stack">
              {tasks.map((task) => (
                <div className="task-card" key={task.id}>
                  <div className="task-card-header">
                    <strong>{task.name}</strong>
                    <StatusPill value={task.status} />
                  </div>
                  <div className="progress-line">
                    <div className="progress">
                      <div className={`progress-bar ${task.status === 'completed' ? 'complete' : ''}`} style={{ width: `${task.progress}%` }} />
                    </div>
                    <small>{task.progress}%</small>
                  </div>
                  <small>{task.user?.name ?? 'Assigned to current user'}</small>
                  <div className="table-actions" style={{ marginTop: 10 }}>
                    <button className="table-button" type="button" onClick={() => handleEdit(task)}>Edit</button>
                    <button className="table-button danger" type="button" onClick={() => void handleDelete(task)}>Delete</button>
                  </div>
                </div>
              ))}
              {!tasks.length && <EmptyState label="No tasks yet." />}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  )
}
