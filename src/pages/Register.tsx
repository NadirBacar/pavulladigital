import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import { register as apiRegister } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    phone: '',
    password: '',
    groupName: '',
    isAdmin: false,
  });
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Phone validation
  const validatePhone = (phone: string) => {
    if (phone.length === 0) {
      setPhoneError('');
      return;
    }

    if (phone.length < 9) {
      setPhoneError('Número incompleto');
      return;
    }

    const validPrefixes = ['82', '83', '84', '85', '86', '87'];
    const prefix = phone.substring(0, 2);

    if (!validPrefixes.includes(prefix)) {
      setPhoneError('Número inválido. Deve começar com 82, 83, 84, 85, 86 ou 87');
      return;
    }

    setPhoneError('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) {
      setRegisterForm({ ...registerForm, phone: value });
      validatePhone(value);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !registerForm.fullName ||
      !registerForm.phone ||
      !registerForm.password ||
      phoneError
    ) {
      toast({
        title: 'Campos incompletos',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      await apiRegister(
        registerForm.fullName,
        registerForm.phone,
        registerForm.password,
        registerForm.groupName,
        registerForm.isAdmin
      );

      toast({
        title: 'Sucesso!',
        description: 'Usuário registrado com sucesso.',
      });

      // Reset form
      setRegisterForm({
        fullName: '',
        phone: '',
        password: '',
        groupName: '',
        isAdmin: false,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Erro no registro',
        description: error.message || 'Falha ao registrar usuário.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Header />

      <div className="max-w-2xl mx-auto p-4 pb-24">
        {/* Back Button */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-6 bg-white px-4 py-2 rounded-lg shadow-md transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="bg-white rounded-3xl shadow-md p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-secondary rounded-2xl transform -rotate-6"></div>
              <div className="absolute inset-0 bg-secondary rounded-2xl flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Registrar Novo Usuário</h1>
            <p className="text-sm text-gray-600">Apenas administradores podem criar contas</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={registerForm.fullName}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, fullName: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-primary focus:outline-none transition"
                placeholder="Nome completo do usuário"
                disabled={isLoading}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Celular *
              </label>
              <input
                type="tel"
                value={registerForm.phone}
                onChange={handlePhoneChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                  phoneError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-border focus:border-primary'
                }`}
                placeholder="8########"
                maxLength={9}
                disabled={isLoading}
                required
              />
              {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-primary focus:outline-none transition"
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>

            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grupo (opcional)
              </label>
              <input
                type="text"
                value={registerForm.groupName}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, groupName: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-primary focus:outline-none transition"
                placeholder="Nome do grupo"
                disabled={isLoading}
              />
            </div>

            {/* Admin Toggle */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="isAdmin"
                checked={registerForm.isAdmin}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, isAdmin: e.target.checked })
                }
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700">
                Registrar como administrador
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={
                !registerForm.fullName ||
                !registerForm.phone ||
                !registerForm.password ||
                !!phoneError ||
                isLoading
              }
              className="w-full bg-secondary hover:bg-secondary/90 text-white py-3 rounded-xl font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registrando...' : 'Registrar Usuário'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
