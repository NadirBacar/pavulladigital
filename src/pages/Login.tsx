import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundWithLogo from '@/components/BackgroundWithLogo';
import { useAuth } from '@/contexts/AuthContext';
import { login as apiLogin } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
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
      setLoginForm({ ...loginForm, phone: value });
      validatePhone(value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, password: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginForm.phone || !loginForm.password || phoneError) {
      return;
    }

    try {
      setIsLoading(true);

      // Call API login
      const response = await apiLogin(loginForm.phone, loginForm.password);

      // Store auth data in context (which saves to localStorage)
      login(response.token, response.user);

      // Show success message
      toast({
        title: 'Login realizado!',
        description: `Bem-vindo, ${response.user.full_name}!`,
      });

      // Navigate to home
      navigate('/home');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Erro no login',
        description: error.message || 'Credenciais inválidas. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-blue-50">
      <BackgroundWithLogo />

      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl shadow-glow w-full max-w-md p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-28 h-28 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-primary rounded-2xl transform rotate-6"></div>
            <div className="absolute inset-0 gradient-primary rounded-2xl flex items-center justify-center p-3">
              <img
                src="/pavulla-logo.svg"
                alt="PAVULLA Logo"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
          <p className="text-sm text-secondary font-semibold mb-2">Confiável. Digital. Local.</p>
          <p className="text-gray-600">Entre para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Celular
            </label>
            <input
              type="tel"
              value={loginForm.phone}
              onChange={handlePhoneChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                phoneError
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-border focus:border-primary'
              }`}
              placeholder="8########"
              maxLength={9}
              disabled={isLoading}
            />
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={loginForm.password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-primary focus:outline-none transition"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={!loginForm.phone || !loginForm.password || !!phoneError || isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold transition shadow-elegant disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
