import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import Accounts from "./Accounts.tsx";

const { mockAccountsData, mockPlatforms } = vi.hoisted(() => ({
    mockAccountsData: [
        { _id: "acc-1", handle: "handle_one", platform: "twitter", status: "connected" },
    ],
    mockPlatforms: [
        {
            id: "twitter",
            name: "Twitter / X",
            icon: () => <svg data-testid="icon-twitter" />,
            description: "Post tweets, threads, and media",
        },
        {
            id: "linkedin",
            name: "LinkedIn",
            icon: () => <svg data-testid="icon-linkedin" />,
            description: "Publish to your profile & company pages",
        },
    ],
}));

vi.mock("../assets/assets.tsx", () => ({
    dummyAccountsData: mockAccountsData,
    PLATFORMS: mockPlatforms,
}));

describe("Accounts page", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("loads and displays the connected accounts on mount", () => {
        render(<Accounts />);

        expect(screen.getByText("handle_one")).toBeInTheDocument();
        expect(screen.getByText("1 of 2 platform connected")).toBeInTheDocument();
    });

    it("opens the platform picker modal when 'Connect Account' is clicked", () => {
        render(<Accounts />);

        fireEvent.click(screen.getByText("Connect Account"));

        expect(screen.getByText("Choose a Platform")).toBeInTheDocument();
    });

    it("closes the platform picker modal via its close callback", () => {
        render(<Accounts />);

        fireEvent.click(screen.getByText("Connect Account"));
        expect(screen.getByText("Choose a Platform")).toBeInTheDocument();

        const closeButton = screen
            .getByText("Choose a Platform")
            .parentElement?.querySelector("button");
        fireEvent.click(closeButton!);

        expect(screen.queryByText("Choose a Platform")).not.toBeInTheDocument();
    });

    it("connects a new platform after the simulated delay and closes the modal", () => {
        render(<Accounts />);

        fireEvent.click(screen.getByText("Connect Account"));
        fireEvent.click(screen.getByText("LinkedIn"));

        // While "connecting", the modal stays open and the platform is disabled.
        expect(screen.getByText("Choose a Platform")).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.queryByText("Choose a Platform")).not.toBeInTheDocument();
        expect(screen.getByText("2 of 2 platform connected")).toBeInTheDocument();
    });

    it("removes an account after disconnect is confirmed", () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);
        render(<Accounts />);

        expect(screen.getByText("handle_one")).toBeInTheDocument();

        fireEvent.click(screen.getByTitle("Disconnect account"));

        expect(screen.queryByText("handle_one")).not.toBeInTheDocument();
        expect(screen.getByText("No accounts connected")).toBeInTheDocument();
        expect(screen.getByText("0 of 2 platform connected")).toBeInTheDocument();
    });

    it("keeps the account when disconnect is not confirmed", () => {
        vi.spyOn(window, "confirm").mockReturnValue(false);
        render(<Accounts />);

        fireEvent.click(screen.getByTitle("Disconnect account"));

        expect(screen.getByText("handle_one")).toBeInTheDocument();
        expect(screen.getByText("1 of 2 platform connected")).toBeInTheDocument();
    });
});