const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};

// Common headers
const getHeaders = (includeAuth = true) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// API Response Types
export interface ApiActivity {
  id: string;
  name: string;
  description: string;
  activity_date: string;
  start_time: string;
  end_time: string;
  has_signed: boolean;
  signature_count: number;
  created_at: string;
}

export interface ApiMemory {
  id: string;
  activity_id: string;
  user_id: string;
  user_name: string;
  content_text: string | null;
  content_type: "text" | "image" | "document" | "recording";
  file_url: string | null;
  created_at: string;
}

export interface ApiLoginResponse {
  token: string;
  user: {
    id: string;
    full_name: string;
    phone: string;
    group_name: string;
    is_admin: boolean;
  };
}

// API Functions

// Auth
export const login = async (
  phone: string,
  password: string
): Promise<ApiLoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ phone, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  return response.json();
};

export const register = async (
  fullName: string,
  phone: string,
  password: string,
  groupName: string,
  isAdmin: boolean
): Promise<{ message: string; user_id: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: getHeaders(true), // Include auth header (admin only)
    body: JSON.stringify({
      full_name: fullName,
      phone,
      password,
      group_name: groupName,
      is_admin: isAdmin,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  return response.json();
};

// Activities
export const fetchActivities = async (): Promise<ApiActivity[]> => {
  const response = await fetch(`${API_BASE_URL}/activities/`, {
    headers: getHeaders(),
  });

  // console.log(response);
  if (!response.ok) {
    throw new Error("Failed to fetch activities");
  }

  const data = await response.json();
  return data.activities || [];
};

export const signActivity = async (activityId: string): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/sign`,
    {
      method: "POST",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to sign activity");
  }
};

// Memories
export const fetchMemories = async (
  activityId: string
): Promise<ApiMemory[]> => {
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/memories`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch memories");
  }

  const data = await response.json();
  return data.memories || [];
};

export const createMemory = async (
  activityId: string,
  text: string,
  file?: File
): Promise<ApiMemory> => {
  const formData = new FormData();
  formData.append("content_text", text);

  if (file) {
    formData.append("file", file);

    // Determine content_type based on file MIME type
    if (file.type.startsWith("image/")) {
      formData.append("content_type", "image");
    } else if (file.type.startsWith("video/")) {
      formData.append("content_type", "document");
    } else if (file.type.startsWith("audio/")) {
      formData.append("content_type", "recording");
    } else {
      formData.append("content_type", "text");
    }
  } else {
    formData.append("content_type", "text");
  }

  const token = getAuthToken();
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/memories`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create memory");
  }

  return response.json();
};

// Helper to get file URL
export const getFileUrl = (activityId: string, filename: string): string => {
  const token = getAuthToken();
  return `${API_BASE_URL}/files/${activityId}/${filename}?token=${token}`;
};

// User Management
export interface ApiUser {
  id: string;
  full_name: string;
  phone: string;
  group_name: string;
  is_admin: boolean;
}

export const fetchUsers = async (): Promise<ApiUser[]> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return data.users || [];
};

export const updateUser = async (
  userId: string,
  fullName: string,
  groupName: string,
  isAdmin: boolean,
  isActive: boolean,
  password?: string
): Promise<ApiUser> => {
  const body: any = {
    full_name: fullName,
    group_name: groupName,
    is_admin: isAdmin,
    is_active: isActive,
  };

  // Only include password if provided
  if (password && password.trim() !== "") {
    body.password = password;
  }

  const response = await fetch(`${API_BASE_URL}/users?id=${userId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }

  return response.json();
};
