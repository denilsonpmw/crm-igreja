import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                CRM para Igrejas
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {user?.nome}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bem-vindo ao Dashboard
              </h2>
              <p className="text-gray-600 mb-8">
                Sistema implementado com sucesso! 🎉
              </p>

              {/* Cards com funcionalidades */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card Membros */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Membros</h3>
                        <p className="text-gray-500">Gerenciar membros da congregação</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3">
                    <button onClick={() => navigate('/members')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Ver membros →
                    </button>
                  </div>
                </div>

                {/* Card Congregações */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Congregações</h3>
                        <p className="text-gray-500">Gerenciar congregações</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3">
                    <button onClick={() => navigate('/congregations')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Ver congregações →
                    </button>
                  </div>
                </div>

                {/* Card RBAC */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Permissões</h3>
                        <p className="text-gray-500">Sistema RBAC completo</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3">
                    <button onClick={() => navigate('/roles')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Ver roles →
                    </button>
                  </div>
                </div>
              </div>

              {/* Informações do usuário */}
              <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informações do usuário
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID:</label>
                    <p className="text-sm text-gray-900">{user?.usuario_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome:</label>
                    <p className="text-sm text-gray-900">{user?.nome}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email:</label>
                    <p className="text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Roles:</label>
                    <p className="text-sm text-gray-900">
                      {user?.roles?.length ? user.roles.join(', ') : 'Nenhuma role atribuída'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Congregação ID:</label>
                    <p className="text-sm text-gray-900">
                      {user?.congregacao_id || 'Não vinculado a congregação'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status de implementação */}
              <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-800 mb-4">
                  ✅ Funcionalidades Implementadas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left text-sm text-green-700">
                  <div>• Autenticação JWT com refresh tokens</div>
                  <div>• Sistema RBAC granular (all, congregation, own)</div>
                  <div>• Multi-tenancy por congregacao_id</div>
                  <div>• CRUD completo de membros</div>
                  <div>• CRUD de congregações</div>
                  <div>• Gestão de roles e permissões</div>
                  <div>• Isolamento de dados por tenant</div>
                  <div>• Testes automatizados (25 testes passando)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;