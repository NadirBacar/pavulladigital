const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.cursoapp.pavulla.com/api";

const QRCODE_BASE_URL =
  import.meta.env.QRCODE_BASE_URL || "https://qrcode.pavulla.com/v1";

const QRCODE_CLIENTAPP_ID =
  import.meta.env.QRCODE_CLIENTAPP_ID || "5ccc98c1-002c-417d-9df6-8977a997dcbd";

const QRCODE_TEMPLATE_ID =
  import.meta.env.QRCODE_TEMPLATE_ID || "b55eaf0f-1186-4072-b6db-cdaa90e6ee6a";

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

export interface ApiComment {
  id: string;
  memory_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

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
  content_type: "text" | "image" | "document" | "recording" | "video";
  file_url: string | null;
  created_at: string;
  comments?: ApiComment[]; // Add this line
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

  console.log(response);
  if (!response.ok) {
    const error = await response.text();
    console.log(error);
    throw new Error(error || "Login failed");
  }

  return response.json();
};

export const register = async (
  fullName: string,
  phone: string,
  password: string,
  groupName: string,
  isAdmin: boolean,
  origin: string
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
      origin: origin,
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

export const scanQRCode = async (id: string, addLog: (log: string) => void) => {
  const url = new URL(`/qrcodes/${id}/scan`, QRCODE_BASE_URL).toString();
  addLog(`URL from constructor: ${url}`);
  const response = await fetch(url, {
    headers: {
      client_app_id: QRCODE_CLIENTAPP_ID,
    },
  });

  addLog("qrcode scanned successfully");
  if (!response.ok) {
    throw new Error("Failed to fetch activities");
  }
  addLog("qrcode scanned with no errors");

  const { activity_id } = await response.json();

  const response2 = await fetch(
    `${API_BASE_URL}/activities/${activity_id}/sign`,
    {
      headers: getHeaders(),
    }
  );

  addLog("well you didn't get here");

  if (!response2.ok) {
    throw new Error("Failed to fetch activities");
  }

  const data = await response2.json();
  console.log(data);
  return data;
};

export const createActivity = async (
  name: string,
  description: string,
  activityDate: string,
  startTime: string,
  endTime: string
): Promise<{
  id: string;
  name: string;
  description: string;
  activity_date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  qr_code_id?: string;
}> => {
  const response = await fetch(`${API_BASE_URL}/activities/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name,
      description,
      activity_date: activityDate,
      start_time: startTime,
      end_time: endTime,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create activity");
  }
  
      const extractQrUuid = (code: string) => {
        if (!code) return null;
        try {
          const url = new URL(code);
          const parts = url.pathname.split("/").filter(Boolean);
          const candidate = parts[2] ?? null;
          return candidate;
        } catch (e) {
          return null;
        }
      };
  let code_id: string;

  const activity: ApiActivity = await response.json();

  // Create QR Code
  try {
    // Combine activity date and end time to create expiration timestamp
    const expiresAt = new Date(`${activityDate}T${endTime}`).toISOString();
    const qrResponse = await fetch(`${QRCODE_BASE_URL}/qrcodes`, {
      method: "POST",
      headers: {
        client_app_id: QRCODE_CLIENTAPP_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "STABLE",
        expiresAt: expiresAt,
        templateId: QRCODE_TEMPLATE_ID,
        clientAppId: QRCODE_CLIENTAPP_ID,
        third_party_ref: activity.id,
        data: { activity_id: activity.id },
        payloadFormat: "activity_id",
      }),
    });

    if (qrResponse.ok) {
      const qrData = await qrResponse.json();
      // Convert scan URL to preview URL
      const previewUrl = qrData.ScanUrl.replace("/scan", "/preview");
      code_id = extractQrUuid(previewUrl)
    } else {
      console.error("Failed to create QR code:", await qrResponse.text());
    }
  } catch (error) {
    console.error("Error creating QR code:", error);
    // Continue without QR code - don't fail the entire activity creation
  }

  return {
    id: activity.id,
    name: activity.name,
    description: activity.description,
    activity_date: activity.activity_date,
    start_time: activity.start_time,
    end_time: activity.end_time,
    created_at: activity.created_at,
    qr_code_id: code_id,
  };
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
  origin: string;
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
  origin: string,
  password?: string
): Promise<ApiUser> => {
  const body: any = {
    full_name: fullName,
    group_name: groupName,
    is_admin: isAdmin,
    is_active: isActive,
    origin: origin,
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
