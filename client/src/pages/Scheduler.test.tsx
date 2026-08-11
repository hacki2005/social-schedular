import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Scheduler from "./Scheduler.tsx";

describe("Scheduler", () => {
    it("renders the placeholder content", () => {
        render(<Scheduler />);
        expect(screen.getByText("Scheduler")).toBeInTheDocument();
    });
});