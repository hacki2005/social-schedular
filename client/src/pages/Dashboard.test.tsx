import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./Dashboard.tsx";

const { mockPosts, mockAccounts, mockActivity } = vi.hoisted(() => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPosts: [] as any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAccounts: [] as any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockActivity: [] as any[],
}));

vi.mock("../assets/assets.tsx", () => ({
    dummyPostsData: mockPosts,
    dummyAccountsData: mockAccounts,
    dummyActivityData: mockActivity,
}));

const resetFixtures = () => {
    mockPosts.length = 0;
    mockPosts.push(
        { _id: "p1", status: "scheduled" },
        { _id: "p2", status: "scheduled" },
        { _id: "p3", status: "published" }
    );
    mockAccounts.length = 0;
    mockAccounts.push(
        { _id: "a1", status: "connected" },
        { _id: "a2", status: "disconnected" }
    );
    mockActivity.length = 0;
    mockActivity.push({
        _id: "act1",
        description: "Published post to twitter",
        createdAt: "2026-01-01T00:00:00.000Z",
    });
};

describe("Dashboard", () => {
    beforeEach(() => {
        resetFixtures();
    });

    it("renders the welcome heading", () => {
        render(<Dashboard />);
        expect(screen.getByText(/Good morning/)).toBeInTheDocument();
    });

    it("computes and displays scheduled, published, and connected account stats", async () => {
        const { container } = render(<Dashboard />);

        await waitFor(() => {
            const values = container.querySelectorAll(".tabular-nums");
            expect(values).toHaveLength(3);
        });

        const values = container.querySelectorAll(".tabular-nums");
        expect(values[0]).toHaveTextContent("2"); // scheduled posts
        expect(values[1]).toHaveTextContent("1"); // published posts
        expect(values[2]).toHaveTextContent("1"); // connected accounts

        expect(screen.getByText("Scheduled Posts")).toBeInTheDocument();
        expect(screen.getByText("Published Posts")).toBeInTheDocument();
        expect(screen.getByText("Connected Accounts")).toBeInTheDocument();
    });

    it("renders the activity feed with the fetched activities", async () => {
        render(<Dashboard />);

        expect(await screen.findByText("Published post to twitter")).toBeInTheDocument();
        expect(screen.getByText("1 events")).toBeInTheDocument();
    });

    it("shows the empty state when there is no recent activity", async () => {
        mockActivity.length = 0;

        render(<Dashboard />);

        expect(await screen.findByText("No activity yet")).toBeInTheDocument();
        expect(screen.getByText("0 events")).toBeInTheDocument();
        expect(
            screen.getByText(/Connect account and schedule posts to see events here/)
        ).toBeInTheDocument();
    });

    it("recomputes stats correctly when there are no scheduled or published posts", async () => {
        mockPosts.length = 0;
        mockAccounts.length = 0;

        const { container } = render(<Dashboard />);

        await waitFor(() => {
            const values = container.querySelectorAll(".tabular-nums");
            expect(values[0]).toHaveTextContent("0");
            expect(values[1]).toHaveTextContent("0");
            expect(values[2]).toHaveTextContent("0");
        });
    });
});