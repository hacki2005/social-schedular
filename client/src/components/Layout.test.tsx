import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout.tsx";

vi.mock("./Sidebar.tsx", () => ({
    default: ({ isOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => (
        <div data-testid="sidebar" data-open={isOpen} />
    ),
}));

const renderLayout = (initialPath: string) =>
    render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<div>Dashboard Content</div>} />
                    <Route path="/accounts" element={<div>Accounts Content</div>} />
                    <Route path="/schedule" element={<div>Scheduler Content</div>} />
                    <Route path="/ai-composer" element={<div>AI Composer Content</div>} />
                    <Route path="*" element={<div>Fallback Content</div>} />
                </Route>
            </Routes>
        </MemoryRouter>
    );

describe("Layout", () => {
    it.each([
        ["/dashboard", "Dashboard"],
        ["/accounts", "Social Accounts"],
        ["/schedule", "Post Scheduler"],
        ["/ai-composer", "AI Composer"],
    ])("shows the '%s' title as '%s'", (path, expectedTitle) => {
        renderLayout(path);
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(expectedTitle);
    });

    it("falls back to 'SocialAI' as the title for an unknown route", () => {
        renderLayout("/some-unmapped-route");
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("SocialAI");
    });

    it("renders the routed child content via the Outlet", () => {
        renderLayout("/dashboard");
        expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
    });

    it("renders the Sidebar closed by default with no mobile overlay", () => {
        const { container } = renderLayout("/dashboard");
        expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "false");
        expect(container.querySelector('[class*="bg-slate-900/50"]')).not.toBeInTheDocument();
    });

    it("opens the mobile menu (overlay + sidebar) when the menu button is clicked", () => {
        const { container } = renderLayout("/dashboard");

        fireEvent.click(screen.getByRole("button"));

        expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "true");
        expect(container.querySelector('[class*="bg-slate-900/50"]')).toBeInTheDocument();
    });

    it("closes the mobile menu when the overlay is clicked", () => {
        const { container } = renderLayout("/dashboard");

        fireEvent.click(screen.getByRole("button"));
        const overlay = container.querySelector('[class*="bg-slate-900/50"]');
        expect(overlay).toBeInTheDocument();

        fireEvent.click(overlay!);

        expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "false");
        expect(container.querySelector('[class*="bg-slate-900/50"]')).not.toBeInTheDocument();
    });
});