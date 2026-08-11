import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AiComposer from "./AIComposer.tsx";

describe("AiComposer", () => {
    it("renders the placeholder content", () => {
        render(<AiComposer />);
        expect(screen.getByText("AiComposer")).toBeInTheDocument();
    });
});