import axios from "axios";

type UserData = {
  email: string;
  passwordHash: string;
};

type UserCadastro = {
  name: string;
  email: string;
  password: string;
};

type AuthResponse = {
  message: string;
  redirectToChangePassword?: boolean;
};

export async function getUser(data: UserData): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>("/api/auth/login", data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createUser(data: UserCadastro): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>("/api/auth/register", data);
    return response.data;
  } catch (error) {
    throw error;
  }
}
