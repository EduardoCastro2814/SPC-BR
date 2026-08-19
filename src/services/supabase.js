import { createClient } from '@supabase/supabase-js';

// Intentar cargar credenciales desde variables de entorno
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Si no están en variables de entorno, intentar cargar desde localStorage
if (!supabaseUrl || !supabaseAnonKey) {
  supabaseUrl = localStorage.getItem('spc_supabase_url') || '';
  supabaseAnonKey = localStorage.getItem('spc_supabase_anon_key') || '';
}

export let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false // No necesitamos autenticación de usuarios para este juego casual
      }
    });
    console.log('[Supabase] Cliente inicializado correctamente.');
  } catch (error) {
    console.error('[Supabase] Error al inicializar el cliente:', error);
  }
}

/**
 * Retorna true si Supabase está configurado (tiene URL y Key cargados).
 */
export function isSupabaseConfigured() {
  return !!supabase;
}

/**
 * Guarda las credenciales de Supabase en localStorage y recarga la página
 * para re-inicializar el cliente.
 */
export function saveSupabaseConfig(url, key) {
  if (!url || !key) return false;
  localStorage.setItem('spc_supabase_url', url.trim());
  localStorage.setItem('spc_supabase_anon_key', key.trim());
  window.location.reload();
  return true;
}

/**
 * Limpia las credenciales de Supabase y recarga la página.
 */
export function clearSupabaseConfig() {
  localStorage.removeItem('spc_supabase_url');
  localStorage.removeItem('spc_supabase_anon_key');
  window.location.reload();
}

/**
 * Obtiene la configuración actual.
 */
export function getSupabaseConfig() {
  return {
    url: supabaseUrl,
    key: supabaseAnonKey,
    isEnv: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
  };
}
