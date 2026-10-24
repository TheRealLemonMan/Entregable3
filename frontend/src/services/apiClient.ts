const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("No se pudo conectar con la API. Comprueba la conexión e inténtalo de nuevo.");
  }

  if (!response.ok) {
    let message = `La solicitud falló (${response.status}).`;
    try {
      const data = (await response.json()) as { error?: string };
      message = data.error || message;
    } catch {
      // La respuesta puede no incluir un cuerpo JSON.
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
