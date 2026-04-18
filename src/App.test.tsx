import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";

import App from "./App";

describe("<App />", () => {
  it("renders the prime counter interface", () => {
    render(() => <App />);

    expect(screen.getByText("Prime Counter")).toBeInTheDocument();
    expect(screen.getByText("Count primes")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Web worker reporting frequency:" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("less than or equal to")).toBeInTheDocument();
  });
});
