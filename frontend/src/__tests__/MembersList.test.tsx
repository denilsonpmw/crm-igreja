// Mock the membersService before importing the component

// inject mock for component to use (avoids module mock ordering issues)
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MembersList from '../pages/MembersList';

const seed = [
  { membro_id: '1', nome: 'João', email: 'joao@example.com', telefone: '1111' },
  { membro_id: '2', nome: 'Maria', email: 'maria@example.com', telefone: '2222' },
];

describe('MembersList', () => {
  it('renders members from service', async () => {
  render(<MembersList initialMembers={seed} />);
  await waitFor(() => expect(screen.getByText('João')).toBeInTheDocument());
    expect(screen.getByText('Maria')).toBeInTheDocument();
  });
});
