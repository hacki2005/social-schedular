import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App.tsx";

vi.mock("./pages/Home", () => ({ default: () => <div>Home Page</div> }));
vi.mock("./pages/Login", () => ({ default: () => <div>Login Page</div> }));
vi.mock("./pages/Dashboard.tsx", () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock("./pages/Accounts.tsx", () => ({ default: () => <div>Accounts Page</div> }));
vi.mock("./pages/Scheduler.tsx", () => ({ default: () => <div>Scheduler Page</div> }));
vi.mock("./pages/AIComposer.tsx", () => ({ default: () => <div>AI Composer Page</div> }));
vi.mock("./components/Sidebar.tsx", () => ({ default: () => <div>Sidebar Stub</div> }));

const renderApp = (initialPath: string) =>
    render(
        <MemoryRouter initialEntries={[initialPath]}>
            <App />
        </MemoryRouter>
    );

describe("App routing", () => {
    it("renders Home at '/'", () => {
        renderApp("/");
        expect(screen.getByText("Home Page")).toBeInTheDocument();
    });

    it("renders Login at '/login'", () => {
        renderApp("/login");
        expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("renders Dashboard wrapped in the Layout at '/dashboard'", () => {
        renderApp("/dashboard");
        expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
        expect(screen.getByText("Sidebar Stub")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dashboard");
    });

    it("renders Accounts wrapped in the Layout at '/accounts'", () => {
        renderApp("/accounts");
        expect(screen.getByText("Accounts Page")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Social Accounts");
    });

    it("renders Scheduler wrapped in the Layout at '/schedule'", () => {
        renderApp("/schedule");
        expect(screen.getByText("Scheduler Page")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Post Scheduler");
    });

    it("renders AiComposer wrapped in the Layout at '/ai-composer'", () => {
        renderApp("/ai-composer");
        expect(screen.getByText("AI Composer Page")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("AI Composer");
    });

    it("renders nothing matching for an unknown route", () => {
        renderApp("/this-route-does-not-exist");
        expect(screen.queryByText("Home Page")).not.toBeInTheDocument();
        expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
        expect(screen.queryByText("Sidebar Stub")).not.toBeInTheDocument();
    });
});