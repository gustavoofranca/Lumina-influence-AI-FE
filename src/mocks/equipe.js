/**
 * Mock central da equipe (Etapa 10).
 * Usado em Configuracoes > Equipe.
 *
 * Roles: 'admin' | 'manager' | 'analyst' | 'viewer'
 * Status: 'active' | 'pending'
 */

export const EQUIPE = [
  {
    id: 'usr-001', name: 'Marina Souza',  email: 'marina@lumina-agency.com.br',
    role: 'admin',   status: 'active',  joinedAt: '2025-01-15',
  },
  {
    id: 'usr-002', name: 'Pedro Lima',    email: 'pedro@lumina-agency.com.br',
    role: 'manager', status: 'active',  joinedAt: '2025-03-22',
  },
  {
    id: 'usr-003', name: 'Aline Tavares', email: 'aline@lumina-agency.com.br',
    role: 'manager', status: 'active',  joinedAt: '2025-06-08',
  },
  {
    id: 'usr-004', name: 'Bruno Castro',  email: 'bruno@lumina-agency.com.br',
    role: 'analyst', status: 'active',  joinedAt: '2025-09-12',
  },
  {
    id: 'usr-005', name: 'Júlia Mendes',  email: 'julia@lumina-agency.com.br',
    role: 'analyst', status: 'active',  joinedAt: '2025-11-04',
  },
  {
    id: 'usr-006', name: 'Felipe Rocha',  email: 'felipe.novo@externos.com',
    role: 'viewer',  status: 'pending', joinedAt: '2026-05-06',
  },
]
