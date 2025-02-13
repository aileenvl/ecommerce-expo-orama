declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_ORAMA_ENDPOINT: string;
      EXPO_PUBLIC_ORAMA_API_KEY: string;
    }
  }
}

export {};