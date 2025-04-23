import { render, screen } from "@testing-library/react";
import Home from "./page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("Home Page", () => {
  it("displays the welcome message", () => {
    render(<Home />);
    const welcome = screen.getByText(/Welcome to Spark! Bytes/i);
    expect(welcome).toBeInTheDocument();
  });

  it("shows event cards when loaded", async () => {
    render(<Home />);
    const eventCards = await screen.findAllByTestId("event-card");
    expect(eventCards.length).toBeGreaterThan(0);
  });
});
