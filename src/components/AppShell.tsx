import { Bell, ChevronDown, Menu, Plus, Search, UserRound, X } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { notificationsApi } from '../api'
import { useAuth } from '../auth/AuthContext'
import '../assets/styles/dashboard.css'
import UniversalSidebar from './UniversalSidebar'

type AppShellProps = {
  pageTitle: string
  pageSubtitle: string
  children: ReactNode
  action?: ReactNode
}

export default function AppShell({ pageTitle, pageSubtitle, children, action }: AppShellProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const items = await notificationsApi.list()
        setUnreadCount(items.filter((item) => !item.is_read).length)
      } catch {
        setUnreadCount(0)
      }
    }

    void loadNotifications()
  }, [])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    const query = search.trim()
    navigate(query ? `/customers?q=${encodeURIComponent(query)}` : '/customers')
  }

  return (
    <div className="cavakuz-app">
      <UniversalSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="cavakuz-main">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <form className="global-search" onSubmit={submitSearch}>
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers..."
              aria-label="Search customers"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </form>

          <div className="topbar-actions">
            <Link to="/notifications" className="notification-button" aria-label="Notifications">
              <Bell size={20} />
              {unreadCount > 0 && <span />}
            </Link>
            <button className="profile-button" type="button">
              <div className="profile-avatar"><UserRound size={20} /></div>
              <div className="profile-copy">
                <strong>{user?.name ?? 'Workspace user'}</strong>
                <small>{user?.role ?? 'assistant'}</small>
              </div>
              <ChevronDown size={16} />
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">BUSINESS OPERATIONS</div>
              <h1>{pageTitle}</h1>
              <p>{pageSubtitle}</p>
            </div>

            <div className="welcome-actions">
              {action ?? (
                <Link to="/sales/new" className="btn btn-primary add-record-btn">
                  <Plus size={17} /> New sale
                </Link>
              )}
            </div>
          </section>

          {children}

          <footer className="dashboard-footer">
            <span>© {new Date().getFullYear()} Cavakuz Work Management</span>
            <span>Print • Design • Operations</span>
          </footer>
        </div>
      </main>
    </div>
  )
}
