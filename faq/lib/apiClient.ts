export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(`/api${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || "Terjadi kesalahan" };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}
