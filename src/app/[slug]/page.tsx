"use server";

import { notFound } from 'next/navigation';

export default async function SlugPage({ params }: { params: { slug: string } }) {
  if (!params.slug) {
    notFound();
  }
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Slug: {params.slug}</h1>
      <p>This is a placeholder page for dynamic slug routes.</p>
    </div>
  );
}

