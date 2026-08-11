import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlatformPickerModal from "./PlatformPickerModal.tsx";

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

describe("PlatformPickerModal", () => {
    it("renders a header and a button for every platform", () => {
        render(
            <PlatformPickerModal
                connectedIds={[]}
                connecting={null}
                onClose={vi.fn()}
                onConnect={vi.fn()}
            />
        );

        expect(screen.getByText("Choose a Platform")).toBeInTheDocument();
        expect(screen.getByText("Twitter / X")).toBeInTheDocument();
        expect(screen.getByText("Post tweets, threads, and media")).toBeInTheDocument();
        expect(screen.getByText("LinkedIn")).toBeInTheDocument();
        expect(screen.getByText("Publish to your profile & company pages")).toBeInTheDocument();
    });

    it("shows 'Already connected' and disables the button for a connected platform", () => {
        render(
            <PlatformPickerModal
                connectedIds={["twitter"]}
                connecting={null}
                onClose={vi.fn()}
                onConnect={vi.fn()}
            />
        );

        expect(screen.getAllByText("Already connected")).toHaveLength(1);
        const twitterButton = screen.getByText("Twitter / X").closest("button");
        expect(twitterButton).toBeDisabled();

        const linkedinButton = screen.getByText("LinkedIn").closest("button");
        expect(linkedinButton).not.toBeDisabled();
    });

    it("disables and shows a spinner for the platform currently connecting", () => {
        const { container } = render(
            <PlatformPickerModal
                connectedIds={[]}
                connecting="linkedin"
                onClose={vi.fn()}
                onConnect={vi.fn()}
            />
        );

        const linkedinButton = screen.getByText("LinkedIn").closest("button");
        expect(linkedinButton).toBeDisabled();
        expect(container.querySelector(".animate-spin")).toBeInTheDocument();

        const twitterButton = screen.getByText("Twitter / X").closest("button");
        expect(twitterButton).not.toBeDisabled();
    });

    it("calls onConnect with the platform id when a connectable platform is clicked", async () => {
        const user = userEvent.setup();
        const onConnect = vi.fn();

        render(
            <PlatformPickerModal
                connectedIds={[]}
                connecting={null}
                onClose={vi.fn()}
                onConnect={onConnect}
            />
        );

        await user.click(screen.getByText("LinkedIn"));

        expect(onConnect).toHaveBeenCalledTimes(1);
        expect(onConnect).toHaveBeenCalledWith("linkedin");
    });

    it("does not call onConnect when clicking an already-connected platform", () => {
        const onConnect = vi.fn();

        render(
            <PlatformPickerModal
                connectedIds={["twitter"]}
                connecting={null}
                onClose={vi.fn()}
                onConnect={onConnect}
            />
        );

        const twitterButton = screen.getByText("Twitter / X").closest("button")!;
        fireEvent.click(twitterButton);

        expect(onConnect).not.toHaveBeenCalled();
    });

    it("calls onClose when the close button is clicked", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <PlatformPickerModal
                connectedIds={[]}
                connecting={null}
                onClose={onClose}
                onConnect={vi.fn()}
            />
        );

        const closeButton = screen.getByText("Choose a Platform")
            .parentElement?.querySelector("button");
        expect(closeButton).toBeTruthy();
        await user.click(closeButton!);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});