// Mock service before importing component
jest.mock('../services/membersService', () => ({
  createMember: jest.fn(() => Promise.resolve({})),
  getMember: jest.fn(() => Promise.resolve({ nome: 'Teste', email: 't@t.com', telefone: '123' })),
  updateMember: jest.fn(() => Promise.resolve({})),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MembersForm from '../pages/MembersForm';
import { BrowserRouter } from 'react-router-dom';

describe('MembersForm', () => {
  it('submits new member', async () => {
    render(<BrowserRouter><MembersForm /></BrowserRouter>);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Novo' } });
    fireEvent.change(inputs[1], { target: { value: 'n@e.com' } });

    fireEvent.click(screen.getByText(/Salvar/i));

    await waitFor(() => expect(screen.queryByText(/Salvando.../i)).not.toBeInTheDocument());
  });
});
