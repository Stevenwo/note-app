export default function Sidebar() {
  return (
    <aside className="w-64 glass border-r border-white/5 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-base font-semibold">Notes</h1>
        </div>
        
        <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </button>
      </div>
      
      {/* Search */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="glass-strong rounded-lg relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search..." className="w-full bg-transparent pl-9 pr-3 py-2 text-xs outline-none" />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-2 space-y-0.5">
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-indigo-500/15 border-l-3 border-indigo-500">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Recently Added</span>
            <span className="ml-auto text-xs text-gray-400">24</span>
          </a>
          
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>Starred</span>
            <span className="ml-auto text-xs text-gray-400">8</span>
          </a>
          
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>Web Clips</span>
            <span className="ml-auto text-xs text-gray-400">12</span>
          </a>
        </div>
        
        <div className="px-2 mt-4 space-y-0.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Notebooks</p>
          
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500"></div>
            <span className="text-sm">Cambodia</span>
            <span className="ml-auto text-xs text-gray-500">2</span>
          </a>
          
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5">
            <div className="w-2.5 h-2.5 rounded-sm bg-green-500"></div>
            <span className="text-sm">PostgreSQL</span>
            <span className="ml-auto text-xs text-gray-500">5</span>
          </a>
        </div>
      </nav>
    </aside>
  )
}
