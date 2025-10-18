export type JsonResponse<T = unknown> = {
    success: boolean
    data?: T
    message?: string
    error?: string
}

export async function handleJson<T>(response: Response): Promise<T> {
    const json: JsonResponse<T> = await response.json();
    if (!response.ok || json.success === false) {
        const error = json.error || json.message || 'Request failed';
        throw new Error(error);
    }
    return json.data as T;
}
