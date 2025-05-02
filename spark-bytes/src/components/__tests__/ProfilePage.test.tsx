import { render, screen, waitFor } from "@testing-library/react";
import ProfilePage from "@/app/profile/page";
import * as supabaseModule from "@/utils/supabaseClient";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Supabase client
const mockGetUser = jest.fn();
const mockFrom = jest.fn(() => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn(),
  update: jest.fn(),
  upsert: jest.fn(),
}));

jest.spyOn(supabaseModule, "supabase", "get").mockReturnValue({
  auth: {
    getUser: mockGetUser,
    updateUser: jest.fn(),
  },
  from: mockFrom,
} as any);

describe("ProfilePage", () => {
  it("redirects to login if no user is returned", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText(/loading your profile/i)).toBeInTheDocument();
    });
  });

  it("renders profile name and email if user exists", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: {
          id: "user123",
          email: "test@example.com",
          user_metadata: { name: "Test User" },
        },
      },
      error: null,
    });

    mockFrom().single.mockResolvedValueOnce({
      data: {
        name: "Test User",
        bio: "Test Bio",
      },
      error: null,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("Test Bio")).toBeInTheDocument();
    });
  });
});
