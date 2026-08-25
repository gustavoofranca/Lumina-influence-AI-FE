/** Serviço da equipe da agência. */
import { api } from '../lib/api.js'

export function adaptMember(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatar_url,
    joinedAt: u.created_at,
  }
}

export async function listMembers() {
  const res = await api.get('/users', { params: { per_page: 100 } })
  return res.data.map(adaptMember)
}

export async function inviteMember({ name, email, role }) {
  const res = await api.post('/users', { name, email, role })
  return adaptMember(res.data)
}

export async function updateMemberRole(id, role) {
  const res = await api.patch(`/users/${id}`, { role })
  return adaptMember(res.data)
}

export async function removeMember(id) {
  await api.delete(`/users/${id}`)
}

/** Atualiza o próprio perfil. Só `name` é editável: e-mail vem do OAuth. */
export async function updateOwnProfile(id, { name }) {
  const res = await api.patch(`/users/${id}`, { name })
  return adaptMember(res.data)
}
