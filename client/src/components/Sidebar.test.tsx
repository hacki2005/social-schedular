import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "./Sidebar.tsx";

const renderSidebar = (
    initialPath = "/dashboard",
    props: { isOpen?: boolean; setIsOpen?: (val: boolean) => void } = {}
) => {
    const setIsOpen = props.setIsOpen ?? vi.fn();
    const utils = render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Sidebar isOpen={props.isOpen ?? false} setIsOpen={setIsOpen} />
        </MemoryRouter>
    );
    return { ...utils, setIsOpen };
};

describe("Sidebar", () => {
    it("renders the logo and all navigation items", () => {
        renderSidebar();

        // "Scheduler" appears both as the logo text and as a nav item label.
        expect(screen.getAllByText("Scheduler")).toHaveLength(2);
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Accounts")).toBeInTheDocument();
        expect(screen.getByText("AI Composer")).toBeInTheDocument();
    });

    it("renders each nav link pointing to the correct path", () => {
        renderSidebar();

        expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute(
            "href",
            "/dashboard"
        );
        expect(screen.getByRole("link", { name: /Accounts/ })).toHaveAttribute(
            "href",
            "/accounts"
        );
        expect(screen.getByRole("link", { name: /AI Composer/ })).toHaveAttribute(
            "href",
            "/ai-composer"
        );
    });

    it("highlights the nav item matching the current location", () => {
        renderSidebar("/accounts");

        const accountsLink = screen.getByRole("link", { name: /Accounts/ });
        expect(accountsLink.className).toContain("bg-red-50");
        expect(accountsLink.className).toContain("text-red-600");

        const dashboardLink = screen.getByRole("link", { name: /Dashboard/ });
        expect(dashboardLink.className).not.toContain("bg-red-50");
    });

    it("does not highlight any nav item for an unmatched route", () => {
        renderSidebar("/some-other-page");

        const dashboardLink = screen.getByRole("link", { name: /Dashboard/ });
        const accountsLink = screen.getByRole("link", { name: /Accounts/ });
        expect(dashboardLink.className).not.toContain("bg-red-50");
        expect(accountsLink.className).not.toContain("bg-red-50");
    });

    it("calls setIsOpen(false) when a nav link is clicked", async () => {
        const user = userEvent.setup();
        const setIsOpen = vi.fn();
        renderSidebar("/dashboard", { setIsOpen });

        await user.click(screen.getByRole("link", { name: /Accounts/ }));

        expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it("renders the user's name, email, and avatar initial", () => {
        renderSidebar();

        expect(screen.getByText("Hari")).toBeInTheDocument();
        expect(screen.getByText("hari@123")).toBeInTheDocument();
        expect(screen.getByText("H")).toBeInTheDocument();
    });

    it("renders a Sign Out control", () => {
        renderSidebar();

        expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    it("applies translate classes based on the isOpen prop", () => {
        const { container, rerender, setIsOpen } = renderSidebar("/dashboard", { isOpen: false });
        const root = container.firstChild as HTMLElement;
        expect(root.className).toContain("-translate-x-full");

        rerender(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Sidebar isOpen={true} setIsOpen={setIsOpen} />
            </MemoryRouter>
        );
        expect((container.firstChild as HTMLElement).className).not.toContain("-translate-x-full");
    });
});