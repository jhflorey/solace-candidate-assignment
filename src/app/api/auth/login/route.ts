import { createJWT } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Simple hardcoded credentials for demo (replace with database check)
    if (username === "admin" && password === "testadmin@1234") {
      const token = await createJWT({
        username,
        role: "admin",
        userId: 1
      });

      return Response.json({
        token,
        user: { username, role: "admin" }
      });
    }

    return Response.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
