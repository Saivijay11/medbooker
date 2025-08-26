const TOKEN_KEY = "medbooker.jwt";

export function saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}
export function getToken(): string | null {
    return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}
