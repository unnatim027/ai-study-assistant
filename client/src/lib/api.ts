import axios from "axios";
import type { StudyMaterial } from "../../../shared/schemas";

/** Axios instance pointing at the Express backend. */
const api = axios.create({
  baseURL: "/api",
  timeout: 60_000, // 60s for LLM calls
  headers: { "Content-Type": "application/json" },
});

/**
 * Generate study material from free-form notes.
 * Throws an AxiosError with `response.data.error` on failure.
 */
export async function generateStudyMaterial(
  notes: string,
  signal?: AbortSignal
): Promise<StudyMaterial> {
  const { data } = await api.post<StudyMaterial>(
    "/generate",
    { notes },
    { signal }
  );
  return data;
}
