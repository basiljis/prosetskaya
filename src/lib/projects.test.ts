import { describe, expect, it } from "vitest";
import { artworks } from "./artworks";
import { canPreviewInRoom, fallbackProjects, projectsForDisplay, worksForProject } from "./projects";

describe("Special project grouping and interior settings", () => {
  for (const id of ["logos", "illustration-projects", "other-projects"]) {
    it(`shows ${id} only in the full special-project catalogue`, () => {
      expect(projectsForDisplay(fallbackProjects).some((p) => p.id === id)).toBe(false);
      expect(projectsForDisplay(fallbackProjects, true).some((p) => p.id === id)).toBe(true);
    });
  }
  it("keeps the main commissions on the homepage", () => {
    expect(projectsForDisplay(fallbackProjects).map((p) => p.id)).toEqual(["luzhniki", "hotels", "tavrida", "individual"]);
  });
  it("groups all eight Luzhniki works under one project", () => {
    const project = fallbackProjects.find((p) => p.id === "luzhniki");
    expect(project).toBeDefined();
    if (!project) throw new Error("Missing Luzhniki");
    expect(worksForProject(artworks, project)).toHaveLength(8);
  });
  it("keeps all 55 project works (incl. 8 logos) in named groups without duplication", () => {
    const ids = fallbackProjects.flatMap((p) => worksForProject(artworks, p).map((w) => w.id));
    expect(ids.length).toBe(55);
    expect(new Set(ids).size).toBe(55);
  });
  it("lets the admin enable interior preview for a photographic project", () => {
    const project = fallbackProjects.find((p) => p.id === "hotels");
    if (!project) throw new Error("Missing hotels");
    const work = worksForProject(artworks, project)[0];
    if (!work) throw new Error("Missing hotel work");
    expect(canPreviewInRoom(work, [{ ...project, interior_enabled: true }])).toBe(true);
    expect(canPreviewInRoom(work, [{ ...project, interior_enabled: false }])).toBe(false);
  });
  it("allows a per-work override of the project interior setting", () => {
    const work = artworks.find((w) => w.source.endsWith("/dlya-sportkompleksa"));
    if (!work) throw new Error("Missing work");
    expect(canPreviewInRoom({ ...work, interiorEnabled: false })).toBe(false);
    expect(canPreviewInRoom({ ...work, interiorEnabled: true })).toBe(true);
  });
  it("uses the saved assignment rather than the old source", () => {
    const project = fallbackProjects.find((p) => p.id === "hotels");
    const work = artworks.find((w) => w.source.endsWith("/dlya-sportkompleksa"));
    if (!project || !work) throw new Error("Missing fixture");
    expect(worksForProject([{ ...work, projectId: "hotels" }], project)).toHaveLength(1);
    expect(worksForProject([{ ...work, projectId: null }], project)).toHaveLength(0);
  });
});