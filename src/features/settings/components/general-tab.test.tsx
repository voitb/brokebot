import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/testing/utils";
import { GeneralTab } from "./general-tab";
import { createMockUserConfig } from "@/testing/mocks/factories";

describe("GeneralTab", () => {
  it("saves the settings when the save control is used", async () => {
    const user = userEvent.setup();
    const onSaveChanges = vi.fn().mockResolvedValue(undefined);

    render(
      <GeneralTab
        settings={createMockUserConfig()}
        onFieldChange={vi.fn()}
        onSaveChanges={onSaveChanges}
        isSaving={false}
      />
    );

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onSaveChanges).toHaveBeenCalledTimes(1);
  });

  it("blocks the save control while a save is in flight", () => {
    render(
      <GeneralTab
        settings={createMockUserConfig()}
        onFieldChange={vi.fn()}
        onSaveChanges={vi.fn()}
        isSaving
      />
    );

    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });
});
