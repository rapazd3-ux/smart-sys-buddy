import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useStore } from '../store';
import {
  Check,
  X,
  Play,
  Loader2,
  AlertTriangle,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CommandQueue() {
  const { pendingCommands, updateCommandStatus, removeCommand } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [executing, setExecuting] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    const command = pendingCommands.find((c) => c.id === id);
    if (!command) return;

    setExecuting(id);
    updateCommandStatus(id, 'executing');

    try {
      const result = await invoke('execute_command', {
        command: command.command,
        args: command.args,
        requiresSudo: command.requires_sudo,
        userConfirmed: true,
      });

      updateCommandStatus(id, 'completed', result);
    } catch (error: any) {
      updateCommandStatus(id, 'failed', { error: error.message || error });
    } finally {
      setExecuting(null);
    }
  };

  const handleReject = (id: string) => {
    updateCommandStatus(id, 'rejected');
    removeCommand(id);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'high':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'executing':
        return <Loader2 className="w-4 h-4 animate-spin text-violet-400" />;
      case 'completed':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const pendingOnly = pendingCommands.filter((c) => c.status === 'pending');
  const completedOrFailed = pendingCommands.filter(
    (c) => c.status === 'completed' || c.status === 'failed'
  );

  return (
    <div className="w-96 border-l border-zinc-800 bg-zinc-900/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-violet-400" />
          <h3 className="font-semibold">Comandos para Aprovar</h3>
        </div>
        <p className="text-xs text-zinc-400">
          Revise cada comando antes de executar. Clique para ver detalhes.
        </p>
      </div>

      {/* Commands List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {pendingOnly.map((cmd) => (
            <motion.div
              key={cmd.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-zinc-800 rounded-xl overflow-hidden"
            >
              {/* Command Header */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === cmd.id ? null : cmd.id)
                }
                className="w-full p-3 flex items-start gap-3 text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {cmd.requires_sudo && (
                      <span className="text-xs px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                        SUDO
                      </span>
                    )}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border ${getRiskColor(
                        cmd.risk_level
                      )}`}
                    >
                      {cmd.risk_level.toUpperCase()}
                    </span>
                    {getStatusIcon(cmd.status)}
                  </div>
                  <code className="text-sm text-zinc-300">
                    {cmd.command} {cmd.args.join(' ')}
                  </code>
                  <p className="text-xs text-zinc-500 mt-1">{cmd.description}</p>
                </div>
                {expandedId === cmd.id ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === cmd.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-3">
                      {cmd.explanation && (
                        <div className="bg-zinc-900 rounded-lg p-3">
                          <p className="text-xs text-zinc-400">{cmd.explanation}</p>
                        </div>
                      )}

                      {cmd.risk_level === 'high' && (
                        <div className="flex items-start gap-2 p-2 bg-red-500/10 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-300">
                            Este comando é de alto risco. Certifique-se de entender
                            o que ele faz antes de aprovar.
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {cmd.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(cmd.id)}
                            disabled={executing === cmd.id}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
                          >
                            {executing === cmd.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleReject(cmd.id)}
                            disabled={executing === cmd.id}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Rejeitar
                          </button>
                        </div>
                      )}

                      {/* Result */}
                      {cmd.result && (
                        <div className="bg-zinc-950 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                          {cmd.result.error ? (
                            <p className="text-red-400">{cmd.result.error}</p>
                          ) : (
                            <>
                              {cmd.result.stdout && (
                                <pre className="text-green-400 whitespace-pre-wrap">
                                  {cmd.result.stdout}
                                </pre>
                              )}
                              {cmd.result.stderr && (
                                <pre className="text-yellow-400 whitespace-pre-wrap">
                                  {cmd.result.stderr}
                                </pre>
                              )}
                              <p className="text-zinc-500 mt-2">
                                Exit code: {cmd.result.exit_code} |{' '}
                                {cmd.result.duration_ms}ms
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {pendingOnly.length === 0 && completedOrFailed.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum comando pendente</p>
          </div>
        )}
      </div>
    </div>
  );
}
