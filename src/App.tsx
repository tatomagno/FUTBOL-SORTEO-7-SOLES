/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Shuffle, 
  Users, 
  UserPlus, 
  Trophy, 
  Shield, 
  Zap, 
  Target,
  Copy,
  Check,
  RotateCcw,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Position = 'arquero' | 'defensor' | 'mediocampista' | 'delantero';

interface Player {
  id: string;
  name: string;
  position: Position;
  level: number;
}

interface Team {
  id: number;
  players: Player[];
  totalLevel: number;
  averages: Record<Position, number>;
}

// --- Constants ---

const POSITIONS: { value: Position; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'arquero', label: 'Arquero', icon: <Target className="w-4 h-4" />, color: 'bg-yellow-500' },
  { value: 'defensor', label: 'Defensor', icon: <Shield className="w-4 h-4" />, color: 'bg-blue-500' },
  { value: 'mediocampista', label: 'Mediocampista', icon: <Zap className="w-4 h-4" />, color: 'bg-emerald-500' },
  { value: 'delantero', label: 'Delantero', icon: <Trophy className="w-4 h-4" />, color: 'bg-red-500' },
];

// --- Utilities ---

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Components ---

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState('');
  const [position, setPosition] = useState<Position>('defensor');
  const [level, setLevel] = useState(3);
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState<Team[]>([]);
  const [copied, setCopied] = useState(false);

  // Add Player
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlayer: Player = {
      id: generateId(),
      name: name.trim(),
      position,
      level,
    };

    setPlayers([...players, newPlayer]);
    setName('');
  };

  // Remove Player
  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  // Balance Algorithm
  const generateBalancedTeams = useCallback(() => {
    if (players.length < numTeams) return;

    // 1. Group players by position
    const byPosition: Record<Position, Player[]> = {
      arquero: [],
      defensor: [],
      mediocampista: [],
      delantero: [],
    };

    players.forEach(p => byPosition[p.position].push(p));

    // 2. Sort each group by level (descending) to distribute "stars" first
    Object.keys(byPosition).forEach(pos => {
      byPosition[pos as Position].sort((a, b) => b.level - a.level);
    });

    // 3. Initialize Teams
    const resultTeams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
      id: i + 1,
      players: [],
      totalLevel: 0,
      averages: { arquero: 0, defensor: 0, mediocampista: 0, delantero: 0 }
    }));

    // 4. Distribute position by position
    // We alternate the order for each position to avoid biased distribution
    const positionsToDistribute: Position[] = ['arquero', 'defensor', 'mediocampista', 'delantero'];
    
    positionsToDistribute.forEach((pos, posIdx) => {
      const group = byPosition[pos];
      
      group.forEach((player, playerIdx) => {
        // Find the team with the lowest total level or fewest players of this position
        // to keep it balanced. Actually, for simplicity and effectiveness:
        // Use a snake-like distribution or find team with least total level
        
        // Strategy: Sort teams by current total level to pick the "weakest" one
        // and if levels are tied, pick the one with fewest players of this position
        const targetTeam = [...resultTeams].sort((a, b) => {
            const diffLevel = a.totalLevel - b.totalLevel;
            if (diffLevel !== 0) return diffLevel;
            
            const aPosCount = a.players.filter(p => p.position === pos).length;
            const bPosCount = b.players.filter(p => p.position === pos).length;
            return aPosCount - bPosCount;
        })[0];

        targetTeam.players.push(player);
        targetTeam.totalLevel += player.level;
      });
    });

    setTeams(resultTeams);
  }, [players, numTeams]);

  // Copy to Clipboard
  const copyTeams = () => {
    const text = teams.map(t => {
      const pList = t.players.map(p => `- ${p.name} (${p.position.charAt(0).toUpperCase()}${p.position.slice(1)})`).join('\n');
      return `Equipo ${t.id} (Promedio: ${(t.totalLevel / t.players.length).toFixed(1)})\n${pList}`;
    }).join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAll = () => {
    setPlayers([]);
    setTeams([]);
  };

  return (
    <div className="min-h-screen bg-[#0a0c0b] text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Shuffle className="w-3 h-3" />
            Fair Play Algoritmo
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            FÚTBOL MIX
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Cargamos, sorteamos y saltamos a la cancha. Equipos balanceados por nivel y posición.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar: Entry Form & Player List */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Entry Form */}
            <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">Sumar Jugador</h2>
              </div>
              
              <form onSubmit={handleAddPlayer} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nombre</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Lionel Messi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Posición</label>
                  <div className="grid grid-cols-2 gap-2">
                    {POSITIONS.map((pos) => (
                      <button
                        key={pos.value}
                        type="button"
                        onClick={() => setPosition(pos.value)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                          position === pos.value 
                          ? 'bg-slate-100 text-slate-900 border-white' 
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-1 rounded-md ${position === pos.value ? 'bg-slate-900 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {pos.icon}
                        </div>
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Nivel (1-5)</label>
                    <span className="text-emerald-400 font-bold">{level}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={level}
                    onChange={(e) => setLevel(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between mt-1 px-1">
                    <span className="text-[10px] text-slate-600 font-bold">PRINCIPIANTE</span>
                    <span className="text-[10px] text-slate-600 font-bold">PROFESIONAL</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" />
                  AGREGAR A LA LISTA
                </button>
              </form>
            </section>

            {/* List */}
            <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[500px]">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold">Convocados</h2>
                </div>
                <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold">{players.length}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                <AnimatePresence initial={false}>
                  {players.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 text-center text-slate-600"
                    >
                      <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm font-medium">No hay jugadores cargados aún</p>
                    </motion.div>
                  ) : (
                    players.map((p) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-8 rounded-full ${POSITIONS.find(pos => pos.value === p.position)?.color}`} />
                          <div>
                            <p className="font-bold text-slate-200">{p.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                              {p.position} • Nivel {p.level}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removePlayer(p.id)}
                          className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {players.length > 0 && (
                <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                  <button
                    onClick={resetAll}
                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-red-400 flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    LIMPIAR TODO
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Main Area: Controls and Results */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Controls */}
            <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Cantidad de Equipos</label>
                  <div className="flex items-center gap-4">
                    {[2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => setNumTeams(num)}
                        className={`flex-1 md:flex-none min-w-[60px] py-2 rounded-xl border font-bold transition-all ${
                          numTeams === num 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row gap-2">
                  <button
                    onClick={generateBalancedTeams}
                    disabled={players.length < numTeams}
                    className="flex-1 bg-white text-slate-950 hover:bg-slate-200 disabled:opacity-20 disabled:cursor-not-allowed font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl"
                  >
                    <Shuffle className="w-5 h-5" />
                    ARMAR EQUIPOS
                  </button>
                  
                  {teams.length > 0 && (
                    <button
                      onClick={copyTeams}
                      className="px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl flex items-center justify-center transition-all"
                      title="Copiar lista"
                    >
                      {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {teams.map((team, idx) => (
                  <motion.div
                    key={team.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                  >
                    <div className="p-5 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-transparent flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase overflow-hidden">
                          EQUIPO {team.id}
                        </h3>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                          PROMEDIO: {(team.totalLevel / team.players.length).toFixed(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 uppercase">{team.players.length} Jugadores</p>
                      </div>
                    </div>

                    <div className="flex-1 p-3 space-y-2">
                       {/* Grouped by position within team card */}
                       {POSITIONS.map(pos => {
                         const posPlayers = team.players.filter(p => p.position === pos.value);
                         if (posPlayers.length === 0) return null;
                         return (
                           <div key={pos.value} className="space-y-1">
                             <div className="flex items-center gap-2 px-2 py-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${pos.color}`} />
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{pos.label}S</span>
                             </div>
                             {posPlayers.map(p => (
                               <div key={p.id} className="flex items-center justify-between px-3 py-2 bg-slate-800/30 rounded-xl border border-white/5">
                                 <span className="font-bold text-slate-200 text-sm">{p.name}</span>
                                 <div className="flex gap-0.5">
                                   {Array.from({ length: 5 }).map((_, i) => (
                                     <div key={i} className={`w-1 h-1 rounded-full ${i < p.level ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                                   ))}
                                 </div>
                               </div>
                             ))}
                           </div>
                         );
                       })}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {teams.length === 0 && (
                <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                  <div className="inline-flex p-4 rounded-full bg-slate-900 mb-4">
                    <Shuffle className="w-8 h-8 text-slate-700" />
                  </div>
                  <p className="text-slate-500 font-medium">Cargá a los jugadores y presioná "Armar Equipos"</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="mt-20 pt-8 border-top border-slate-800 text-center">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">Fútbol Mix © 2024 • Potenciado por Fair Play AI</p>
        </footer>
      </div>
    </div>
  );
}
