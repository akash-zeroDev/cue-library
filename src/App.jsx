import { useEffect, useMemo, useState } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import FilterBar from './components/FilterBar.jsx'
import Rail from './components/Rail.jsx'
import Card from './components/Card.jsx'
import Modal from './components/Modal.jsx'
import Toast from './components/Toast.jsx'
import Search from './components/Search.jsx'
import EmptyState from './components/EmptyState.jsx'
import Footer from './components/Footer.jsx'
import Admin from './pages/Admin.jsx'
import { AppProvider, useApp } from './context/AppContext.jsx'
import { filterPrompts, sortPrompts } from './data/prompts.js'

function useRoute() {
  const [hash, setHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''))
  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return hash
}

function Home() {
  const { allPrompts, filter, isFiltering } = useApp()
  const [searchOpen, setSearchOpen] = useState(false)

  const filtered = useMemo(
    () => sortPrompts(filterPrompts(allPrompts, filter), filter.sort),
    [allPrompts, filter]
  )
  const featured = useMemo(() => allPrompts.filter((p) => p.rail === 'featured'), [allPrompts])
  const fresh = useMemo(() => allPrompts.filter((p) => p.rail === 'fresh'), [allPrompts])
  const trending = useMemo(() => allPrompts.filter((p) => p.rail === 'trending'), [allPrompts])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === '/' && !searchOpen && !isTypingInField(e.target)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen])

  return (
    <>
      <Nav onSearchClick={() => setSearchOpen(true)} />
      <main className="app">
        {!isFiltering && <Hero />}
        <FilterBar />
        {isFiltering ? (
          filtered.length > 0 ? (
            <Rail title={`${filtered.length} prompt${filtered.length === 1 ? '' : 's'}`} columns={3}>
              {filtered.map((p) => <Card key={p.id} item={p} />)}
            </Rail>
          ) : (
            <EmptyState />
          )
        ) : (
          <>
            {featured.length > 0 && (
              <Rail title="Featured picks" columns={2}>
                {featured.map((p) => <Card key={p.id} item={p} />)}
              </Rail>
            )}
            {fresh.length > 0 && (
              <Rail title="Fresh finds" columns={3}>
                {fresh.map((p) => <Card key={p.id} item={p} />)}
              </Rail>
            )}
            {trending.length > 0 && (
              <Rail title="Trending this week" columns={3}>
                {trending.map((p) => <Card key={p.id} item={p} />)}
              </Rail>
            )}
          </>
        )}
      </main>
      <Footer />
      <Search open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function isTypingInField(el) {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
}

function Router() {
  const route = useRoute()
  if (route === '#/admin' || route === '#admin') return <Admin />
  return <Home />
}

export default function App() {
  return (
    <AppProvider>
      <Router />
      <Modal />
      <Toast />
    </AppProvider>
  )
}
