import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundWithLogo from '@/components/BackgroundWithLogo';
import { useApp } from '@/contexts/AppContext';

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();
  
  // Estados
  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
  const [phoneError, setPhoneError] = useState('');

  // Função de validação do telefone
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

  // Handlers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove não-dígitos
    if (value.length <= 9) {
      setLoginForm({ ...loginForm, phone: value });
      validatePhone(value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, password: e.target.value });
  };

  const handleLogin = () => {
    if (loginForm.phone && loginForm.password && !phoneError) {
      setCurrentUser({ name: 'Usuário', phone: loginForm.phone });
      navigate('/home');
    }
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
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
          {/* <h1 className="text-3xl font-black text-gray-800 mb-1">PAVULLA</h1> */}
          <p className="text-sm text-secondary font-semibold mb-2">Confiável. Digital. Local.</p>
          <p className="text-gray-600">Entre para continuar</p>
        </div>

        {/* Formulário */}
        <div className="space-y-4">
          {/* Campo de Telefone */}
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
            />
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}
          </div>

          {/* Campo de Senha */}
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
            />
          </div>

          {/* Botão de Login */}
          <button
            onClick={handleLogin}
            disabled={!loginForm.phone || !loginForm.password || !!phoneError}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold transition shadow-elegant disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Entrar
          </button>
        </div>

        {/* Link para Registro */}
        <div className="mt-6 text-center">
          <button
            onClick={handleNavigateToRegister}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Criar nova conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;