import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountList from "./AccountList.tsx";

vi.mock("../assets/assets.tsx", () => ({
    PLATFORMS: [
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

describe("AccountList", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("renders the empty state when there are no accounts", () => {
        render(<AccountList accounts={[]} onDisconnect={vi.fn()} />);

        expect(screen.getByText("No accounts connected")).toBeInTheDocument();
        expect(
            screen.getByText(/Connect your first social platform/i)
        ).toBeInTheDocument();
    });

    it("renders a card for each account with matching platform metadata", () => {
        const accounts = [
            { _id: "a1", handle: "my_twitter", platform: "twitter", status: "connected" },
            { _id: "a2", handle: "my_linkedin", platform: "linkedin", status: "disconnected" },
        ];

        render(<AccountList accounts={accounts} onDisconnect={vi.fn()} />);

        expect(screen.getByText("my_twitter")).toBeInTheDocument();
        expect(screen.getByText("Twitter / X")).toBeInTheDocument();
        expect(screen.getByText("my_linkedin")).toBeInTheDocument();
        expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    });

    it("shows a 'Connected' badge for accounts with status 'connected'", () => {
        const accounts = [
            { _id: "a1", handle: "my_twitter", platform: "twitter", status: "connected" },
        ];

        render(<AccountList accounts={accounts} onDisconnect={vi.fn()} />);

        expect(screen.getByText("Connected")).toBeInTheDocument();
        expect(screen.queryByText("Disconnected")).not.toBeInTheDocument();
    });

    it("shows a 'Disconnected' badge for accounts with a non-connected status", () => {
        const accounts = [
            { _id: "a1", handle: "my_twitter", platform: "twitter", status: "error" },
        ];

        render(<AccountList accounts={accounts} onDisconnect={vi.fn()} />);

        expect(screen.getByText("Disconnected")).toBeInTheDocument();
        expect(screen.queryByText("Connected")).not.toBeInTheDocument();
    });

    it("skips rendering an account whose platform has no matching metadata", () => {
        const accounts = [
            { _id: "a1", handle: "unknown_handle", platform: "myspace", status: "connected" },
        ];

        render(<AccountList accounts={accounts} onDisconnect={vi.fn()} />);

        expect(screen.queryByText("unknown_handle")).not.toBeInTheDocument();
    });

    it("asks for confirmation and calls onDisconnect with the account id when confirmed", async () => {
        const user = userEvent.setup();
        const onDisconnect = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(window, "confirm").mockReturnValue(true);

        const accounts = [
            { _id: "acc-123", handle: "my_twitter", platform: "twitter", status: "connected" },
        ];

        render(<AccountList accounts={accounts} onDisconnect={onDisconnect} />);

        await user.click(screen.getByTitle("Disconnect account"));

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to disconnect this account"
        );
        expect(onDisconnect).toHaveBeenCalledTimes(1);
        expect(onDisconnect).toHaveBeenCalledWith("acc-123");
    });

    it("does not call onDisconnect when the confirmation is dismissed", async () => {
        const user = userEvent.setup();
        const onDisconnect = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(window, "confirm").mockReturnValue(false);

        const accounts = [
            { _id: "acc-123", handle: "my_twitter", platform: "twitter", status: "connected" },
        ];

        render(<AccountList accounts={accounts} onDisconnect={onDisconnect} />);

        await user.click(screen.getByTitle("Disconnect account"));

        expect(window.confirm).toHaveBeenCalledTimes(1);
        expect(onDisconnect).not.toHaveBeenCalled();
    });
});