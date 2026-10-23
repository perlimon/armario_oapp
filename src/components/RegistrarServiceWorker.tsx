"use client";

import { useEffect } from "react";
import { pedirAlmacenamientoPersistente } from "@/lib/prendas";

export function RegistrarServiceWorker() {
  useEffect(() => {
    pedirAlmacenamientoPersistente();
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);
  return null;
}
