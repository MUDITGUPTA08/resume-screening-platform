// One-time seed: posts the two sample job openings from the assignment brief
// into Supabase via the real admin API, so the demo has data on first load.
// Run with: npx tsx scripts/seedJobs.ts   (requires the dev server running on :3000)
import { INITIAL_JOB_OPENINGS } from '../src/data/initialData.js';

const BASE_URL = process.env.SEED_BASE_URL || 'http://localhost:3000';
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'admin123';

async function seed() {
  for (const job of INITIAL_JOB_OPENINGS) {
    const res = await fetch(`${BASE_URL}/api/admin/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': ADMIN_PASSCODE,
      },
      body: JSON.stringify({
        title: job.title,
        company: job.company,
        department: job.department,
        location: job.location,
        description: job.description,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Failed to seed "${job.title}":`, err);
      continue;
    }

    const created = await res.json();
    console.log(`Seeded: ${created.title} @ ${created.company} (id: ${created.id})`);
  }
}

seed().catch((e) => {
  console.error('Seed script failed:', e);
  process.exit(1);
});
