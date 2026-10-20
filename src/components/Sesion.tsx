"use client";

import { createContext, useContext, useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigurado } from "@/lib/supabase";

const SesionContext = createContext<Session | null>(null);

export function useSesion() {
  return useContext(SesionContext);
}

export function salir() {
  return supabase().auth.signOut();
}

/** Muestra la pantalla de entrada hasta que hay una sesión iniciada. */
export function Sesion({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>();

  useEffect(() => {
    if (!supabaseConfigurado) return;
    supabase()
      .auth.getSession()
      .then(({ data }) => setSesion(data.session));
    const { data } = supabase().auth.onAuthStateChange((_evento, s) => setSesion(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabaseConfigurado) {
    return (
      <Pantalla titulo="Falta configurar Supabase">
        <p className="text-muted">
          Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY como variables de entorno y vuelve a publicar la app.
        </p>
      </Pantalla>
    );
  }
  if (sesion === undefined) return null;
  if (!sesion) return <Entrar />;
  return <SesionContext.Provider value={sesion}>{children}</SesionContext.Provider>;
}

function Entrar() {
  const [modo, setModo] = useState<"entrar" | "registro">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "error" | "info"; texto: string }>();

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setMensaje(undefined);
    const auth = supabase().auth;
    const { data, error } =
      modo === "entrar"
        ? await auth.signInWithPassword({ email, password })
        : await auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setEnviando(false);
    if (error) return setMensaje({ tipo: "error", texto: traducirError(error.message) });
    if (modo === "registro" && !data.session) {
      setMensaje({ tipo: "info", texto: "Te hemos enviado un correo. Abre el enlace para confirmar la cuenta y luego entra aquí." });
      setModo("entrar");
    }
  }

  const campo = "w-full rounded-xl border border-line bg-surface px-3 py-2.5 outline-none focus:border-foreground";

  return (
    <Pantalla titulo={modo === "entrar" ? "Entra en tu armario" : "Crea tu cuenta"}>
      <form onSubmit={enviar} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">Correo</span>
          <input className={campo} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">Contraseña</span>
          <input
            className={campo}
            type="password"
            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {mensaje && (
          <p className={`rounded-xl px-3 py-2 text-sm ${mensaje.tipo === "error" ? "text-danger" : "bg-warn"}`}>{mensaje.texto}</p>
        )}
        <button disabled={enviando} className="w-full rounded-2xl bg-foreground py-3.5 font-medium text-background disabled:opacity-40">
          {modo === "entrar" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>
      <button
        onClick={() => {
          setModo(modo === "entrar" ? "registro" : "entrar");
          setMensaje(undefined);
        }}
        className="mt-5 w-full text-center text-sm text-muted underline"
      >
        {modo === "entrar" ? "¿Primera vez? Crea tu cuenta" : "Ya tengo cuenta"}
      </button>
    </Pantalla>
  );
}

function Pantalla({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-sm px-4 pt-20">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{titulo}</h1>
      {children}
    </main>
  );
}

function traducirError(mensaje: string) {
  if (/invalid login credentials/i.test(mensaje)) return "Correo o contraseña incorrectos.";
  if (/email not confirmed/i.test(mensaje)) return "Confirma tu correo con el enlace que te enviamos antes de entrar.";
  if (/already registered/i.test(mensaje)) return "Ya existe una cuenta con ese correo. Entra con tu contraseña.";
  if (/signups not allowed/i.test(mensaje)) return "No se admiten cuentas nuevas en esta app.";
  if (/password should be/i.test(mensaje)) return "La contraseña debe tener al menos 6 caracteres.";
  return mensaje;
}
