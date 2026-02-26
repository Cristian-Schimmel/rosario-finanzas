'use client';

import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudFog, Wind, Thermometer } from 'lucide-react';

interface WeatherData {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
}

// WMO Weather interpretation codes
function getWeatherIcon(code: number, isDay: boolean) {
  // Clear sky
  if (code === 0) return isDay ? Sun : Cloud;
  // Mainly clear, partly cloudy
  if (code <= 3) return Cloud;
  // Fog
  if (code >= 45 && code <= 48) return CloudFog;
  // Drizzle or Rain
  if (code >= 51 && code <= 67) return CloudRain;
  // Snow
  if (code >= 71 && code <= 77) return CloudSnow;
  // Rain showers
  if (code >= 80 && code <= 82) return CloudRain;
  // Snow showers
  if (code >= 85 && code <= 86) return CloudSnow;
  // Thunderstorm
  if (code >= 95) return CloudRain;
  
  return Cloud;
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Despejado';
  if (code <= 3) return 'Parcialmente nublado';
  if (code >= 45 && code <= 48) return 'Niebla';
  if (code >= 51 && code <= 55) return 'Llovizna';
  if (code >= 56 && code <= 57) return 'Llovizna helada';
  if (code >= 61 && code <= 65) return 'Lluvia';
  if (code >= 66 && code <= 67) return 'Lluvia helada';
  if (code >= 71 && code <= 75) return 'Nieve';
  if (code >= 80 && code <= 82) return 'Chaparrón';
  if (code >= 95) return 'Tormenta';
  return 'Nublado';
}

export function WeatherDateTime() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Update time every second
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather from Open-Meteo (Rosario coordinates: -32.9442, -60.6505)
  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-32.9442&longitude=-60.6505&current=temperature_2m,weather_code,is_day&timezone=America/Argentina/Buenos_Aires'
        );
        const data = await response.json();
        if (data.current) {
          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            weatherCode: data.current.weather_code,
            isDay: data.current.is_day === 1,
          });
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    }
    fetchWeather();
    // Refresh weather every 30 minutes
    const weatherTimer = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherTimer);
  }, []);

  if (!currentTime) return null;

  const WeatherIcon = weather ? getWeatherIcon(weather.weatherCode, weather.isDay) : Thermometer;

  // Format date
  const formatDate = (date: Date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="flex items-center gap-4 text-xs text-text-muted dark:text-slate-400">
      {/* Date */}
      <span className="font-medium">{formatDate(currentTime)}</span>
      
      {/* Separator */}
      <span className="w-px h-3 bg-border-muted dark:bg-slate-700" />
      
      {/* Time */}
      <span className="tabular-nums font-mono">{formatTime(currentTime)}</span>
      
      {/* Separator */}
      <span className="w-px h-3 bg-border-muted dark:bg-slate-700" />
      
      {/* Weather */}
      {weather && (
        <div className="flex items-center gap-1.5" title={getWeatherDescription(weather.weatherCode)}>
          <WeatherIcon className="w-3.5 h-3.5" />
          <span className="font-medium">{weather.temperature}°C</span>
          <span className="text-text-muted/70 dark:text-slate-500">Rosario</span>
        </div>
      )}
    </div>
  );
}
