import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadAdminData, saveAdminPayment, saveAdminPrice, saveAdminSetting, saveCollectionMenuPosition, saveAdminProject, saveAdminArtwork } from "./admin";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/lib/backend/client", () => ({ supabase: { auth: { getUser: mocks.getUser }, rpc: mocks.rpc, from: mocks.from } }));

describe("Admin access and persistence", () => {
  beforeEach(() => { vi.resetAllMocks(); });
  it("does not read admin data for a signed-out visitor", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect(await loadAdminData()).toBeNull();
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("does not read admin data for a buyer without the admin role", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "buyer" } }, error: null });
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    expect(await loadAdminData()).toBeNull();
    expect(mocks.rpc).toHaveBeenCalledWith("has_role", { _user_id: "buyer", _role: "admin" });
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("loads all management sections only after confirming the admin role", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "owner" } }, error: null });
    mocks.rpc.mockResolvedValue({ data: true, error: null });
    const responses: Record<string, unknown> = {
      site_settings: { show_prices: false, online_payment_enabled: false, collection_menu_position: "left" },
      payment_settings: { yookassa_shop_id: "shop", yookassa_secret_key: "test-fixture-not-a-credential" },
      artwork_prices: [{ artwork_id: "reflection", price: 120000 }], orders: [],
    };
    mocks.from.mockImplementation((table: string) => {
      const result = Promise.resolve({ data: responses[table], error: null });
      const chain = { select: vi.fn(), eq: vi.fn(), single: vi.fn(() => result), order: vi.fn(() => result), then: result.then.bind(result) };
      chain.select.mockReturnValue(chain); chain.eq.mockReturnValue(chain);
      return chain;
    });
    const result = await loadAdminData();
    expect(result?.prices["reflection"]).toBe(120000);
    expect(result?.settings.collection_menu_position).toBe("left");
    expect(result?.payment).toEqual({ shopId: "shop", keySaved: true });
    expect(JSON.stringify(result)).not.toContain("test-fixture-not-a-credential");
    expect(mocks.from).toHaveBeenCalledTimes(4);
  });
  it("does not report success when a settings save fails", async () => {
    const chain = { update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn().mockResolvedValue({ data: null, error: { message: "denied" } }) };
    chain.update.mockReturnValue(chain); chain.eq.mockReturnValue(chain); chain.select.mockReturnValue(chain); mocks.from.mockReturnValue(chain);
    await expect(saveAdminSetting("show_prices", true)).rejects.toThrow("не сохранена");
  });
  it("keeps a saved payment key unchanged when the new key is blank", async () => {
    const chain = { update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }) };
    chain.update.mockReturnValue(chain); chain.eq.mockReturnValue(chain); chain.select.mockReturnValue(chain); mocks.from.mockReturnValue(chain);
    await saveAdminPayment(" shop ", " ");
    expect(chain.update.mock.calls[0]?.[0]).toMatchObject({ yookassa_shop_id: "shop" });
    expect(chain.update.mock.calls[0]?.[0]).not.toHaveProperty("yookassa_secret_key");
  });
  it("saves a cleared artwork price as null", async () => {
    const chain = { upsert: vi.fn(), select: vi.fn(), single: vi.fn().mockResolvedValue({ data: { artwork_id: "reflection" }, error: null }) };
    chain.upsert.mockReturnValue(chain); chain.select.mockReturnValue(chain); mocks.from.mockReturnValue(chain);
    await saveAdminPrice("reflection", null);
    expect(chain.upsert).toHaveBeenCalledWith(expect.objectContaining({ artwork_id: "reflection", price: null }));
  });
  it.each(["top", "left"] as const)("saves collection placement %s without changing payment or price visibility", async (position) => {
    const chain = { update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }) };
    chain.update.mockReturnValue(chain); chain.eq.mockReturnValue(chain); chain.select.mockReturnValue(chain); mocks.from.mockReturnValue(chain);
    await saveCollectionMenuPosition(position);
    expect(mocks.from).toHaveBeenCalledWith("site_settings");
    expect(chain.eq).toHaveBeenCalledWith("id", 1);
    expect(chain.update).toHaveBeenCalledWith({ collection_menu_position: position, updated_at: expect.any(String) });
  });
  it("persists an editable Luzhniki title and its interior choice", async () => {
    const chain = { update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn().mockResolvedValue({ data: { id: "luzhniki" }, error: null }) };
    chain.update.mockReturnValue(chain); chain.eq.mockReturnValue(chain); chain.select.mockReturnValue(chain); mocks.from.mockReturnValue(chain);
    await saveAdminProject("luzhniki", { title_ru: "Арт-проект «Лужники»", interior_enabled: false });
    expect(mocks.from).toHaveBeenCalledWith("projects");
    expect(chain.eq).toHaveBeenCalledWith("id", "luzhniki");
    expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({ title_ru: "Арт-проект «Лужники»", interior_enabled: false }));
  });
  it("persists per-work project membership and interior override", async () => {
    const chain = { update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn().mockResolvedValue({ data: { id: "work" }, error: null }) };
    chain.update.mockReturnValue(chain); chain.eq.mockReturnValue(chain); chain.select.mockReturnValue(chain); mocks.from.mockReturnValue(chain);
    await saveAdminArtwork("work", { project_id: "luzhniki", interior_enabled: true });
    expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({ project_id: "luzhniki", interior_enabled: true }));
  });
  it("does not report a saved project when the admin write is denied", async () => {
    const chain = { update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn().mockResolvedValue({ data: null, error: { message: "denied" } }) };
    chain.update.mockReturnValue(chain); chain.eq.mockReturnValue(chain); chain.select.mockReturnValue(chain); mocks.from.mockReturnValue(chain);
    await expect(saveAdminProject("luzhniki", { interior_enabled: true })).rejects.toThrow("не сохранён");
  });
});