import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Timer, 
  X, 
  ChevronDown, 
  ChevronUp, 
  CalendarDays, 
  AlertCircle 
} from 'lucide-react';

export default function ProjectCard({ project }) {
  const [showDetail, setShowDetail] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);

  if (!project) return null;

  // Map database status colors to visual themes based on your specific values
  const getStatusStyles = (urgency) => {
    const status = urgency?.toLowerCase();
    switch (status) {
      case 'red': // Very Urgent
        return { 
          bar: 'bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]', 
          dot: 'bg-red-500 animate-pulse',
          border: 'border-red-500/30 shadow-red-50',
          label: 'Very Urgent'
        };
      case 'orange': // Urgent
        return { 
          bar: 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]', 
          dot: 'bg-orange-500 animate-pulse',
          border: 'border-orange-400/20 shadow-orange-50',
          label: 'Urgent'
        };
      case 'yellow': // HOLD
        return { 
          bar: 'bg-yellow-400', 
          dot: 'bg-yellow-500',
          border: 'border-yellow-400/30 shadow-yellow-50',
          label: 'On Hold'
        };
      case 'green': // Ready to Start
        return { 
          bar: 'bg-emerald-500', 
          dot: 'bg-emerald-500',
          border: 'border-emerald-500/20 shadow-emerald-50',
          label: 'Ready to Start'
        };
      case 'purple': // Closed
        return { 
          bar: 'bg-purple-600 opacity-60', 
          dot: 'bg-purple-600',
          border: 'border-purple-200 grayscale-[0.4] bg-slate-50/50',
          label: 'Closed'
        };
      case 'white': // Don't Start
      default:
        return { 
          bar: 'bg-slate-200', 
          dot: 'bg-slate-300',
          border: 'border-slate-100 shadow-slate-200/60',
          label: "Don't Start"
        };
    }
  };

  const styles = getStatusStyles(project.urgency);
  const totalLogged = project.contributors?.reduce((acc, curr) => acc + parseFloat(curr.total_hours || 0), 0).toFixed(1) || "0.0";

  return (
    <>
      {/* --- Main Dashboard Card --- */}
      <div 
        onClick={() => setShowDetail(true)}
        className={`group relative rounded-[3rem] p-9 border-2 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl cursor-pointer overflow-hidden bg-white ${styles.border}`}
      >
        {/* Visual Status Accent Bar */}
        <div className={`absolute top-0 left-0 right-0 h-2.5 transition-colors duration-500 ${styles.bar}`} />

        <div className="flex justify-between items-start mb-8 mt-2">
          <div className="flex gap-2">
            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
              {project.p_team?.split(' ')[0] || 'N/A'}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
               <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{styles.label}</span>
            </div>
          </div>
          <div className="text-slate-200 group-hover:text-blue-500 transition-colors">
            <AlertCircle size={20} />
          </div>
        </div>

        <h3 className="text-2xl font-black text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
          {project.project_name || "Untitled Project"}
        </h3>
        <p className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-tighter">PRJ-#{project.project_id}</p>

        {/* Timeline & Budget Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><Calendar size={12}/> Start</p>
            <p className="text-sm font-bold text-slate-700">{project.start_date || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><Timer size={12}/> Budget</p>
            <p className="text-sm font-bold text-slate-700">{project.estimated_hours ? `${project.estimated_hours}h` : '0h'}</p>
          </div>
        </div>

        {/* Progress Logic */}
        <div className="space-y-3 mb-10">
          <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
            <span className="text-slate-400">Completion</span>
            <span className="text-blue-600">{project.progress || 0}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(37,99,235,0.2)] 
              ${project.urgency === 'purple' ? 'bg-slate-400' : 'bg-blue-600'}`} 
              style={{ width: `${project.progress || 0}%` }} 
            />
          </div>
        </div>

        {/* Contributor Footer */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-8">
          <div className="flex -space-x-4">
            {project.contributors?.slice(0, 3).map((eng, i) => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                {eng.pic ? (
                  <img src={eng.pic} alt={eng.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs font-black text-slate-400 bg-slate-200 uppercase">
                    {eng.name?.[0]}
                  </div>
                )}
              </div>
            ))}
            {project.contributors?.length > 3 && (
              <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                +{project.contributors.length - 3}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-[1.2rem] shadow-xl">
            <Clock size={16} className="text-blue-400" />
            <span className="text-sm font-black">{totalLogged}h</span>
          </div>
        </div>
      </div>

      {/* --- Detail Breakout Modal --- */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] p-12 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-in zoom-in duration-300">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowDetail(false); }} 
              className="absolute right-10 top-10 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={28} className="text-slate-400" />
            </button>
            
            <header className="mb-10 text-center">
              <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">{project.project_name}</h2>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center justify-center gap-2">
                <CalendarDays size={16}/> Daily Log Breakout
              </p>
            </header>

            <div className="space-y-5">
              {project.contributors?.map((engineer) => (
                <div key={engineer.user_id} className="border border-slate-100 rounded-[2rem] overflow-hidden bg-slate-50">
                  <div 
                    onClick={(e) => { e.stopPropagation(); setExpandedUser(expandedUser === engineer.user_id ? null : engineer.user_id); }}
                    className="flex items-center justify-between p-6 cursor-pointer hover:bg-white transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-blue-600 shadow-sm overflow-hidden">
                        {engineer.pic ? <img src={engineer.pic} className="w-full h-full object-cover" /> : engineer.name?.[0]}
                      </div>
                      <div>
                        <p className="text-md font-black text-slate-800">{engineer.name}</p>
                        <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">{engineer.total_hours}h Net Logged</p>
                      </div>
                    </div>
                    {expandedUser === engineer.user_id ? <ChevronUp size={24} className="text-blue-600" /> : <ChevronDown size={24} className="text-slate-300" />}
                  </div>

                  {expandedUser === engineer.user_id && (
                    <div className="p-6 bg-white space-y-3 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
                      {engineer.breakouts?.map((log, idx) => (
                        <div key={idx} className="flex justify-between items-center py-4 px-6 bg-slate-50 rounded-2xl border border-slate-50 hover:border-blue-100 transition-colors">
                          <div className="flex items-center gap-3 text-slate-600">
                            <CalendarDays size={16} className="text-blue-400" />
                            <span className="text-xs font-bold">{new Date(log.date).toLocaleDateString('en-AU')}</span>
                          </div>
                          <span className="text-sm font-black text-slate-900">{log.hours}h</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowDetail(false)}
              className="mt-10 w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-slate-800 transition-all shadow-xl active:scale-95"
            >
              Close Detailed View
            </button>
          </div>
        </div>
      )}
    </>
  );
}