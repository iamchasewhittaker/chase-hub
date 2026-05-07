import { projects } from "@/lib/projects";
import { ProjectCard } from "./ProjectCard";

export function PortfolioSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
        What I&apos;ve been building
      </h2>
      <p className="mt-2 text-base text-muted">
        Three apps from 14 months of building with AI-assisted workflows.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}
