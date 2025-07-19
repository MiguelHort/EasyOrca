// src/api/http/infoUser.ts

export async function getInfoUser() {
  const response = await fetch('/api/infoUser', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // se estiver usando cookies
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar informações do usuário');
  }

  return response.json();
}
