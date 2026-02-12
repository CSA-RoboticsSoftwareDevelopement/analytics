import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-full xl:w-96 group">
      <Search 
        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" 
        size={20} 
      />
      <input
        type="text" 
        placeholder="Search all teams..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-14 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none font-bold transition-all shadow-sm"
      />
      {searchTerm && (
        <button 
          onClick={() => setSearchTerm('')} 
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={16} className="text-slate-400" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;