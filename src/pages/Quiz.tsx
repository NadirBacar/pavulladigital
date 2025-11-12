import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Gift, Award, CheckCircle, XCircle, History, Star } from 'lucide-react';
import BackgroundWithLogo from '@/components/BackgroundWithLogo';
import Header from '@/components/Header';
import { questionBank }  from '@/data/questions';
import { QuizQuestion } from '@/types';

interface QuizResult {
  date: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  timestamp: number;
}

const STORAGE_KEY = 'pavulla_quiz_results';
const LAST_PLAY_KEY = 'pavulla_quiz_last_play';

const Quiz = () => {
  const navigate = useNavigate();
  const [quizState, setQuizState] = useState('menu');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Função para carregar histórico do localStorage
  const loadQuizHistory = () => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        const history: QuizResult[] = JSON.parse(savedHistory);
        setQuizHistory(history.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  // Função para salvar resultado no localStorage
  const saveQuizResult = (correct: number, wrong: number) => {
    try {
      const today = new Date();
      const newResult: QuizResult = {
        date: today.toLocaleDateString('pt-BR'),
        score: correct,
        correctAnswers: correct,
        wrongAnswers: wrong,
        timestamp: today.getTime()
      };

      const savedHistory = localStorage.getItem(STORAGE_KEY);
      const history: QuizResult[] = savedHistory ? JSON.parse(savedHistory) : [];
      
      history.push(newResult);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      
      setQuizHistory(history.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Erro ao salvar resultado:', error);
    }
  };

  // Função para obter a melhor pontuação
  const getBestScore = () => {
    if (quizHistory.length === 0) return 0;
    return Math.max(...quizHistory.map(result => result.score));
  };

  // Função para obter estatísticas
  const getStats = () => {
    if (quizHistory.length === 0) {
      return { totalGames: 0, averageScore: 0, totalCorrect: 0, totalWrong: 0 };
    }

    const totalGames = quizHistory.length;
    const totalCorrect = quizHistory.reduce((sum, result) => sum + result.correctAnswers, 0);
    const totalWrong = quizHistory.reduce((sum, result) => sum + result.wrongAnswers, 0);
    const averageScore = (totalCorrect / totalGames).toFixed(1);

    return { totalGames, averageScore, totalCorrect, totalWrong };
  };

  useEffect(() => {
    loadQuizHistory();
  }, []);

  useEffect(() => {
    if (quizState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizState === 'playing' && quizQuestions.length > 0) {
      handleNextQuestion();
    }
  }, [timeLeft, quizState]);

  const startQuiz = () => {
    const shuffled = [...questionBank].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuizQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setSelectedAnswer(null);
    setTimeLeft(60);
    setQuizState('playing');
  };

  const handleNextQuestion = () => {
    if (quizQuestions.length === 0 || currentQuestionIndex >= quizQuestions.length) return;

    if (currentQuestionIndex < 4) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(60);
    } else {
      // Salvar resultado antes de mostrar a tela de resultado
      saveQuizResult(correctAnswers, wrongAnswers);
      setQuizState('result');
    }
  };

  const selectAnswer = (index: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(index);
      
      // Verificar se a resposta está correta IMEDIATAMENTE
      const isCorrect = index === quizQuestions[currentQuestionIndex].correct;
      
      // Atualizar contadores imediatamente
      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1);
      } else {
        setWrongAnswers(prev => prev + 1);
      }

      // Aguardar antes de avançar para próxima questão
      setTimeout(() => {
        handleNextQuestion();
      }, 1500);
    }
  };

  const getPrize = (score: number) => {
    if (score === 5) return { name: "Boné PAVULLA", icon: "🧢", message: "Parabéns! Você dominou o conhecimento sobre PAVULLA!" };
    if (score === 4) return { name: "Agenda e Caneta", icon: "📓", message: "Muito bem! Você está quase expert!" };
    if (score === 3) return { message: "Bom trabalho! Continue estudando, você está quase lá! 💪" };
    if (score === 2) return { message: "Não desista! Você já conhece bastante sobre PAVULLA! 🌟" };
    return { message: "Continue tentando! Cada tentativa te deixa mais perto do prêmio! 🚀" };
  };

  const stats = getStats();
  const bestScore = getBestScore();

  return (
    <div className="min-h-screen bg-blue-100">
      <BackgroundWithLogo />
      <Header />

      <div className="max-w-4xl mx-auto p-4 pb-24 relative z-10 ">
        {quizState === 'menu' && (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-8 shadow-glow text-center">
            <div className="w-24 h-24 mx-auto mb-6 gradient-quiz rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-4">Quiz PAVULLA</h2>
            <p className="text-gray-600 mb-6">Responda 5 perguntas e ganhe prêmios incríveis!</p>
            
            {/* Estatísticas */}
            {quizHistory.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="gradient-card rounded-xl p-4">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Melhor Pontuação</p>
                  <p className="text-3xl font-black text-primary">{bestScore}/5</p>
                </div>
                <div className="gradient-card rounded-xl p-4">
                  <History className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Total de Jogos</p>
                  <p className="text-3xl font-black text-secondary">{stats.totalGames}</p>
                </div>
              </div>
            )}

            <div className="gradient-card rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-3 text-lg flex items-center justify-center gap-2">
                <Gift className="w-6 h-6 text-secondary" />
                Sobre o Quiz
              </h3>
              <div className="space-y-2 text-left text-gray-700">
                <p className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  5 questões por tentativa
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  1 minuto por questão
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Tentativas ilimitadas
                </p>
                {/* <p className="flex items-center gap-2">
                  <span className="text-secondary">🎁</span>
                  Responda para habilitar brindes exclusivos!
                </p> */}
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={startQuiz}
                className="w-full py-4 rounded-xl font-bold text-lg transition shadow-elegant gradient-quiz text-white hover:opacity-90"
              >
                Iniciar Quiz
              </button>
              
              {quizHistory.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full bg-blue-50 text-blue-700 py-3 rounded-xl font-semibold hover:bg-blue-100 transition flex items-center justify-center gap-2"
                >
                  <History className="w-5 h-5" />
                  {showHistory ? 'Ocultar Histórico' : 'Ver Histórico'}
                </button>
              )}
              
              <button
                onClick={() => navigate('/home')}
                className="w-full bg-muted text-gray-700 py-3 rounded-xl font-semibold hover:bg-muted/80 transition"
              >
                Voltar ao Menu
              </button>
            </div>

            {/* Histórico de Pontuações */}
            {showHistory && quizHistory.length > 0 && (
              <div className="mt-6 bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                  <History className="w-6 h-6 text-primary" />
                  Histórico de Jogos
                </h3>
                
                {/* Estatísticas gerais */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Média</p>
                    <p className="text-xl font-bold text-gray-800">{stats.averageScore}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Acertos</p>
                    <p className="text-xl font-bold text-green-600">{stats.totalCorrect}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Erros</p>
                    <p className="text-xl font-bold text-red-600">{stats.totalWrong}</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {quizHistory.slice(0, 10).map((result, index) => (
                    <div 
                      key={result.timestamp}
                      className={`bg-white rounded-lg p-4 ${
                        result.score === bestScore ? 'border-2 border-yellow-400' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {result.score === bestScore && (
                            <Star className="w-5 h-5 text-yellow-500" />
                          )}
                          <div className="text-left">
                            <p className="text-sm font-semibold text-gray-800">{result.date}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {result.correctAnswers}
                              </span>
                              <span className="text-xs text-red-600 flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                {result.wrongAnswers}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-primary">{result.score}/5</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {quizHistory.length > 10 && (
                  <p className="text-xs text-gray-500 mt-3">
                    Mostrando os 10 resultados mais recentes de {quizHistory.length}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {quizState === 'playing' && quizQuestions[currentQuestionIndex] && (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-8 shadow-glow">
            {/* Estatísticas do Usuário - Topo */}
            {quizHistory.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 mb-6 border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white rounded-full p-2">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-600 font-semibold">Seu Recorde</p>
                      <p className="text-2xl font-black text-purple-600">{bestScore}/5</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-semibold">Total de Jogos</p>
                      <p className="text-xl font-bold text-blue-600">{stats.totalGames}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-semibold">Média</p>
                      <p className="text-xl font-bold text-indigo-600">{stats.averageScore}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">Total Acertos</span>
                    <span className="text-sm font-bold text-green-600">{stats.totalCorrect}</span>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">Total Erros</span>
                    <span className="text-sm font-bold text-red-600">{stats.totalWrong}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Cabeçalho com questão e placar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">Questão</span>
                <span className="text-2xl font-black text-primary">{currentQuestionIndex + 1}</span>
                <span className="text-sm font-semibold text-gray-600">de 5</span>
              </div>
              
              {/* Placar de Acertos e Erros - Jogo Atual */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg border-2 border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-bold text-green-600">{correctAnswers}</span>
                </div>
                <div className="flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg border-2 border-red-200">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-lg font-bold text-red-600">{wrongAnswers}</span>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
                {timeLeft}s
              </span>
            </div>

            {/* Barra de progresso */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
              <div 
                className="h-full gradient-primary transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / 5) * 100}%` }}
              ></div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
                {quizQuestions[currentQuestionIndex].question}
              </h3>

              <div className="space-y-3">
                {quizQuestions[currentQuestionIndex].options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === quizQuestions[currentQuestionIndex].correct;
                  const showResult = selectedAnswer !== null;

                  return (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-xl text-left font-semibold transition-all transform ${
                        showResult
                          ? isSelected
                            ? isCorrect
                              ? 'bg-green-500 text-white border-2 border-green-600 scale-105 shadow-lg'
                              : 'bg-red-500 text-white border-2 border-red-600 shadow-lg'
                            : isCorrect
                            ? 'bg-green-500 text-white border-2 border-green-600 scale-105 shadow-lg'
                            : 'bg-gray-100 border-2 border-gray-200 opacity-50'
                          : 'bg-gray-100 hover:bg-blue-50 hover:border-primary border-2 border-gray-200 hover:scale-102'
                      } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          showResult && (isSelected || isCorrect)
                            ? 'bg-white bg-opacity-30'
                            : 'bg-gray-200'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                        
                        {/* Ícones de feedback visual */}
                        {showResult && isSelected && isCorrect && (
                          <CheckCircle className="w-6 h-6 text-white animate-bounce" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle className="w-6 h-6 text-white" />
                        )}
                        {showResult && !isSelected && isCorrect && (
                          <CheckCircle className="w-6 h-6 text-white animate-bounce" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {quizState === 'result' && (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-8 shadow-glow text-center">
            <div className="mb-6">
              {correctAnswers >= 4 ? (
                <div className="w-32 h-32 mx-auto mb-6 gradient-quiz rounded-full flex items-center justify-center animate-bounce">
                  <Trophy className="w-16 h-16 text-white" />
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto mb-6 bg-primary rounded-full flex items-center justify-center">
                  <Award className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            <h2 className="text-5xl font-black text-gray-800 mb-6">Resultado</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Acertos</p>
                <p className="text-4xl font-black text-green-600">{correctAnswers}</p>
              </div>
              <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                <XCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Erros</p>
                <p className="text-4xl font-black text-red-600">{wrongAnswers}</p>
              </div>
            </div>

            <div className="gradient-card rounded-2xl p-4 mb-4">
              <p className="text-3xl font-black text-gray-800">{correctAnswers}/5</p>
            </div>

            {/* Mostrar se é novo recorde */}
            {correctAnswers === bestScore && quizHistory.length > 1 && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-3 mb-4 flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <p className="text-sm font-bold text-yellow-700">
                  {correctAnswers > Math.max(...quizHistory.slice(0, -1).map(r => r.score)) 
                    ? '🎉 Novo Recorde Pessoal!' 
                    : '⭐ Igualou seu recorde!'}
                </p>
              </div>
            )}

            <div className="gradient-card rounded-2xl p-8 mb-6">
              {getPrize(correctAnswers).icon && (
                <div className="text-6xl mb-4">{getPrize(correctAnswers).icon}</div>
              )}
              {getPrize(correctAnswers).name && (
                <h3 className="text-2xl font-black text-gray-800 mb-2">
                  🎉 {getPrize(correctAnswers).name}
                </h3>
              )}
              <p className="text-lg text-gray-700 font-medium">
                {getPrize(correctAnswers).message}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setQuizState('menu');
                  setCurrentQuestionIndex(0);
                  setCorrectAnswers(0);
                  setWrongAnswers(0);
                  setSelectedAnswer(null);
                }}
                className="w-full gradient-quiz text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-elegant"
              >
                🎮 Jogar Novamente
              </button>
              <button
                onClick={() => navigate('/home')}
                className="w-full bg-muted text-gray-700 py-3 rounded-xl font-semibold hover:bg-muted/80 transition"
              >
                Voltar ao Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;