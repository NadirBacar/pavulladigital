import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, ChevronRight, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { fetchActivities, ApiActivity } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Agenda = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activities, setActivities] = useState<ApiActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Fetch activities on mount
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        const data = await fetchActivities();
        setActivities(data);

        // Set default selected date to today if available, otherwise first date
        if (data.length > 0) {
          const dates = Array.from(new Set(data.map(a => a.activity_date))).sort();
          const today = new Date().toISOString().split('T')[0];
          const defaultDate = dates.includes(today) ? today : dates[0];
          setSelectedDate(defaultDate);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao carregar atividades.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [toast]);

  // Handle activity click
  const handleActivityClick = (activity: ApiActivity) => {
    if (activity.has_signed) {
      navigate(`/activity/${activity.id}`);
    } else {
      toast({
        title: 'Atividade não assinada',
        description: 'Você precisa assinar esta atividade primeiro para ver os detalhes.',
        variant: 'default',
      });
    }
  };

  // Get unique sorted dates
  const uniqueDates = Array.from(new Set(activities.map(a => a.activity_date))).sort();

  // Filter activities for selected date
  const selectedActivities = selectedDate
    ? activities.filter(a => a.activity_date === selectedDate)
    : [];

  return (
    <div className="min-h-screen bg-blue-50">
      <Header />

      <div className="max-w-4xl mx-auto p-4 pb-24 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Actividades do Dia</h2>
          <button
            onClick={() => navigate('/home')}
            className="text-primary hover:text-primary/80 font-medium bg-white px-4 py-2 rounded-lg shadow-md transition"
          >
            Voltar
          </button>
        </div>

        {/* Current Time */}
        <div className="bg-white rounded-xl p-3 mb-4 shadow-md">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-semibold text-gray-700">
              Horário Atual:{' '}
              {currentTime.toLocaleTimeString('pt-PT', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Date Selector */}
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-md">
            <p className="text-gray-500 text-lg">Carregando atividades...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-md">
            <p className="text-gray-500 text-lg">Nenhuma atividade agendada</p>
          </div>
        ) : (
          <>
            {/* Date Cards */}
            <div className="mb-6 overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max">
                {uniqueDates.map((date) => {
                  const dateObj = new Date(date);
                  const isToday = dateObj.toDateString() === new Date().toDateString();
                  const isSelected = date === selectedDate;
                  const dayName = dateObj.toLocaleDateString('pt-PT', { weekday: 'short' });
                  const day = dateObj.getDate();
                  const monthName = dateObj.toLocaleDateString('pt-PT', { month: 'short' });

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl shadow-md transition min-w-[90px] ${
                        isSelected
                          ? 'bg-primary text-white scale-105 shadow-lg'
                          : 'bg-white text-gray-700 hover:shadow-lg hover:scale-[1.02]'
                      }`}
                    >
                      <span className={`text-xs font-semibold uppercase ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                        {dayName}
                      </span>
                      <span className={`text-2xl font-bold my-1 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {day}
                      </span>
                      <span className={`text-xs uppercase ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                        {monthName}
                      </span>
                      {isToday && (
                        <span className={`text-xs mt-1 font-medium ${isSelected ? 'text-white' : 'text-secondary'}`}>
                          Hoje
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Header */}
            {selectedDate && (
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-800">
                  {new Date(selectedDate).toLocaleDateString('pt-PT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
              </div>
            )}

            {/* Activities for Selected Date */}
            <div className="space-y-3">
              {selectedActivities.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-md">
                  <p className="text-gray-500">Nenhuma atividade para esta data</p>
                </div>
              ) : (
                selectedActivities.map((activity) => {
                  const isSigned = activity.has_signed;

                  return (
                    <div
                      key={activity.id}
                      onClick={() => handleActivityClick(activity)}
                      className={`bg-white rounded-2xl p-4 shadow-md transition cursor-pointer ${
                        isSigned
                          ? 'hover:shadow-lg hover:scale-[1.01]'
                          : 'opacity-50 cursor-not-allowed hover:opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Lock Icon for unsigned activities */}
                        {!isSigned && (
                          <div className="text-gray-400">
                            <Lock className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span
                              className={`text-sm font-semibold ${
                                isSigned ? 'text-gray-600' : 'text-gray-400'
                              }`}
                            >
                              {activity.start_time} - {activity.end_time}
                            </span>
                            {isSigned && (
                              <span className="text-xs text-green-600 font-medium">
                                ✓ Assinado
                              </span>
                            )}
                          </div>

                          <h3
                            className={`text-lg font-bold ${
                              isSigned ? 'text-gray-800' : 'text-gray-400'
                            }`}
                          >
                            {activity.name}
                          </h3>

                          {activity.description && (
                            <p
                              className={`text-sm mt-1 ${
                                isSigned ? 'text-gray-600' : 'text-gray-400'
                              }`}
                            >
                              {activity.description}
                            </p>
                          )}

                          <p
                            className={`text-xs mt-2 ${
                              isSigned ? 'text-gray-500' : 'text-gray-400'
                            }`}
                          >
                            {activity.signature_count}{' '}
                            {activity.signature_count === 1
                              ? 'pessoa assinou'
                              : 'pessoas assinaram'}
                          </p>
                        </div>

                        {/* Arrow for clickable (signed) activities */}
                        {isSigned && (
                          <ChevronRight className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Agenda;
