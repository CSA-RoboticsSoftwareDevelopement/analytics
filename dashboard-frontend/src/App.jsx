import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import ProjectCard from './components/ProjectCard';
import SearchBar from './components/SearchBar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  LayoutDashboard, HardHat, Cpu, Factory, Database,
  Loader2, Search, X, BarChart3, TrendingUp, AlertTriangle
} from 'lucide-react';

export default function ModernDashboard() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('Building Team');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('csarae_search') || '');

  // --- DATA FETCHING ---
  useEffect(() => {
    axios.get('http://localhost:5001/api/detailed-projects')
      .then(res => {
        setProjects(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, []);

  // --- SEARCH PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('csarae_search', searchTerm);
  }, [searchTerm]);

  // --- ANALYTICS LOGIC (Charts) ---
  const stats = useMemo(() => {
    if (!projects.length) return null;

    // Filters data specifically for the chart analytics based on current view
    const filteredForStats = projects.filter(p => {
        if (!p) return false;
        const matchesSearch = p.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.project_id?.toString().includes(searchTerm);
        return searchTerm.trim() !== "" ? matchesSearch : p.p_team === filter;
    });

    const statusData = [
      { name: 'Running', value: projects.filter(p => p.urgency === 'green').length, color: '#10b981' },
      { name: 'Closed', value: projects.filter(p => p.urgency === 'purple').length, color: '#8b5cf6' },
      { name: 'Delayed/Urgent', value: projects.filter(p => ['red', 'orange'].includes(p.urgency)).length, color: '#ef4444' },
      { name: 'Hold', value: projects.filter(p => p.urgency === 'yellow').length, color: '#f59e0b' },
    ];

    const workloadData = filteredForStats
      .map(p => ({
        fullName: p.project_name,
        name: p.project_name, 
        hours: p.contributors?.reduce((sum, c) => sum + parseFloat(c.total_hours || 0), 0) || 0
      }))
      .sort((a, b) => b.hours - a.hours).slice(0, 5);

    const concentrationData = projects
      .map(p => ({
        fullName: p.project_name,
        name: p.project_name, 
        staff: p.contributors?.length || 0
      }))
      .sort((a, b) => b.staff - a.staff)
      .slice(0, 5);

    return { statusData, workloadData, concentrationData };
  }, [projects, filter, searchTerm]);

  // --- LIST LOGIC (Recently Created & Not Started) ---
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => b.project_id - a.project_id)
      .slice(0, 5);
  }, [projects]);

  const notStartedProjects = useMemo(() => {
    return projects.filter(p => p.urgency === 'white').slice(0, 5);
  }, [projects]);

  // --- MAIN GRID LOGIC ---
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (!p) return false;
      const matchesSearch = p.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.project_id?.toString().includes(searchTerm);
      return searchTerm.trim() !== "" ? matchesSearch : p.p_team === filter;
    });
  }, [projects, searchTerm, filter]);

  // --- HANDLERS ---
  const handleBarClick = useCallback((data) => {
    if (data && data.fullName) setSearchTerm(data.fullName);
  }, []);

  const teams = [
    { id: 'Building Team', icon: <HardHat size={20} />, label: 'Building' },
    { id: 'Industrial Team', icon: <Factory size={20} />, label: 'Industrial' },
    { id: 'IT', icon: <Cpu size={20} />, label: 'IT & AI' }
  ];

  // --- CONDITIONAL RENDERING (Must be after all Hooks) ---
  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-500 font-bold tracking-tight">Syncing DDEV Analytics...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] font-sans">
      {/* Sidebar with Squircle Icon styling */}
      <aside className="group w-24 hover:w-72 bg-white border-r border-slate-200 flex flex-col p-6 hidden lg:flex sticky top-0 h-screen transition-all duration-300 ease-in-out z-30 shadow-sm overflow-x-hidden">
        <div className="flex items-center gap-4 mb-10 text-blue-600 px-2 h-10">
          <div className="min-w-[32px]">
            <LayoutDashboard size={32} strokeWidth={2.5} />
          </div>
          <span className="font-black text-2xl tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            CSARAE
          </span>
        </div>

        <nav className="space-y-4 flex-1">
          {teams.map((team) => {
            const isActive = filter === team.id && !searchTerm;
            return (
              <button
                key={team.id}
                onClick={() => { setFilter(team.id); setSearchTerm(''); }}
                className={`flex items-center transition-all duration-300 relative group/btn
                  ${isActive ? 'w-full text-white' : 'text-slate-400 hover:text-blue-600'} 
                  ${isActive ? 'w-full' : 'w-14 group-hover:w-full'}`}
              >
                <div className={`flex items-center justify-center transition-all duration-300 shrink-0
                  ${isActive 
                    ? 'w-14 h-14 bg-blue-600 rounded-[1.25rem] shadow-xl shadow-blue-200' 
                    : 'w-14 h-14 bg-transparent group-hover/btn:bg-slate-50 rounded-2xl'}`}
                >
                  {React.cloneElement(team.icon, { size: 24 })}
                </div>
                <span className={`font-bold text-sm ml-4 whitespace-nowrap transition-all duration-300
                  ${isActive ? 'text-blue-600' : 'text-slate-500'}
                  opacity-0 group-hover:opacity-100 hidden group-hover:block`}
                >
                  {team.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-4 px-2 h-10">
            <div className="min-w-[12px] flex justify-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              DDEV Active
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
        {/* Analytics Charts */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-96">
            <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
              <TrendingUp size={16} /> Project Health
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={stats?.statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats?.statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-96">
            <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
              <BarChart3 size={16} /> Effort (Hours)
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={stats?.workloadData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" fontSize={9} axisLine={false} tickLine={false} width={100} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[0, 4, 4, 0]} onClick={handleBarClick} className="cursor-pointer" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-96">
            <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
              <AlertTriangle size={16} /> Staff Concentration
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={stats?.concentrationData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" fontSize={9} axisLine={false} tickLine={false} width={100} />
                <Tooltip />
                <Bar dataKey="staff" fill="#f59e0b" radius={[0, 4, 4, 0]} onClick={handleBarClick} className="cursor-pointer" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Dashboard Quick-Lists */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Recently Created */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-500" /> Recently Created
              </h3>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">New Entries</span>
            </div>
            <div className="space-y-4">
              {recentProjects.map(p => (
                <div key={p.project_id} onClick={() => setSearchTerm(p.project_name)} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs">
                      #{p.project_id}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{p.project_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.p_team}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-400">{p.start_date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Start */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={16} className="text-slate-400" /> Pending Start
              </h3>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">Not Started</span>
            </div>
            <div className="space-y-4">
              {notStartedProjects.length > 0 ? notStartedProjects.map(p => (
                <div key={p.project_id} onClick={() => setSearchTerm(p.project_name)} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-bold text-xs">
                      #{p.project_id}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{p.project_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.p_team}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-400">{p.start_date}</p>
                </div>
              )) : (
                <div className="h-40 flex items-center justify-center text-slate-300 font-bold text-sm italic">
                  All projects are currently in progress.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Search & Grid Header */}
        <header className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Active Projects</h1>
            {searchTerm && <p className="text-blue-600 font-bold text-sm mt-2 flex items-center gap-2">
              <Search size={14} /> Result for: "{searchTerm}"
            </p>}
          </div>
         <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* Project Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {filteredProjects.map(project => <ProjectCard key={project.project_id} project={project} />)}
        </div>
      </main>
    </div>
  );
}